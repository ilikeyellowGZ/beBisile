import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, Boxes, CircleDollarSign, ClipboardList, Eye, EyeOff, Gauge, Inbox, KeyRound, Layers, LogOut, Mail, PackageCheck, Percent, RefreshCw, Search, Settings, ShieldCheck, ShoppingBag, Star, Truck, Users } from 'lucide-react';
import { CONFIGURABLE_HAIR_PRODUCTS, PRODUCTS } from '../constants';
import { packageImages } from '../src/assets/images';
import { ApiError, apiUrl, readJsonResponse } from '../utils/http';
import { getImageUrl } from '../utils/images';
import { OptimizedImage } from '../components/UI/OptimizedImage';

type AdminSection = 'overview' | 'products' | 'categories' | 'orders' | 'customers' | 'payments' | 'refunds' | 'inventory' | 'reviews' | 'discounts' | 'messages' | 'newsletter' | 'admins' | 'audit' | 'settings';
type ApiMap = Record<string, any[]>;
type ProductDraft = {
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: string;
  sku: string;
  image: string;
  tags: string;
  isFeatured: boolean;
  isActive: boolean;
};

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
  inventory: 'inventory',
  reviews: 'reviews',
  discounts: 'discounts',
  messages: 'contact-messages',
  newsletter: 'newsletter',
  admins: 'admins',
  audit: 'audit-logs',
  settings: 'settings',
};

const statusTone = (status: string) => {
  const text = String(status || '').toLowerCase();
  if (text.includes('paid') || text.includes('active') || text.includes('approved') || text.includes('delivered')) return 'bg-[#edf7ef] text-[#1d6b36]';
  if (text.includes('pending') || text.includes('processing') || text.includes('new')) return 'bg-[#fff8e8] text-[#8a6420]';
  if (text.includes('fail') || text.includes('cancel') || text.includes('reject') || text.includes('archived')) return 'bg-[#fff0ee] text-[#a63b2d]';
  return 'bg-[#f7f5f1] text-primary/60';
};

const ADMIN_TOKEN_KEY = 'bisileAdminToken';
const ADMIN_SESSION_STARTED_AT_KEY = 'bisileAdminSessionStartedAt';
const ADMIN_SESSION_LIFETIME_MS = 30 * 60 * 1000;

const decodeJwtPayload = (token: string): { exp?: number; iat?: number } | null => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')));
  } catch {
    return null;
  }
};

const clearStoredToken = () => {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  sessionStorage.removeItem(ADMIN_SESSION_STARTED_AT_KEY);
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem('adminToken');
};

const getStoredToken = () => sessionStorage.getItem(ADMIN_TOKEN_KEY) ?? localStorage.getItem(ADMIN_TOKEN_KEY) ?? localStorage.getItem('adminToken') ?? '';

const getToken = () => {
  const token = getStoredToken();
  const expiresAt = decodeJwtPayload(token)?.exp;
  if (expiresAt && expiresAt * 1000 <= Date.now()) {
    clearStoredToken();
    return '';
  }
  return token;
};

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
  return readJsonResponse<any>(response, `${url} returned ${response.status}`);
};

const isUnauthorizedError = (caught: unknown) => (
  caught instanceof ApiError
    ? caught.status === 401
    : caught instanceof Error && (caught.message.includes('401') || caught.message.toLowerCase().includes('unauthorized'))
);

const normalizeOrderItemId = (item: any) => String(item.productId || item.variantId || item.sku || item.id || normalizeOrderItemName(item));
const normalizeOrderItemName = (item: any) => item.productName || item.name || item.id || 'Product';
const normalizeOrderTotal = (order: any) => Number(order.totalAmount ?? order.total ?? 0);
const getProductDocumentId = (row: any) => String(row._id || row.id || '');
const slugifyProduct = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const emptyProductDraft = (): ProductDraft => ({
  name: '',
  slug: '',
  description: '',
  price: '',
  stock: '0',
  sku: '',
  image: '',
  tags: '',
  isFeatured: false,
  isActive: true,
});
const draftFromProduct = (product: any): ProductDraft => ({
  name: product.name || '',
  slug: product.slug || '',
  description: product.description || product.shortDescription || '',
  price: product.price == null ? '' : String(product.price),
  stock: product.stock == null ? '0' : String(product.stock),
  sku: product.sku || '',
  image: product.image || product.images?.[0] || '',
  tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
  isFeatured: Boolean(product.isFeatured),
  isActive: product.isActive !== false,
});
const getProductRowId = (row: any) => String(row.productId || row.variantId || row.sku || row.id || row._id || '—');

const DataTable: React.FC<{ title: string; rows: any[]; columns: Array<{ key: string; label: string; render?: (row: any) => React.ReactNode }>; onRowClick?: (row: any) => void }> = ({ title, rows, columns, onRowClick }) => (
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
            <tr key={row._id || row.id || index} onClick={() => onRowClick?.(row)} className={onRowClick ? 'cursor-pointer hover:bg-[#f7f5f1]' : undefined}>
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
  const [token, setToken] = useState(getToken());
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [collections, setCollections] = useState<ApiMap>({});
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productDraft, setProductDraft] = useState<ProductDraft>(() => emptyProductDraft());
  const [editingProductId, setEditingProductId] = useState('');
  const [productMessage, setProductMessage] = useState('');
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerHistory, setCustomerHistory] = useState<any[]>([]);
  const [customerHistoryState, setCustomerHistoryState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [customerHistoryError, setCustomerHistoryError] = useState('');

  const logout = useCallback(async (reason: 'manual' | 'expired' = 'manual') => {
    const currentToken = getStoredToken();
    clearStoredToken();
    setToken('');
    setIsLoading(false);
    setOrders([]);
    setProducts([]);
    setDashboard(null);
    setCollections({});
    setSelectedOrderId(null);
    setSelectedCustomerId(null);
    setCustomerHistory([]);
    setCustomerHistoryState('idle');
    setCustomerHistoryError('');
    setError(null);
    setLoginError(reason === 'expired' ? 'For your security, your 30-minute admin session has ended. Please sign in again.' : '');

    if (currentToken) {
      try {
        await fetch(apiUrl('/api/auth/logout'), {
          method: 'POST',
          headers: { Authorization: `Bearer ${currentToken}` },
        });
      } catch {
        // The local session is already cleared if the audit request cannot reach the API.
      }
    }
  }, []);

  const loadDashboard = async () => {
    if (!getToken()) return;
    setIsLoading(true);
    setError(null);
    try {
      const [statsResult, ordersResult, productsResult] = await Promise.allSettled([
        apiFetch(apiUrl('/api/admin/dashboard/stats')),
        apiFetch(apiUrl('/api/admin/orders')),
        apiFetch(apiUrl('/api/admin/products')),
      ]);

      const settledResults = [statsResult, ordersResult, productsResult];
      const authFailure = settledResults.find((result) => result.status === 'rejected' && isUnauthorizedError(result.reason));
      if (authFailure?.status === 'rejected') {
        void logout('expired');
        return;
      }

      const statsPayload = statsResult.status === 'fulfilled' ? statsResult.value : {};
      const ordersPayload = ordersResult.status === 'fulfilled' ? ordersResult.value : {};
      const productsPayload = productsResult.status === 'fulfilled' ? productsResult.value : {};
      const nextOrders = Array.isArray(ordersPayload.orders)
        ? ordersPayload.orders
        : (Array.isArray(statsPayload.recentOrders) ? statsPayload.recentOrders : []);

      if (statsResult.status === 'rejected' && ordersResult.status === 'rejected') {
        throw ordersResult.reason;
      }

      setOrders(nextOrders);
      setProducts(Array.isArray(productsPayload.products) ? productsPayload.products : []);
      setDashboard({
        totals: {
          totalRevenue: statsPayload.totalRevenue,
          totalOrders: statsPayload.totalOrders,
          pendingOrders: statsPayload.pendingOrders,
          totalCustomers: statsPayload.totalCustomers,
          productsInStock: (productsPayload.products || []).filter((product: any) => Number(product.stock || 0) > 0).length,
          lowStockProducts: Array.isArray(statsPayload.lowStockProducts) ? statsPayload.lowStockProducts.length : 0,
        },
        revenueChart: statsPayload.revenueChart || [],
      });

      const partialErrors: string[] = [];
      if (statsResult.status === 'rejected') partialErrors.push('Dashboard summary could not be loaded.');
      if (ordersResult.status === 'rejected') partialErrors.push('Orders could not be loaded from the orders endpoint; recent orders are shown when available.');
      if (productsResult.status === 'rejected') {
        partialErrors.push(productsResult.reason instanceof ApiError && productsResult.reason.status === 403
          ? 'Some product tools are restricted for this admin role.'
          : 'Product data could not be loaded.');
      }
      setError(partialErrors.length ? partialErrors.join(' ') : null);
    } catch (caught) {
      if (isUnauthorizedError(caught)) {
        void logout('expired');
        return;
      }
      setError(caught instanceof Error ? caught.message : 'Could not load live dashboard data');
      setOrders([]);
      setProducts([]);
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
      const payload = await apiFetch(apiUrl(`/api/admin/${resource}`));
      setCollections((current) => ({ ...current, [resource]: payload[resource] || payload[nextSection] || [] }));
    } catch (caught) {
      if (isUnauthorizedError(caught)) {
        void logout('expired');
        return;
      }
      setCollections((current) => ({ ...current, [resource]: [] }));
    }
  };

  const resetProductForm = () => {
    setEditingProductId('');
    setProductDraft(emptyProductDraft());
  };

  const editProduct = (product: any) => {
    setSection('products');
    setEditingProductId(getProductDocumentId(product));
    setProductDraft(draftFromProduct(product));
    setProductMessage('');
  };

  const saveProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSavingProduct(true);
    setProductMessage('');
    try {
      const slug = productDraft.slug.trim() || slugifyProduct(productDraft.name);
      const payload = {
        name: productDraft.name.trim(),
        slug,
        description: productDraft.description.trim(),
        price: Number(productDraft.price),
        stock: Number(productDraft.stock || 0),
        sku: productDraft.sku.trim(),
        images: productDraft.image.trim() ? [productDraft.image.trim()] : [],
        tags: productDraft.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        isFeatured: productDraft.isFeatured,
        isActive: productDraft.isActive,
        isArchived: false,
      };
      if (!payload.name || !payload.slug || Number.isNaN(payload.price)) throw new Error('Name, slug, and price are required.');

      const url = editingProductId
        ? apiUrl(`/api/admin/products/${editingProductId}`)
        : apiUrl('/api/admin/products');
      await apiFetch(url, {
        method: editingProductId ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      });
      setProductMessage(editingProductId ? 'Product updated.' : 'Product created.');
      resetProductForm();
      await loadDashboard();
    } catch (caught) {
      setProductMessage(caught instanceof Error ? caught.message : 'Product could not be saved.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const archiveProduct = async (product: any) => {
    const id = getProductDocumentId(product);
    if (!id) {
      setProductMessage('This product has no database ID to archive.');
      return;
    }
    setIsSavingProduct(true);
    setProductMessage('');
    try {
      await apiFetch(apiUrl(`/api/admin/products/${id}`), { method: 'DELETE' });
      setProductMessage('Product archived.');
      if (editingProductId === id) resetProductForm();
      await loadDashboard();
    } catch (caught) {
      setProductMessage(caught instanceof Error ? caught.message : 'Product could not be archived.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  useEffect(() => {
    if (token) void loadDashboard();
    else setIsLoading(false);
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const tokenPayload = decodeJwtPayload(token);
    const issuedAt = tokenPayload?.iat ? tokenPayload.iat * 1000 : Date.now();
    const storedSessionStartedAt = Number(sessionStorage.getItem(ADMIN_SESSION_STARTED_AT_KEY));
    const sessionStartedAt = Number.isFinite(storedSessionStartedAt) && storedSessionStartedAt > 0
      ? storedSessionStartedAt
      : issuedAt;
    const expiresAt = tokenPayload?.exp
      ? tokenPayload.exp * 1000
      : sessionStartedAt + ADMIN_SESSION_LIFETIME_MS;
    const remainingMs = Math.max(0, expiresAt - Date.now());

    sessionStorage.setItem(ADMIN_SESSION_STARTED_AT_KEY, String(sessionStartedAt));
    const timeout = window.setTimeout(() => {
      void logout('expired');
    }, remainingMs);

    return () => window.clearTimeout(timeout);
  }, [token, logout]);

  useEffect(() => {
    if (!token || section !== 'customers' || !selectedCustomerId) {
      setCustomerHistory([]);
      setCustomerHistoryState('idle');
      setCustomerHistoryError('');
      return;
    }

    let active = true;
    setCustomerHistory([]);
    setCustomerHistoryError('');
    setCustomerHistoryState('loading');
    apiFetch(apiUrl(`/api/admin/customers/${selectedCustomerId}/history`))
      .then((payload) => {
        if (!active) return;
        setCustomerHistory(payload.orders || []);
        setCustomerHistoryState('ready');
      })
      .catch((caught) => {
        if (!active) return;
        const message = caught instanceof Error ? caught.message : 'Purchase history could not be loaded.';
        if (isUnauthorizedError(caught)) {
          void logout('expired');
          return;
        }
        setCustomerHistory([]);
        setCustomerHistoryError(message);
        setCustomerHistoryState('error');
      })
      .finally(() => undefined);

    return () => {
      active = false;
    };
  }, [section, selectedCustomerId, token]);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const identifier = loginIdentifier.trim();
      const payload = await apiFetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        body: JSON.stringify({ username: identifier, password: loginPassword }),
      });
      if (!payload.token) throw new Error('Login did not return a token');
      clearStoredToken();
      sessionStorage.setItem(ADMIN_TOKEN_KEY, payload.token);
      sessionStorage.setItem(ADMIN_SESSION_STARTED_AT_KEY, String(Date.now()));
      setToken(payload.token);
      setLoginPassword('');
      setShowLoginPassword(false);
    } catch (caught) {
      setLoginError(caught instanceof Error ? caught.message : 'Admin login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

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
  const selectedOrder = useMemo(() => filteredOrders.find((order) => String(order._id || order.id) === selectedOrderId) || null, [filteredOrders, selectedOrderId]);
  const selectedCustomer = useMemo(() => currentRows.find((row) => String(row._id || row.id) === selectedCustomerId) || null, [currentRows, selectedCustomerId]);
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
                  <div className="aspect-square overflow-hidden bg-[#f7f5f1]"><OptimizedImage src={getImageUrl(product?.image || product?.images?.[0] || packageImages.product07)} width={180} widths={[120, 180, 240]} sizes="64px" alt={item.name} className={`h-full w-full ${product?.imageFit === 'contain' ? 'object-contain p-2' : 'object-cover'}`} /></div>
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

  const renderProductManager = () => (
    <div className="space-y-6">
      <form onSubmit={saveProduct} className="border border-[#e5e2dd] bg-white p-5">
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="bisile-kicker mb-2">{editingProductId ? 'Edit product' : 'New product'}</p>
            <h2 className="font-inter text-2xl font-light">Website product manager.</h2>
          </div>
          <div className="flex gap-2">
            {editingProductId && <button type="button" onClick={resetProductForm} className="border border-[#e5e2dd] px-4 py-3 font-inter text-xs font-light uppercase tracking-[0.14em]">Cancel</button>}
            <button disabled={isSavingProduct} className="bg-primary px-4 py-3 font-inter text-xs font-light uppercase tracking-[0.14em] text-white disabled:opacity-50">
              {isSavingProduct ? 'Saving...' : editingProductId ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-2 font-inter text-xs font-light text-primary/55">
            Name
            <input required value={productDraft.name} onChange={(event) => setProductDraft((current) => ({ ...current, name: event.target.value, slug: current.slug || slugifyProduct(event.target.value) }))} className="field-light px-4 py-3 text-sm text-primary" />
          </label>
          <label className="grid gap-2 font-inter text-xs font-light text-primary/55">
            Slug
            <input required value={productDraft.slug} onChange={(event) => setProductDraft((current) => ({ ...current, slug: slugifyProduct(event.target.value) }))} className="field-light px-4 py-3 text-sm text-primary" />
          </label>
          <label className="grid gap-2 font-inter text-xs font-light text-primary/55">
            Price
            <input required type="number" min="0" step="0.01" value={productDraft.price} onChange={(event) => setProductDraft((current) => ({ ...current, price: event.target.value }))} className="field-light px-4 py-3 text-sm text-primary" />
          </label>
          <label className="grid gap-2 font-inter text-xs font-light text-primary/55">
            Stock
            <input type="number" min="0" step="1" value={productDraft.stock} onChange={(event) => setProductDraft((current) => ({ ...current, stock: event.target.value }))} className="field-light px-4 py-3 text-sm text-primary" />
          </label>
          <label className="grid gap-2 font-inter text-xs font-light text-primary/55">
            SKU
            <input value={productDraft.sku} onChange={(event) => setProductDraft((current) => ({ ...current, sku: event.target.value }))} className="field-light px-4 py-3 text-sm text-primary" />
          </label>
          <label className="grid gap-2 font-inter text-xs font-light text-primary/55 xl:col-span-2">
            Main image URL
            <input value={productDraft.image} onChange={(event) => setProductDraft((current) => ({ ...current, image: event.target.value }))} className="field-light px-4 py-3 text-sm text-primary" placeholder="Cloudinary or hosted image URL" />
          </label>
          <label className="grid gap-2 font-inter text-xs font-light text-primary/55">
            Tags
            <input value={productDraft.tags} onChange={(event) => setProductDraft((current) => ({ ...current, tags: event.target.value }))} className="field-light px-4 py-3 text-sm text-primary" placeholder="hair, wig, featured" />
          </label>
          <label className="grid gap-2 font-inter text-xs font-light text-primary/55 md:col-span-2 xl:col-span-4">
            Description
            <textarea rows={4} value={productDraft.description} onChange={(event) => setProductDraft((current) => ({ ...current, description: event.target.value }))} className="field-light px-4 py-3 text-sm text-primary" />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-5 font-inter text-sm font-light text-primary/60">
          <label className="flex items-center gap-2"><input type="checkbox" checked={productDraft.isFeatured} onChange={(event) => setProductDraft((current) => ({ ...current, isFeatured: event.target.checked }))} /> Featured</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={productDraft.isActive} onChange={(event) => setProductDraft((current) => ({ ...current, isActive: event.target.checked }))} /> Active on site</label>
        </div>
        {productMessage && <p className="mt-4 border border-[#e5e2dd] bg-[#f7f5f1] p-3 font-inter text-sm font-light text-primary/60">{productMessage}</p>}
      </form>

      <DataTable title="Products" rows={products} columns={[
        { key: 'image', label: 'Image', render: (row) => <div className="h-12 w-12 overflow-hidden bg-[#f7f5f1]"><OptimizedImage src={getImageUrl(row.image || row.images?.[0] || packageImages.product07)} width={120} widths={[80, 120, 180]} sizes="48px" alt={row.name} className="h-full w-full object-cover" /></div> },
        { key: 'id', label: 'ID / SKU', render: (row) => <span className="font-inter text-xs font-light text-primary/58">{getProductRowId(row)}</span> },
        { key: 'name', label: 'Product', render: (row) => <div><p>{row.name}</p><p className="mt-1 text-xs text-primary/42">{row.slug || row.sku}</p></div> },
        { key: 'price', label: 'Price', render: (row) => currency.format(Number(row.price || 0)) },
        { key: 'stock', label: 'Stock', render: (row) => <span className={Number(row.stock || 0) <= Number(row.lowStockThreshold ?? 3) ? 'text-[#a63b2d]' : ''}>{row.stock ?? '—'}</span> },
        { key: 'status', label: 'Status', render: (row) => <span className={`px-2 py-1 text-xs ${statusTone(row.isActive === false ? 'inactive' : 'active')}`}>{row.isActive === false ? 'Inactive' : 'Active'}</span> },
        { key: 'actions', label: 'Actions', render: (row) => <div className="flex flex-wrap gap-2"><button type="button" onClick={() => editProduct(row)} className="border border-[#e5e2dd] px-3 py-2 text-xs hover:border-primary">Edit</button><button type="button" onClick={() => void archiveProduct(row)} className="border border-[#e5e2dd] px-3 py-2 text-xs text-[#a63b2d] hover:border-[#a63b2d]">Archive</button></div> },
      ]} />
    </div>
  );

  const renderTable = () => {
    if (section === 'products') {
      return renderProductManager();
      return <DataTable title="Products" rows={products} columns={[
        { key: 'image', label: 'Image', render: (row) => <div className="h-12 w-12 overflow-hidden bg-[#f7f5f1]"><OptimizedImage src={getImageUrl(row.image || row.images?.[0] || packageImages.product07)} width={120} widths={[80, 120, 180]} sizes="48px" alt={row.name} className="h-full w-full object-cover" /></div> },
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
      return (
        <div className="space-y-6">
          <DataTable title="Orders" rows={filteredOrders} columns={[
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
          ]} onRowClick={(row) => setSelectedOrderId(String(row._id || row.id))} />
          {selectedOrder && (
            <div className="border border-[#e5e2dd] bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="bisile-kicker">Order details</p>
                  <h3 className="font-inter text-2xl font-light">{selectedOrder.orderNumber}</h3>
                </div>
                <span className={`px-2 py-1 text-xs ${statusTone(selectedOrder.paymentStatus)}`}>{selectedOrder.paymentStatus}</span>
              </div>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="space-y-3 text-sm text-primary/70">
                  <p><span className="font-medium text-primary">Customer:</span> {selectedOrder.customerInfo?.fullName || '—'}</p>
                  <p><span className="font-medium text-primary">Email:</span> {selectedOrder.customerInfo?.email || '—'}</p>
                  <p><span className="font-medium text-primary">Phone:</span> {selectedOrder.customerInfo?.phone || '—'}</p>
                  <p><span className="font-medium text-primary">Address:</span> {selectedOrder.shippingAddress?.streetAddress || '—'}, {selectedOrder.shippingAddress?.city || '—'}</p>
                </div>
                <div className="space-y-3 text-sm text-primary/70">
                  <p><span className="font-medium text-primary">Items:</span> {(selectedOrder.items || []).map((item: any) => `${item.quantity}x ${normalizeOrderItemName(item)}`).join(', ') || '—'}</p>
                  <p><span className="font-medium text-primary">Shipping:</span> {selectedOrder.shippingPartner?.name || '—'}</p>
                  <p><span className="font-medium text-primary">Reference:</span> {selectedOrder.paystackReference || '—'}</p>
                  <p><span className="font-medium text-primary">Total:</span> {currency.format(normalizeOrderTotal(selectedOrder))}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (section === 'customers') {
      return (
        <div className="space-y-6">
          <DataTable title="Customers" rows={currentRows} columns={[
            { key: 'name', label: 'Customer', render: (row) => <div><p>{row.fullName || '—'}</p><p className="text-xs text-primary/45">{row.email}</p></div> },
            { key: 'phone', label: 'Phone', render: (row) => row.phone || '—' },
            { key: 'totalOrders', label: 'Orders', render: (row) => row.totalOrders ?? '—' },
            { key: 'totalSpent', label: 'Spent', render: (row) => currency.format(Number(row.totalSpent || 0)) },
            { key: 'createdAt', label: 'Joined', render: (row) => row.createdAt ? dateFormatter.format(new Date(row.createdAt)) : '—' },
          ]} onRowClick={(row) => setSelectedCustomerId(String(row._id || row.id))} />
          {selectedCustomer && (
            <div className="border border-[#e5e2dd] bg-white p-5">
              <p className="bisile-kicker">Customer profile</p>
              <h3 className="font-inter text-2xl font-light">{selectedCustomer.fullName || selectedCustomer.email}</h3>
              <div className="mt-4 grid gap-6 lg:grid-cols-2">
                <div className="space-y-3 text-sm text-primary/70">
                  <p><span className="font-medium text-primary">Email:</span> {selectedCustomer.email || '—'}</p>
                  <p><span className="font-medium text-primary">Phone:</span> {selectedCustomer.phone || '—'}</p>
                  <p><span className="font-medium text-primary">Status:</span> {selectedCustomer.isBlocked ? 'Blocked' : 'Active'}</p>
                </div>
                <div className="space-y-3 text-sm text-primary/70">
                  <p><span className="font-medium text-primary">Total spent:</span> {currency.format(Number(selectedCustomer.totalSpent || 0))}</p>
                  <p><span className="font-medium text-primary">Orders:</span> {selectedCustomer.totalOrders ?? 0}</p>
                  <p><span className="font-medium text-primary">Last order:</span> {selectedCustomer.lastOrderAt ? dateFormatter.format(new Date(selectedCustomer.lastOrderAt)) : '—'}</p>
                </div>
              </div>
              {customerHistoryState === 'loading' && <p className="mt-6 text-sm text-primary/55">Loading protected purchase history...</p>}
              {customerHistoryState === 'error' && <p className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">Purchase history could not be loaded. {customerHistoryError}</p>}
              {customerHistoryState === 'ready' && customerHistory.length === 0 && <p className="mt-6 text-sm text-primary/55">No purchases recorded for this customer.</p>}
              {customerHistoryState === 'ready' && customerHistory.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-inter text-lg font-light">Purchase history</h4>
                  <div className="mt-3 space-y-2">
                    {customerHistory.slice(0, 6).map((order) => (
                      <div key={order._id || order.id} className="border border-[#e5e2dd] p-3 text-sm text-primary/70">
                        <p className="font-medium text-primary">{order.orderNumber}</p>
                        <p>{currency.format(normalizeOrderTotal(order))} • {order.paymentStatus} • {order.createdAt ? dateFormatter.format(new Date(order.createdAt)) : '—'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return <DataTable title={sections.find((item) => item.id === section)?.label || 'Records'} rows={currentRows} columns={[
      { key: 'name', label: 'Name / ID', render: (row) => row.name || row.fullName || row.email || row.code || row.orderNumber || String(row._id || '—') },
      { key: 'status', label: 'Status', render: (row) => <span className={`px-2 py-1 text-xs ${statusTone(row.status || row.paymentStatus || row.role || (row.isActive === false ? 'inactive' : 'active'))}`}>{row.status || row.paymentStatus || row.role || (row.isActive === false ? 'Inactive' : 'Active')}</span> },
      { key: 'detail', label: 'Detail', render: (row) => row.message || row.subject || row.description || row.reason || row.action || row.storeEmail || row.phone || '—' },
      { key: 'createdAt', label: 'Created', render: (row) => row.createdAt ? dateFormatter.format(new Date(row.createdAt)) : '—' },
    ]} />;
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-off-white px-6 pt-16 text-primary">
        <form onSubmit={login} className="bisile-card-surface w-full max-w-md p-7">
          <p className="bisile-kicker mb-3">Admin Login</p>
          <h1 className="font-inter text-3xl font-light">BISILE dashboard.</h1>
          <p className="mt-3 text-sm leading-6 text-primary/58">Use your admin username to access live backend data.</p>
          <label className="mt-7 block">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-[#5B3A24]/68">Username</span>
            <input value={loginIdentifier} onChange={(event) => setLoginIdentifier(event.target.value)} className="field-light w-full px-4 py-4 text-sm" autoComplete="username" />
          </label>
          <label className="mt-4 block">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-[#5B3A24]/68">Password</span>
            <span className="relative block">
              <input value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} type={showLoginPassword ? 'text' : 'password'} className="field-light w-full px-4 py-4 pr-12 text-sm" autoComplete="current-password" />
              <button
                type="button"
                onClick={() => setShowLoginPassword((visible) => !visible)}
                className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full p-1.5 text-primary/45 transition-all duration-200 ease-out hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showLoginPassword}
                title={showLoginPassword ? 'Hide password' : 'Show password'}
              >
                <span className={`transition-all duration-200 ease-out ${showLoginPassword ? 'scale-100 rotate-0 opacity-100' : 'absolute scale-75 -rotate-12 opacity-0'}`} aria-hidden="true">
                  <Eye size={17} strokeWidth={1.5} />
                </span>
                <span className={`transition-all duration-200 ease-out ${showLoginPassword ? 'absolute scale-75 rotate-12 opacity-0' : 'scale-100 rotate-0 opacity-100'}`} aria-hidden="true">
                  <EyeOff size={17} strokeWidth={1.5} />
                </span>
              </button>
            </span>
          </label>
          {loginError && <p className="mt-4 border border-red-300 bg-red-50 px-4 py-3 text-xs leading-6 text-red-800">{loginError}</p>}
          <button disabled={isLoggingIn} className="mt-6 flex h-12 w-full items-center justify-center bg-primary px-6 text-sm font-light text-white transition-colors hover:bg-accent disabled:opacity-50">
            {isLoggingIn ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white pt-16 text-primary">
      <div className="grid lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-[#D8D0C3] bg-[#F7F4EF] lg:min-h-[calc(100vh-4rem)]">
          <div className="sticky top-16 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="bisile-kicker">Admin</p>
              <button
                type="button"
                onClick={() => void logout()}
                className="inline-flex items-center gap-2 border border-primary/20 px-3 py-2 font-inter text-xs font-light text-primary/65 transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                aria-label="Log out of the admin dashboard"
                title="Log out"
              >
                <LogOut size={14} strokeWidth={1.5} />
                Log out
              </button>
            </div>
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
            {error && <div className="mt-6 border border-[#e5e2dd] bg-[#f7f5f1] p-4 font-inter text-sm font-light text-primary/60">Live admin data could not load. Details: {error}</div>}
          </section>

          <section className="p-6 md:p-8">
            {isLoading ? <div className="border border-[#e5e2dd] p-8 font-inter text-sm font-light text-primary/55">Loading dashboard...</div> : section === 'overview' ? renderOverview() : renderTable()}
          </section>
        </main>
      </div>
    </div>
  );
};
