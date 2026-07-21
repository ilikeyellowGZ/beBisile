import { Router } from 'express';
import type { Request } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdminManagement, requirePricePermission, requireRefundPermission, requireRole } from '../middleware/role.middleware.js';
import { Admin, AdminLog, AuditLog, Category, ContactMessage, Customer, DiscountCode, EmailLog, InventoryLog, NewsletterSubscriber, Order, Payment, Product, Refund, Review, ShippingOption, StoreSettings, Upload, User } from '../models/index.js';
import { writeAuditLog } from '../services/audit.service.js';
import { createBisileEmailHtml, sendTransactionalEmail } from '../services/email.service.js';

export const adminRoutes = Router();
adminRoutes.use(requireAuth);

const sanitizeAdmin = (admin: any) => ({
  _id: admin?._id,
  id: admin?._id,
  fullName: admin?.fullName,
  username: admin?.username,
  email: admin?.email,
  role: admin?.role,
  avatar: admin?.avatar,
  isActive: admin?.isActive,
  createdAt: admin?.createdAt,
  updatedAt: admin?.updatedAt,
  lastLoginAt: admin?.lastLoginAt,
});

const sanitizeAdminPayload = (payload: any) => {
  if (Array.isArray(payload)) return payload.map((item) => sanitizeAdmin(item));
  if (payload && typeof payload === 'object' && 'admins' in payload) {
    return { ...payload, admins: payload.admins.map((item: any) => sanitizeAdmin(item)) };
  }
  return payload;
};

adminRoutes.get('/dashboard/stats', async (_req, res) => {
  const [orders, products, customers, payments] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).limit(500).lean(),
    Product.find({ isArchived: { $ne: true } }).lean(),
    Customer.countDocuments(),
    Payment.find().sort({ createdAt: -1 }).limit(20).lean()
  ]);
  const paidOrders = orders.filter((order) => String(order.paymentStatus).includes('paid'));
  res.json({
    totalRevenue: paidOrders.reduce((sum, order) => sum + Number(order.totalAmount ?? 0), 0),
    totalOrders: orders.length,
    pendingOrders: orders.filter((order) => order.orderStatus === 'pending').length,
    completedOrders: orders.filter((order) => ['paid', 'delivered', 'completed'].includes(order.orderStatus)).length,
    cancelledOrders: orders.filter((order) => ['cancelled', 'refunded'].includes(order.orderStatus)).length,
    totalCustomers: customers,
    lowStockProducts: products.filter((product) => Number(product.stock ?? 0) <= Number(product.lowStockThreshold ?? 3)),
    recentOrders: orders.slice(0, 10),
    recentPayments: payments
  });
});

adminRoutes.get('/products', requireRole('owner', 'manager'), async (_req, res) => res.json({ products: await Product.find().sort({ createdAt: -1 }) }));
adminRoutes.post('/products', requirePricePermission, async (req, res) => res.status(201).json({ product: await Product.create(req.body) }));
adminRoutes.patch('/products/:id', requireRole('owner', 'manager'), async (req: any, res) => {
  if (req.body.price !== undefined && req.admin.role !== 'owner') return res.status(403).json({ error: 'Only owners can change prices' });
  const before = await Product.findById(req.params.id).lean();
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  await writeAuditLog(req, { adminId: req.admin.id, action: req.body.price !== undefined ? 'product_price_changed' : 'product_updated', entityType: 'product', entityId: req.params.id, oldValue: before, newValue: req.body });
  res.json({ product });
});
adminRoutes.delete('/products/:id', requireRole('owner', 'manager'), async (req: any, res) => {
  await Product.findByIdAndUpdate(req.params.id, { isArchived: true, isActive: false });
  await writeAuditLog(req, { adminId: req.admin.id, action: 'product_deleted', entityType: 'product', entityId: req.params.id });
  res.json({ ok: true });
});

const crud = (path: string, model: any, roles = ['owner', 'manager', 'support']) => {
  adminRoutes.get(`/${path}`, requireRole(...roles as any), async (_req, res) => {
    const records = await model.find().sort({ createdAt: -1 });
    const payload = { [path]: records };
    if (path === 'admins') {
      res.json(sanitizeAdminPayload(payload));
      return;
    }
    res.json(payload);
  });
  adminRoutes.post(`/${path}`, requireRole(...roles as any), async (req, res) => res.status(201).json({ item: await model.create(req.body) }));
  adminRoutes.patch(`/${path}/:id`, requireRole(...roles as any), async (req, res) => res.json({ item: await model.findByIdAndUpdate(req.params.id, req.body, { new: true }) }));
  adminRoutes.delete(`/${path}/:id`, requireRole(...roles as any), async (req, res) => { await model.findByIdAndDelete(req.params.id); res.json({ ok: true }); });
};

crud('categories', Category, ['owner', 'manager']);
adminRoutes.get('/orders', requireRole('owner', 'manager', 'support'), async (_req, res) => {
  res.json({ orders: await Order.find().sort({ createdAt: -1 }) });
});

adminRoutes.patch('/orders/:id', requireRole('owner', 'manager', 'support'), async (req, res) => {
  const allowed: Record<string, string> = {};
  const orderStatuses = new Set(['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled']);
  const shippingStatuses = new Set(['not_shipped', 'processing', 'shipped', 'delivered', 'returned']);
  if (req.body.orderStatus !== undefined && orderStatuses.has(String(req.body.orderStatus))) allowed.orderStatus = String(req.body.orderStatus);
  if (req.body.shippingStatus !== undefined && shippingStatuses.has(String(req.body.shippingStatus))) allowed.shippingStatus = String(req.body.shippingStatus);
  if (req.body.trackingNumber !== undefined) allowed.trackingNumber = String(req.body.trackingNumber).trim().slice(0, 100);
  if (!Object.keys(allowed).length) return res.status(400).json({ error: 'Only operational order fields may be changed' });

  const order = await Order.findByIdAndUpdate(req.params.id, { $set: { ...allowed, updatedAt: new Date() } }, { new: true });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({ item: order });
});

adminRoutes.delete('/orders/:id', requireRole('owner', 'manager', 'support'), async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.paymentStatus === 'paid') return res.status(409).json({ error: 'Paid orders cannot be deleted' });
  await order.deleteOne();
  res.json({ ok: true });
});

crud('customers', Customer, ['owner', 'manager', 'support']);
adminRoutes.get('/payments', requireRole('owner', 'manager'), async (_req, res) => {
  res.json({ payments: await Payment.find().sort({ createdAt: -1 }) });
});
crud('refunds', Refund, ['owner']);
crud('contact-messages', ContactMessage, ['owner', 'manager', 'support']);
crud('newsletter', NewsletterSubscriber, ['owner', 'manager']);
crud('reviews', Review, ['owner', 'manager']);
crud('discounts', DiscountCode, ['owner', 'manager']);
crud('inventory', InventoryLog, ['owner', 'manager']);
crud('audit-logs', AuditLog, ['owner']);
crud('settings', StoreSettings, ['owner']);
crud('admins', Admin, ['owner']);
crud('users', User, ['owner']);
crud('shipping-options', ShippingOption, ['owner', 'manager']);
crud('email-logs', EmailLog, ['owner', 'manager', 'support']);
crud('uploads', Upload, ['owner', 'manager']);
crud('admin-logs', AdminLog, ['owner']);

adminRoutes.post('/messages/send', requireRole('owner', 'manager', 'support'), async (req: Request & { admin?: { email?: string } }, res) => {
  const recipientEmail = String(req.body.recipientEmail || '').trim();
  const recipientName = String(req.body.recipientName || 'Customer').trim();
  const subject = String(req.body.subject || 'Message from BISILE').trim();
  const message = String(req.body.message || '').trim();

  if (!recipientEmail || !message) return res.status(400).json({ error: 'Recipient email and message are required' });

  try {
    const html = createBisileEmailHtml({
      title: subject,
      intro: `Hello ${recipientName},`,
      body: `<p>${message.replace(/\n/g, '<br />')}</p><p style="margin-top:16px;">Thanks,<br />The BISILE team</p>`,
      footer: 'This message was sent from the BISILE admin dashboard.',
    });

    await sendTransactionalEmail({
      to: recipientEmail,
      subject,
      html,
      text: `${message}\n\nThanks,\nThe BISILE team`,
      type: 'admin_message',
      from: req.admin?.email ? `BISILE Admin <${req.admin.email}>` : undefined,
      metadata: { recipientName, senderEmail: req.admin?.email },
    });

    await ContactMessage.create({ fullName: recipientName, email: recipientEmail, subject, message, status: 'sent' });
    res.json({ ok: true, message: 'Message sent successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Message delivery failed';
    res.status(502).json({ error: message });
  }
});

adminRoutes.patch('/refunds/:id/approve', requireRefundPermission, async (req, res) => res.json({ refund: await Refund.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true }) }));
adminRoutes.patch('/admins/:id', requireAdminManagement, async (req, res) => res.json({ admin: await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true }) }));
