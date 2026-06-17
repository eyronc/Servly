import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import {
  RefreshCw, PhilippinePeso, Clock, CheckCircle, AlertTriangle,
  Search, ExternalLink, Download, Printer, User, UtensilsCrossed, TrendingUp,
} from 'lucide-react';
import Logo from '../components/Logo';

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent, delay = 0 }) {
  return (
    <div
      className="glass-dark hover-lift hover-lift-dark card-shimmer animate-fade-in-up"
      style={{
        borderRadius: 22, padding: 22, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', animationDelay: `${delay}ms`,
      }}
    >
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {label}
        </p>
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 26, color: '#f5f5f0', marginTop: 6, lineHeight: 1 }}>
          {value}
        </h3>
      </div>
      <div
        style={{
          width: 50, height: 50, borderRadius: 16,
          background: `${accent}18`,
          border: `1px solid ${accent}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accent,
        }}
      >
        <Icon size={22} />
      </div>
    </div>
  );
}

// ── Order Status Badge ─────────────────────────────────────────────────────
function StatusDot({ status, type = 'order' }) {
  const map = {
    order: {
      pending:   { color: '#f59e0b', label: 'Pending' },
      preparing: { color: '#3b82f6', label: 'Preparing' },
      completed: { color: '#10b981', label: 'Completed' },
    },
    payment: {
      pending: { color: '#f59e0b', label: 'Unpaid' },
      paid:    { color: '#10b981', label: 'Paid' },
      failed:  { color: '#ef4444', label: 'Failed' },
    },
  };
  const { color, label } = (map[type]?.[status]) || { color: '#71717a', label: status };
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: `${color}18`, border: `1px solid ${color}35`,
        borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 700, color,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: color, display: 'inline-block' }} />
      {label}
    </span>
  );
}

export default function AdminDashboard({ apiBaseUrl, setPage }) {
  const [orders, setOrders] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [qrTableNumber, setQrTableNumber] = useState('1');
  const [qrGeneratedUrl, setQrGeneratedUrl] = useState('');
  const [justRefreshed, setJustRefreshed] = useState(false);
  const [tableCount, setTableCount] = useState('5');
  const [tableCountSaving, setTableCountSaving] = useState(false);
  const [tableCountSaved, setTableCountSaved] = useState(false);

  const pollInterval = useRef(null);

  useEffect(() => {
    const origin = window.location.origin;
    setQrGeneratedUrl(`${origin}?table=${qrTableNumber}`);
  }, [qrTableNumber]);

  const fetchOrders = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      const [ordersRes, sessionsRes] = await Promise.all([
        axios.get(`${apiBaseUrl}/api/orders`),
        axios.get(`${apiBaseUrl}/api/sessions`),
      ]);
      setOrders(ordersRes.data);
      setSessions(sessionsRes.data);
      setError(null);
      if (isSilent) { setJustRefreshed(true); setTimeout(() => setJustRefreshed(false), 1500); }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders. Ensure API server and MySQL database are active.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    pollInterval.current = setInterval(() => fetchOrders(true), 8000);
    return () => { if (pollInterval.current) clearInterval(pollInterval.current); };
  }, [apiBaseUrl]);

  // Fetch current table count setting
  useEffect(() => {
    axios.get(`${apiBaseUrl}/api/settings`)
      .then(res => { if (res.data.table_count) setTableCount(res.data.table_count); })
      .catch(() => {});
  }, [apiBaseUrl]);

  const saveTableCount = async () => {
    setTableCountSaving(true);
    try {
      await axios.put(`${apiBaseUrl}/api/settings/table_count`, { value: tableCount });
      setTableCountSaved(true);
      setTimeout(() => setTableCountSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save table count:', err);
    } finally {
      setTableCountSaving(false);
    }
  };

  const handleUpdateStatus = async (orderId, updates) => {
    try {
      await axios.patch(`${apiBaseUrl}/api/orders/${orderId}`, updates);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Failed to update order status.');
    }
  };

  // Filter logic
  const filteredOrders = orders.filter(order => {
    const customer = order.customer_name.toLowerCase();
    const matchesSearch = customer.includes(searchTerm.toLowerCase()) || order.id.toString().includes(searchTerm);
    if (activeTab === 'all')       return matchesSearch;
    if (activeTab === 'pending')   return matchesSearch && order.order_status === 'pending' && order.payment_status !== 'failed';
    if (activeTab === 'preparing') return matchesSearch && order.order_status === 'preparing';
    if (activeTab === 'completed') return matchesSearch && order.order_status === 'completed';
    if (activeTab === 'failed')    return matchesSearch && order.payment_status === 'failed';
    return matchesSearch;
  });

  // KPIs
  const paidOrders = orders.filter(o => o.payment_status === 'paid');
  const activeOrders = orders.filter(o => o.payment_status !== 'failed' && (o.order_status === 'pending' || o.order_status === 'preparing'));
  const completedOrders = orders.filter(o => o.order_status === 'completed');
  const failedOrders = orders.filter(o => o.payment_status === 'failed');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

  // QR helpers
  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `table-${qrTableNumber}-qr.svg`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const printQRCode = () => {
    const content = document.getElementById('qr-print-area').innerHTML;
    const pw = window.open('', '_blank');
    pw.document.write(`<html><head><title>Print QR - Table ${qrTableNumber}</title>
      <style>body{font-family:sans-serif;text-align:center;padding:40px}
      .box{border:2px dashed #ccc;padding:30px;display:inline-block;border-radius:20px}
      h1{margin-top:20px;font-size:24px;color:#333}p{color:#666;font-size:14px}</style>
      </head><body><div class="box">${content}<h1>TABLE ${qrTableNumber}</h1>
      <p>Scan to Browse Menu & Order</p></div>
      <script>window.onload=function(){window.print();window.close()}<\/script></body></html>`);
    pw.document.close();
  };

  const TABS = ['all', 'pending', 'preparing', 'completed', 'failed'];
  const TAB_LABELS = { all: 'All', pending: 'Pending', preparing: 'Preparing', completed: 'Completed', failed: 'Failed' };

  return (
    <div className="min-h-screen bg-admin-hero text-stone-200 pb-16">
      
      {/* ─── Top Navigation ─── */}
      <nav className="sticky top-0 z-40" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="glass-dark" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              {/* Brand */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Logo size={36} theme="dark" showText={false} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 17, color: '#f5f5f0', letterSpacing: '-0.02em' }}>
                      Servly
                    </span>
                    <span
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: '#1c1917', fontSize: 9, fontWeight: 800,
                        padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.08em',
                      }}
                    >
                      Admin
                    </span>
                  </div>
                  <p style={{ fontSize: 10, color: '#52525b', fontWeight: 500 }}>
                    Dashboard Portal
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Auto-refresh indicator */}
                {justRefreshed && (
                  <span className="animate-fade-in" style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>
                    ✓ Updated
                  </span>
                )}
                <button
                  id="refresh-orders-btn"
                  onClick={() => fetchOrders()}
                  disabled={refreshing}
                  className="press-effect"
                  style={{
                    padding: 9, borderRadius: 999,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', color: '#71717a', transition: 'all 0.2s ease',
                    opacity: refreshing ? 0.5 : 1,
                  }}
                  title="Refresh"
                  onMouseEnter={e => e.currentTarget.style.color = '#f5f5f0'}
                  onMouseLeave={e => e.currentTarget.style.color = '#71717a'}
                >
                  <RefreshCw size={17} className={refreshing ? 'animate-spin-slow' : ''} />
                </button>
                <button
                  id="go-to-menu-btn"
                  onClick={() => setPage('menu')}
                  className="press-effect"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#1c1917', fontWeight: 700, fontSize: 12,
                    padding: '8px 18px', borderRadius: 999, border: 'none',
                    display: 'flex', alignItems: 'center', gap: 6,
                    boxShadow: '0 4px 14px rgba(245,158,11,0.3)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>Go to Menu</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Main Body ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">

        {/* Error Banner */}
        {error && (
          <div
            className="animate-scale-in"
            style={{
              background: 'rgba(127,29,29,0.6)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(239,68,68,0.3)', borderRadius: 18,
              padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24,
            }}
          >
            <AlertTriangle size={18} style={{ color: '#f87171', flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: 13, color: '#fca5a5' }}>Server Offline</p>
              <p style={{ fontSize: 12, color: '#fca5a5', opacity: 0.7, marginTop: 2 }}>{error}</p>
            </div>
          </div>
        )}

        {/* KPI Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Revenue"  value={`₱${totalRevenue.toFixed(0)}`} icon={PhilippinePeso} accent="#10b981" delay={0} />
          <StatCard label="Active Orders"  value={activeOrders.length}           icon={Clock}          accent="#f59e0b" delay={60} />
          <StatCard label="Completed"      value={completedOrders.length}        icon={CheckCircle}    accent="#3b82f6" delay={120} />
          <StatCard label="Failed / Unpaid" value={failedOrders.length}          icon={AlertTriangle}  accent="#ef4444" delay={180} />
        </div>

        {/* Table Status Panel */}
        <div
          className="glass-dark animate-fade-in-up"
          style={{ borderRadius: 24, padding: 24, marginBottom: 24, animationDelay: '100ms' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 17, color: '#f5f5f0' }}>
                Table Status
              </h2>
              <p style={{ fontSize: 12, color: '#52525b', marginTop: 3 }}>
                Live occupancy — updates every 8s
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: '#f59e0b', display: 'inline-block' }} />
                <span style={{ fontSize: 11, color: '#71717a' }}>Occupied</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: '#3f3f46', display: 'inline-block' }} />
                <span style={{ fontSize: 11, color: '#71717a' }}>Free</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 10 }}>
            {Array.from({ length: parseInt(tableCount, 10) || 5 }, (_, i) => i + 1).map(num => {
              const session = sessions.find(s => s.table_number === num);
              const isOccupied = !!session;
              const seatedMins = session
                ? Math.floor((Date.now() - new Date(session.created_at).getTime()) / 60000)
                : null;

              return (
                <div
                  key={num}
                  style={{
                    borderRadius: 16,
                    padding: '14px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    border: isOccupied
                      ? '1.5px solid rgba(245,158,11,0.4)'
                      : '1px solid rgba(255,255,255,0.06)',
                    background: isOccupied
                      ? 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.06))'
                      : 'rgba(255,255,255,0.03)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {/* Table icon */}
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="3" width="14" height="9" rx="3"
                      fill={isOccupied ? '#f59e0b' : '#3f3f46'} />
                    <rect x="3" y="12" width="18" height="3" rx="1.5"
                      fill={isOccupied ? '#d97706' : '#27272a'} />
                    <line x1="8" y1="15" x2="8" y2="21"
                      stroke={isOccupied ? '#b45309' : '#27272a'} strokeWidth="2" strokeLinecap="round" />
                    <line x1="16" y1="15" x2="16" y2="21"
                      stroke={isOccupied ? '#b45309' : '#27272a'} strokeWidth="2" strokeLinecap="round" />
                  </svg>

                  <span style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 800,
                    fontSize: 14,
                    color: isOccupied ? '#f5f5f0' : '#52525b',
                  }}>
                    {num}
                  </span>

                  <span style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: isOccupied ? '#f59e0b' : '#3f3f46',
                  }}>
                    {isOccupied ? 'Occupied' : 'Free'}
                  </span>

                  {isOccupied && seatedMins !== null && (
                    <span style={{ fontSize: 9, color: '#71717a' }}>
                      {seatedMins < 1 ? 'just now' : `${seatedMins}m ago`}
                    </span>
                  )}

                  {isOccupied && (
                    <button
                      onClick={async () => {
                        if (confirm(`Are you sure you want to clear/free Table ${num}?`)) {
                          try {
                            await axios.post(`${apiBaseUrl}/api/sessions/leave`, { session_id: session.session_id });
                            fetchOrders(true);
                          } catch (err) {
                            console.error('Failed to release session:', err);
                            alert('Failed to release table.');
                          }
                        }
                      }}
                      className="press-effect"
                      style={{
                        marginTop: 4,
                        fontSize: 8,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                      }}
                    >
                      Release
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sub-grid: Orders (2/3) + QR Generator (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ── Orders Panel ── */}
          <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Search & Tabs */}
            <div
              className="glass-dark animate-fade-in-up"
              style={{ borderRadius: 20, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              {/* Tab Filters */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="press-effect"
                    style={{
                      padding: '7px 16px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                      whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.2s ease',
                      ...(activeTab === tab
                        ? {
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color: '#1c1917', border: 'none',
                            boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
                          }
                        : {
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: '#71717a',
                          }),
                    }}
                    onMouseEnter={e => { if (activeTab !== tab) e.currentTarget.style.color = '#f5f5f0'; }}
                    onMouseLeave={e => { if (activeTab !== tab) e.currentTarget.style.color = '#71717a'; }}
                  >
                    {TAB_LABELS[tab]}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)', color: '#52525b', pointerEvents: 'none' }}>
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  placeholder="Search by name or order ID..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="input-glass-dark"
                  style={{ paddingLeft: 36, borderRadius: 12 }}
                />
              </div>
            </div>

            {/* Orders Feed */}
            {loading ? (
              <div
                className="glass-dark animate-fade-in text-center"
                style={{ borderRadius: 24, padding: '64px 32px' }}
              >
                <RefreshCw className="animate-spin-slow" size={28} style={{ color: '#f59e0b', margin: '0 auto 12px' }} />
                <p style={{ fontSize: 13, color: '#52525b' }}>Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div
                className="glass-dark animate-fade-in text-center"
                style={{ borderRadius: 24, padding: '64px 32px' }}
              >
                <p style={{ fontSize: 13, color: '#52525b', fontWeight: 500 }}>
                  No orders in this category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
                {filteredOrders.map((order, index) => (
                  <div
                    key={order.id}
                    className="glass-dark hover-lift hover-lift-dark card-shimmer animate-fade-in-up"
                    style={{
                      borderRadius: 22, padding: 20,
                      display: 'flex', flexDirection: 'column', gap: 14,
                      animationDelay: `${index * 40}ms`,
                    }}
                  >
                    {/* Card Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 14, color: '#f5f5f0' }}>
                            #{order.id}
                          </span>
                          <span style={{ fontSize: 10, color: '#52525b' }}>
                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {order.table_number > 0 && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, color: '#d97706',
                              background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)',
                              borderRadius: 999, padding: '2px 8px',
                            }}>
                              Table {order.table_number}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, color: '#71717a' }}>
                          <User size={11} />
                          <span style={{ fontSize: 12, fontWeight: 500, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {order.customer_name}
                          </span>
                        </div>
                      </div>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 16, color: '#f59e0b' }}>
                        ₱{Number(order.total_amount).toFixed(2)}
                      </span>
                    </div>

                    {/* Items */}
                    <div style={{ maxHeight: 120, overflowY: 'auto', paddingRight: 2 }} className="no-scrollbar">
                      {order.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, padding: '4px 0' }}>
                          <span style={{ color: '#a1a1aa' }}>
                            <strong style={{ color: '#f59e0b', fontFamily: "'Outfit', sans-serif" }}>{item.quantity}×</strong>{' '}
                            {item.name}
                          </span>
                          <span style={{ color: '#52525b', fontSize: 11 }}>₱{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Status badges row */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <StatusDot status={order.order_status} type="order" />
                      <StatusDot status={order.payment_status} type="payment" />
                    </div>

                    {/* Status Selects */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[
                        { label: 'Order Status', key: 'order_status', val: order.order_status, opts: ['pending','preparing','completed'] },
                        { label: 'Payment',      key: 'payment_status', val: order.payment_status, opts: ['pending','paid','failed'] },
                      ].map(({ label, key, val, opts }) => (
                        <div key={key}>
                          <label style={{ display: 'block', fontSize: 9, fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                            {label}
                          </label>
                          <select
                            value={val}
                            onChange={e => handleUpdateStatus(order.id, { [key]: e.target.value })}
                            className="input-glass-dark"
                            style={{
                              padding: '8px 10px', fontSize: 12, fontWeight: 700, borderRadius: 10,
                              ...(val === 'completed' || val === 'paid'
                                ? { color: '#10b981', borderColor: 'rgba(16,185,129,0.35)', background: 'rgba(16,185,129,0.08)' }
                                : val === 'preparing'
                                ? { color: '#3b82f6', borderColor: 'rgba(59,130,246,0.35)', background: 'rgba(59,130,246,0.08)' }
                                : val === 'failed'
                                ? { color: '#ef4444', borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)' }
                                : { color: '#f59e0b', borderColor: 'rgba(245,158,11,0.35)', background: 'rgba(245,158,11,0.08)' }),
                            }}
                          >
                            {opts.map(o => (
                              <option key={o} value={o} style={{ background: '#0c0c0f', color: '#f5f5f0' }}>
                                {o.charAt(0).toUpperCase() + o.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── QR Code Panel ── */}
          <div
            className="glass-dark animate-fade-in-up h-fit"
            style={{ borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, animationDelay: '200ms' }}
          >
            <div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 17, color: '#f5f5f0' }}>
                QR Generator
              </h2>
              <p style={{ fontSize: 12, color: '#52525b', marginTop: 4, lineHeight: 1.5 }}>
                Create ordering QR codes for each table.
              </p>
            </div>

            {/* ── Table Count Setting ── */}
            <div
              style={{
                background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)',
                borderRadius: 16, padding: 16,
              }}
            >
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Total Tables Available
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  id="table-count-input"
                  type="number"
                  min="1"
                  max="99"
                  value={tableCount}
                  onChange={e => setTableCount(e.target.value)}
                  className="input-glass-dark"
                  style={{ flex: 1, padding: '8px 12px', fontSize: 14, fontWeight: 700 }}
                />
                <button
                  id="save-table-count-btn"
                  onClick={saveTableCount}
                  disabled={tableCountSaving}
                  style={{
                    padding: '8px 16px', borderRadius: 12, fontSize: 12, fontWeight: 700,
                    border: 'none', cursor: tableCountSaving ? 'wait' : 'pointer',
                    background: tableCountSaved
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#1c1917',
                    transition: 'all 0.25s ease',
                    boxShadow: tableCountSaved
                      ? '0 4px 12px rgba(16,185,129,0.3)'
                      : '0 4px 12px rgba(245,158,11,0.3)',
                    flexShrink: 0,
                    minWidth: 60,
                  }}
                >
                  {tableCountSaved ? '✓ Saved' : tableCountSaving ? '...' : 'Save'}
                </button>
              </div>
              <p style={{ fontSize: 10, color: '#52525b', marginTop: 8, lineHeight: 1.5 }}>
                Customers will see Tables 1–{tableCount} on the welcome screen.
              </p>
            </div>

            {/* Table Input for QR */}
            <div>
              <label htmlFor="qr-table" style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Generate QR for Table
              </label>
              <input
                id="qr-table"
                type="number"
                min="1"
                max={tableCount}
                placeholder="e.g. 5"
                value={qrTableNumber}
                onChange={e => setQrTableNumber(e.target.value)}
                className="input-glass-dark"
              />
            </div>

            {/* QR Preview Card */}
            <div
              style={{
                background: 'rgba(5,5,7,0.5)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 18, padding: 24,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
              }}
            >
              <div
                id="qr-print-area"
                style={{
                  background: '#fff', borderRadius: 16, padding: 16,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
                {qrGeneratedUrl && (
                  <QRCodeSVG
                    id="qr-code-svg"
                    value={qrGeneratedUrl}
                    size={160}
                    bgColor="#FFFFFF"
                    fgColor="#1c1917"
                    level="H"
                    includeMargin={false}
                  />
                )}
              </div>

              {/* Table label pill */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.08))',
                  border: '1px solid rgba(245,158,11,0.25)',
                  borderRadius: 999, padding: '6px 18px',
                  fontSize: 13, fontWeight: 700, color: '#f59e0b',
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Table {qrTableNumber}
              </div>

              <p
                className="no-scrollbar"
                style={{
                  fontSize: 10, color: '#3f3f46', textAlign: 'center',
                  wordBreak: 'break-all', maxWidth: '100%',
                  userSelect: 'all',
                }}
              >
                {qrGeneratedUrl}
              </p>
            </div>

            {/* QR Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                id="download-qr-btn"
                onClick={downloadQRCode}
                className="press-effect"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#a1a1aa', fontWeight: 600, fontSize: 12,
                  padding: '11px 14px', borderRadius: 14, transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#f5f5f0'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <Download size={14} />
                <span>Download</span>
              </button>
              <button
                id="print-qr-btn"
                onClick={printQRCode}
                className="press-effect"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#1c1917', fontWeight: 700, fontSize: 12,
                  padding: '11px 14px', borderRadius: 14, border: 'none',
                  boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Printer size={14} />
                <span>Print</span>
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
