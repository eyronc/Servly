import React from 'react';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingCart, ShoppingBag } from 'lucide-react';
import Logo from '../components/Logo';

export default function CartPage({ cart, updateQuantity, removeFromCart, setPage, tableNumber }) {
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-menu-hero pb-12">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40">
        <div className="glass border-b border-white/40 shadow-sm">
          <div className="max-w-xl mx-auto px-4 py-3.5 flex items-center gap-3">
            <button
              id="cart-back-btn"
              onClick={() => setPage('menu')}
              className="press-effect"
              style={{
                padding: 8,
                borderRadius: 999,
                background: 'rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.07)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#57534e',
                flexShrink: 0,
              }}
            >
              <ArrowLeft size={18} />
            </button>
            <Logo size={32} theme="light" />
            {tableNumber && (
              <div
                className="ml-auto glass-amber px-3 py-1 rounded-full text-xs font-bold"
                style={{ color: '#b45309', flexShrink: 0 }}
              >
                🪑 Table {tableNumber}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 mt-8">
        {/* Page title */}
        <div className="mb-6 animate-fade-in-up">
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 26, color: '#0c0c0f', letterSpacing: '-0.03em' }}>
            Your Basket
          </h1>
          {cartItemCount > 0 && (
            <p style={{ fontSize: 13, color: '#78716c', marginTop: 4 }}>
              {cartItemCount} item{cartItemCount !== 1 ? 's' : ''} · ready to order
            </p>
          )}
        </div>

        {cart.length === 0 ? (
          /* ── Empty State ── */
          <div
            className="glass animate-scale-in text-center py-16 px-8"
            style={{ borderRadius: 28 }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 999,
                background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.08))',
                border: '2px solid rgba(245,158,11,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <ShoppingBag size={30} style={{ color: '#d97706' }} />
            </div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 20, color: '#0c0c0f' }}>
              Your basket is empty
            </h2>
            <p style={{ fontSize: 13, color: '#78716c', marginTop: 6, marginBottom: 24 }}>
              Explore our menu and add your favourites to order.
            </p>
            <button
              id="browse-menu-btn"
              onClick={() => setPage('menu')}
              className="btn-dark"
              style={{ display: 'inline-flex' }}
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 stagger">
            {/* ── Cart Items ── */}
            <div
              className="glass animate-fade-in-up overflow-hidden"
              style={{ borderRadius: 24 }}
            >
              {/* Section header */}
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                  background: 'rgba(255,255,255,0.5)',
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Order Items
                </span>
              </div>

              <div style={{ divide: 'y' }}>
                {cart.map((item, index) => (
                  <div
                    key={item.id}
                    className="animate-fade-in-up"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      padding: 16,
                      display: 'flex',
                      gap: 14,
                      alignItems: 'center',
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                    }}
                  >
                    <img
                      src={item.image_url}
                      alt={item.name}
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        objectFit: 'cover',
                        flexShrink: 0,
                        border: '1.5px solid rgba(255,255,255,0.7)',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, color: '#0c0c0f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </h3>
                      <p style={{ fontSize: 12, color: '#d97706', fontWeight: 600, marginTop: 2 }}>
                        ₱{Number(item.price).toFixed(2)} each
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          background: 'rgba(0,0,0,0.05)',
                          border: '1px solid rgba(0,0,0,0.07)',
                          borderRadius: 999,
                          padding: '2px',
                        }}
                      >
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="press-effect"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'transparent',
                            border: 'none',
                            color: '#57534e',
                            opacity: item.quantity <= 1 ? 0.3 : 1,
                          }}
                        >
                          <Minus size={13} />
                        </button>
                        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, color: '#0c0c0f', minWidth: 24, textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="press-effect"
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'white',
                            border: 'none',
                            color: '#57534e',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                          }}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="press-effect"
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 999,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'transparent',
                          border: '1px solid rgba(239,68,68,0.2)',
                          color: '#d1d5db',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                          e.currentTarget.style.color = '#ef4444';
                          e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#d1d5db';
                          e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Price Summary ── */}
            <div
              className="glass animate-fade-in-up"
              style={{ borderRadius: 24, padding: 20 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <span style={{ color: '#78716c' }}>Subtotal ({cartItemCount} items)</span>
                  <span style={{ fontWeight: 600, color: '#0c0c0f' }}>₱{cartTotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <span style={{ color: '#78716c' }}>Service Charge (VAT incl.)</span>
                  <span style={{ fontWeight: 600, color: '#059669' }}>Free</span>
                </div>
                <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: '#0c0c0f' }}>Total Amount</span>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22, color: '#0c0c0f' }}>
                    ₱{cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Checkout CTA ── */}
            <button
              id="checkout-btn"
              onClick={() => setPage('checkout')}
              className="btn-primary w-full animate-fade-in-up"
              style={{ borderRadius: 999, padding: '16px 28px' }}
            >
              <ShoppingCart size={18} />
              <span>Proceed to Checkout</span>
            </button>

            <button
              onClick={() => setPage('menu')}
              className="press-effect w-full py-3 text-sm font-semibold"
              style={{ color: '#78716c', background: 'transparent', border: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#0c0c0f'}
              onMouseLeave={e => e.currentTarget.style.color = '#78716c'}
            >
              ← Add more items
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
