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
const emailSiteUrl = String(env.FRONTEND_URL || env.CLIENT_URL || 'https://bisile.co.za').replace(/\/$/, '');
const emailLogoUrl = `${env.NODE_ENV === 'production' ? emailSiteUrl : 'https://bisile.co.za'}/media/bisile/logo.png`;

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
  <body style="margin:0;padding:0;background:#eee8df;font-family:Arial, Helvetica, sans-serif;color:#2a2114;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(intro)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#eee8df;">
      <tr><td align="center" style="padding:28px 12px;">
        <table role="presentation" width="680" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:680px;background:#ffffff;border:1px solid #dfd5c8;border-radius:14px;overflow:hidden;">
          <tr><td style="height:4px;background:#a3915d;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr><td align="center" style="padding:24px 28px 20px;background:#ffffff;border-bottom:1px solid #eee8df;">
            <a href="${escapeHtml(emailSiteUrl)}" style="text-decoration:none;">
              <img src="${escapeHtml(emailLogoUrl)}" width="210" alt="BISILE Be Luxury" style="display:block;width:210px;max-width:80%;height:auto;margin:0 auto;border:0;outline:none;text-decoration:none;" />
            </a>
          </td></tr>
          <tr><td style="padding:34px 32px 30px;background:#ffffff;">
            <p style="margin:0 0 10px;font-size:11px;line-height:1.4;letter-spacing:0.18em;text-transform:uppercase;color:#a3915d;">BISILE / BE LUXURY</p>
            <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;font-weight:500;color:#2a2114;">${escapeHtml(title)}</h1>
            <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:#6c6257;">${escapeHtml(intro)}</p>
            <div style="background:#faf8f4;border:1px solid #e8dfd4;border-radius:10px;padding:22px 20px;line-height:1.7;font-size:15px;color:#2a2114;">${body}</div>
            ${footer ? `<p style="margin:20px 0 0;font-size:13px;line-height:1.7;color:#83796e;">${escapeHtml(footer)}</p>` : ''}
          </td></tr>
          <tr><td style="padding:18px 28px;background:#2a2114;text-align:center;">
            <p style="margin:0;font-size:12px;line-height:1.6;color:#eee8df;">BISILE Be Luxury · <a href="${escapeHtml(emailSiteUrl)}" style="color:#d9c992;text-decoration:none;">bisile.co.za</a></p>
          </td></tr>
        </table>
      </td></tr>
    </table>
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
const formatAddressText = (address: any) => [address?.streetAddress, address?.city, address?.province, address?.postalCode, address?.country].filter(Boolean).map((value) => String(value)).join(', ') || 'Not provided';

const orderSummaryMarkup = (order: any) => {
  const currency = String(order?.currency || 'ZAR');
  const rows = (order?.items || []).map((item: any) => `<tr><td style="padding:8px 0;border-bottom:1px solid #ece7de;">${escapeHtml(String(item.productName || 'Product'))}</td><td style="padding:8px 0;border-bottom:1px solid #ece7de;text-align:center;">${escapeHtml(String(item.quantity || 0))}</td><td style="padding:8px 0;border-bottom:1px solid #ece7de;text-align:right;">${escapeHtml(formatMoney(item.unitPrice, currency))}</td><td style="padding:8px 0;border-bottom:1px solid #ece7de;text-align:right;">${escapeHtml(formatMoney(item.totalPrice, currency))}</td></tr>`).join('');
  const discount = Number(order?.discountAmount || 0);
  const tax = Number(order?.taxAmount || 0);
  return `<table role="presentation" style="width:100%;border-collapse:collapse;"><thead><tr><th style="padding:8px 0;text-align:left;font-size:12px;color:#7d756c;">Product</th><th style="padding:8px 0;text-align:center;font-size:12px;color:#7d756c;">Qty</th><th style="padding:8px 0;text-align:right;font-size:12px;color:#7d756c;">Unit</th><th style="padding:8px 0;text-align:right;font-size:12px;color:#7d756c;">Total</th></tr></thead><tbody>${rows || '<tr><td colspan="4">No items recorded</td></tr>'}</tbody></table><div style="margin-top:16px;border-top:1px solid #d9d0c3;padding-top:12px;"><p style="margin:4px 0;"><strong>Subtotal:</strong> ${escapeHtml(formatMoney(order?.subtotal, currency))}</p>${discount > 0 ? `<p style="margin:4px 0;"><strong>Discount${order?.discountCode ? ` (${escapeHtml(String(order.discountCode))})` : ''}:</strong> -${escapeHtml(formatMoney(discount, currency))}</p>` : ''}<p style="margin:4px 0;"><strong>Shipping:</strong> ${escapeHtml(String(order?.shippingPartner?.name || order?.shippingPartner?.id || 'Standard'))} (${escapeHtml(formatMoney(order?.deliveryFee, currency))})</p>${tax > 0 ? `<p style="margin:4px 0;"><strong>Tax:</strong> ${escapeHtml(formatMoney(tax, currency))}</p>` : ''}<p style="margin:8px 0 0;font-size:16px;"><strong>Total:</strong> ${escapeHtml(formatMoney(order?.totalAmount, currency))}</p></div>`;
};

const orderSummaryText = (order: any) => {
  const currency = String(order?.currency || 'ZAR');
  const products = (order?.items || []).map((item: any) => `- ${item.quantity || 0} x ${item.productName || 'Product'} | Unit: ${formatMoney(item.unitPrice, currency)} | Line total: ${formatMoney(item.totalPrice, currency)}`).join('\n') || '- No items recorded';
  const discount = Number(order?.discountAmount || 0);
  const tax = Number(order?.taxAmount || 0);
  return [
    'Products:',
    products,
    `Subtotal: ${formatMoney(order?.subtotal, currency)}`,
    ...(discount > 0 ? [`Discount${order?.discountCode ? ` (${order.discountCode})` : ''}: -${formatMoney(discount, currency)}`] : []),
    `Shipping method: ${order?.shippingPartner?.name || order?.shippingPartner?.id || 'Standard'}`,
    `Shipping cost: ${formatMoney(order?.deliveryFee, currency)}`,
    ...(tax > 0 ? [`Tax: ${formatMoney(tax, currency)}`] : []),
    `Total: ${formatMoney(order?.totalAmount, currency)}`,
  ].join('\n');
};

export const sendOrderConfirmationEmail = async ({ order }: { order: any }) => {
  const storeSettings = await getStoreSettings();
  const customerName = String(order?.customerInfo?.fullName || 'Customer').trim();
  const customerEmail = String(order?.customerInfo?.email || '').trim();
  const customerPhone = String(order?.customerInfo?.phone || '').trim();
  const orderNumber = String(order?.orderNumber || '').trim() || 'Not available';
  const paymentReference = String(order?.paystackReference || '').trim() || 'Not available';
  const paymentStatus = String(order?.paymentStatus || '').trim() || 'pending';
  const supportEmail = String(storeSettings?.storeEmail || env.ADMIN_NOTIFICATION_EMAIL || senderAddress).trim() || senderAddress;
  const currency = String(order?.currency || 'ZAR');
  const html = createBisileEmailHtml({
    title: 'Your BISILE order is confirmed',
    intro: `Hello ${customerName}, your order has been received and is now being processed.`,
    body: `<p><strong>Order number:</strong> ${escapeHtml(orderNumber)}</p><p><strong>Payment reference:</strong> ${escapeHtml(paymentReference)}</p><p><strong>Payment status:</strong> ${escapeHtml(paymentStatus)}</p><p><strong>Order date:</strong> ${escapeHtml(formatDate(order?.createdAt))}</p>${orderSummaryMarkup(order)}<p style="margin-top:18px;"><strong>Delivery address:</strong><br />${formatAddress(order?.shippingAddress)}</p><p><strong>Customer contact:</strong> ${escapeHtml(customerEmail || 'Not provided')}${customerPhone ? ` · ${escapeHtml(customerPhone)}` : ''}</p>`,
    footer: `Thank you for shopping with ${String(storeSettings?.storeName || 'BISILE')}. Support: ${supportEmail} (${currency}).`,
  });

  return sendTransactionalEmail({
    to: customerEmail,
    subject: `BISILE order confirmation ${orderNumber}`,
    html,
    text: [`Hello ${customerName}, your BISILE order has been received and is now being processed.`, `Order number: ${orderNumber}`, `Payment reference: ${paymentReference}`, `Payment status: ${paymentStatus}`, `Order date: ${formatDate(order?.createdAt)}`, '', orderSummaryText(order), '', `Delivery address: ${formatAddressText(order?.shippingAddress)}`, `Customer contact: ${customerEmail || 'Not provided'}${customerPhone ? ` · ${customerPhone}` : ''}`, `Support: ${supportEmail}`].join('\n'),
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
  const customerName = String(order?.customerInfo?.fullName || '').trim() || 'Not provided';
  const customerPhone = String(order?.customerInfo?.phone || '').trim() || 'Not provided';
  const orderNumber = String(order?.orderNumber || '').trim() || 'Not available';
  const orderStatus = String(order?.orderStatus || '').trim() || 'paid';
  const paymentStatus = String(order?.paymentStatus || '').trim() || 'paid';
  const paymentReference = String(order?.paystackReference || '').trim() || 'Not available';
  const adminDashboardUrl = `${emailSiteUrl}/admin`;
  const deliveryInstructions = String(order?.shippingAddress?.deliveryInstructions || '').trim();
  const html = createBisileEmailHtml({
    title: 'New BISILE order received',
    intro: 'A verified Paystack payment has been matched to a BISILE order.',
    body: `<p><strong>Customer:</strong> ${escapeHtml(customerName)}</p><p><strong>Email:</strong> ${escapeHtml(customerEmail || 'Not provided')}</p><p><strong>Phone:</strong> ${escapeHtml(customerPhone)}</p><p><strong>Order number:</strong> ${escapeHtml(orderNumber)}</p><p><strong>Order status:</strong> ${escapeHtml(orderStatus)}</p><p><strong>Payment status:</strong> ${escapeHtml(paymentStatus)}</p><p><strong>Payment reference:</strong> ${escapeHtml(paymentReference)}</p><p><strong>Order date:</strong> ${escapeHtml(formatDate(order?.createdAt))}</p><h2 style="margin:24px 0 10px;font-size:17px;">Order breakdown</h2>${orderSummaryMarkup(order)}<p style="margin-top:18px;"><strong>Delivery address:</strong><br />${formatAddress(order?.shippingAddress)}</p>${deliveryInstructions ? `<p><strong>Delivery instructions:</strong><br />${escapeHtml(deliveryInstructions)}</p>` : ''}<p style="margin-top:22px;"><a href="${escapeHtml(adminDashboardUrl)}" style="display:inline-block;background:#2a2114;color:#ffffff;text-decoration:none;border-radius:6px;padding:12px 18px;">Open BISILE dashboard</a></p>`,
    footer: `This notification was sent to ${String(storeSettings?.storeName || 'BISILE')} admin.`,
  });

  return sendTransactionalEmail({
    to: adminEmail,
    subject: `New BISILE order ${orderNumber}`,
    html,
    text: `New BISILE order received\n\nCustomer: ${customerName}\nEmail: ${customerEmail || 'Not provided'}\nPhone: ${customerPhone}\nOrder number: ${orderNumber}\nOrder status: ${orderStatus}\nPayment status: ${paymentStatus}\nPayment reference: ${paymentReference}\nOrder date: ${formatDate(order?.createdAt)}\n\n${orderSummaryText(order)}\n\nDelivery address: ${formatAddressText(order?.shippingAddress)}${deliveryInstructions ? `\nDelivery instructions: ${deliveryInstructions}` : ''}\n\nOpen dashboard: ${adminDashboardUrl}`,
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
