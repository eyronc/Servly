import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ShoppingBag, AlertCircle, ChevronRight } from 'lucide-react';
import Logo from '../components/Logo';

export default function MenuPage({ cart, addToCart, setPage, apiBaseUrl, tableNumber }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedIds, setAddedIds] = useState({}); // track which items were just added

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiBaseUrl}/api/products`);
        setProducts(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Unable to fetch menu. Please check database connection or XAMPP.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [apiBaseUrl]);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleAddToCart = (product) => {
    addToCart(product);
    setAddedIds(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAddedIds(prev => ({ ...prev, [product.id]: false })), 900);
  };

  return (
    <div className="min-h-screen bg-menu-hero pb-32">
      {/* ─── Sticky Header ─── */}
      <header className="sticky top-0 z-40">
        <div className="glass border-b border-white/40 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
            <Logo size={36} theme="light" />

            {tableNumber && (
              <div
                className="glass-amber px-4 py-1.5 rounded-full text-xs font-bold tracking-wide animate-float"
                style={{ color: '#b45309' }}
              >
                🪑 Table {tableNumber}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── Main ─── */}
      <main className="max-w-4xl mx-auto px-4 mt-8">
        {/* Welcome Hero */}
        <div className="mb-8 animate-fade-in-up">
          <h2
            className="text-3xl font-bold"
            style={{ fontFamily: "'Outfit', sans-serif", color: '#0c0c0f', letterSpacing: '-0.03em' }}
          >
            Welcome to our Table
          </h2>
          <p className="text-sm mt-2" style={{ color: '#78716c' }}>
            Explore our hand-crafted culinary creations — order with ease.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none" style={{ color: '#a8a29e' }}>
            <Search size={17} />
          </span>
          <input
            type="text"
            placeholder="Search dishes, drinks, desserts..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-glass"
            style={{ paddingLeft: 44, borderRadius: 999 }}
          />
        </div>

        {/* Category Pills */}
        {loading ? (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="skeleton h-8 w-20 rounded-full shrink-0" />
            ))}
          </div>
        ) : (
          <div
            className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar stagger animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="press-effect"
                style={{
                  padding: '7px 18px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  ...(selectedCategory === category
                    ? {
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: '#1c1917',
                        border: 'none',
                        boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                      }
                    : {
                        background: 'rgba(255,255,255,0.7)',
                        backdropFilter: 'blur(8px)',
                        color: '#57534e',
                        border: '1px solid rgba(0,0,0,0.08)',
                      }),
                }}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            className="animate-scale-in flex items-start gap-3 mb-8 p-4"
            style={{
              background: 'rgba(254,242,242,0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(252,165,165,0.5)',
              borderRadius: 20,
            }}
          >
            <AlertCircle size={18} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: 13, color: '#dc2626' }}>Offline Mode</p>
              <p style={{ fontSize: 12, color: '#b91c1c', marginTop: 2 }}>{error}</p>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(n => (
              <div
                key={n}
                className="glass p-4 flex gap-4"
                style={{ borderRadius: 24 }}
              >
                <div className="skeleton w-24 h-24 shrink-0" style={{ borderRadius: 18 }} />
                <div className="flex-1 py-1 flex flex-col gap-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-full" />
                  <div className="skeleton h-3 w-5/6" />
                  <div className="skeleton h-5 w-1/4 mt-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            className="glass text-center py-16 animate-fade-in"
            style={{ borderRadius: 28 }}
          >
            <p style={{ color: '#a8a29e', fontWeight: 500, fontSize: 14 }}>
              No items match your search
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
            {filteredProducts.map(product => {
              const justAdded = addedIds[product.id];
              return (
                <div
                  key={product.id}
                  className="glass hover-lift card-shimmer animate-fade-in-up flex gap-4 p-4"
                  style={{ borderRadius: 24 }}
                >
                  {/* Product Image */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-24 h-24 object-cover"
                      style={{
                        borderRadius: 18,
                        border: '1.5px solid rgba(255,255,255,0.6)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                    />
                    {product.category && (
                      <span
                        style={{
                          position: 'absolute',
                          top: -6,
                          left: -6,
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          color: '#1c1917',
                          fontSize: 9,
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: 999,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          boxShadow: '0 2px 8px rgba(245,158,11,0.35)',
                        }}
                      >
                        {product.category}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <h3
                        style={{
                          fontFamily: "'Outfit', sans-serif",
                          fontWeight: 700,
                          fontSize: 15,
                          color: '#0c0c0f',
                          lineHeight: 1.3,
                        }}
                      >
                        {product.name}
                      </h3>
                      <p
                        className="line-clamp-2"
                        style={{ fontSize: 12, color: '#78716c', marginTop: 4, lineHeight: 1.5 }}
                      >
                        {product.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span
                        style={{
                          fontFamily: "'Outfit', sans-serif",
                          fontWeight: 800,
                          fontSize: 16,
                          color: '#0c0c0f',
                        }}
                      >
                        ₱{Number(product.price).toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="press-effect"
                        style={{
                          background: justAdded
                            ? 'linear-gradient(135deg, #10b981, #059669)'
                            : 'linear-gradient(135deg, #f59e0b, #d97706)',
                          color: justAdded ? '#fff' : '#1c1917',
                          fontWeight: 700,
                          fontSize: 12,
                          padding: '7px 16px',
                          borderRadius: 999,
                          border: 'none',
                          transition: 'all 0.25s var(--transition-spring)',
                          boxShadow: justAdded
                            ? '0 4px 14px rgba(16,185,129,0.35)'
                            : '0 4px 14px rgba(245,158,11,0.3)',
                          transform: justAdded ? 'scale(1.05)' : 'scale(1)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {justAdded ? '✓ Added!' : '+ Add'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ─── Floating Cart Bar ─── */}
      {cartItemCount > 0 && (
        <div
          className="fixed bottom-6 z-50 animate-bounce-cart"
          style={{
            left: '50%',
            width: '90%',
            maxWidth: 480,
            transform: 'translateX(-50%)',
          }}
        >
          <button
            id="view-cart-btn"
            onClick={() => setPage('cart')}
            className="w-full press-effect"
            style={{
              background: 'linear-gradient(135deg, #1e1e2a 0%, #0c0c0f 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(16px)',
              borderRadius: 999,
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                className="animate-pulse-glow"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  borderRadius: 999,
                  padding: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShoppingBag size={17} color="#1c1917" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 11, color: '#71717a', fontWeight: 500 }}>View Basket</p>
                <p style={{ fontSize: 14, color: '#fff', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                  {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: '#f59e0b' }}>
                ₱{cartTotal.toFixed(2)}
              </span>
              <ChevronRight size={18} color="#71717a" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
