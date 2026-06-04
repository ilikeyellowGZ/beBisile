import React, { useEffect, useState } from 'react';
import { ArrowRight, LockKeyhole, RefreshCw } from 'lucide-react';
import type { DashboardOrder } from '../types';

const ORDERS_API_URL = import.meta.env.VITE_ORDERS_API_URL || '/.netlify/functions/orders';
const LOGIN_API_URL = import.meta.env.VITE_DASHBOARD_LOGIN_API_URL || '/.netlify/functions/admin-login';

export const Dashboard: React.FC = () => {
  const [sessionToken, setSessionToken] = useState(() => sessionStorage.getItem('bisile-dashboard-session') ?? '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadOrders = async (token = sessionToken) => {
    if (!token) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch(ORDERS_API_URL, { headers: { Authorization: `Bearer ${token}` } });
      const payload = await response.json() as { orders?: DashboardOrder[]; error?: string };
      if (!response.ok) throw new Error(payload.error || 'Unable to load orders.');
      setOrders(payload.orders ?? []);
    } catch (requestError) {
      setOrders([]);
      setError(requestError instanceof Error ? requestError.message : 'Unable to load orders.');
      sessionStorage.removeItem('bisile-dashboard-session');
      setSessionToken('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionToken) void loadOrders(sessionToken);
  }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(LOGIN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const payload = await response.json() as { token?: string; error?: string };
      if (!response.ok || !payload.token) throw new Error(payload.error || 'Unable to log in.');
      sessionStorage.setItem('bisile-dashboard-session', payload.token);
      setSessionToken(payload.token);
      setPassword('');
      await loadOrders(payload.token);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to log in.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('bisile-dashboard-session');
    setSessionToken('');
    setOrders([]);
  };

  return (
    <div className="min-h-screen bg-secondary px-6 pb-24 pt-32 text-primary md:px-12">
      <div className="mx-auto max-w-[1320px]">
        <div className="flex flex-col gap-8 border-b border-black/10 pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-4 font-sans text-[10px] uppercase tracking-[0.3em] text-accent">Private admin</p>
            <h1 className="font-serif text-6xl leading-none md:text-7xl">Order dashboard.</h1>
            <p className="mt-5 max-w-xl font-sans text-sm leading-7 text-primary/60">
              Orders from Stripe Checkout are saved to the Bisile MongoDB database and shown here after admin login.
            </p>
          </div>

          {!sessionToken ? (
            <form onSubmit={handleLogin} className="grid w-full max-w-xl gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <label className="border border-black/15 bg-white px-4">
                <span className="sr-only">Username</span>
                <input value={username} onChange={(event) => setUsername(event.target.value)} required placeholder="Username" className="w-full bg-transparent py-4 font-sans text-xs outline-none" />
              </label>
              <label className="flex items-center gap-2 border border-black/15 bg-white px-4">
                <LockKeyhole size={15} className="text-accent" />
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="Password" className="w-full bg-transparent py-4 font-sans text-xs outline-none" />
              </label>
              <button className="flex items-center justify-center gap-2 bg-primary px-5 py-4 font-sans text-[10px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-accent">
                {loading ? <RefreshCw size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                Login
              </button>
            </form>
          ) : (
            <div className="flex gap-3">
              <button onClick={() => void loadOrders()} className="flex items-center gap-2 border border-primary px-5 py-4 font-sans text-[10px] uppercase tracking-[0.18em] transition-colors hover:border-accent hover:text-accent">
                {loading ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Refresh
              </button>
              <button onClick={handleLogout} className="px-5 py-4 font-sans text-[10px] uppercase tracking-[0.18em] text-primary/55 hover:text-primary">Logout</button>
            </div>
          )}
        </div>

        {error && <p className="mt-7 border border-red-300 bg-red-50 px-4 py-3 font-sans text-xs text-red-800">{error}</p>}

        <div className="mt-10 overflow-x-auto border border-black/10 bg-white">
          <table className="min-w-full text-left font-sans text-xs">
            <thead className="border-b border-black/10 bg-secondary text-[10px] uppercase tracking-[0.16em] text-primary/55">
              <tr>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Items</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Payment</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-black/10 last:border-b-0">
                  <td className="whitespace-nowrap px-5 py-4 text-primary/55">{new Date(order.createdAt).toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <p>{order.customer.fullName}</p>
                    <p className="mt-1 text-primary/50">{order.customer.email}</p>
                  </td>
                  <td className="px-5 py-4 text-primary/65">{order.items.map((item) => `${item.name} x${item.quantity}`).join(', ')}</td>
                  <td className="whitespace-nowrap px-5 py-4">R {order.total.toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-secondary text-primary/60'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {!orders.length && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-primary/45">
                    {sessionToken ? 'No orders yet.' : 'Log in to load orders.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
