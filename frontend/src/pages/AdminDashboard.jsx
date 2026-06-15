import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { 
  RefreshCw, PhilippinePeso, Clock, CheckCircle, AlertTriangle, 
  Search, ExternalLink, Download, Printer, User, UtensilsCrossed 
} from 'lucide-react';

export default function AdminDashboard({ apiBaseUrl, setPage }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'preparing', 'completed', 'failed'
  const [searchTerm, setSearchTerm] = useState('');
  
  // QR Generator states
  const [qrTableNumber, setQrTableNumber] = useState('1');
  const [qrGeneratedUrl, setQrGeneratedUrl] = useState('');
  
  const pollInterval = useRef(null);

  // Generate QR URL on load / table change
  useEffect(() => {
    const origin = window.location.origin;
    setQrGeneratedUrl(`${origin}?table=${qrTableNumber}`);
  }, [qrTableNumber]);

  // Fetch orders function
  const fetchOrders = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const response = await axios.get(`${apiBaseUrl}/api/orders`);
      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders. Ensure API server and MySQL database are active.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Poll orders on mount
  useEffect(() => {
    fetchOrders();
    pollInterval.current = setInterval(() => {
      fetchOrders(true);
    }, 8000); // Poll every 8 seconds

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [apiBaseUrl]);

  // Handle status update
  const handleUpdateStatus = async (orderId, updates) => {
    try {
      await axios.patch(`${apiBaseUrl}/api/orders/${orderId}`, updates);
      // Optimistically update status in state to feel instantaneous
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, ...updates } : order
      ));
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Failed to update order status. Please check database connection.');
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const customer = order.customer_name.toLowerCase();
    const matchesSearch = customer.includes(searchTerm.toLowerCase()) || order.id.toString().includes(searchTerm);
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'pending') return matchesSearch && order.order_status === 'pending' && order.payment_status !== 'failed';
    if (activeTab === 'preparing') return matchesSearch && order.order_status === 'preparing';
    if (activeTab === 'completed') return matchesSearch && order.order_status === 'completed';
    if (activeTab === 'failed') return matchesSearch && order.payment_status === 'failed';
    
    return matchesSearch;
  });

  // Calculate statistics
  const paidOrders = orders.filter(o => o.payment_status === 'paid');
  const activeOrders = orders.filter(o => o.payment_status !== 'failed' && (o.order_status === 'pending' || o.order_status === 'preparing'));
  const completedOrders = orders.filter(o => o.order_status === 'completed');
  const failedOrders = orders.filter(o => o.payment_status === 'failed');

  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

  // QR Code download function
  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `table-${qrTableNumber}-qr.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Print QR code
  const printQRCode = () => {
    const printContent = document.getElementById('qr-print-area').innerHTML;
    const originalContent = document.body.innerHTML;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - Table ${qrTableNumber}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 40px; }
            .qr-container { border: 2px dashed #ccc; padding: 30px; display: inline-block; border-radius: 20px; }
            h1 { margin-top: 20px; font-size: 24px; color: #333; }
            p { color: #666; font-size: 14px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="qr-container">
            ${printContent}
            <h1>TABLE ${qrTableNumber}</h1>
            <p>Scan to Browse Menu & Order</p>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-dark-950 text-stone-200 pb-16">
      
      {/* Top Admin Navigation */}
      <nav className="border-b border-stone-800/80 bg-dark-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2.5">
              <div className="bg-amber-500 text-white p-2 rounded-xl">
                <UtensilsCrossed size={18} />
              </div>
              <div>
                <span className="font-bold text-lg font-display tracking-tight text-white">Servly Admin</span>
                <span className="ml-2 bg-stone-800 text-amber-400 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm">Dashboard</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchOrders()}
                disabled={refreshing}
                className="p-2 hover:bg-stone-800 rounded-full transition-all text-stone-400 hover:text-white disabled:opacity-30"
                title="Refresh Orders"
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => setPage('menu')}
                className="text-xs bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-4 py-2 rounded-full transition-all flex items-center gap-1.5"
              >
                <span>Go to Menu</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Error Handling */}
        {error && (
          <div className="bg-red-950/60 border border-red-800 text-red-200 p-4 rounded-2xl flex items-start gap-3 mb-6">
            <AlertTriangle className="shrink-0 text-red-500" size={20} />
            <div>
              <p className="font-semibold text-sm">Server Offline</p>
              <p className="text-xs text-red-300/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Top KPI Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-dark-900 border border-stone-800/80 rounded-3xl p-5 flex items-center justify-between">
            <div>
              <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-bold font-display text-white mt-1.5">₱{totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-2xl">
              <PhilippinePeso size={22} />
            </div>
          </div>

          <div className="bg-dark-900 border border-stone-800/80 rounded-3xl p-5 flex items-center justify-between">
            <div>
              <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider">Active Orders</p>
              <h3 className="text-2xl font-bold font-display text-white mt-1.5">{activeOrders.length}</h3>
            </div>
            <div className="bg-amber-500/10 text-amber-400 p-3 rounded-2xl">
              <Clock size={22} />
            </div>
          </div>

          <div className="bg-dark-900 border border-stone-800/80 rounded-3xl p-5 flex items-center justify-between">
            <div>
              <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider">Completed</p>
              <h3 className="text-2xl font-bold font-display text-white mt-1.5">{completedOrders.length}</h3>
            </div>
            <div className="bg-blue-500/10 text-blue-400 p-3 rounded-2xl">
              <CheckCircle size={22} />
            </div>
          </div>

          <div className="bg-dark-900 border border-stone-800/80 rounded-3xl p-5 flex items-center justify-between">
            <div>
              <p className="text-stone-500 text-xs font-semibold uppercase tracking-wider">Failed / unpaid</p>
              <h3 className="text-2xl font-bold font-display text-white mt-1.5">{failedOrders.length}</h3>
            </div>
            <div className="bg-red-500/10 text-red-400 p-3 rounded-2xl">
              <AlertTriangle size={22} />
            </div>
          </div>
        </div>

        {/* Sub-grid: Orders Manager (Left/Middle) and QR Code Generator (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Orders Management Area (2 Columns wide on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search & Tabs Filtering */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Tab Filters */}
              <div className="flex gap-1 overflow-x-auto pb-1 w-full sm:w-auto scrollbar-none">
                {['all', 'pending', 'preparing', 'completed', 'failed'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all duration-150 ${
                      activeTab === tab
                        ? 'bg-amber-500 text-stone-950 shadow-md'
                        : 'bg-dark-900 text-stone-400 hover:text-white border border-stone-800'
                    }`}
                  >
                    {tab === 'failed' ? 'Failed' : tab}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64 shrink-0">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-stone-500">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search order or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-dark-900 border border-stone-800 rounded-full py-2.5 pl-9 pr-4 text-white text-xs placeholder-stone-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            {/* Orders Feed */}
            {loading ? (
              <div className="text-center py-20 bg-dark-900 border border-stone-800 rounded-3xl">
                <RefreshCw className="animate-spin text-amber-500 mx-auto mb-3" size={24} />
                <p className="text-stone-400 text-sm">Loading incoming orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-20 bg-dark-900 border border-stone-800 rounded-3xl p-8">
                <p className="text-stone-500 font-medium text-sm">No orders found in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOrders.map(order => (
                  <div 
                    key={order.id} 
                    className="bg-dark-900 border border-stone-800/80 rounded-3xl p-5 flex flex-col justify-between hover:border-stone-700/80 transition-all duration-200"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex justify-between items-start gap-2 border-b border-stone-800/60 pb-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold font-display text-white">Order #{order.id}</span>
                            <span className="text-[10px] text-stone-500">
                              {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 text-stone-400">
                            <User size={12} className="shrink-0" />
                            <span className="text-xs font-medium truncate max-w-[140px]" title={order.customer_name}>
                              {order.customer_name}
                            </span>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right">
                          <span className="text-sm font-bold font-display text-amber-400">₱{Number(order.total_amount).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Card Items */}
                      <div className="py-4 space-y-2 max-h-36 overflow-y-auto pr-1 border-b border-stone-800/40">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-stone-300">
                              <strong className="text-amber-500/85">{item.quantity}x</strong> {item.name}
                            </span>
                            <span className="text-stone-500">₱{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Modifiers */}
                    <div className="pt-4 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                          Order Status
                        </label>
                        <select
                          value={order.order_status}
                          onChange={(e) => handleUpdateStatus(order.id, { order_status: e.target.value })}
                          className={`w-full text-xs font-bold py-1.5 px-2.5 rounded-lg focus:outline-hidden transition-colors border ${
                            order.order_status === 'completed'
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                              : order.order_status === 'preparing'
                              ? 'bg-blue-950/40 text-blue-400 border-blue-800/60'
                              : 'bg-stone-900 text-stone-300 border-stone-700'
                          }`}
                        >
                          <option value="pending" className="bg-dark-900">Pending</option>
                          <option value="preparing" className="bg-dark-900">Preparing</option>
                          <option value="completed" className="bg-dark-900">Completed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                          Payment
                        </label>
                        <select
                          value={order.payment_status}
                          onChange={(e) => handleUpdateStatus(order.id, { payment_status: e.target.value })}
                          className={`w-full text-xs font-bold py-1.5 px-2.5 rounded-lg focus:outline-hidden transition-colors border ${
                            order.payment_status === 'paid'
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                              : order.payment_status === 'failed'
                              ? 'bg-red-950/40 text-red-400 border-red-800/60'
                              : 'bg-stone-900 text-amber-500 border-stone-700'
                          }`}
                        >
                          <option value="pending" className="bg-dark-900">Pending</option>
                          <option value="paid" className="bg-dark-900">Paid</option>
                          <option value="failed" className="bg-dark-900">Failed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* QR Code Utility Panel (1 Column wide) */}
          <div className="bg-dark-900 border border-stone-800/80 rounded-3xl p-6 h-fit space-y-6">
            <div>
              <h2 className="text-base font-bold font-display text-white">QR Code Generator</h2>
              <p className="text-stone-500 text-xs mt-1 leading-relaxed">
                Generate and print secure ordering QR codes for your restaurant tables.
              </p>
            </div>

            {/* Input fields */}
            <div>
              <label htmlFor="qr-table" className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-2">
                Table Identifier
              </label>
              <input
                id="qr-table"
                type="number"
                min="1"
                placeholder="e.g. 5"
                value={qrTableNumber}
                onChange={(e) => setQrTableNumber(e.target.value)}
                className="w-full bg-dark-950 border border-stone-800 rounded-xl py-3 px-4 text-white placeholder-stone-600 focus:outline-hidden focus:border-amber-500 transition-all text-sm font-semibold"
              />
            </div>

            {/* QR Card Container */}
            <div className="bg-dark-950 border border-stone-800 rounded-2xl p-6 flex flex-col items-center justify-center">
              
              {/* This div serves as the printable canvas wrapper */}
              <div id="qr-print-area" className="bg-white p-4 rounded-xl flex items-center justify-center">
                {qrGeneratedUrl && (
                  <QRCodeSVG 
                    id="qr-code-svg"
                    value={qrGeneratedUrl}
                    size={180}
                    bgColor="#FFFFFF"
                    fgColor="#1C1917"
                    level="H"
                    includeMargin={true}
                  />
                )}
              </div>

              {/* Show encoded text as verification helper */}
              <span className="text-[10px] text-stone-500 select-all truncate max-w-full text-center mt-4">
                {qrGeneratedUrl}
              </span>
            </div>

            {/* Actions for QR */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={downloadQRCode}
                className="flex items-center justify-center gap-1.5 bg-stone-800 hover:bg-stone-750 text-white font-semibold py-2.5 rounded-xl text-xs transition-colors border border-stone-700 shadow-xs"
              >
                <Download size={14} />
                <span>Download</span>
              </button>
              <button
                onClick={printQRCode}
                className="flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-2.5 rounded-xl text-xs transition-colors shadow-xs"
              >
                <Printer size={14} />
                <span>Print</span>
              </button>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
