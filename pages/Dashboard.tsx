import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Boxes, CircleDollarSign, ClipboardList, Gauge, Inbox, KeyRound, Layers, Mail, PackageCheck, Percent, RefreshCw, Search, Settings, ShieldCheck, ShoppingBag, Star, Truck, Users } from 'lucide-react';
import { CONFIGURABLE_HAIR_PRODUCTS, PRODUCTS } from '../constants';
import { packageImages } from '../src/assets/images';

type AdminSection = 'overview' | 'products' | 'categories' | 'orders' | 'customers' | 'payments' | 'refunds' | 'inventory' | 'reviews' | 'discounts' | 'messages' | 'newsletter' | 'admins' | 'audit' | 'settings';
type ApiMap = Record<string, any[]>;

const currency = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' });
const dateFormatter = new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium', timeStyle: 'short' });

const dashboardProductCatalog = [...PRODUCTS, ...CONFIGURABLE_HAIR_PRODUCTS];
const productById = new Map(dashboardProductCatalog.map((product) => [product.id, product]));

const sections: Array<{ id: AdminSection; label: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }> }> = [
  { id: 'overview', label: 'Dashboard', icon: Gauge },
  { id: 'products', label: 'Products', icon: Boxes },
  { id: 'categories', label: 'Categories', icon: Layers },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'payments', label: 'Payments', icon: CircleDollarSign },
  { id: 'refunds', label: 'Refunds', icon: RefreshCw },
  { id: 'inventory', label: 'Inventory', icon: PackageCheck },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'discounts', label: 'Discounts', icon: Percent },
  { id: 'messages', label: 'Messages', icon: Inbox },
  { id: 'newsletter', label: 'Newsletter', icon: Mail },
  { id: 'admins', label: 'Admin Users', icon: KeyRound },
  { id: 'audit', label: 'Audit Logs', icon: ShieldCheck },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const collectionResource: Partial<Record<AdminSection, string>> = {
  categories: 'categories',
  customers: 'customers',
  payments: 'payments',
  refunds: 'refunds',
  inventory: 'inventoryLogs',
  reviews: 'reviews',
  discounts: 'discountCodes',
  messages: 'contactMessages',
  newsletter: 'newsletterSubscribers',
  admins: 'admins',
  audit: 'auditLogs',
  settings: 'storeSettings',
};

const demoOrders = [
  {
    _id: 'demo-1001',
    orderNumber: 'BIS-DEMO-1001',
    customerInfo: { fullName: 'A. Mokoena', email: 'demo@bisile.co.za', phone: '+27 60 000 0001' },
    shippingAddress: { city: 'Johannesburg' },
    items: [{ id: 'indoniyamanzi', productName: 'Indoniyamanzi', quantity: 2, unitPrice: 499.99, totalPrice: 999.98 }],
    totalAmount: 999.98,
    paymentStatus: 'paid',
    orderStatus: 'paid',
    shippingStatus: 'processing',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    _id: 'demo-1002',
    orderNumber: 'BIS-DEMO-1002',
    customerInfo: { fullName: 'N. Dlamini', email: 'client@example.com', phone: '+27 60 000 0002' },
    shippingAddress: { city: 'Windhoek' },
    items: [{ id: 'khwezilokusa', productName: 'Khwezilokusa', quantity: 1, unitPrice: 2799.99, totalPrice: 2799.99 }],
    totalAmount: 2799.99,
    paymentStatus: 'pending',
    orderStatus: 'pending',
    shippingStatus: 'not_shipped',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(),
  },
];

const statusTone = (status: string) => {
  const text = String(status || '').toLowerCase();
  if (text.includes('paid') || text.includes('active') || text.includes('approved') || text.includes('delivered')) return 'bg-[#edf7ef] text-[#1d6b36]';
  if (text.includes('pending') || text.includes('processing') || text.includes('new')) return 'bg-[#fff8e8] text-[#8a6420]';
  if (text.includes('fail') || text.includes('cancel') || text.includes('reject') || text.includes('archived')) return 'bg-[#fff0ee] text-[#a63b2d]';
  return 'bg-[#f7f5f1] text-primary/60';
};

const getToken = () => localStorage.getItem('bisileAdminToken') ?? localStorage.getItem('adminToken') ?? '';

const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
};

const normalizeOrderItemId = (item: any) => String(item.productId || item.variantId || item.sku || item.id || normalizeOrderItemName(item));
const normalizeOrderItemName = (item: any) => item.productName || item.name || item.id || 'Product';
const normalizeOrderTotal = (order: any) => Number(order.totalAmount ?? order.total ?? 0);
const getProductRowId = (row: any) => String(row.productId || row.variantId || row.sku || row.id || row._id || '—');

const DataTable: React.FC<{ title: string; rows: any[]; columns: Array<{ key: string; label: string; render?: (row: any) => React.ReactNode }> }> = ({ title, rows, columns }) => (
  <div className="border border-[#e5e2dd] bg-white">
    <div className="border-b border-[#e5e2dd] p-5">
      <h2 className="font-inter text-2xl font-light">{title}</h2>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[780px] border-collapse">
        <thead>
          <tr className="border-b border-[#e5e2dd] text-left">
            {columns.map((column) => <th key={column.key} className="px-5 py-3 font-inter text-xs font-light text-primary/45">{column.label}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e2dd]">
          {rows.map((row, index) => (
            <tr key={row._id || row.id || index}>
              {columns.map((column) => <td key={column.key} className="px-5 py-4 align-top font-inter text-sm font-light">{column.render ? column.render(row) : row[column.key] ?? '—'}</td>)}
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={columns.length} className="px-5 py-8 font-inter text-sm font-light text-primary/50">No records yet.</td></tr>}
        </tbody>
      </table>
    </div>
  </div>
);

const RevenueBars: React.FC<{ data: Array<{ date: string; value: number }> }> = ({ data }) => {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="flex h-56 items-end gap-2 border border-[#e5e2dd] bg-white p-5">
      {(data.length ? data : [{ date: 'No data', value: 0 }]).slice(-14).map((item) => (
        <div key={item.date} className="flex flex-1 flex-col items-center gap-2">
          <div className="w-full bg-primary transition-all" style={{ height: `${Math.max(6, (item.value / max) * 170)}px` }} />
          <span className="max-w-16 truncate font-inter text-[10px] font-light text-primary/40">{item.date}</span>
        </div>
      ))}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const [section, setSection] = useState<AdminSection>('overview');
  const [orders, setOrders] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [collections, setCollections] = useState<ApiMap>({});
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = await apiFetch('/.netlify/functions/orders');
      setOrders(payload.orders || []);
      setProducts(payload.products || []);
      setDashboard(payload.dashboard || null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load live dashboard data');
      setOrders(demoOrders);
      setProducts(dashboardProductCatalog.map((product) => ({ ...product, stock: product.collection === 'fragrance' ? 12 : 4, isActive: true })));
      setDashboard(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCollection = async (nextSection: AdminSection) => {
    setSection(nextSection);
    const resource = collectionResource[nextSection];
    if (!resource || collections[resource]) return;
    try {
      const payload = await apiFetch(`/.netlify/functions/admin-collections?resource=${resource}`);
      setCollections((current) => ({ ...current, [resource]: payload[resource] || payload[nextSection] || [] }));
    } catch {
      setCollections((current) => ({ ...current, [resource]: [] }));
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const filteredOrders = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return orders;
    return orders.filter((order) => [
      order.orderNumber,
      order.customerInfo?.fullName,
      order.customerInfo?.email,
      order.customerInfo?.phone,
      order.paymentStatus,
      order.orderStatus,
      ...(order.items || []).map(normalizeOrderItemName),
      ...(order.items || []).map(normalizeOrderItemId),
    ].join(' ').toLowerCase().includes(text));
  }, [orders, query]);

  const computed = useMemo(() => {
    const paid = filteredOrders.filter((order) => String(order.paymentStatus).toLowerCase().includes('paid'));
    const revenue = paid.reduce((sum, order) => sum + normalizeOrderTotal(order), 0);
    const itemCount = filteredOrders.reduce((sum, order) => sum + (order.items || []).reduce((inner: number, item: any) => inner + Number(item.quantity || 0), 0), 0);
    const customerCount = new Set(filteredOrders.map((order) => order.customerInfo?.email).filter(Boolean)).size;
    const movement = new Map<string, { id: string; name: string; quantity: number; revenue: number }>();
    filteredOrders.forEach((order) => (order.items || []).forEach((item: any) => {
      const id = normalizeOrderItemId(item);
      const current = movement.get(id) || { id, name: normalizeOrderItemName(item), quantity: 0, revenue: 0 };
      current.quantity += Number(item.quantity || 0);
      current.revenue += Number(item.totalPrice ?? (item.unitPrice || 0) * (item.quantity || 0));
      movement.set(id, current);
    }));
    return {
      revenue,
      itemCount,
      customerCount,
      avgOrder: filteredOrders.length ? revenue / filteredOrders.length : 0,
      topProducts: [...movement.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8),
    };
  }, [filteredOrders]);

  const currentResource = collectionResource[section];
  const currentRows = currentResource ? collections[currentResource] || [] : [];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid gap-px bg-[#e5e2dd] md:grid-cols-2 xl:grid-cols-6">
        {[
          ['Revenue', currency.format(dashboard?.totals?.totalRevenue ?? computed.revenue), CircleDollarSign],
          ['Orders', String(dashboard?.totals?.totalOrders ?? filteredOrders.length), ShoppingBag],
          ['Pending', String(dashboard?.totals?.pendingOrders ?? filteredOrders.filter((order) => order.orderStatus === 'pending').length), ClipboardList],
          ['Customers', String(dashboard?.totals?.totalCustomers ?? computed.customerCount), Users],
          ['In stock', String(dashboard?.totals?.productsInStock ?? products.filter((product) => Number(product.stock || 0) > 0).length), Boxes],
          ['Low stock', String(dashboard?.totals?.lowStockProducts ?? products.filter((product) => Number(product.stock || 0) <= Number(product.lowStockThreshold ?? 3)).length), Activity],
        ].map(([label, value, Icon]) => (
          <div key={String(label)} className="bg-white p-5">
            <Icon size={18} strokeWidth={1.25} className="mb-5 text-primary/45" />
            <p className="font-inter text-xs font-light text-primary/45">{label}</p>
            <p className="mt-2 font-inter text-2xl font-light">{value as string}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-inter text-2xl font-light">Revenue chart</h2>
            <span className="font-inter text-xs font-light text-primary/45">Webhook-confirmed payments only</span>
          </div>
          <RevenueBars data={dashboard?.revenueChart || []} />
        </div>
        <div className="border border-[#e5e2dd] bg-white p-5">
          <h2 className="font-inter text-2xl font-light">Best-selling products</h2>
          <div className="mt-6 space-y-4">
            {computed.topProducts.map((item, index) => {
              const product = productById.get(item.id) || products.find((candidate) => getProductRowId(candidate) === item.id || candidate.name === item.name);
              return (
                <div key={item.id} className="grid grid-cols-[56px_1fr_auto] items-center gap-4">
                  <div className="aspect-square overflow-hidden bg-[#f7f5f1]"><img src={product?.image || product?.images?.[0] || packageImages.product07} alt={item.name} className={`h-full w-full ${product?.imageFit === 'contain' ? 'object-contain p-2' : 'object-cover'}`} /></div>
                  <div>
                    <p className="font-inter text-sm font-normal">{index + 1}. {item.name}</p>
                    <p className="font-inter text-xs font-light text-primary/45">{item.quantity} sold</p>
                    <p className="mt-1 font-inter text-[10px] font-light uppercase tracking-[0.12em] text-primary/38">ID {item.id}</p>
                  </div>
                  <p className="font-inter text-sm font-light">{currency.format(item.revenue)}</p>
                </div>
              );
            })}
            {!computed.topProducts.length && <p className="font-inter text-sm font-light text-primary/50">No purchases yet.</p>}
          </div>
        </div>
      </div>

      <DataTable title="Recent orders" rows={filteredOrders.slice(0, 10)} columns={[
        { key: 'customer', label: 'Customer', render: (row) => <div><p>{row.customerInfo?.fullName || row.customer?.fullName || 'Unknown'}</p><p className="text-xs text-primary/45">{row.customerInfo?.email || row.customer?.email}</p></div> },
        { key: 'items', label: 'Products', render: (row) => <div className="flex flex-wrap gap-2">{(row.items || []).map((item: any) => <span key={`${row._id}-${normalizeOrderItemId(item)}`} className="border border-[#e5e2dd] px-2 py-1 text-xs">{item.quantity}x {normalizeOrderItemName(item)} <span className="text-primary/40">/ {normalizeOrderItemId(item)}</span></span>)}</div> },
        { key: 'totalAmount', label: 'Total', render: (row) => currency.format(normalizeOrderTotal(row)) },
        { key: 'paymentStatus', label: 'Payment', render: (row) => <span className={`px-2 py-1 text-xs ${statusTone(row.paymentStatus)}`}>{row.paymentStatus}</span> },
        { key: 'createdAt', label: 'Date', render: (row) => row.createdAt ? dateFormatter.format(new Date(row.createdAt)) : '—' },
      ]} />
    </div>
  );

  const renderTable = () => {
    if (section === 'products') {
      return <DataTable title="Products" rows={products} columns={[
        { key: 'image', label: 'Image', render: (row) => <div className="h-12 w-12 overflow-hidden bg-[#f7f5f1]"><img src={row.image || row.images?.[0] || packageImages.product07} alt={row.name} className="h-full w-full object-cover" /></div> },
        { key: 'id', label: 'ID / SKU', render: (row) => <span className="font-inter text-xs font-light text-primary/58">{getProductRowId(row)}</span> },
        { key: 'name', label: 'Product', render: (row) => <div><p>{row.name}</p>{row.selectedOptions && <p className="mt-1 text-xs text-primary/42">{Object.values(row.selectedOptions).join(' / ')}</p>}</div> },
        { key: 'category', label: 'Category', render: (row) => row.category || row.collection || '—' },
        { key: 'price', label: 'Price', render: (row) => currency.format(Number(row.price || 0)) },
        { key: 'stock', label: 'Stock', render: (row) => <span className={Number(row.stock || 0) <= Number(row.lowStockThreshold ?? 3) ? 'text-[#a63b2d]' : ''}>{row.stock ?? '—'}</span> },
        { key: 'status', label: 'Status', render: (row) => <span className={`px-2 py-1 text-xs ${statusTone(row.isActive === false ? 'inactive' : 'active')}`}>{row.isActive === false ? 'Inactive' : 'Active'}</span> },
        { key: 'featured', label: 'Featured', render: (row) => row.isFeatured || row.isBestSeller ? 'Yes' : 'No' },
      ]} />;
    }

    if (section === 'orders') {
      return <DataTable title="Orders" rows={filteredOrders} columns={[
        { key: 'orderNumber', label: 'Order' },
        { key: 'customer', label: 'Customer', render: (row) => <div><p>{row.customerInfo?.fullName || '—'}</p><p className="text-xs text-primary/45">{row.customerInfo?.email}</p></div> },
        {
          key: 'items',
          label: 'Items / IDs',
          render: (row) => (
            <div className="grid gap-2">
              {(row.items || []).map((item: any) => (
                <div key={`${row._id}-${normalizeOrderItemId(item)}`}>
                  <p>{item.quantity}x {normalizeOrderItemName(item)}</p>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-primary/40">{normalizeOrderItemId(item)}</p>
                </div>
              ))}
            </div>
          ),
        },
        { key: 'totalAmount', label: 'Total', render: (row) => currency.format(normalizeOrderTotal(row)) },
        { key: 'paymentStatus', label: 'Payment', render: (row) => <span className={`px-2 py-1 text-xs ${statusTone(row.paymentStatus)}`}>{row.paymentStatus}</span> },
        { key: 'shippingStatus', label: 'Shipping', render: (row) => <span className={`px-2 py-1 text-xs ${statusTone(row.shippingStatus)}`}>{row.shippingStatus}</span> },
      ]} />;
    }

    return <DataTable title={sections.find((item) => item.id === section)?.label || 'Records'} rows={currentRows} columns={[
      { key: 'name', label: 'Name / ID', render: (row) => row.name || row.fullName || row.email || row.code || row.orderNumber || String(row._id || '—') },
      { key: 'status', label: 'Status', render: (row) => <span className={`px-2 py-1 text-xs ${statusTone(row.status || row.paymentStatus || row.role || (row.isActive === false ? 'inactive' : 'active'))}`}>{row.status || row.paymentStatus || row.role || (row.isActive === false ? 'Inactive' : 'Active')}</span> },
      { key: 'detail', label: 'Detail', render: (row) => row.message || row.subject || row.description || row.reason || row.action || row.storeEmail || row.phone || '—' },
      { key: 'createdAt', label: 'Created', render: (row) => row.createdAt ? dateFormatter.format(new Date(row.createdAt)) : '—' },
    ]} />;
  };

  return (
    <div className="min-h-screen bg-off-white pt-16 text-primary">
      <div className="grid lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-[#D8D0C3] bg-[#F7F4EF] lg:min-h-[calc(100vh-4rem)]">
          <div className="sticky top-16 p-5">
            <p className="bisile-kicker mb-4">Admin</p>
            <div className="grid gap-1">
              {sections.map((item) => (
                <button key={item.id} onClick={() => void loadCollection(item.id)} className={`flex items-center gap-3 px-3 py-2.5 text-left font-inter text-sm font-light transition-colors ${section === item.id ? 'bg-[#f7f5f1] text-primary' : 'text-primary/55 hover:bg-[#f7f5f1] hover:text-primary'}`}>
                  <item.icon size={16} strokeWidth={1.25} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main>
          <section className="border-b border-[#e5e2dd] p-6 md:p-8">
            <div className="grid gap-6 xl:grid-cols-[1fr_auto] xl:items-end">
              <div>
                <p className="bisile-kicker mb-3">BISILE backend</p>
                <h1 className="font-inter text-4xl font-light leading-tight md:text-5xl">{sections.find((item) => item.id === section)?.label}</h1>
                <p className="mt-4 max-w-3xl font-inter text-sm font-light leading-7 text-primary/60">
                  Manage products, backend-controlled prices, stock, orders, payments, customers, messages, discounts, refunds, settings, and audit history from one secure console.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <label className="flex h-11 items-center gap-3 border border-[#e5e2dd] px-3">
                  <Search size={16} strokeWidth={1.25} className="text-primary/45" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search orders..." className="h-full w-full bg-transparent font-inter text-sm font-light outline-none placeholder:text-primary/35" />
                </label>
                <button onClick={() => void loadDashboard()} className="flex h-11 items-center justify-center gap-2 border border-primary px-4 font-inter text-sm font-light transition-colors hover:border-accent hover:text-accent">
                  <RefreshCw size={15} strokeWidth={1.25} /> Refresh
                </button>
              </div>
            </div>
            {error && <div className="mt-6 border border-[#e5e2dd] bg-[#f7f5f1] p-4 font-inter text-sm font-light text-primary/60">Live admin data could not load, showing local/demo data. Details: {error}</div>}
          </section>

          <section className="p-6 md:p-8">
            {isLoading ? <div className="border border-[#e5e2dd] p-8 font-inter text-sm font-light text-primary/55">Loading dashboard...</div> : section === 'overview' ? renderOverview() : renderTable()}
          </section>
        </main>
      </div>
    </div>
  );
};
