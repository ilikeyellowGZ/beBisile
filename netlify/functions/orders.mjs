import { collectionNames, getDb, json, now, toObjectId } from '../lib/secure-db.mjs';
import { requireAdmin, writeAuditLog } from '../lib/admin-auth.mjs';
import { parseJsonBody } from '../lib/commerce-service.mjs';

const orderDate = (order) => new Date(order.createdAt || order.updatedAt || Date.now());
const money = (value) => Math.round(Number(value || 0) * 100) / 100;

const buildStats = (orders, products, payments) => {
  const todayKey = new Date().toISOString().slice(0, 10);
  const monthKey = new Date().toISOString().slice(0, 7);
  const paidOrders = orders.filter((order) => String(order.paymentStatus).toLowerCase().includes('paid'));
  const revenue = paidOrders.reduce((sum, order) => sum + Number(order.totalAmount ?? order.total ?? 0), 0);
  const revenueToday = paidOrders.filter((order) => orderDate(order).toISOString().slice(0, 10) === todayKey).reduce((sum, order) => sum + Number(order.totalAmount ?? order.total ?? 0), 0);
  const revenueThisMonth = paidOrders.filter((order) => orderDate(order).toISOString().slice(0, 7) === monthKey).reduce((sum, order) => sum + Number(order.totalAmount ?? order.total ?? 0), 0);

  const customers = new Set(orders.map((order) => order.customerInfo?.email || order.customer?.email).filter(Boolean));
  const productMovement = new Map();
  orders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const key = String(item.productId || item.id || item.productName || item.name);
      const current = productMovement.get(key) || { id: key, name: item.productName || item.name, quantity: 0, revenue: 0 };
      current.quantity += Number(item.quantity || 0);
      current.revenue += Number(item.totalPrice ?? (item.unitPrice || 0) * (item.quantity || 0));
      productMovement.set(key, current);
    });
  });

  const revenueByDay = new Map();
  paidOrders.forEach((order) => {
    const key = orderDate(order).toISOString().slice(0, 10);
    revenueByDay.set(key, money((revenueByDay.get(key) || 0) + Number(order.totalAmount ?? order.total ?? 0)));
  });

  const statusCounts = orders.reduce((acc, order) => {
    const status = order.orderStatus || order.paymentStatus || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return {
    totals: {
      totalSales: paidOrders.length,
      totalRevenue: money(revenue),
      totalOrders: orders.length,
      pendingOrders: orders.filter((order) => ['pending', 'processing'].includes(String(order.orderStatus || order.paymentStatus).toLowerCase())).length,
      completedOrders: orders.filter((order) => ['delivered', 'completed', 'paid'].includes(String(order.orderStatus || order.paymentStatus).toLowerCase())).length,
      cancelledOrders: orders.filter((order) => ['cancelled', 'refunded'].includes(String(order.orderStatus || order.paymentStatus).toLowerCase())).length,
      totalCustomers: customers.size,
      revenueToday: money(revenueToday),
      revenueThisMonth: money(revenueThisMonth),
      ordersToday: orders.filter((order) => orderDate(order).toISOString().slice(0, 10) === todayKey).length,
      productsInStock: products.filter((product) => Number(product.stock || 0) > 0).length,
      lowStockProducts: products.filter((product) => Number(product.stock || 0) <= Number(product.lowStockThreshold ?? 3)).length,
      recentPayments: payments.slice(0, 8),
    },
    lowStock: products.filter((product) => Number(product.stock || 0) <= Number(product.lowStockThreshold ?? 3)).slice(0, 12),
    bestSellingProducts: [...productMovement.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 10),
    revenueChart: [...revenueByDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, value })),
    orderStatusChart: Object.entries(statusCounts).map(([status, value]) => ({ status, value })),
  };
};

export const handler = async (event) => {
  try {
    const admin = await requireAdmin(event);
    const db = await getDb();

    if (event.httpMethod === 'GET') {
      const url = new URL(event.rawUrl || `https://local${event.path || ''}`);
      const status = url.searchParams.get('status');
      const query = {};
      if (status) query.$or = [{ orderStatus: status }, { paymentStatus: status }];

      const [orders, products, payments] = await Promise.all([
        db.collection(collectionNames.orders).find(query).sort({ createdAt: -1 }).limit(500).toArray(),
        db.collection(collectionNames.products).find({ isArchived: { $ne: true } }).sort({ createdAt: -1 }).toArray(),
        db.collection(collectionNames.payments).find({}).sort({ createdAt: -1 }).limit(100).toArray(),
      ]);

      return json(200, {
        orders,
        products,
        payments,
        dashboard: buildStats(orders, products, payments),
      });
    }

    if (event.httpMethod === 'PATCH') {
      const body = parseJsonBody(event);
      const id = toObjectId(body.orderId);
      if (!id) return json(400, { error: 'orderId is required' });

      const allowed = {};
      for (const field of ['orderStatus', 'shippingStatus', 'trackingNumber']) {
        if (body[field] !== undefined) allowed[field] = body[field];
      }
      if (!Object.keys(allowed).length) return json(400, { error: 'No allowed order fields supplied' });

      const before = await db.collection(collectionNames.orders).findOne({ _id: id });
      await db.collection(collectionNames.orders).updateOne({ _id: id }, { $set: { ...allowed, updatedAt: now() } });
      await writeAuditLog(event, admin, 'order_status_changed', 'order', id, before, allowed);
      return json(200, { ok: true });
    }

    return json(405, { error: 'Method not allowed' });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || 'Orders API failed' });
  }
};
