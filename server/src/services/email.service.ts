import { EmailLog, StoreSettings } from '../models/index.js';
import { env } from '../config/env.js';

export type EmailSendOptions = {
  to: string;
  subject: string;
  html: string;
  text: string;
  type: string;
  from?: string;
  replyTo?: string;
  metadata?: Record<string, unknown>;
};

const senderAddress = env.RESEND_FROM_EMAIL || env.FROM_EMAIL || 'orders@bisile.co.za';
const defaultSender = env.RESEND_FROM_NAME ? `${env.RESEND_FROM_NAME} <${senderAddress}>` : senderAddress;

export const escapeHtml = (value: string) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

export const createBisileEmailHtml = ({
  title,
  intro,
  body,
  footer,
}: {
  title: string;
  intro: string;
  body: string;
  footer?: string;
}) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f7f4ef;font-family:Inter, Arial, sans-serif;color:#2a2114;">
    <div style="max-width:680px;margin:24px auto;background:#ffffff;border:1px solid #e7dfd3;border-radius:12px;overflow:hidden;">
      <div style="background:#2a2114;padding:24px 32px;">
        <div style="font-size:24px;font-weight:600;color:#f7f4ef;letter-spacing:0.04em;">BISILE</div>
      </div>
      <div style="padding:32px;">
        <h1 style="margin:0 0 12px;font-size:24px;color:#2a2114;">${escapeHtml(title)}</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#5f584f;">${escapeHtml(intro)}</p>
        <div style="background:#f9f6f1;border:1px solid #ece7de;border-radius:8px;padding:18px 20px;line-height:1.7;font-size:15px;color:#2a2114;">${body}</div>
        ${footer ? `<p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#7d756c;">${escapeHtml(footer)}</p>` : ''}
      </div>
    </div>
  </body>
</html>`;

export const getStoreSettings = async () => {
  try {
    return await StoreSettings.findOne().lean();
  } catch (error) {
    console.error('Store settings lookup failed for email', { error: error instanceof Error ? error.message : error });
    return null;
  }
};

const formatMoney = (value: unknown, currency = 'ZAR') => {
  try {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency }).format(Number(value || 0));
  } catch {
    return `${currency} ${Number(value || 0).toFixed(2)}`;
  }
};
const formatDate = (value: unknown) => {
  if (!value) return 'Not available';
  try {
    return new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(String(value)));
  } catch {
    return 'Not available';
  }
};
const formatAddress = (address: any) => [address?.streetAddress, address?.city, address?.province, address?.postalCode, address?.country].filter(Boolean).map((value) => escapeHtml(String(value))).join(', ') || 'Not provided';

const orderSummaryMarkup = (order: any) => {
  const currency = String(order?.currency || 'ZAR');
  const rows = (order?.items || []).map((item: any) => `<tr><td style="padding:8px 0;border-bottom:1px solid #ece7de;">${escapeHtml(String(item.productName || 'Product'))}</td><td style="padding:8px 0;border-bottom:1px solid #ece7de;text-align:center;">${escapeHtml(String(item.quantity || 0))}</td><td style="padding:8px 0;border-bottom:1px solid #ece7de;text-align:right;">${escapeHtml(formatMoney(item.unitPrice, currency))}</td><td style="padding:8px 0;border-bottom:1px solid #ece7de;text-align:right;">${escapeHtml(formatMoney(item.totalPrice, currency))}</td></tr>`).join('');
  return `<table role="presentation" style="width:100%;border-collapse:collapse;"><thead><tr><th style="padding:8px 0;text-align:left;font-size:12px;color:#7d756c;">Product</th><th style="padding:8px 0;text-align:center;font-size:12px;color:#7d756c;">Qty</th><th style="padding:8px 0;text-align:right;font-size:12px;color:#7d756c;">Unit</th><th style="padding:8px 0;text-align:right;font-size:12px;color:#7d756c;">Total</th></tr></thead><tbody>${rows || '<tr><td colspan="4">No items recorded</td></tr>'}</tbody></table><div style="margin-top:16px;border-top:1px solid #d9d0c3;padding-top:12px;"><p style="margin:4px 0;"><strong>Subtotal:</strong> ${escapeHtml(formatMoney(order?.subtotal, currency))}</p><p style="margin:4px 0;"><strong>Shipping:</strong> ${escapeHtml(String(order?.shippingPartner?.name || 'Standard'))} (${escapeHtml(formatMoney(order?.deliveryFee, currency))})</p><p style="margin:4px 0;"><strong>Total:</strong> ${escapeHtml(formatMoney(order?.totalAmount, currency))}</p></div>`;
};

export const sendOrderConfirmationEmail = async ({ order }: { order: any }) => {
  const storeSettings = await getStoreSettings();
  const customerName = String(order?.customerInfo?.fullName || 'Customer').trim();
  const orderNumber = String(order?.orderNumber || '');
  const supportEmail = String(storeSettings?.storeEmail || env.ADMIN_NOTIFICATION_EMAIL || senderAddress).trim();
  const currency = String(order?.currency || 'ZAR');
  const html = createBisileEmailHtml({
    title: 'Your BISILE order is confirmed',
    intro: `Hello ${customerName}, your order has been received and is now being processed.`,
    body: `<p><strong>Order number:</strong> ${escapeHtml(orderNumber)}</p><p><strong>Payment reference:</strong> ${escapeHtml(String(order?.paystackReference || 'Not available'))}</p><p><strong>Payment status:</strong> ${escapeHtml(String(order?.paymentStatus || 'pending'))}</p><p><strong>Order date:</strong> ${escapeHtml(formatDate(order?.createdAt))}</p>${orderSummaryMarkup(order)}<p style="margin-top:18px;"><strong>Delivery address:</strong><br />${formatAddress(order?.shippingAddress)}</p><p><strong>Customer contact:</strong> ${escapeHtml(String(order?.customerInfo?.email || ''))}${order?.customerInfo?.phone ? ` · ${escapeHtml(String(order.customerInfo.phone))}` : ''}</p>`,
    footer: `Thank you for shopping with ${String(storeSettings?.storeName || 'BISILE')}. Support: ${supportEmail} (${currency}).`,
  });

  return sendTransactionalEmail({
    to: String(order?.customerInfo?.email || ''),
    subject: `BISILE order confirmation ${orderNumber}`,
    html,
    text: `Hi ${customerName},\nYour BISILE order ${orderNumber} has been received.\nPayment status: ${order?.paymentStatus || 'pending'}.`,
    type: 'customer_order_confirmation',
    from: defaultSender,
    metadata: { orderNumber },
  });
};

export const sendAdminOrderNotificationEmail = async ({ order }: { order: any }) => {
  const storeSettings = await getStoreSettings();
  const adminEmail = String(env.ADMIN_NOTIFICATION_EMAIL || storeSettings?.storeEmail || '').trim();
  if (!adminEmail) {
    console.warn('Admin order email skipped: ADMIN_NOTIFICATION_EMAIL and storeEmail are not configured');
    return { ok: false, skipped: true };
  }
  const customerEmail = String(order?.customerInfo?.email || '').trim();
  const html = createBisileEmailHtml({
    title: 'New BISILE order received',
    intro: 'A verified Paystack payment has been matched to a BISILE order.',
    body: `<p><strong>Customer:</strong> ${escapeHtml(String(order?.customerInfo?.fullName || ''))}</p><p><strong>Email:</strong> ${escapeHtml(customerEmail)}</p><p><strong>Phone:</strong> ${escapeHtml(String(order?.customerInfo?.phone || ''))}</p><p><strong>Order number:</strong> ${escapeHtml(String(order?.orderNumber || ''))}</p><p><strong>Payment status:</strong> ${escapeHtml(String(order?.paymentStatus || 'paid'))}</p><p><strong>Payment reference:</strong> ${escapeHtml(String(order?.paystackReference || ''))}</p><p><strong>Order date:</strong> ${escapeHtml(formatDate(order?.createdAt))}</p>${orderSummaryMarkup(order)}<p style="margin-top:18px;"><strong>Delivery address:</strong><br />${formatAddress(order?.shippingAddress)}</p>`,
    footer: `This notification was sent to ${String(storeSettings?.storeName || 'BISILE')} admin.`,
  });

  return sendTransactionalEmail({
    to: adminEmail,
    subject: `New BISILE order ${order?.orderNumber || ''}`,
    html,
    text: `New order received for ${order?.customerInfo?.fullName || ''}.`,
    type: 'admin_order_notification',
    from: defaultSender,
    replyTo: customerEmail || undefined,
    metadata: { orderNumber: order?.orderNumber },
  });
};

export const sendTransactionalEmail = async (options: EmailSendOptions) => {
  const to = String(options.to || '').trim();
  if (!to) throw Object.assign(new Error('A recipient email is required'), { statusCode: 400 });

  const apiKey = String(env.RESEND_API_KEY || '').trim();
  const from = String(options.from || defaultSender).trim();

  if (!apiKey) {
    await EmailLog.create({
      provider: 'resend', type: options.type, to, from, subject: options.subject, status: 'skipped',
      providerResponse: { reason: 'missing_api_key' },
    });
    throw Object.assign(new Error('Resend is not configured on the server'), { statusCode: 500 });
  }

  const payload = {
    from,
    to: [to],
    subject: options.subject,
    html: options.html,
    text: options.text,
    reply_to: options.replyTo || from,
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    let response: Response;
    try {
      response = await fetch('https://api.resend.com/emails', {
        method: 'POST', signal: controller.signal,
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } finally {
      clearTimeout(timeout);
    }

    const responseBody = await response.json().catch(() => ({}));
    if (!response.ok || !responseBody?.id) {
      const message = typeof responseBody?.message === 'string' ? responseBody.message : 'Resend rejected the email';
      throw Object.assign(new Error(message), { statusCode: response.status || 502 });
    }

    await EmailLog.create({
      provider: 'resend', type: options.type, to, from, subject: options.subject, status: 'accepted',
      providerResponse: responseBody,
    });

    return { ok: true, provider: 'resend', id: String(responseBody.id) };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Resend request failed';
    console.error('Resend email failed', { type: options.type, to, subject: options.subject, message, metadata: options.metadata || null });
    try {
      await EmailLog.create({
        provider: 'resend', type: options.type, to, from, subject: options.subject, status: 'failed',
        providerResponse: { message, metadata: options.metadata || null },
      });
    } catch (logError) {
      console.error('Failed to write email failure log', { error: logError instanceof Error ? logError.message : logError });
    }
    throw error;
  }
};
