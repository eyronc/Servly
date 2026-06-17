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
  // Track the order ID from the first POST so retries PATCH instead of creating duplicates
  const [pendingOrderId, setPendingOrderId] = useState(null);

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
    const newPaymentStatus = outcome === 'success' ? 'paid' : 'failed';

    try {
      if (pendingOrderId === null) {
        // First attempt — create the order
        const orderItems = cart.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity }));
        const orderData = {
          customer_name: customerName,
          table_number: parseInt(tableInput, 10),
          items: orderItems,
          total_amount: cartTotal,
          payment_status: newPaymentStatus,
          order_status: 'pending',
        };
        const response = await axios.post(`${apiBaseUrl}/api/orders`, orderData);
        setOrderResponse(response.data);
        setPendingOrderId(response.data.orderId);
      } else {
        // Retry — PATCH the existing failed order instead of creating a new one
        await axios.patch(`${apiBaseUrl}/api/orders/${pendingOrderId}`, {
          payment_status: newPaymentStatus,
        });
        setOrderResponse(prev => ({ ...prev, orderId: pendingOrderId }));
      }

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
            className="animate-scale-in w-full relative overflow-hidden"
            style={{
              maxWidth: 420, borderRadius: 28, padding: 32,
              background: '#fffdf7',
              border: '1px solid rgba(245,158,11,0.15)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
            }}
          >
            {/* Brand badge */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(180,83,9,0.12))',
                  border: '1px solid rgba(245,158,11,0.4)',
                  borderRadius: 999, padding: '6px 16px',
                  fontSize: 11, fontWeight: 700, color: '#92400e', letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                }}
              >
                {/* Lock icon */}
                <svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="5.5" width="9" height="7" rx="2" fill="#b45309" opacity="0.9"/>
                  <path d="M3 5.5V3.5a2.5 2.5 0 0 1 5 0v2" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                  <circle cx="5.5" cy="9" r="1" fill="white"/>
                </svg>
                Servly Payment Sandbox
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
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                      e.currentTarget.style.boxShadow = '0 6px 24px rgba(5,150,105,0.55)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #059669, #047857)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(5,150,105,0.35)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      background: 'linear-gradient(135deg, #059669, #047857)',
                      color: '#fff', fontWeight: 700, fontSize: 14,
                      padding: '14px 28px', borderRadius: 16, border: 'none',
                      boxShadow: '0 4px 16px rgba(5,150,105,0.35)',
                      transition: 'all 0.22s ease', cursor: 'pointer',
                    }}
                  >
                    {/* Checkmark icon */}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="8" r="7" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2"/>
                      <path d="M4.5 8.5l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Simulate Success (Paid)
                  </button>
                  <button
                    id="simulate-failure-btn"
                    onClick={() => handleSimulatePaymentOutcome('failure')}
                    className="press-effect"
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(239,68,68,0.16)';
                      e.currentTarget.style.borderColor = 'rgba(239,68,68,0.7)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(239,68,68,0.2)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(239,68,68,0.07)';
                      e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      background: 'rgba(239,68,68,0.07)', color: '#dc2626', fontWeight: 700, fontSize: 14,
                      padding: '14px 28px', borderRadius: 16,
                      border: '1.5px solid rgba(239,68,68,0.35)',
                      transition: 'all 0.22s ease', cursor: 'pointer',
                    }}
                  >
                    {/* X icon */}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="8" r="7" stroke="rgba(220,38,38,0.4)" strokeWidth="1.2"/>
                      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    Simulate Failure (Declined)
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
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22, color: '#0c0c0f', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  Order Placed!
                  {/* Party star SVG */}
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 2l2.09 6.26L19 8.27l-4.91 4.37 1.64 6.36L11 15.27l-4.73 3.73 1.64-6.36L3 8.27l5.91-.01z" fill="#f59e0b" stroke="#d97706" strokeWidth="0.8"/>
                  </svg>
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
                  Your payment failed. The order was logged as{' '}
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
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(0,0,0,0.08)';
                      e.currentTarget.style.color = '#292524';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
                      e.currentTarget.style.color = '#57534e';
                    }}
                    style={{
                      padding: '12px 28px', borderRadius: 14, fontWeight: 600, fontSize: 13,
                      background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)',
                      color: '#57534e', transition: 'all 0.18s ease', cursor: 'pointer',
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
