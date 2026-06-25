import { collectionNames, json, now } from '../lib/secure-db.mjs';
import { calculateTrustedCheckout, createOrderNumber, mapOrderItems, parseJsonBody, rejectFrontendPrices } from '../lib/commerce-service.mjs';
import { paystackRequest, toPaystackSubunit } from '../lib/paystack-service.mjs';

const shippingPartners = [
  { id: 'postnet-to-postnet', name: 'PostNet to PostNet', price: 109.99 },
  { id: 'paxi-to-paxi', name: 'PAXI to PAXI', price: 109.99 },
  { id: 'courier-guy-pudo', name: 'Courier GUY (PUDO)', price: 149.99 },
  { id: 'postnet-to-address', name: 'PostNet to Address', price: 349.99 },
];

const getShippingPartner = (id) => shippingPartners.find((option) => option.id === id) || shippingPartners[0];
const makeReference = (orderNumber) => `${orderNumber}-${Date.now()}`.replace(/[^A-Za-z0-9-.=]/g, '-');

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const allowedOrigin = process.env.CLIENT_URL;
    const requestOrigin = event.headers.origin || event.headers.Origin;
    if (allowedOrigin && requestOrigin && requestOrigin !== allowedOrigin) {
      return json(403, { error: 'Checkout origin is not allowed' });
    }

    const body = parseJsonBody(event);
    rejectFrontendPrices(body);

    const customerInfo = body.customerInfo || body.customer || {};
    const shippingAddress = body.shippingAddress || body.address || {};
    if (!customerInfo.email || !(customerInfo.fullName || customerInfo.name)) {
      return json(400, { error: 'Customer name and email are required' });
    }

    const trusted = await calculateTrustedCheckout({
      items: body.items,
      discountCode: body.discountCode,
    });
    const shippingPartner = getShippingPartner(body.shippingPartner?.id || body.shippingPartnerId);
    const deliveryFee = shippingPartner.price;
    const totalAmount = trusted.subtotal - trusted.discountAmount + deliveryFee + trusted.taxAmount;
    const orderNumber = createOrderNumber();
    const paystackReference = makeReference(orderNumber);
    const clientUrl = process.env.CLIENT_URL || event.headers.origin || '';

    const orderDoc = {
      orderNumber,
      customerId: null,
      customerInfo: {
        fullName: customerInfo.fullName || customerInfo.name || '',
        email: customerInfo.email || '',
        phone: customerInfo.phone || '',
      },
      shippingAddress,
      shippingPartner,
      items: mapOrderItems(trusted.checkoutItems),
      subtotal: trusted.subtotal,
      discountCode: trusted.discountCode,
      discountAmount: trusted.discountAmount,
      deliveryFee,
      taxAmount: trusted.taxAmount,
      totalAmount,
      currency: trusted.currency,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      shippingStatus: 'not_shipped',
      paystackReference,
      paystackAccessCode: null,
      paystackAuthorizationUrl: null,
      createdAt: now(),
      updatedAt: now(),
    };

    const orderResult = await trusted.db.collection(collectionNames.orders).insertOne(orderDoc);
    const callbackUrl = `${clientUrl}/order-complete?order=${encodeURIComponent(orderNumber)}&reference=${encodeURIComponent(paystackReference)}`;

    const paystackPayload = await paystackRequest('/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify({
        email: orderDoc.customerInfo.email,
        amount: String(toPaystackSubunit(totalAmount)),
        currency: trusted.currency,
        reference: paystackReference,
        callback_url: callbackUrl,
        metadata: {
          orderId: String(orderResult.insertedId),
          orderNumber,
          customerName: orderDoc.customerInfo.fullName,
          shippingPartner: shippingPartner.id,
        },
      }),
    });

    await trusted.db.collection(collectionNames.orders).updateOne(
      { _id: orderResult.insertedId },
      {
        $set: {
          paystackAccessCode: paystackPayload.data?.access_code || null,
          paystackAuthorizationUrl: paystackPayload.data?.authorization_url || null,
          updatedAt: now(),
        },
      }
    );

    return json(200, {
      success: true,
      url: paystackPayload.data?.authorization_url,
      authorization_url: paystackPayload.data?.authorization_url,
      authorizationUrl: paystackPayload.data?.authorization_url,
      access_code: paystackPayload.data?.access_code,
      accessCode: paystackPayload.data?.access_code,
      reference: paystackPayload.data?.reference || paystackReference,
      orderNumber,
      orderId: String(orderResult.insertedId),
    });
  } catch (error) {
    return json(error.statusCode || 500, { success: false, message: error.message || 'Paystack checkout failed', error: error.message || 'Paystack checkout failed' });
  }
};
