import React from 'react';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingCart, ShoppingBag } from 'lucide-react';

export default function CartPage({ cart, updateQuantity, removeFromCart, setPage, tableNumber }) {
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-stone-50 pb-12">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200/85">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => setPage('menu')}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-600"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold font-display text-stone-900">Your Basket</h1>
          {tableNumber && (
            <span className="ml-auto bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-xs font-semibold text-amber-800">
              Table {tableNumber}
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto px-4 mt-6">
        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white border border-stone-200/80 rounded-3xl p-8 shadow-xs">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={28} />
            </div>
            <h2 className="text-xl font-bold font-display text-stone-900">Your basket is empty</h2>
            <p className="text-stone-500 text-sm mt-1 mb-6">Explore our menu and add items to your cart to order.</p>
            <button
              onClick={() => setPage('menu')}
              className="bg-stone-900 hover:bg-stone-950 text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Cart Items List */}
            <div className="bg-white border border-stone-200/80 rounded-3xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-stone-100 bg-stone-50/50">
                <span className="text-stone-500 text-xs font-semibold uppercase tracking-wider">Order Items</span>
              </div>
              <div className="divide-y divide-stone-100">
                {cart.map(item => (
                  <div key={item.id} className="p-4 flex gap-4 items-center">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover bg-stone-100 border border-stone-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-stone-900 text-sm truncate font-display">{item.name}</h3>
                      <p className="text-amber-600 font-semibold text-xs mt-1">
                        ₱{Number(item.price).toFixed(2)} each
                      </p>
                    </div>
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1">
                      <div className="flex items-center bg-stone-100 border border-stone-200 rounded-full p-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1 hover:bg-white rounded-full transition-colors disabled:opacity-30 text-stone-600"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 text-sm font-bold font-display text-stone-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-white rounded-full transition-colors text-stone-600"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-xs flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-500">Subtotal ({cartItemCount} items)</span>
                <span className="font-semibold text-stone-900">₱{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-stone-500">Service Charge (VAT included)</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>
              <div className="h-px bg-stone-100 my-1" />
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-stone-900">Total Amount</span>
                <span className="text-xl font-bold font-display text-stone-950">₱{cartTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => setPage('checkout')}
              className="w-full mt-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-4 rounded-full flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-150 active:scale-98"
            >
              <ShoppingCart size={18} />
              <span>Proceed to Checkout</span>
            </button>
            
            <button
              onClick={() => setPage('menu')}
              className="w-full py-3 text-stone-500 hover:text-stone-800 text-sm font-medium transition-colors"
            >
              Add more items
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
