import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, CreditCard, ShieldCheck, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Logo from '../components/Logo';

export default function CheckoutPage({ cart, clearCart, setPage, apiBaseUrl, tableNumber, setTableNumber }) {
  const [customerName, setCustomerName] = useState('');
  const [tableInput, setTableInput] = useState(tableNumber || '');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedState, setSimulatedState] = useState(null);
  const [orderResponse, setOrderResponse] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleStartPayment = (e) => {
    e.preventDefault();
    if (!customerName.trim()) { setErrorMessage('Please enter your name.'); return; }
    if (!tableInput) { setErrorMessage('Please specify your table number.'); return; }
    setErrorMessage('');
    setTableNumber(tableInput);
    setIsSimulating(true);
    setSimulatedState('processing');
  };

  const handleSimulatePaymentOutcome = async (outcome) => {
    setSimulatedState('submitting');
    const orderItems = cart.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity }));
    try {
      const orderData = {
        customer_name: `${customerName} (Table ${tableInput})`,
        items: orderItems,
        total_amount: cartTotal,
        payment_status: outcome === 'success' ? 'paid' : 'failed',
        order_status: 'pending',
      };
      const response = await axios.post(`${apiBaseUrl}/api/orders`, orderData);
      setOrderResponse(response.data);
      if (outcome === 'success') { setSimulatedState('success'); clearCart(); }
      else { setSimulatedState('failure'); }
    } catch (err) {
      console.error('Error submitting order:', err);
      setErrorMessage('Network error. Order could not be recorded.');
      setSimulatedState(null);
      setIsSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-menu-hero pb-12">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-40">
        <div className="glass border-b border-white/40 shadow-sm">
          <div className="max-w-xl mx-auto px-4 py-3.5 flex items-center gap-3">
            <button
              id="checkout-back-btn"
              onClick={() => setPage('cart')}
              disabled={isSimulating}
              className="press-effect"
              style={{
                padding: 8, borderRadius: 999,
                background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#57534e', flexShrink: 0,
                opacity: isSimulating ? 0.4 : 1,
              }}
            >
              <ArrowLeft size={18} />
            </button>
            <Logo size={32} theme="light" />
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 mt-8">
        <div className="mb-6 animate-fade-in-up">
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 26, color: '#0c0c0f', letterSpacing: '-0.03em' }}>
            Checkout
          </h1>
          <p style={{ fontSize: 13, color: '#78716c', marginTop: 4 }}>
            Fill in your details and simulate a payment to place your order.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* ── Customer Details Form ── */}
          <form
            onSubmit={handleStartPayment}
            className="glass animate-fade-in-up"
            style={{ borderRadius: 24, padding: 24 }}
          >
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 16, color: '#0c0c0f', marginBottom: 16 }}>
              Customer Details
            </h2>

            {errorMessage && (
              <div
                className="animate-scale-in"
                style={{
                  background: 'rgba(254,242,242,0.9)', border: '1px solid rgba(252,165,165,0.5)',
                  borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#dc2626',
                  fontWeight: 500, marginBottom: 14,
                }}
              >
                {errorMessage}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label
                  htmlFor="customer-name"
                  style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}
                >
                  Your Name
                </label>
                <input
                  id="customer-name"
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="input-glass"
                />
              </div>

              <div>
                <label
                  htmlFor="table-number"
                  style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}
                >
                  Table Number
                </label>
                <input
                  id="table-number"
                  type="number"
                  required
                  placeholder="e.g. 5"
                  value={tableInput}
                  onChange={e => setTableInput(e.target.value)}
                  className="input-glass"
                />
              </div>

              <button
                type="submit"
                id="proceed-payment-btn"
                className="btn-dark w-full"
                style={{ marginTop: 4 }}
              >
                <CreditCard size={17} />
                <span>Proceed to Payment</span>
              </button>
            </div>
          </form>

          {/* ── Order Summary ── */}
          <div
            className="glass animate-fade-in-up"
            style={{ borderRadius: 24, padding: 24, animationDelay: '60ms' }}
          >
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 16, color: '#0c0c0f', marginBottom: 16 }}>
              Order Summary
            </h2>

            <div style={{ maxHeight: 200, overflowY: 'auto', paddingRight: 4 }} className="no-scrollbar">
              {cart.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '11px 0', fontSize: 13,
                    borderBottom: index < cart.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                  }}
                >
                  <div>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: '#d97706' }}>{item.quantity}×</span>
                    <span style={{ color: '#3d3d3d', fontWeight: 500, marginLeft: 6 }}>{item.name}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: '#0c0c0f' }}>
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: 14, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#0c0c0f' }}>Total</span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22, color: '#0c0c0f' }}>
                ₱{cartTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Payment Simulation Modal ─── */}
      {isSimulating && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(5,5,7,0.7)', backdropFilter: 'blur(16px)' }}
        >
          <div
            className="glass animate-scale-in w-full relative overflow-hidden"
            style={{ maxWidth: 420, borderRadius: 28, padding: 32 }}
          >
            {/* Brand badge */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
                  borderRadius: 999, padding: '5px 14px',
                  fontSize: 11, fontWeight: 700, color: '#b45309', letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                🔒 Servly Payment Sandbox
              </span>
            </div>

            {/* PROCESSING */}
            {simulatedState === 'processing' && (
              <div className="text-center animate-fade-in">
                <div
                  style={{
                    width: 72, height: 72, borderRadius: 999, margin: '0 auto 20px',
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.1))',
                    border: '2px solid rgba(245,158,11,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <CreditCard size={30} style={{ color: '#d97706' }} />
                </div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 20, color: '#0c0c0f' }}>
                  Payment Gateway
                </h3>
                <p style={{ fontSize: 13, color: '#78716c', marginTop: 8, marginBottom: 24, lineHeight: 1.6 }}>
                  Simulating a transaction of{' '}
                  <strong style={{ color: '#0c0c0f' }}>₱{cartTotal.toFixed(2)}</strong>.
                  <br />Choose the bank's response:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    id="simulate-success-btn"
                    onClick={() => handleSimulatePaymentOutcome('success')}
                    className="press-effect"
                    style={{
                      background: 'linear-gradient(135deg, #059669, #047857)',
                      color: '#fff', fontWeight: 700, fontSize: 14,
                      padding: '14px 28px', borderRadius: 16, border: 'none',
                      boxShadow: '0 4px 16px rgba(5,150,105,0.35)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    ✓ Simulate Success (Paid)
                  </button>
                  <button
                    id="simulate-failure-btn"
                    onClick={() => handleSimulatePaymentOutcome('failure')}
                    className="press-effect"
                    style={{
                      background: 'rgba(239,68,68,0.08)', color: '#dc2626', fontWeight: 700, fontSize: 14,
                      padding: '14px 28px', borderRadius: 16,
                      border: '1px solid rgba(239,68,68,0.3)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    ✕ Simulate Failure (Declined)
                  </button>
                </div>
              </div>
            )}

            {/* SUBMITTING */}
            {simulatedState === 'submitting' && (
              <div className="text-center py-8 animate-fade-in">
                <Loader2 size={40} className="animate-spin-slow" style={{ color: '#d97706', margin: '0 auto 16px' }} />
                <p style={{ fontWeight: 600, fontSize: 14, color: '#57534e' }}>
                  Recording transaction...
                </p>
              </div>
            )}

            {/* SUCCESS */}
            {simulatedState === 'success' && (
              <div className="text-center animate-scale-in">
                <div
                  style={{
                    width: 80, height: 80, borderRadius: 999, margin: '0 auto 20px',
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.08))',
                    border: '2px solid rgba(16,185,129,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <CheckCircle2 size={38} style={{ color: '#10b981' }} />
                </div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22, color: '#0c0c0f' }}>
                  Order Placed! 🎉
                </h3>
                <p style={{ fontSize: 13, color: '#78716c', marginTop: 8 }}>
                  Payment succeeded. Order{' '}
                  <span style={{ fontWeight: 700, color: '#0c0c0f' }}>#{orderResponse?.orderId}</span>{' '}
                  is being prepared.
                </p>
                <div
                  style={{
                    margin: '20px 0', padding: 16, borderRadius: 16,
                    background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)',
                    textAlign: 'left',
                  }}
                >
                  {[
                    ['Customer', customerName],
                    ['Table', tableInput],
                    ['Amount', `₱${cartTotal.toFixed(2)}`],
                    ['Status', 'Paid ✓'],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '5px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <span style={{ color: '#78716c' }}>{label}</span>
                      <span style={{ fontWeight: 700, color: label === 'Status' ? '#059669' : '#0c0c0f' }}>{value}</span>
                    </div>
                  ))}
                </div>
                <button
                  id="order-again-btn"
                  onClick={() => { setIsSimulating(false); setSimulatedState(null); setPage('menu'); }}
                  className="btn-dark w-full"
                >
                  Order Something Else
                </button>
              </div>
            )}

            {/* FAILURE */}
            {simulatedState === 'failure' && (
              <div className="text-center animate-scale-in">
                <div
                  style={{
                    width: 80, height: 80, borderRadius: 999, margin: '0 auto 20px',
                    background: 'rgba(254,242,242,0.9)', border: '2px solid rgba(252,165,165,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <XCircle size={38} style={{ color: '#ef4444' }} />
                </div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22, color: '#0c0c0f' }}>
                  Transaction Declined
                </h3>
                <p style={{ fontSize: 13, color: '#78716c', marginTop: 8, marginBottom: 24 }}>
                  Your mock payment failed. The order was logged as{' '}
                  <span style={{ fontWeight: 700, color: '#ef4444' }}>Failed</span>.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    onClick={() => setSimulatedState('processing')}
                    className="btn-dark w-full"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => { setIsSimulating(false); setSimulatedState(null); setPage('cart'); }}
                    className="press-effect"
                    style={{
                      padding: '12px 28px', borderRadius: 14, fontWeight: 600, fontSize: 13,
                      background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)',
                      color: '#57534e',
                    }}
                  >
                    Return to Basket
                  </button>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div
              style={{
                marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                fontSize: 11, color: '#a8a29e',
              }}
            >
              <ShieldCheck size={12} />
              <span>Simulated sandbox · No real funds processed</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
