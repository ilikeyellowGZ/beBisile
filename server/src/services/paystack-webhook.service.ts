import mongoose from 'mongoose';
import {
  InventoryLog,
  Order,
  Payment,
  PaystackPaymentRequest,
  PaystackTransfer,
  Product,
  Refund,
} from '../models/index.js';
import { paystackRequest, verifyPaystackTransaction } from './paystack.service.js';

type PaystackWebhookData = Record<string, any>;

const majorAmount = (value: unknown) => Number(value || 0) / 100;
const asReference = (value: unknown) => String(value || '').trim();

const restoreRefundedStock = async (order: any, session: mongoose.ClientSession) => {
  for (const item of order.items || []) {
    const quantity = Number(item.quantity || 0);
    if (!item.productId || quantity < 1) continue;

    const product = await Product.findOneAndUpdate(
      { _id: item.productId },
      { $inc: { stock: quantity } },
      { new: true, session },
    );
    if (!product) continue;

    await InventoryLog.create([{
      productId: product._id,
      previousStock: product.stock - quantity,
      newStock: product.stock,
      changeAmount: quantity,
      reason: 'cancelled_or_refunded_order',
      orderId: order._id,
    }], { session });
  }
};

export const handleRefundWebhook = async (event: string, data: PaystackWebhookData) => {
  const transactionReference = asReference(data.transaction_reference || data.transaction?.reference || data.reference);
  const amount = majorAmount(data.amount);
  const suppliedRefundReference = asReference(data.refund_reference || data.id);
  if (!transactionReference && !suppliedRefundReference) return;
  const refundReference = suppliedRefundReference || `${transactionReference}:${amount}`;

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const order = transactionReference
        ? await Order.findOne({ paystackReference: transactionReference }).session(session)
        : null;
      const payment = transactionReference
        ? await Payment.findOne({ paystackReference: transactionReference }).session(session)
        : null;
      const existing = await Refund.findOne({ paystackRefundReference: refundReference }).session(session);
      const becameProcessed = event === 'refund.processed' && existing?.status !== 'processed';

      await Refund.findOneAndUpdate(
        { paystackRefundReference: refundReference },
        {
          $set: {
            status: String(data.status || event.replace('refund.', '')),
            amount,
            reason: data.reason || data.merchant_note || null,
            paystackRefundId: data.id == null ? undefined : String(data.id),
            paystackRefundReference: refundReference,
          },
          $setOnInsert: {
            orderId: order?._id,
            paymentId: payment?._id,
            customerId: order?.customerId,
          },
        },
        { upsert: true, new: true, session },
      );

      if (!becameProcessed || !order) return;

      const originalAmount = Number(payment?.amount || order.totalAmount || 0);
      const refundedAmount = Number(order.refundedAmount || 0) + amount;
      const isFullRefund = originalAmount > 0 && refundedAmount >= originalAmount - 0.01;

      if (payment) {
        await Payment.updateOne(
          { _id: payment._id },
          { $inc: { refundedAmount: amount }, $set: { status: isFullRefund ? 'refunded' : 'partially_refunded' } },
          { session },
        );
      }

      if (!isFullRefund) {
        await Order.updateOne(
          { _id: order._id },
          { $inc: { refundedAmount: amount }, $set: { paymentStatus: 'partially_refunded', updatedAt: new Date() } },
          { session },
        );
        return;
      }

      const claimedOrder = await Order.findOneAndUpdate(
        { _id: order._id, stockRestoredAt: { $exists: false } },
        {
          $inc: { refundedAmount: amount },
          $set: {
            paymentStatus: 'refunded',
            orderStatus: 'refunded',
            refundedAt: new Date(),
            stockRestoredAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { new: true, session },
      );

      if (claimedOrder) await restoreRefundedStock(claimedOrder, session);
    });
  } finally {
    await session.endSession();
  }
};

export const handleTransferWebhook = async (event: string, data: PaystackWebhookData) => {
  const reference = asReference(data.reference || data.transfer_code || data.id);
  if (!reference) return;

  await PaystackTransfer.findOneAndUpdate(
    { paystackTransferReference: reference },
    {
      $set: {
        paystackTransferId: data.id == null ? undefined : String(data.id),
        amount: majorAmount(data.amount),
        currency: data.currency,
        status: data.status || event.replace('transfer.', ''),
        recipient: data.recipient || null,
        reason: data.reason || null,
        failures: data.failures || null,
        event,
        occurredAt: data.updatedAt || data.createdAt ? new Date(data.updatedAt || data.createdAt) : new Date(),
      },
      $setOnInsert: { paystackTransferReference: reference },
    },
    { upsert: true, new: true },
  );
};

export const handlePaymentRequestWebhook = async (event: string, data: PaystackWebhookData) => {
  const requestCode = asReference(data.request_code || data.code || data.id);
  const transactions = [
    ...(Array.isArray(data.transactions) ? data.transactions : []),
    ...(data.transaction && typeof data.transaction === 'object' ? [data.transaction] : []),
  ];
  const transactionRefs = transactions
    .map((transaction: PaystackWebhookData) => asReference(transaction.reference))
    .filter(Boolean);

  if (requestCode) {
    await PaystackPaymentRequest.findOneAndUpdate(
      { requestCode },
      {
        $set: {
          paystackRequestId: data.id == null ? undefined : String(data.id),
          amount: majorAmount(data.amount),
          currency: data.currency,
          status: data.status || event.replace('paymentrequest.', ''),
          customer: data.customer || null,
          transactions,
          event,
          occurredAt: data.updatedAt || data.createdAt ? new Date(data.updatedAt || data.createdAt) : new Date(),
        },
        $setOnInsert: { requestCode },
      },
      { upsert: true, new: true },
    );
  }

  if (event !== 'paymentrequest.success') return;

  // Never trust the payment-request webhook amount/status alone. Re-verify each
  // referenced transaction with Paystack before fulfilling a BISILE order.
  for (const reference of transactionRefs) {
    const verified = await paystackRequest<any>(`/transaction/verify/${encodeURIComponent(reference)}`, { method: 'GET' });
    if (verified.data?.status === 'success') await verifyPaystackTransaction(reference);
  }
};
