import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ShoppingBag, AlertCircle, Sparkles } from 'lucide-react';

export default function MenuPage({ cart, addToCart, setPage, apiBaseUrl, tableNumber }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

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

  // Categories extraction
  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Filtering products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-stone-50 pb-28">
      {/* Header Banner */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500 text-white p-2 rounded-xl shadow-md">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-stone-900 tracking-tight leading-none">Servly</h1>
              <p className="text-xs text-stone-500 mt-1">Bespoke Dining Experience</p>
            </div>
          </div>
          {tableNumber && (
            <div className="bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full text-xs font-semibold text-amber-800">
              Table {tableNumber}
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 mt-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-stone-950 font-display">Welcome to our Table</h2>
          <p className="text-stone-500 text-sm mt-1">Select from our signature hand-crafted culinary items below.</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-stone-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search for dishes, desserts, drinks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-2xl py-3 pl-10 pr-4 text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-xs"
          />
        </div>

        {/* Categories Horizontal Scroll */}
        {loading ? (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-9 w-20 bg-stone-200 animate-pulse rounded-full" />
            ))}
          </div>
        ) : (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Error Handling */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-start gap-3 my-8">
            <AlertCircle className="shrink-0 text-red-600" size={20} />
            <div>
              <p className="font-semibold text-sm">Offline Mode</p>
              <p className="text-xs text-red-700/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Products Listing */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white border border-stone-100 rounded-3xl p-4 flex gap-4 animate-pulse">
                <div className="w-24 h-24 bg-stone-200 rounded-2xl shrink-0" />
                <div className="flex-1 py-1">
                  <div className="h-4 bg-stone-200 rounded-sm w-3/4 mb-2" />
                  <div className="h-3 bg-stone-200 rounded-sm w-full mb-1" />
                  <div className="h-3 bg-stone-200 rounded-sm w-5/6 mb-3" />
                  <div className="h-5 bg-stone-200 rounded-sm w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-stone-200/80 p-8 shadow-xs">
            <p className="text-stone-400 font-medium text-sm">No items found matching your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="bg-white border border-stone-200/80 rounded-3xl p-4 flex gap-4 hover-lift hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-24 h-24 rounded-2xl object-cover bg-stone-100 shrink-0 border border-stone-100"
                />
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-bold text-stone-900 text-base font-display">{product.name}</h3>
                    <p className="text-stone-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-stone-950 font-display">₱{Number(product.price).toFixed(2)}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-2 rounded-full transition-all duration-150 active:scale-95 shadow-xs"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar for Mobile/Tablet */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-50 animate-bounce-subtle">
          <button
            onClick={() => setPage('cart')}
            className="w-full bg-stone-900 hover:bg-stone-950 text-white px-5 py-4 rounded-full flex items-center justify-between shadow-2xl transition-all duration-150 active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 text-white p-2 rounded-full">
                <ShoppingBag size={18} />
              </div>
              <div className="text-left">
                <p className="text-xs text-stone-400 font-medium">View Cart</p>
                <p className="text-sm font-bold font-display">{cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-stone-400 text-xs">Total:</span>
              <span className="font-bold font-display text-lg text-amber-400">₱{cartTotal.toFixed(2)}</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
