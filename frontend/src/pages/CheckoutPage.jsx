import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, CreditCard, ShieldCheck, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function CheckoutPage({ cart, clearCart, setPage, apiBaseUrl, tableNumber, setTableNumber }) {
  const [customerName, setCustomerName] = useState('');
  const [tableInput, setTableInput] = useState(tableNumber || '');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedState, setSimulatedState] = useState(null); // 'processing', 'success', 'failure'
  const [orderResponse, setOrderResponse] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleStartPayment = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!tableInput) {
      setErrorMessage('Please specify your table number.');
      return;
    }
    setErrorMessage('');
    setTableNumber(tableInput);
    setIsSimulating(true);
    setSimulatedState('processing');
  };

  const handleSimulatePaymentOutcome = async (outcome) => {
    setSimulatedState('submitting');
    
    // Map cart items into db compatible structure
    const orderItems = cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    try {
      const orderData = {
        customer_name: `${customerName} (Table ${tableInput})`,
        items: orderItems,
        total_amount: cartTotal,
        payment_status: outcome === 'success' ? 'paid' : 'failed',
        order_status: 'pending'
      };

      const response = await axios.post(`${apiBaseUrl}/api/orders`, orderData);
      setOrderResponse(response.data);

      if (outcome === 'success') {
        setSimulatedState('success');
        clearCart();
      } else {
        setSimulatedState('failure');
      }
    } catch (err) {
      console.error('Error submitting simulated order:', err);
      setErrorMessage('Network error occurred. Order could not be created in the database.');
      setSimulatedState(null);
      setIsSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-12">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => setPage('cart')}
            disabled={isSimulating}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-600 disabled:opacity-30"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold font-display text-stone-900">Checkout</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-4 mt-6">
        <div className="flex flex-col gap-6">
          
          {/* Order Details Form */}
          <form onSubmit={handleStartPayment} className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-xs flex flex-col gap-4">
            <h2 className="text-base font-bold text-stone-900 font-display">Customer Details</h2>
            
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-xs px-3 py-2 rounded-xl">
                {errorMessage}
              </div>
            )}

            <div>
              <label htmlFor="customer-name" className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                Your Name
              </label>
              <input
                id="customer-name"
                type="text"
                required
                placeholder="Enter your name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all text-sm font-medium"
              />
            </div>

            <div>
              <label htmlFor="table-number" className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                Table Number
              </label>
              <input
                id="table-number"
                type="number"
                required
                placeholder="e.g. 5"
                value={tableInput}
                onChange={(e) => setTableInput(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl py-3 px-4 text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all text-sm font-medium"
              />
            </div>
            
            <button
              type="submit"
              className="mt-2 bg-stone-900 hover:bg-stone-950 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <CreditCard size={18} />
              <span>Proceed to Payment Simulation</span>
            </button>
          </form>

          {/* Checkout Summary */}
          <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-xs flex flex-col gap-4">
            <h2 className="text-base font-bold text-stone-900 font-display">Order Summary</h2>
            <div className="divide-y divide-stone-100 max-h-48 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                  <div>
                    <span className="font-bold text-stone-900 font-display">{item.quantity}x</span>
                    <span className="text-stone-700 ml-2 font-medium">{item.name}</span>
                  </div>
                  <span className="font-semibold text-stone-900">₱{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-stone-100 pt-4 flex justify-between items-center">
              <span className="text-base font-bold text-stone-900">Total</span>
              <span className="text-xl font-bold font-display text-stone-950">₱{cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Simulation Modal overlay */}
      {isSimulating && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-stone-200 shadow-2xl relative overflow-hidden animate-scale-up">
            
            {/* Simulation Header */}
            <div className="text-center mb-6">
              <span className="bg-stone-100 px-3 py-1 rounded-full text-xs font-semibold text-stone-500 border border-stone-200">
                Servly Payment Sandbox
              </span>
            </div>

            {/* PROCESSING STATE */}
            {simulatedState === 'processing' && (
              <div className="text-center py-6">
                <Loader2 size={48} className="text-amber-500 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-bold font-display text-stone-900">Simulating Payment Gateway</h3>
                <p className="text-stone-500 text-xs mt-2 px-6 leading-relaxed">
                  Choose how you would like the bank to respond to this transaction request of <strong className="text-stone-800">₱{cartTotal.toFixed(2)}</strong>.
                </p>
                <div className="flex flex-col gap-3 mt-8">
                  <button
                    onClick={() => handleSimulatePaymentOutcome('success')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors shadow-xs"
                  >
                    Simulate Success (Paid)
                  </button>
                  <button
                    onClick={() => handleSimulatePaymentOutcome('failure')}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors shadow-xs"
                  >
                    Simulate Failure (Declined)
                  </button>
                </div>
              </div>
            )}

            {/* SUBMITTING STATE */}
            {simulatedState === 'submitting' && (
              <div className="text-center py-12">
                <Loader2 size={40} className="text-stone-900 animate-spin mx-auto mb-4" />
                <p className="text-sm font-semibold text-stone-700">Recording order transaction in database...</p>
              </div>
            )}

            {/* SUCCESS STATE */}
            {simulatedState === 'success' && (
              <div className="text-center py-6 animate-fade-in">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-xl font-bold font-display text-stone-900">Order Placed Successfully!</h3>
                <p className="text-stone-500 text-xs mt-2 px-6">
                  Thank you! Your payment succeeded. Order <span className="font-semibold text-stone-700">#{orderResponse?.orderId}</span> is now being prepared.
                </p>
                <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4 my-6 text-left text-xs text-stone-600 space-y-1.5 max-w-xs mx-auto">
                  <div className="flex justify-between"><span>Customer:</span><span className="font-semibold text-stone-900">{customerName}</span></div>
                  <div className="flex justify-between"><span>Table:</span><span className="font-semibold text-stone-900">{tableInput}</span></div>
                  <div className="flex justify-between"><span>Amount:</span><span className="font-semibold text-stone-900">₱{cartTotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Payment:</span><span className="font-semibold text-emerald-600 uppercase">Paid</span></div>
                </div>
                <button
                  onClick={() => {
                    setIsSimulating(false);
                    setSimulatedState(null);
                    setPage('menu');
                  }}
                  className="w-full bg-stone-900 hover:bg-stone-950 text-white font-semibold py-3 rounded-xl text-sm transition-colors shadow-xs"
                >
                  Order Something Else
                </button>
              </div>
            )}

            {/* FAILURE STATE */}
            {simulatedState === 'failure' && (
              <div className="text-center py-6 animate-fade-in">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle size={36} />
                </div>
                <h3 className="text-xl font-bold font-display text-stone-900">Transaction Declined</h3>
                <p className="text-stone-500 text-xs mt-2 px-6">
                  Your mock payment failed. The order has been logged in the database as <span className="font-semibold text-red-600">Failed</span>.
                </p>
                
                <div className="flex flex-col gap-3 mt-8">
                  <button
                    onClick={() => {
                      setSimulatedState('processing');
                    }}
                    className="w-full bg-stone-900 hover:bg-stone-950 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors shadow-xs"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => {
                      setIsSimulating(false);
                      setSimulatedState(null);
                      setPage('cart');
                    }}
                    className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold py-3 rounded-xl text-sm transition-colors border border-stone-200"
                  >
                    Return to Basket
                  </button>
                </div>
              </div>
            )}

            {/* Security Note */}
            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-center gap-1.5 text-stone-400 text-[10px]">
              <ShieldCheck size={12} />
              <span>Simulated sandbox transaction. No real funds processed.</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
