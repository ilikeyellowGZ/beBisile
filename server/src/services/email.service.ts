import { EmailLog } from '../models/index.js';
import { env } from '../config/env.js';
import { StoreSettings } from '../models/index.js';

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

const defaultSender = env.FROM_EMAIL || 'orders@bisile.co.za';

const escapeHtml = (value: string) => String(value ?? '')
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

const getStoreSettings = async () => {
  const settings = await StoreSettings.findOne().lean();
  return settings;
};

export const sendOrderConfirmationEmail = async ({ order }: { order: any }) => {
  const storeSettings = await getStoreSettings();
  const customerName = String(order?.customerInfo?.fullName || 'Customer').trim();
  const orderNumber = String(order?.orderNumber || '');
  const itemsMarkup = (order?.items || []).map((item: any) => `<li style="margin-bottom:8px;">${escapeHtml(String(item.productName || 'Product'))} × ${escapeHtml(String(item.quantity || 0))} — ${escapeHtml(String(item.totalPrice ?? item.unitPrice ?? 0))}</li>`).join('');
  const html = createBisileEmailHtml({
    title: 'Your BISILE order is confirmed',
    intro: `Hello ${customerName}, your order has been received and is now being processed.`,
    body: `<p><strong>Order number:</strong> ${escapeHtml(orderNumber)}</p><p><strong>Payment status:</strong> ${escapeHtml(String(order?.paymentStatus || 'pending'))}</p><p><strong>Shipping:</strong> ${escapeHtml(String(order?.shippingPartner?.name || 'Standard'))}</p><ul>${itemsMarkup}</ul><p><strong>Total paid:</strong> ${escapeHtml(String(order?.totalAmount || 0))}</p><p><strong>Delivery address:</strong> ${escapeHtml(String(order?.shippingAddress?.streetAddress || ''))}, ${escapeHtml(String(order?.shippingAddress?.city || ''))}</p>`,
    footer: `Thank you for shopping with ${storeSettings?.storeName || 'BISILE'}.`,
  });

  await sendTransactionalEmail({
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
  const adminEmail = String(storeSettings?.storeEmail || defaultSender).trim();
  if (!adminEmail) return;
  const html = createBisileEmailHtml({
    title: 'New BISILE order received',
    intro: 'A new customer order has been created.',
    body: `<p><strong>Customer:</strong> ${escapeHtml(String(order?.customerInfo?.fullName || ''))}</p><p><strong>Email:</strong> ${escapeHtml(String(order?.customerInfo?.email || ''))}</p><p><strong>Phone:</strong> ${escapeHtml(String(order?.customerInfo?.phone || ''))}</p><p><strong>Order number:</strong> ${escapeHtml(String(order?.orderNumber || ''))}</p><p><strong>Total:</strong> ${escapeHtml(String(order?.totalAmount || 0))}</p><p><strong>Payment reference:</strong> ${escapeHtml(String(order?.paystackReference || ''))}</p><p><strong>Delivery address:</strong> ${escapeHtml(String(order?.shippingAddress?.streetAddress || ''))}, ${escapeHtml(String(order?.shippingAddress?.city || ''))}</p>`,
    footer: `This notification was sent to ${storeSettings?.storeName || 'BISILE'} admin.`,
  });

  await sendTransactionalEmail({
    to: adminEmail,
    subject: `New BISILE order ${order?.orderNumber || ''}`,
    html,
    text: `New order received for ${order?.customerInfo?.fullName || ''}.`,
    type: 'admin_order_notification',
    from: defaultSender,
    metadata: { orderNumber: order?.orderNumber },
  });
};

export const sendTransactionalEmail = async (options: EmailSendOptions) => {
  const to = String(options.to || '').trim();
  if (!to) throw Object.assign(new Error('A recipient email is required'), { statusCode: 400 });

  const apiKey = String(env.RESEND_API_KEY || '').trim();
  const from = String(options.from || defaultSender).trim();

  const payload = {
    from,
    to: [to],
    subject: options.subject,
    html: options.html,
    text: options.text,
    reply_to: options.replyTo || from,
  };

  if (!apiKey) {
    await EmailLog.create({
      provider: 'resend',
      type: options.type,
      to,
      from,
      subject: options.subject,
      status: 'skipped',
      providerResponse: { reason: 'missing_api_key' },
    });
    throw Object.assign(new Error('Resend is not configured on the server'), { statusCode: 500 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    clearTimeout(timeout);

    const responseBody = await response.json().catch(() => ({}));
    const isOk = response.ok && Boolean(responseBody?.id);

    await EmailLog.create({
      provider: 'resend',
      type: options.type,
      to,
      from,
      subject: options.subject,
      status: isOk ? 'sent' : 'failed',
      providerResponse: responseBody,
    });

    if (!isOk) {
      const message = typeof responseBody?.message === 'string' ? responseBody.message : 'Resend rejected the email';
      throw Object.assign(new Error(message), { statusCode: response.status || 502 });
    }

    return { ok: true, provider: 'resend', id: String(responseBody.id || '') };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Resend request failed';
    console.error('Resend email failed', { type: options.type, to, subject: options.subject, message, metadata: options.metadata || null });
    await EmailLog.create({
      provider: 'resend',
      type: options.type,
      to,
      from,
      subject: options.subject,
      status: 'failed',
      providerResponse: { message, metadata: options.metadata || null },
    });
    throw error;
  }
};
