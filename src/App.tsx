import React, { useState, useEffect } from 'react';
import { 
  Search, ShoppingBag, Truck, Package, Clock, RotateCcw,
  X, Check, CreditCard, Wallet, AlertCircle, Ban, QrCode, ExternalLink
} from 'lucide-react';

type Tab = 'all' | 'crops' | 'f2f-seeds' | 'rentals' | 'orders';

interface Listing {
  id: string;
  title: string;
  type: 'crop' | 'seed' | 'rental';
  category: string;
  price: number;
  unit: string;
  city: string;
  state: string;
  sellerName: string;
  sellerUpiId: string;
  image: string;
  expectedDeliveryDays: number;
  estimatedDistanceKm: number;
}

interface ActiveOrder {
  orderId: string;
  item: Listing;
  orderDate: string;
  sellerSetDeliveryDate: string;
  currentStatus: 'Placed' | 'Processing' | 'In-Transit' | 'Delivered' | 'Returned' | 'Cancelled';
  paymentMethod: string;
  deliveryAddress: string;
  itemPrice: number;
  deliveryCharge: number;
  totalAmount: number;
  timeline: { title: string; date: string; completed: boolean; current?: boolean }[];
  isReturned?: boolean;
  returnReason?: string;
  returnFeedback?: string;
  cancelReason?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Checkout Modal & Payment State
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment_app' | 'success'>('cart');
  const [paymentApp, setPaymentApp] = useState<'phonepe' | 'gpay' | 'paytm' | 'qr'>('phonepe');
  const [paymentTimer, setPaymentTimer] = useState<number>(300); // 5 minute timer
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Return & Cancel Modal States
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ActiveOrder | null>(null);
  const [actionReason, setActionReason] = useState('Changed Mind');
  const [actionFeedback, setActionFeedback] = useState('');

  // Delivery Rate Calculation Engine (Cheapest Local Transport e.g., Auto / Mini Truck)
  const deliveryRatePerKm = 8; // ₹8 per km cheapest mandi rate

  const [listings] = useState<Listing[]>([
    { 
      id: '1', 
      title: 'A-Grade Hybrid Wheat Seed (Lok-1 Desi)', 
      type: 'seed', 
      category: 'F2F Seed', 
      price: 35, 
      unit: 'kg', 
      city: 'Indore', 
      state: 'MP', 
      sellerName: 'Patel Organic Farms', 
      sellerUpiId: 'patelfarms@upi',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80', 
      expectedDeliveryDays: 3,
      estimatedDistanceKm: 15
    },
    { 
      id: '2', 
      title: 'Fresh Desi Red Tomatoes (A-Grade)', 
      type: 'crop', 
      category: 'Vegetable', 
      price: 26, 
      unit: 'kg', 
      city: 'Bhopal', 
      state: 'MP', 
      sellerName: 'Vikram Singh', 
      sellerUpiId: 'vikram.singh@upi',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80', 
      expectedDeliveryDays: 2,
      estimatedDistanceKm: 22
    },
    { 
      id: '3', 
      title: 'Mahindra 575 DI Harvester Rental', 
      type: 'rental', 
      category: 'Machinery', 
      price: 1100, 
      unit: 'hr', 
      city: 'Ujjain', 
      state: 'MP', 
      sellerName: 'Suresh Verma', 
      sellerUpiId: 'sureshverma@upi',
      image: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=600&q=80', 
      expectedDeliveryDays: 1,
      estimatedDistanceKm: 10
    }
  ]);

  const [cart, setCart] = useState<Listing[]>([listings[0]]);

  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([
    {
      orderId: 'ORD-889201',
      item: listings[0],
      orderDate: '02 Sep 2026, 10:30 AM',
      sellerSetDeliveryDate: '05 Sep 2026 (Before 6:00 PM)',
      currentStatus: 'In-Transit',
      paymentMethod: 'PhonePe Direct UPI',
      deliveryAddress: 'Farm House #4, Village Badnawar, Dhar, MP - 454661',
      itemPrice: 35,
      deliveryCharge: 120,
      totalAmount: 155,
      timeline: [
        { title: 'Order Placed & Paid', date: '02 Sep, 10:30 AM', completed: true },
        { title: 'Packed & Verified by Seller', date: '02 Sep, 04:15 PM', completed: true },
        { title: 'Dispatched via Local Transport', date: '03 Sep, 09:00 AM', completed: true, current: true },
        { title: 'Out for Local Delivery', date: '05 Sep (Expected)', completed: false }
      ]
    }
  ]);

  // Payment Countdown Timer (5 Minutes)
  useEffect(() => {
    let timer: any;
    if (checkoutStep === 'payment_app' && paymentTimer > 0) {
      timer = setInterval(() => {
        setPaymentTimer((prev) => prev - 1);
      }, 1000);
    } else if (paymentTimer === 0) {
      alert("Payment Session Expired! Please try placing order again.");
      setCheckoutStep('cart');
      setCartModalOpen(false);
      setPaymentTimer(300);
    }
    return () => clearInterval(timer);
  }, [checkoutStep, paymentTimer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Launch Third-Party UPI App Intent (Myntra-Style)
  const triggerUpiPaymentApp = () => {
    if (cart.length === 0) return;
    const currentItem = cart[0];
    const deliveryCharge = currentItem.estimatedDistanceKm * deliveryRatePerKm;
    const grandTotal = currentItem.price + deliveryCharge;

    // UPI Deep Linking URL Schema
    const upiUrl = `upi://pay?pa=${currentItem.sellerUpiId}&pn=${encodeURIComponent(currentItem.sellerName)}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent('UrbanAgri Order Payment')}`;
    
    setIsProcessingPayment(true);
    
    // Open Third Party App Link
    window.location.href = upiUrl;

    // Simulate verification check callback from payment gateway
    setTimeout(() => {
      setIsProcessingPayment(false);
      handleSuccessfulPayment(grandTotal, deliveryCharge);
    }, 4000);
  };

  const handleSuccessfulPayment = (grandTotal: number, deliveryCharge: number) => {
    const newOrder: ActiveOrder = {
      orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      item: cart[0],
      orderDate: 'Today, Just Now',
      sellerSetDeliveryDate: '06 Sep 2026 (Guaranteed by Seller)',
      currentStatus: 'Placed',
      paymentMethod: `UPI Direct (${paymentApp.toUpperCase()})`,
      deliveryAddress: 'Farmer Registered Address, MP',
      itemPrice: cart[0].price,
      deliveryCharge: deliveryCharge,
      totalAmount: grandTotal,
      timeline: [
        { title: 'Payment Confirmed & Order Placed', date: 'Just Now', completed: true, current: true },
        { title: 'Seller Quality Verification', date: 'Pending', completed: false },
        { title: 'Dispatched to Transport Hub', date: 'Pending', completed: false },
        { title: 'Out for Local Delivery', date: 'Pending', completed: false }
      ]
    };

    setActiveOrders([newOrder, ...activeOrders]);
    setCheckoutStep('success');
  };

  // Order Cancellation Logic
  const handleCancelOrder = () => {
    if (!selectedOrder) return;

    setActiveOrders(prev => prev.map(order => {
      if (order.orderId === selectedOrder.orderId) {
        return {
          ...order,
          currentStatus: 'Cancelled',
          cancelReason: actionReason,
          timeline: [
            ...order.timeline,
            { title: `Order Cancelled (${actionReason})`, date: 'Just Now', completed: true, current: true }
          ]
        };
      }
      return order;
    }));

    setCancelModalOpen(false);
    setSelectedOrder(null);
    setActionFeedback('');
  };

  // Order Return Logic
  const handleProcessReturn = () => {
    if (!selectedOrder) return;
    
    setActiveOrders(prev => prev.map(order => {
      if (order.orderId === selectedOrder.orderId) {
        return {
          ...order,
          currentStatus: 'Returned',
          isReturned: true,
          returnReason: actionReason,
          returnFeedback: actionFeedback
        };
      }
      return order;
    }));

    setReturnModalOpen(false);
    setSelectedOrder(null);
    setActionFeedback('');
  };

  const filteredListings = listings.filter(item => {
    if (activeTab === 'crops') return item.type === 'crop';
    if (activeTab === 'f2f-seeds') return item.type === 'seed';
    if (activeTab === 'rentals') return item.type === 'rental';
    return true;
  });

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }} className="min-h-screen bg-slate-100 text-slate-900 pb-20 w-full overflow-x-hidden">
      
      {/* HEADER */}
      <header className="bg-slate-950 text-white sticky top-0 z-50 w-full border-b border-slate-800 shadow-md">
        <div className="w-full px-4 lg:px-10 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('all')}>
            <span className="text-2xl font-black tracking-tighter uppercase italic text-white">URBAN<span className="text-emerald-400">AGRI</span></span>
          </div>

          <div className="flex-1 max-w-2xl relative mx-2">
            <Search className="absolute left-4 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search crops, seeds, order tracking..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-2 bg-slate-900 border border-slate-700 text-white placeholder-slate-400 text-xs font-medium rounded-full focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border transition ${activeTab === 'orders' ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-slate-900 border-slate-700 text-slate-300'}`}
            >
              <Package size={15} /> My Orders ({activeOrders.length})
            </button>

            <div onClick={() => setCartModalOpen(true)} className="relative cursor-pointer text-slate-300 hover:text-white">
              <ShoppingBag size={22} />
              {cart.length > 0 && <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-black text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">{cart.length}</span>}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex w-full px-10 bg-slate-900 text-slate-300 py-2.5 overflow-x-auto space-x-8 text-xs font-bold border-t border-slate-800 uppercase tracking-wider justify-center">
          <button onClick={() => setActiveTab('all')} className={activeTab === 'all' ? 'text-emerald-400 font-black border-b-2 border-emerald-400 pb-1' : ''}>All Market</button>
          <button onClick={() => setActiveTab('crops')} className={activeTab === 'crops' ? 'text-emerald-400 font-black border-b-2 border-emerald-400 pb-1' : ''}>Crops</button>
          <button onClick={() => setActiveTab('f2f-seeds')} className={activeTab === 'f2f-seeds' ? 'text-emerald-400 font-black border-b-2 border-emerald-400 pb-1' : ''}>Farmer Seeds</button>
          <button onClick={() => setActiveTab('rentals')} className={activeTab === 'rentals' ? 'text-emerald-400 font-black border-b-2 border-emerald-400 pb-1' : ''}>Equipment Rentals</button>
          <button onClick={() => setActiveTab('orders')} className={activeTab === 'orders' ? 'text-emerald-400 font-black border-b-2 border-emerald-400 pb-1' : ''}>Track Orders & Returns</button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="w-full px-4 lg:px-10 py-6 max-w-7xl mx-auto">

        {/* TAB 1: PRODUCT MARKETPLACE */}
        {activeTab !== 'orders' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map(item => {
              const estDeliveryCharge = item.estimatedDistanceKm * deliveryRatePerKm;
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition">
                  <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
                  <div className="p-4 space-y-2">
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold uppercase">{item.category}</span>
                    <h3 className="font-extrabold text-slate-900 text-sm">{item.title}</h3>
                    <p className="text-xl font-black text-emerald-700">₹{item.price} <span className="text-xs text-slate-500 font-normal">/ {item.unit}</span></p>
                    
                    <div className="bg-slate-50 text-slate-800 p-2.5 rounded-xl text-xs space-y-1 border border-slate-200">
                      <p className="font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1"><Truck size={14} className="text-emerald-600" /> Cheapest Local Delivery:</span>
                        <b className="text-slate-950">₹{estDeliveryCharge}</b>
                      </p>
                      <p className="text-[10px] text-slate-500">Auto/Truck Logistics ({item.estimatedDistanceKm} km distance @ ₹{deliveryRatePerKm}/km)</p>
                    </div>

                    <button 
                      onClick={() => { setCart([item]); setCheckoutStep('cart'); setCartModalOpen(true); }}
                      className="w-full bg-slate-950 hover:bg-emerald-600 text-white font-extrabold text-xs py-2.5 rounded-xl transition mt-2"
                    >
                      Buy Now & Pay via UPI
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: DETAILED ORDER TRACKING & CANCELLATION */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tight">Order Tracking & History</h2>
                <p className="text-xs text-slate-500">Track real-time shipment, seller direct UPI payments, and easy cancellations.</p>
              </div>
            </div>

            {activeOrders.map(order => (
              <div key={order.orderId} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition">
                
                {/* Order Top Bar */}
                <div className="bg-slate-950 text-white p-4 flex flex-wrap justify-between items-center gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold">Order ID:</span> <b className="text-emerald-400 font-mono text-sm">{order.orderId}</b>
                    <span className="ml-4 text-slate-400">Placed on:</span> <b>{order.orderDate}</b>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-black px-3 py-1 rounded-full border uppercase text-[10px] ${
                      order.currentStatus === 'Cancelled' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {order.currentStatus}
                    </span>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 border-b border-slate-100">
                  
                  {/* Left Column */}
                  <div className="space-y-4 border-r border-slate-100 pr-4">
                    <div className="flex gap-4 items-center">
                      <img src={order.item.image} alt={order.item.title} className="w-20 h-20 object-cover rounded-2xl border" />
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{order.item.title}</h4>
                        <p className="text-xs text-slate-500">Seller: <b>{order.item.sellerName}</b></p>
                        <p className="text-xs text-slate-500">UPI ID: <b className="font-mono text-slate-700">{order.item.sellerUpiId}</b></p>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs space-y-1">
                      <p className="font-extrabold text-slate-900 border-b pb-1">Price Breakdown:</p>
                      <p className="flex justify-between"><span>Item Price:</span> <b>₹{order.itemPrice}</b></p>
                      <p className="flex justify-between"><span>Cheapest Local Delivery:</span> <b>₹{order.deliveryCharge}</b></p>
                      <p className="flex justify-between text-emerald-700 font-black border-t pt-1"><span>Total Paid:</span> <b>₹{order.totalAmount}</b></p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                        <Clock size={15} className="text-amber-600" />
                        <span>Seller Promised Delivery:</span>
                      </div>
                      <p className="text-sm font-black text-slate-950 pl-5">{order.sellerSetDeliveryDate}</p>
                    </div>
                  </div>

                  {/* Middle Column */}
                  <div className="lg:col-span-2 space-y-4">
                    <h5 className="font-black text-xs uppercase text-slate-400 tracking-wider">Shipment Live Tracking Details</h5>
                    
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {order.timeline.map((step, idx) => (
                        <div key={idx} className="relative flex items-start gap-4">
                          <span className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step.completed ? 'bg-emerald-500 text-black' : 'bg-slate-200 text-slate-500'}`}>
                            {step.completed ? '✓' : idx + 1}
                          </span>
                          <div>
                            <p className={`text-xs font-extrabold ${step.current ? 'text-emerald-600' : step.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                              {step.title} {step.current && <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full ml-2">Current Location</span>}
                            </p>
                            <p className="text-[11px] text-slate-500">{step.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action Bar (Cancel or Return) */}
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center gap-2">
                      {order.currentStatus === 'Placed' || order.currentStatus === 'Processing' ? (
                        <button 
                          onClick={() => { setSelectedOrder(order); setCancelModalOpen(true); }}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition"
                        >
                          <Ban size={14} /> Cancel Order
                        </button>
                      ) : null}

                      {order.currentStatus === 'Delivered' && !order.isReturned && (
                        <button 
                          onClick={() => { setSelectedOrder(order); setReturnModalOpen(true); }}
                          className="bg-slate-100 hover:bg-rose-50 text-slate-700 font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition border border-slate-200"
                        >
                          <RotateCcw size={14} /> Request Return / Replacement
                        </button>
                      )}

                      {order.currentStatus === 'Cancelled' && (
                        <span className="text-xs text-rose-600 font-bold bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                          Cancelled ({order.cancelReason})
                        </span>
                      )}
                    </div>

                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* CANCELLATION MODAL */}
      {cancelModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setCancelModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-black"><X size={20} /></button>
            
            <div className="space-y-1">
              <h3 className="text-lg font-black uppercase text-rose-600 flex items-center gap-2"><Ban size={20} /> Cancel Order</h3>
              <p className="text-xs text-slate-500">Order ID: <b>{selectedOrder.orderId}</b> ({selectedOrder.item.title})</p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Select Cancellation Reason *</label>
                <select 
                  value={actionReason} 
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-rose-500"
                >
                  <option value="Ordered by Mistake">Ordered by Mistake</option>
                  <option value="Found Cheaper Price Elsewhere">Found Cheaper Price Elsewhere</option>
                  <option value="Delivery Date Too Late">Delivery Date Too Late</option>
                  <option value="Changed My Mind">Changed My Mind</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleCancelOrder}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-3 rounded-2xl text-xs uppercase transition shadow-md"
            >
              Confirm Cancellation & Refund to Source UPI
            </button>
          </div>
        </div>
      )}

      {/* RETURN MODAL */}
      {returnModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setReturnModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-black"><X size={20} /></button>
            
            <div className="space-y-1">
              <h3 className="text-lg font-black uppercase text-slate-950 flex items-center gap-2"><RotateCcw size={20} className="text-rose-600" /> Return / Replace Item</h3>
              <p className="text-xs text-slate-500">Order ID: <b>{selectedOrder.orderId}</b></p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Select Return Reason *</label>
                <select 
                  value={actionReason} 
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-emerald-500"
                >
                  <option value="Quality Mismatch">Crop / Seed Quality Mismatch</option>
                  <option value="Damaged in Transport">Damaged / Rotten during Transport</option>
                  <option value="Wrong Item Delivered">Wrong Item Delivered</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Feedback *</label>
                <textarea 
                  rows={3}
                  value={actionFeedback}
                  onChange={(e) => setActionFeedback(e.target.value)}
                  placeholder="Batayein kyo return karna chahte hain..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>
            </div>

            <button 
              onClick={handleProcessReturn}
              disabled={!actionFeedback.trim()}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-3 rounded-2xl text-xs uppercase transition shadow-md disabled:opacity-50"
            >
              Submit Return Request
            </button>
          </div>
        </div>
      )}

      {/* MYNTRA-STYLE DIRECT SELLER UPI PAYMENT GATEWAY MODAL */}
      {cartModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-end z-50">
          <div className="bg-white text-slate-900 h-full w-full max-w-md p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div>
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="font-black text-lg uppercase flex items-center gap-2"><ShoppingBag size={20} /> Order & Payment</h3>
                <X size={22} onClick={() => setCartModalOpen(false)} className="cursor-pointer text-slate-400 hover:text-black" />
              </div>

              {checkoutStep === 'cart' && cart.length > 0 && (
                <div className="space-y-4 pt-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-3">
                      <img src={cart[0].image} alt={cart[0].title} className="w-16 h-16 object-cover rounded-xl" />
                      <div className="flex-1">
                        <p className="font-extrabold text-xs text-slate-900">{cart[0].title}</p>
                        <p className="text-xs text-slate-500">Seller: <b>{cart[0].sellerName}</b></p>
                      </div>
                    </div>

                    <div className="pt-2 border-t text-xs space-y-1">
                      <div className="flex justify-between"><span>Item Cost:</span> <b>₹{cart[0].price}</b></div>
                      <div className="flex justify-between text-slate-600">
                        <span>Cheapest Local Delivery ({cart[0].estimatedDistanceKm} km):</span> 
                        <b>₹{cart[0].estimatedDistanceKm * deliveryRatePerKm}</b>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-black text-sm pt-1 border-t">
                        <span>Total Payable:</span> 
                        <span>₹{cart[0].price + (cart[0].estimatedDistanceKm * deliveryRatePerKm)}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => { setCheckoutStep('payment_app'); setPaymentTimer(300); }} 
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3.5 rounded-2xl text-xs uppercase shadow-md transition flex items-center justify-center gap-2"
                  >
                    Proceed to Payment App <ExternalLink size={15} />
                  </button>
                </div>
              )}

              {checkoutStep === 'payment_app' && cart.length > 0 && (
                <div className="space-y-4 pt-4">
                  
                  {/* Timer Bar */}
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-2xl flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5"><Clock size={16} className="text-amber-600" /> Payment Session Expires in:</span>
                    <span className="font-mono font-black text-amber-700 text-sm bg-amber-200 px-2 py-0.5 rounded-lg">{formatTimer(paymentTimer)}</span>
                  </div>

                  <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Direct Seller Payment Details</p>
                    <p className="text-xs">Recipient: <b className="text-emerald-400">{cart[0].sellerName}</b></p>
                    <p className="text-xs">Seller UPI ID: <b className="text-emerald-400 font-mono">{cart[0].sellerUpiId}</b></p>
                    <p className="text-lg font-black text-emerald-400 pt-1">Amount: ₹{cart[0].price + (cart[0].estimatedDistanceKm * deliveryRatePerKm)}</p>
                  </div>

                  <p className="text-xs font-bold text-slate-700">Select Payment App (Myntra Style Intent):</p>
                  
                  <div className="space-y-2">
                    <div onClick={() => setPaymentApp('phonepe')} className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer ${paymentApp === 'phonepe' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                      <span className="font-extrabold text-xs flex items-center gap-2"><CreditCard size={16} className="text-purple-600" /> PhonePe UPI</span>
                      {paymentApp === 'phonepe' && <Check size={16} className="text-emerald-600" />}
                    </div>

                    <div onClick={() => setPaymentApp('gpay')} className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer ${paymentApp === 'gpay' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                      <span className="font-extrabold text-xs flex items-center gap-2"><CreditCard size={16} className="text-blue-600" /> Google Pay UPI</span>
                      {paymentApp === 'gpay' && <Check size={16} className="text-emerald-600" />}
                    </div>

                    <div onClick={() => setPaymentApp('paytm')} className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer ${paymentApp === 'paytm' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                      <span className="font-extrabold text-xs flex items-center gap-2"><Wallet size={16} className="text-cyan-600" /> Paytm UPI</span>
                      {paymentApp === 'paytm' && <Check size={16} className="text-emerald-600" />}
                    </div>

                    <div onClick={() => setPaymentApp('qr')} className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer ${paymentApp === 'qr' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                      <span className="font-extrabold text-xs flex items-center gap-2"><QrCode size={16} className="text-slate-800" /> Scan Seller QR Code</span>
                      {paymentApp === 'qr' && <Check size={16} className="text-emerald-600" />}
                    </div>
                  </div>

                  {paymentApp === 'qr' && (
                    <div className="text-center p-4 bg-slate-50 border rounded-2xl space-y-2">
                      <p className="text-xs font-bold text-slate-700">Scan QR via any UPI App:</p>
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${cart[0].sellerUpiId}&pn=${encodeURIComponent(cart[0].sellerName)}`} alt="Seller QR" className="mx-auto w-32 h-32 rounded-lg border p-1" />
                    </div>
                  )}

                  <button 
                    onClick={triggerUpiPaymentApp}
                    disabled={isProcessingPayment}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3.5 rounded-2xl text-xs uppercase shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessingPayment ? 'Opening App & Verifying...' : `Pay ₹${cart[0].price + (cart[0].estimatedDistanceKm * deliveryRatePerKm)} via ${paymentApp.toUpperCase()}`}
                  </button>
                </div>
              )}

              {checkoutStep === 'success' && (
                <div className="py-12 text-center space-y-3">
                  <Package size={54} className="text-emerald-500 mx-auto" />
                  <h4 className="text-xl font-black">Payment Verified & Order Placed!</h4>
                  <p className="text-xs text-slate-500">Payment direct seller ke account mein transfer kar di gayi hai.</p>
                  <button 
                    onClick={() => { setCartModalOpen(false); setActiveTab('orders'); setCheckoutStep('cart'); }}
                    className="bg-emerald-500 text-black font-extrabold text-xs px-6 py-2.5 rounded-full transition"
                  >
                    View Live Tracking
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}