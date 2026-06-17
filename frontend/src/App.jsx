import React, { useState, useEffect, useRef } from 'react';
import WelcomePage from './pages/WelcomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminDashboard from './pages/AdminDashboard';

const API_BASE_URL = 'http://localhost:5000';

// Get or create a unique session ID per browser tab
function getSessionId() {
  let id = sessionStorage.getItem('servly_session_id');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('servly_session_id', id);
  }
  return id;
}

export default function App() {
  const [page, setPage] = useState(null);
  const [cart, setCart] = useState([]);
  const [tableNumber, setTableNumber] = useState('');
  const sessionId = getSessionId();
  const lastRegistered = useRef(0);

  // Parse URL on first load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname;

    if (pathname === '/admin') { setPage('admin'); return; }

    const isAdmin = params.get('admin') === 'true' || params.get('page') === 'admin';
    if (isAdmin) { setPage('admin'); return; }

    const tableParam = params.get('table');
    if (tableParam) {
      setTableNumber(tableParam);
      // Register session immediately for QR-scanned tables
      fetch(`${API_BASE_URL}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, table_number: parseInt(tableParam, 10) }),
      }).catch(() => {});
      
      const pageParam = params.get('page');
      if (pageParam && ['menu', 'cart', 'checkout'].includes(pageParam)) {
        setPage(pageParam);
      } else {
        setPage('menu');
      }
      return;
    }

    const pageParam = params.get('page');
    if (pageParam && ['menu', 'cart', 'checkout'].includes(pageParam)) {
      setPage(pageParam);
      return;
    }

    setPage('welcome');
  }, []);

  // Sync state changes to URL
  useEffect(() => {
    if (page === null) return;

    const params = new URLSearchParams(window.location.search);

    // Update or clear 'table' parameter
    if (tableNumber) {
      params.set('table', tableNumber);
    } else {
      params.delete('table');
    }

    // Update or clear 'page' parameter
    if (page === 'admin') {
      params.set('page', 'admin');
    } else if (page && page !== 'welcome' && page !== 'menu') {
      params.set('page', page);
    } else {
      params.delete('page');
    }

    // Don't add page/admin param if pathname is /admin
    if (window.location.pathname === '/admin') {
      params.delete('page');
      params.delete('admin');
    }

    const searchString = params.toString();
    const newSearch = searchString ? `?${searchString}` : '';
    const newUrl = `${window.location.pathname}${newSearch}`;

    // Push state only if search changed to avoid redundant entries/loops
    if (window.location.search !== newSearch) {
      window.history.pushState({ page, tableNumber }, '', newUrl);
    }
  }, [page, tableNumber]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const pathname = window.location.pathname;

      if (pathname === '/admin' || params.get('page') === 'admin' || params.get('admin') === 'true') {
        setPage('admin');
        return;
      }

      const tableParam = params.get('table');
      if (tableParam) {
        setTableNumber(tableParam);
      } else {
        setTableNumber('');
      }

      const pageParam = params.get('page');
      if (pageParam && ['menu', 'cart', 'checkout'].includes(pageParam)) {
        setPage(pageParam);
      } else if (tableParam) {
        setPage('menu');
      } else {
        setPage('welcome');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Heartbeat every 60s to keep session alive
  useEffect(() => {
    if (!tableNumber) return;
    const interval = setInterval(() => {
      fetch(`${API_BASE_URL}/api/sessions/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      }).catch(() => {});
    }, 60_000);
  }, [tableNumber, sessionId]);

  // If tableNumber becomes empty, delete the session from DB immediately
  useEffect(() => {
    if (page === null || page === 'admin') return;
    if (!tableNumber) {
      fetch(`${API_BASE_URL}/api/sessions/leave?session_id=${sessionId}`, {
        method: 'POST',
      }).catch(() => {});
    }
  }, [tableNumber, sessionId, page]);

  // On tab close / navigate away → delete session via sendBeacon
  useEffect(() => {
    const handleUnload = () => {
      navigator.sendBeacon(`${API_BASE_URL}/api/sessions/leave?session_id=${sessionId}`);
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [sessionId]);

  // Track tableNumber registration times to support grace period
  useEffect(() => {
    if (tableNumber) {
      lastRegistered.current = Date.now();
    }
  }, [tableNumber]);

  // Poll active sessions to see if admin released this session
  useEffect(() => {
    if (!tableNumber || page === 'admin') return;

    const interval = setInterval(async () => {
      // Grace period of 5 seconds to avoid race conditions during initial registration
      if (Date.now() - lastRegistered.current < 5000) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/sessions`);
        if (!res.ok) return;
        const activeSessions = await res.json();
        const stillActive = activeSessions.some(s => s.session_id === sessionId);
        if (!stillActive) {
          // Session was released/deleted!
          setTableNumber('');
          setPage('welcome');
        }
      } catch (err) {
        console.warn('Failed to check session status:', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [tableNumber, sessionId, page]);

  // Dynamic document title
  useEffect(() => {
    const titles = {
      admin: 'Servly — Admin Portal',
      cart: 'Your Basket — Servly',
      checkout: 'Checkout — Servly',
      welcome: 'Servly — Welcome',
    };
    document.title = titles[page] || 'Servly';
  }, [page]);

  // Cart helpers
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
  };
  const updateQuantity = (productId, qty) => {
    if (qty <= 0) { removeFromCart(productId); return; }
    setCart(prev => prev.map(i => i.id === productId ? { ...i, quantity: qty } : i));
  };
  const removeFromCart = (productId) => setCart(prev => prev.filter(i => i.id !== productId));
  const clearCart = () => setCart([]);

  if (page === null) return null;

  switch (page) {
    case 'welcome':
      return (
        <WelcomePage
          apiBaseUrl={API_BASE_URL}
          sessionId={sessionId}
          setPage={setPage}
          setTableNumber={setTableNumber}
        />
      );
    case 'admin':
      return <AdminDashboard apiBaseUrl={API_BASE_URL} setPage={setPage} />;
    case 'cart':
      return (
        <CartPage
          cart={cart}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          setPage={setPage}
          tableNumber={tableNumber}
        />
      );
    case 'checkout':
      return (
        <CheckoutPage
          cart={cart}
          clearCart={clearCart}
          setPage={setPage}
          apiBaseUrl={API_BASE_URL}
          tableNumber={tableNumber}
          setTableNumber={setTableNumber}
        />
      );
    case 'menu':
    default:
      return (
        <MenuPage
          cart={cart}
          addToCart={addToCart}
          setPage={setPage}
          apiBaseUrl={API_BASE_URL}
          tableNumber={tableNumber}
        />
      );
  }
}
