import React, { useState, useEffect } from 'react';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminDashboard from './pages/AdminDashboard';

// Set up dynamically configurable API Base URL. 
// For local network mobile testing, connect both desktop and mobile to the same Wi-Fi
// and change this to http://<your-desktop-ip>:5000.
const API_BASE_URL = 'http://localhost:5000';

export default function App() {
  const [page, setPage] = useState('menu'); // 'menu', 'cart', 'checkout', 'admin'
  const [cart, setCart] = useState([]);
  const [tableNumber, setTableNumber] = useState('');

  // Extract table number and routing query arguments from URL parameters on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Parse table number e.g., ?table=3
    const tableParam = params.get('table');
    if (tableParam) {
      setTableNumber(tableParam);
    }

    // Direct routing option e.g., ?admin=true or ?page=admin
    const isAdmin = params.get('admin') === 'true' || params.get('page') === 'admin';
    if (isAdmin) {
      setPage('admin');
    } else {
      const pageParam = params.get('page');
      if (pageParam && ['menu', 'cart', 'checkout'].includes(pageParam)) {
        setPage(pageParam);
      }
    }
  }, []);

  // Update document title dynamically based on active page
  useEffect(() => {
    let title = 'Servly — Premium Ordering';
    if (page === 'admin') {
      title = 'Servly — Admin Portal';
    } else if (page === 'cart') {
      title = 'Your Basket — Servly';
    } else if (page === 'checkout') {
      title = 'Checkout — Servly';
    }
    document.title = title;
  }, [page]);

  // Cart Management Functions
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // State-driven routing engine
  switch (page) {
    case 'admin':
      return (
        <AdminDashboard 
          apiBaseUrl={API_BASE_URL} 
          setPage={setPage} 
        />
      );
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
