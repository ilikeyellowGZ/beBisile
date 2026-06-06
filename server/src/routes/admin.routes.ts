import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdminManagement, requirePricePermission, requireRefundPermission, requireRole } from '../middleware/role.middleware.js';
import { Admin, AuditLog, Category, ContactMessage, Customer, DiscountCode, InventoryLog, NewsletterSubscriber, Order, Payment, Product, Refund, Review, StoreSettings } from '../models/index.js';
import { writeAuditLog } from '../services/audit.service.js';

export const adminRoutes = Router();
adminRoutes.use(requireAuth);

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
  adminRoutes.get(`/${path}`, requireRole(...roles as any), async (_req, res) => res.json({ [path]: await model.find().sort({ createdAt: -1 }) }));
  adminRoutes.post(`/${path}`, requireRole(...roles as any), async (req, res) => res.status(201).json({ item: await model.create(req.body) }));
  adminRoutes.patch(`/${path}/:id`, requireRole(...roles as any), async (req, res) => res.json({ item: await model.findByIdAndUpdate(req.params.id, req.body, { new: true }) }));
  adminRoutes.delete(`/${path}/:id`, requireRole(...roles as any), async (req, res) => { await model.findByIdAndDelete(req.params.id); res.json({ ok: true }); });
};

crud('categories', Category, ['owner', 'manager']);
crud('orders', Order, ['owner', 'manager', 'support']);
crud('customers', Customer, ['owner', 'manager', 'support']);
crud('payments', Payment, ['owner', 'manager']);
crud('refunds', Refund, ['owner']);
crud('contact-messages', ContactMessage, ['owner', 'manager', 'support']);
crud('newsletter', NewsletterSubscriber, ['owner', 'manager']);
crud('reviews', Review, ['owner', 'manager']);
crud('discounts', DiscountCode, ['owner', 'manager']);
crud('inventory', InventoryLog, ['owner', 'manager']);
crud('audit-logs', AuditLog, ['owner']);
crud('settings', StoreSettings, ['owner']);
crud('admins', Admin, ['owner']);

adminRoutes.patch('/refunds/:id/approve', requireRefundPermission, async (req, res) => res.json({ refund: await Refund.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true }) }));
adminRoutes.patch('/admins/:id', requireAdminManagement, async (req, res) => res.json({ admin: await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true }) }));
