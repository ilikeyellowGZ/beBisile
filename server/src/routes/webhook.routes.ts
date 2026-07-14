import { Router } from 'express';
import { markPaystackOrderPaid, verifyPaystackSignature } from '../services/paystack.service.js';
import { handlePaymentRequestWebhook, handleRefundWebhook, handleTransferWebhook } from '../services/paystack-webhook.service.js';

export const webhookRoutes = Router();

webhookRoutes.post('/paystack', async (req, res) => {
  const body = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body || {}));
  if (!verifyPaystackSignature(body, req.headers['x-paystack-signature'])) return res.status(401).send('Invalid Paystack signature');

  const event = JSON.parse(body.toString('utf8') || '{}');
  const eventName = String(event.event || '');
  const normalizedEventName = eventName.replace(/^payment\.request\./, 'paymentrequest.');
  const data = event.data && typeof event.data === 'object' ? event.data : {};
  console.info('Paystack webhook received', {
    event: eventName,
    reference: data.reference || data.transaction_reference || data.refund_reference || data.transfer_code || null,
  });

  if (eventName === 'charge.success') await markPaystackOrderPaid(data);
  else if (normalizedEventName.startsWith('refund.')) await handleRefundWebhook(normalizedEventName, data);
  else if (normalizedEventName.startsWith('transfer.')) await handleTransferWebhook(normalizedEventName, data);
  else if (normalizedEventName.startsWith('paymentrequest.')) await handlePaymentRequestWebhook(normalizedEventName, data);
  res.json({ received: true });
});
