import Stripe from 'stripe';
import { collectionNames, json, now } from '../lib/secure-db.mjs';
import { calculateTrustedCheckout, createOrderNumber, mapOrderItems, parseJsonBody, rejectFrontendPrices } from '../lib/commerce-service.mjs';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const shippingPartners = [
  { id: 'pudo', name: 'Pudo', price: 89 },
  { id: 'courier-guy', name: 'The Courier Guy', price: 119 },
  { id: 'paxi', name: 'PAXI', price: 110 },
  { id: 'postnet', name: 'PostNet to PostNet', price: 120 },
];

const getShippingPartner = (id) => shippingPartners.find((option) => option.id === id) || shippingPartners[0];

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  if (!stripe) return json(500, { error: 'Stripe is not configured' });

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
    if (!customerInfo.email || !customerInfo.fullName && !customerInfo.name) {
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
      stripeCheckoutSessionId: null,
      stripePaymentIntentId: null,
      createdAt: now(),
      updatedAt: now(),
    };

    const orderResult = await trusted.db.collection(collectionNames.orders).insertOne(orderDoc);

    const lineItems = trusted.checkoutItems.map((item) => {
      if (item.stripePriceId) return { price: item.stripePriceId, quantity: item.quantity };
      return {
        quantity: item.quantity,
        price_data: {
          currency: trusted.currency.toLowerCase(),
          unit_amount: Math.round(item.unitPrice * 100),
          product_data: {
            name: item.productName,
            images: item.product.images?.length ? item.product.images : [item.product.image].filter(Boolean),
            metadata: { productId: String(item.productId) },
          },
        },
      };
    });

    if (deliveryFee > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: trusted.currency.toLowerCase(),
          unit_amount: Math.round(deliveryFee * 100),
          product_data: { name: `Delivery - ${shippingPartner.name}` },
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: orderDoc.customerInfo.email || undefined,
      line_items: lineItems,
      discounts: [],
      metadata: {
        orderId: String(orderResult.insertedId),
        orderNumber,
      },
      success_url: `${process.env.CLIENT_URL || event.headers.origin || ''}/#/payment/success?order=${orderNumber}`,
      cancel_url: `${process.env.CLIENT_URL || event.headers.origin || ''}/#/cart?cancelled=true`,
    });

    await trusted.db.collection(collectionNames.orders).updateOne(
      { _id: orderResult.insertedId },
      { $set: { stripeCheckoutSessionId: session.id, updatedAt: now() } }
    );

    return json(200, {
      url: session.url,
      orderNumber,
      orderId: String(orderResult.insertedId),
    });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || 'Checkout failed' });
  }
};
