import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import {
  RefreshCw, PhilippinePeso, Clock, CheckCircle, AlertTriangle,
  Search, ExternalLink, Download, Printer, User, UtensilsCrossed, TrendingUp,
  Plus, Trash2, Edit3, X, LogOut, Menu,
} from 'lucide-react';
import Logo from '../components/Logo';

// ── Confirm Modal ───────────────────────────────────────────────────────────
function ConfirmModal({ isOpen, title, message, confirmLabel = 'Confirm', danger = true, onConfirm, onCancel }) {
  const [closing, setClosing] = useState(false);

  const handleCancel = () => {
    setClosing(true);
    setTimeout(() => { setClosing(false); onCancel(); }, 260);
  };

  const handleConfirm = () => {
    setClosing(true);
    setTimeout(() => { setClosing(false); onConfirm(); }, 260);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        background: closing ? 'rgba(5,5,7,0)' : 'rgba(5,5,7,0.72)',
        backdropFilter: closing ? 'blur(0px)' : 'blur(12px)',
        transition: 'background 0.26s ease, backdrop-filter 0.26s ease',
      }}
      onClick={handleCancel}
    >
      <div
        style={{
          width: '100%', maxWidth: 380, borderRadius: 24,
          background: 'linear-gradient(145deg, #1a1a24, #12121a)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
          padding: '28px 24px',
          display: 'flex', flexDirection: 'column', gap: 20,
          transform: closing ? 'scale(0.92) translateY(12px)' : 'scale(1) translateY(0)',
          opacity: closing ? 0 : 1,
          animation: closing ? 'none' : 'confirmModalIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
          <div style={{
            width: 60, height: 60, borderRadius: 999,
            background: danger ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
            border: `1.5px solid ${danger ? 'rgba(239,68,68,0.35)' : 'rgba(245,158,11,0.35)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={26} style={{ color: danger ? '#f87171' : '#f59e0b' }} />
          </div>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 17, color: '#f5f5f0', marginBottom: 8 }}>
              {title}
            </h3>
            <p style={{ fontSize: 13, color: '#71717a', lineHeight: 1.6 }}>
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleCancel}
            style={{
              flex: 1, padding: '11px', borderRadius: 12,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#a1a1aa', fontWeight: 600, fontSize: 13,
              cursor: 'pointer', transition: 'all 0.18s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.09)'; e.currentTarget.style.color='#f5f5f0'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='#a1a1aa'; }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              flex: 1, padding: '11px', borderRadius: 12,
              background: danger
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'linear-gradient(135deg, #f59e0b, #d97706)',
              border: 'none',
              color: danger ? '#fff' : '#1c1917',
              fontWeight: 700, fontSize: 13,
              cursor: 'pointer', transition: 'all 0.18s ease',
              boxShadow: danger
                ? '0 4px 14px rgba(239,68,68,0.35)'
                : '0 4px 14px rgba(245,158,11,0.35)',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter='brightness(1.1)'; e.currentTarget.style.transform='translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter='brightness(1)'; e.currentTarget.style.transform='translateY(0)'; }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Products CRUD states
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', confirmLabel: '', danger: true, onConfirm: null });
  const openConfirm = useCallback((title, message, confirmLabel, danger, onConfirm) => {
    setConfirmModal({ open: true, title, message, confirmLabel, danger, onConfirm });
  }, []);
  const closeConfirm = useCallback(() => {
    setConfirmModal(prev => ({ ...prev, open: false }));
  }, []);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formCategory, setFormCategory] = useState('Starters');

  const pollInterval = useRef(null);

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await axios.get(`${apiBaseUrl}/api/products`);
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'products') {
      fetchProducts();
    }
  }, [viewMode, apiBaseUrl]);

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormPrice('');
    setFormImageUrl('');
    setFormCategory('Starters');
    setEditingProduct(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormDescription(product.description || '');
    setFormPrice(product.price);
    setFormImageUrl(product.image_url || '');
    setFormCategory(product.category);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice || !formCategory) {
      alert('Please fill in Name, Price, and Category.');
      return;
    }

    const payload = {
      name: formName.trim(),
      description: formDescription.trim(),
      price: parseFloat(formPrice),
      image_url: formImageUrl.trim() || null,
      category: formCategory
    };

    try {
      if (editingProduct) {
        await axios.put(`${apiBaseUrl}/api/products/${editingProduct.id}`, payload);
      } else {
        await axios.post(`${apiBaseUrl}/api/products`, payload);
      }
      fetchProducts();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product. Please try again.');
    }
  };

  const handleDeleteProduct = (productId, name) => {
    openConfirm(
      'Delete Menu Item',
      `"${name}" will be permanently removed from the menu. This cannot be undone.`,
      'Delete',
      true,
      async () => {
        try {
          await axios.delete(`${apiBaseUrl}/api/products/${productId}`);
          fetchProducts();
        } catch (err) {
          console.error('Error deleting product:', err);
        }
      }
    );
  };

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
    <div className="min-h-screen bg-admin-hero text-stone-200 pb-16" style={{ overflowX: 'hidden', width: '100%' }}>

      {/* ─── Confirm Modal ─── */}
      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        danger={confirmModal.danger}
        onConfirm={() => { closeConfirm(); confirmModal.onConfirm?.(); }}
        onCancel={closeConfirm}
      />

      {/* ─── Top Navigation ─── */}
      <nav className="sticky top-0 z-40" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="glass-dark" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', height: 60, alignItems: 'center' }}>
              {/* Brand */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Logo size={34} theme="dark" showText={false} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 16, color: '#f5f5f0', letterSpacing: '-0.02em' }}>
                      Servly
                    </span>
                    <span style={{
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: '#1c1917', fontSize: 9, fontWeight: 800,
                      padding: '2px 7px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>
                      Admin
                    </span>
                  </div>
                  <p style={{ fontSize: 10, color: '#52525b', fontWeight: 500 }}>Dashboard Portal</p>
                </div>
              </div>

              {/* Desktop Actions */}
              <div className="admin-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {justRefreshed && (
                  <span className="animate-fade-in" style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>✓ Updated</span>
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
                  id="toggle-view-btn"
                  onClick={() => setViewMode(prev => prev === 'dashboard' ? 'products' : 'dashboard')}
                  className="press-effect"
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                    color: '#e4e4e7', fontWeight: 700, fontSize: 12,
                    padding: '8px 16px', borderRadius: 999,
                    display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.color='#ffffff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='#e4e4e7'; }}
                >
                  <UtensilsCrossed size={13} />
                  <span>{viewMode === 'dashboard' ? 'Manage Menu' : 'Dashboard'}</span>
                </button>
                <button
                  id="go-to-menu-btn"
                  onClick={() => setPage('menu')}
                  className="press-effect"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#1c1917', fontWeight: 700, fontSize: 12,
                    padding: '8px 16px', borderRadius: 999, border: 'none',
                    display: 'flex', alignItems: 'center', gap: 6,
                    boxShadow: '0 4px 14px rgba(245,158,11,0.3)', transition: 'all 0.2s ease',
                  }}
                >
                  <span>Go to Menu</span>
                  <ExternalLink size={12} />
                </button>
              </div>

              {/* Mobile Hamburger */}
              <button
                className="admin-nav-mobile press-effect"
                onClick={() => setMobileMenuOpen(prev => !prev)}
                style={{
                  display: 'none', padding: 9, borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#e4e4e7',
                }}
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
              <div
                className="animate-fade-in-up admin-nav-mobile"
                style={{
                  display: 'none', flexDirection: 'column', gap: 8,
                  paddingBottom: 14, paddingTop: 4,
                }}
              >
                <button
                  onClick={() => { fetchOrders(); setMobileMenuOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 14px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                    color: '#a1a1aa', fontWeight: 600, fontSize: 13, width: '100%',
                  }}
                >
                  <RefreshCw size={15} className={refreshing ? 'animate-spin-slow' : ''} />
                  Refresh Data
                </button>
                <button
                  onClick={() => { setViewMode(prev => prev === 'dashboard' ? 'products' : 'dashboard'); setMobileMenuOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 14px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                    color: '#e4e4e7', fontWeight: 600, fontSize: 13, width: '100%',
                  }}
                >
                  <UtensilsCrossed size={15} />
                  {viewMode === 'dashboard' ? 'Manage Menu' : 'Dashboard'}
                </button>
                <button
                  onClick={() => setPage('menu')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 14px', borderRadius: 12,
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    border: 'none', color: '#1c1917', fontWeight: 700, fontSize: 13, width: '100%',
                  }}
                >
                  <ExternalLink size={15} />
                  Go to Customer Menu
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Main Body ─── */}
      <main className="admin-main" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px', marginTop: 28 }}>

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

        {viewMode === 'dashboard' ? (
          <>
            {/* KPI Stats */}
            <div className="admin-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
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

          <div className="admin-table-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 10 }}>
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
                      onClick={() => {
                        openConfirm(
                          `Clear Table ${num}`,
                          `This will end the current session and free Table ${num} for new guests.`,
                          'Free Table',
                          true,
                          async () => {
                            try {
                              await axios.post(`${apiBaseUrl}/api/sessions/leave`, { session_id: session.session_id });
                              fetchOrders(true);
                            } catch (err) {
                              console.error('Failed to release session:', err);
                            }
                          }
                        );
                      }}
                      className="press-effect"
                      style={{
                        marginTop: 4, fontSize: 8, fontWeight: 700,
                        padding: '4px 9px', borderRadius: 6,
                        background: 'rgba(239,68,68,0.14)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: '#f87171', cursor: 'pointer',
                        textTransform: 'uppercase', letterSpacing: '0.04em',
                        transition: 'all 0.2s ease',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.28)'; e.currentTarget.style.color='#fca5a5'; }}
                      onMouseLeave={e => { e.currentTarget.style.background='rgba(239,68,68,0.14)'; e.currentTarget.style.color='#f87171'; }}
                    >
                      <LogOut size={8} />
                      Release
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sub-grid: Orders (2/3) + QR Generator (1/3) */}
        <div className="admin-subgrid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, minWidth: 0 }}>
          
          {/* ── Orders Panel ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>

            {/* Search & Tabs */}
            <div
              className="glass-dark animate-fade-in-up"
              style={{ borderRadius: 20, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}
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
              <div className="admin-order-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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
                    <div className="admin-status-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
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
          </>
        ) : (
          <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Top row: Header & Add Product button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22, color: '#f5f5f0' }}>
                  Menu & Products Management
                </h2>
                <p style={{ fontSize: 12, color: '#71717a', marginTop: 3 }}>
                  Create, edit, or delete items on your digital menu in real-time.
                </p>
              </div>
              <button
                onClick={openAddModal}
                className="press-effect"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff', fontWeight: 700, fontSize: 13,
                  padding: '10px 20px', borderRadius: 999, border: 'none',
                  display: 'flex', alignItems: 'center', gap: 6,
                  boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} />
                <span>Add Product</span>
              </button>
            </div>

            {/* Products list grouped by category */}
            {productsLoading ? (
              <div className="glass-dark text-center" style={{ borderRadius: 24, padding: '64px 32px' }}>
                <RefreshCw className="animate-spin-slow" size={28} style={{ color: '#f59e0b', margin: '0 auto 12px' }} />
                <p style={{ fontSize: 13, color: '#71717a' }}>Loading menu items...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="glass-dark text-center" style={{ borderRadius: 24, padding: '64px 32px' }}>
                <p style={{ fontSize: 13, color: '#71717a', fontWeight: 500 }}>No products found on the menu. Get started by adding one!</p>
              </div>
            ) : (
              ['Starters', 'Mains', 'Desserts', 'Drinks'].map(cat => {
                const catProducts = products.filter(p => p.category === cat);
                if (catProducts.length === 0) return null;
                return (
                  <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 16, color: '#f59e0b', borderBottom: '1px solid rgba(245,158,11,0.2)', paddingBottom: 6 }}>
                      {cat}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                      {catProducts.map(product => (
                        <div
                          key={product.id}
                          className="glass-dark card-shimmer"
                          style={{
                            borderRadius: 20,
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          {/* Image or fallback */}
                          <div style={{ height: 140, width: '100%', position: 'relative', background: 'rgba(0,0,0,0.2)' }}>
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3f3f46' }}>
                                <UtensilsCrossed size={40} />
                              </div>
                            )}
                            <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(24,24,27,0.75)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, color: '#f59e0b' }}>
                              ₱{product.price}
                            </div>
                          </div>

                          {/* Content */}
                          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 8 }}>
                            <h4 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 850, fontSize: 15, color: '#f5f5f0' }}>
                              {product.name}
                            </h4>
                            <p style={{ fontSize: 12, color: '#71717a', lineHeight: 1.5, flexGrow: 1 }}>
                              {product.description || 'No description provided.'}
                            </p>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                              <button
                                onClick={() => openEditModal(product)}
                                className="press-effect"
                                style={{
                                  flex: 1,
                                  background: 'rgba(255,255,255,0.05)',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  color: '#e4e4e7',
                                  padding: '7px 0',
                                  borderRadius: 10,
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 6,
                                }}
                              >
                                <Edit3 size={13} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id, product.name)}
                                className="press-effect"
                                style={{
                                  background: 'rgba(239,68,68,0.1)',
                                  border: '1px solid rgba(239,68,68,0.2)',
                                  color: '#f87171',
                                  padding: '7px 12px',
                                  borderRadius: 10,
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(9, 9, 11, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
        >
          <div
            className="glass-dark animate-scale-in"
            style={{
              width: '100%',
              maxWidth: 480,
              borderRadius: 24,
              border: '1px solid rgba(255,255,255,0.08)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: '#f5f5f0' }}>
                {editingProduct ? 'Edit Menu Item' : 'Add Menu Item'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Product Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="input-glass-dark"
                  placeholder="e.g. Garlic Butter Shrimp"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category *</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="input-glass-dark"
                    style={{ height: '38px', padding: '0 10px', color: '#e4e4e7', background: '#1c1917' }}
                  >
                    <option value="Starters" style={{ background: '#18181b', color: '#f5f5f0' }}>Starters</option>
                    <option value="Mains" style={{ background: '#18181b', color: '#f5f5f0' }}>Mains</option>
                    <option value="Desserts" style={{ background: '#18181b', color: '#f5f5f0' }}>Desserts</option>
                    <option value="Drinks" style={{ background: '#18181b', color: '#f5f5f0' }}>Drinks</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Price (₱) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={e => setFormPrice(e.target.value)}
                    className="input-glass-dark"
                    placeholder="e.g. 350.00"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Description</label>
                <textarea
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="input-glass-dark"
                  placeholder="Short description of the item..."
                  style={{ minHeight: 80, resize: 'vertical', padding: '8px 12px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Image URL</label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={e => setFormImageUrl(e.target.value)}
                  className="input-glass-dark"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="press-effect"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#1c1917',
                  fontWeight: 700,
                  fontSize: 13,
                  padding: '12px',
                  borderRadius: 12,
                  border: 'none',
                  marginTop: 8,
                  cursor: 'pointer'
                }}
              >
                {editingProduct ? 'Save Changes' : 'Create Item'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
