import bcrypt from 'bcrypt';
import { isValidObjectId } from 'mongoose';
import { Router } from 'express';
import type { Request } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdminManagement, requirePricePermission, requireRefundPermission, requireRole } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { Admin, AdminLog, AuditLog, Category, ContactMessage, Customer, DiscountCode, EmailLog, InventoryLog, NewsletterSubscriber, Order, Payment, Product, Refund, Review, ShippingOption, StoreSettings, Upload, User } from '../models/index.js';
import { writeAuditLog } from '../services/audit.service.js';
import { createBisileEmailHtml, sendTransactionalEmail } from '../services/email.service.js';
import { asyncHandler } from '../middleware/async-handler.js';

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

adminRoutes.get('/dashboard/stats', asyncHandler(async (_req, res) => {
  const chartStart = new Date();
  chartStart.setHours(0, 0, 0, 0);
  chartStart.setDate(chartStart.getDate() - 13);
  const [orders, products, customers, payments, totalOrders, pendingOrders, completedOrders, cancelledOrders, revenueTotals, revenueByDay] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).limit(500).lean(),
    Product.find({ isArchived: { $ne: true } }).lean(),
    Customer.countDocuments(),
    Payment.find().sort({ createdAt: -1 }).limit(20).lean(),
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: 'pending' }),
    Order.countDocuments({ orderStatus: { $in: ['paid', 'delivered', 'completed'] } }),
    Order.countDocuments({ orderStatus: { $in: ['cancelled', 'refunded'] } }),
    Order.aggregate([
      { $match: { paymentStatus: { $in: ['paid', 'partially_refunded'] } } },
      { $group: { _id: null, value: { $sum: '$totalAmount' } } },
    ]),
    Order.aggregate([
      { $match: { paymentStatus: { $in: ['paid', 'partially_refunded'] }, createdAt: { $gte: chartStart } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, value: { $sum: '$totalAmount' } } },
      { $sort: { _id: 1 } },
    ]),
  ]);
  const chartValues = new Map(revenueByDay.map((item: { _id: string; value: number }) => [item._id, Number(item.value || 0)]));
  const revenueChart = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(chartStart);
    date.setDate(chartStart.getDate() + index);
    const key = date.toISOString().slice(0, 10);
    return { date: key.slice(5), value: chartValues.get(key) || 0 };
  });
  res.json({
    totalRevenue: Number(revenueTotals[0]?.value || 0),
    totalOrders,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    totalCustomers: customers,
    lowStockProducts: products.filter((product) => Number(product.stock ?? 0) <= Number(product.lowStockThreshold ?? 3)),
    recentOrders: orders.slice(0, 10),
    recentPayments: payments,
    revenueChart,
  });
}));

adminRoutes.get('/products', requireRole('owner', 'manager'), asyncHandler(async (_req, res) => res.json({ products: await Product.find().sort({ createdAt: -1 }).lean() })));
adminRoutes.post('/products', requirePricePermission, asyncHandler(async (req, res) => res.status(201).json({ product: await Product.create(req.body) })));
adminRoutes.patch('/products/:id', requireRole('owner', 'manager'), asyncHandler(async (req: any, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid product ID' });
  if (req.body.price !== undefined && req.admin.role !== 'owner') return res.status(403).json({ error: 'Only owners can change prices' });
  const before = await Product.findById(req.params.id).lean();
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  await writeAuditLog(req, { adminId: req.admin.id, action: req.body.price !== undefined ? 'product_price_changed' : 'product_updated', entityType: 'product', entityId: req.params.id, oldValue: before, newValue: req.body });
  res.json({ product });
}));
adminRoutes.delete('/products/:id', requireRole('owner', 'manager'), asyncHandler(async (req: any, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid product ID' });
  const product = await Product.findByIdAndUpdate(req.params.id, { isArchived: true, isActive: false }, { new: true });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  await writeAuditLog(req, { adminId: req.admin.id, action: 'product_deleted', entityType: 'product', entityId: req.params.id });
  res.json({ ok: true });
}));

const crud = (path: string, model: any, roles = ['owner', 'manager', 'support']) => {
  adminRoutes.get(`/${path}`, requireRole(...roles as any), asyncHandler(async (_req, res) => {
    const records = await model.find().sort({ createdAt: -1 });
    const payload = { [path]: records };
    if (path === 'admins') {
      res.json(sanitizeAdminPayload(payload));
      return;
    }
    res.json(payload);
  }));
  adminRoutes.post(`/${path}`, requireRole(...roles as any), asyncHandler(async (req, res) => res.status(201).json({ item: await model.create(req.body) })));
  adminRoutes.patch(`/${path}/:id`, requireRole(...roles as any), asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: `Invalid ${path} ID` });
    const item = await model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: `${path} record not found` });
    return res.json({ item });
  }));
  adminRoutes.delete(`/${path}/:id`, requireRole(...roles as any), asyncHandler(async (req, res) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: `Invalid ${path} ID` });
    const item = await model.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: `${path} record not found` });
    return res.json({ ok: true });
  }));
};

crud('categories', Category, ['owner', 'manager']);
adminRoutes.get('/orders', requireRole('owner', 'manager', 'support'), asyncHandler(async (_req, res) => {
  res.json({ orders: await Order.find().sort({ createdAt: -1 }).lean() });
}));

adminRoutes.patch('/orders/:id', requireRole('owner', 'manager', 'support'), asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid order ID' });
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
}));

adminRoutes.delete('/orders/:id', requireRole('owner', 'manager', 'support'), asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid order ID' });
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.paymentStatus === 'paid') return res.status(409).json({ error: 'Paid orders cannot be deleted' });
  await order.deleteOne();
  res.json({ ok: true });
}));

crud('customers', Customer, ['owner', 'manager', 'support']);
adminRoutes.get('/customers/:id/history', requireRole('owner', 'manager', 'support'), asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid customer ID' });
  const customer = await Customer.findById(req.params.id).lean();
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  const orders = await Order.find({
    $or: [
      { customerId: customer._id },
      ...(customer.email ? [{ 'customerInfo.email': customer.email }] : []),
    ],
  }).sort({ createdAt: -1 }).lean();
  return res.json({ customer, orders });
}));
adminRoutes.get('/payments', requireRole('owner', 'manager'), asyncHandler(async (_req, res) => {
  res.json({ payments: await Payment.find().sort({ createdAt: -1 }).lean() });
}));
crud('refunds', Refund, ['owner']);
crud('contact-messages', ContactMessage, ['owner', 'manager', 'support']);
crud('newsletter', NewsletterSubscriber, ['owner', 'manager']);
crud('reviews', Review, ['owner', 'manager']);
crud('discounts', DiscountCode, ['owner', 'manager']);
crud('inventory', InventoryLog, ['owner', 'manager']);
crud('audit-logs', AuditLog, ['owner']);
crud('settings', StoreSettings, ['owner']);
const adminCreateSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  username: z.string().trim().min(3).max(60),
  email: z.string().email().max(200),
  password: z.string().min(10).max(200),
  role: z.enum(['owner', 'manager', 'support']),
}).strict();
const adminUpdateSchema = adminCreateSchema.partial().strict();

adminRoutes.get('/admins', requireAdminManagement, asyncHandler(async (_req, res) => {
  const admins = await Admin.find().sort({ createdAt: -1 }).lean();
  res.json({ admins: admins.map((admin) => sanitizeAdmin(admin)) });
}));
adminRoutes.post('/admins', requireAdminManagement, validate(adminCreateSchema), asyncHandler(async (req, res) => {
  const admin = await Admin.create({
    fullName: req.body.fullName,
    username: req.body.username.toLowerCase(),
    email: req.body.email.toLowerCase(),
    passwordHash: await bcrypt.hash(req.body.password, 12),
    role: req.body.role,
    isActive: true,
  });
  res.status(201).json({ admin: sanitizeAdmin(admin) });
}));
adminRoutes.patch('/admins/:id', requireAdminManagement, validate(adminUpdateSchema), asyncHandler(async (req: any, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid admin ID' });
  const update: Record<string, unknown> = { ...req.body };
  if (update.username) update.username = String(update.username).toLowerCase();
  if (update.email) update.email = String(update.email).toLowerCase();
  if (update.password) {
    update.passwordHash = await bcrypt.hash(String(update.password), 12);
    update.mustChangePassword = false;
    delete update.password;
  }
  const admin = await Admin.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).lean();
  if (!admin) return res.status(404).json({ error: 'Admin not found' });
  res.json({ admin: sanitizeAdmin(admin) });
}));
adminRoutes.delete('/admins/:id', requireAdminManagement, asyncHandler(async (req: any, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid admin ID' });
  if (String(req.params.id) === String(req.admin?.id)) return res.status(400).json({ error: 'You cannot deactivate your own admin account' });
  const admin = await Admin.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).lean();
  if (!admin) return res.status(404).json({ error: 'Admin not found' });
  res.json({ ok: true });
}));
crud('users', User, ['owner']);
crud('shipping-options', ShippingOption, ['owner', 'manager']);
crud('email-logs', EmailLog, ['owner', 'manager', 'support']);
crud('uploads', Upload, ['owner', 'manager']);
crud('admin-logs', AdminLog, ['owner']);

adminRoutes.post('/messages/send', requireRole('owner', 'manager', 'support'), asyncHandler(async (req: Request & { admin?: { email?: string } }, res) => {
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
}));

adminRoutes.patch('/refunds/:id/approve', requireRefundPermission, asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid refund ID' });
  const refund = await Refund.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true, runValidators: true });
  if (!refund) return res.status(404).json({ error: 'Refund not found' });
  return res.json({ refund });
}));
