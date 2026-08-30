import React, { useState } from 'react';
import { 
  Search, Camera, ShieldCheck, MapPin, Phone, 
  PlusCircle, ShoppingBag, ArrowRight, Wallet, 
  Menu, X, Heart, Mic, RefreshCw,
  CreditCard, Sprout, Check, Truck, Package, Clock, RotateCcw
} from 'lucide-react';

type Tab = 'all' | 'crops' | 'f2f-seeds' | 'rentals' | 'b2b' | 'orders';
type Language = 'en' | 'hi' | 'pb';

interface Listing {
  id: string;
  title: string;
  type: 'crop' | 'seed' | 'rental' | 'b2b';
  category: string;
  price: number;
  unit: string;
  city: string;
  state: string;
  location: string;
  sellerName: string;
  sellerRating: number;
  phone: string;
  image: string;
  aiVerified: boolean;
  isFarmerDirect?: boolean;
  expectedDeliveryDays?: number;
}

interface ActiveOrder {
  orderId: string;
  item: Listing;
  orderDate: string;
  expectedDeliveryDate: string;
  sellerSetDeliveryDate: string;
  currentStatus: 'Placed' | 'Processing' | 'In-Transit' | 'Delivered' | 'Returned';
  paymentMethod: string;
  deliveryAddress: string;
  timeline: { title: string; date: string; completed: boolean; current?: boolean }[];
  isReturned?: boolean;
  returnReason?: string;
  returnFeedback?: string;
}

export default function App() {
  const [lang, setLang] = useState<Language>('hi');
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState<string[]>([]);
  
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment' | 'success'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod' | 'escrow'>('upi');

  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<ActiveOrder | null>(null);
  const [returnReason, setReturnReason] = useState('Quality Mismatch');
  const [returnFeedback, setReturnFeedback] = useState('');

  const [listings] = useState<Listing[]>([
    { id: '1', title: 'A-Grade Hybrid Wheat Seed (Lok-1 Desi)', type: 'seed', category: 'F2F Seed', price: 35, unit: 'kg', city: 'Indore', state: 'MP', location: 'Indore Mandi Zone', sellerName: 'Patel Organic Farms', sellerRating: 4.8, phone: '+91 9876543210', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80', aiVerified: true, isFarmerDirect: true, expectedDeliveryDays: 3 },
    { id: '2', title: 'Fresh Desi Red Tomatoes (A-Grade)', type: 'crop', category: 'Vegetable', price: 26, unit: 'kg', city: 'Bhopal', state: 'MP', location: 'Karond Mandi, Bhopal', sellerName: 'Vikram Singh', sellerRating: 4.7, phone: '+91 9988776655', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80', aiVerified: true, expectedDeliveryDays: 2 },
    { id: '3', title: 'Mahindra 575 DI Harvester Rental', type: 'rental', category: 'Machinery', price: 1100, unit: 'hr', city: 'Ujjain', state: 'MP', location: 'Dewas Bypass Hub', sellerName: 'Suresh Verma', sellerRating: 4.9, phone: '+91 9826012345', image: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=600&q=80', aiVerified: true, expectedDeliveryDays: 1 }
  ]);

  const [cart, setCart] = useState<Listing[]>([listings[0]]);

  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([
    {
      orderId: 'ORD-889201',
      item: listings[0],
      orderDate: '02 Sep 2026, 10:30 AM',
      expectedDeliveryDate: '05 Sep 2026',
      sellerSetDeliveryDate: '05 Sep 2026 (Before 6:00 PM)',
      currentStatus: 'In-Transit',
      paymentMethod: 'UPI Payment (PhonePe)',
      deliveryAddress: 'Farm House #4, Village Badnawar, Dhar, MP - 454661',
      timeline: [
        { title: 'Order Placed', date: '02 Sep, 10:30 AM', completed: true },
        { title: 'Packed & Verified by Seller', date: '02 Sep, 04:15 PM', completed: true },
        { title: 'Dispatched via Mandi Logistics', date: '03 Sep, 09:00 AM', completed: true, current: true },
        { title: 'Arrived at Indore APMC Hub', date: '04 Sep (Expected)', completed: false },
        { title: 'Out for Delivery to Farmer', date: '05 Sep (Expected)', completed: false }
      ]
    }
  ]);

  const handleConfirmOrder = () => {
    if (cart.length === 0) return;
    
    const newOrder: ActiveOrder = {
      orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      item: cart[0],
      orderDate: 'Today, Just Now',
      expectedDeliveryDate: '06 Sep 2026',
      sellerSetDeliveryDate: '06 Sep 2026 (Guaranteed by Seller)',
      currentStatus: 'Placed',
      paymentMethod: paymentMethod.toUpperCase(),
      deliveryAddress: 'Farmer Registered Address, MP',
      timeline: [
        { title: 'Order Placed Successfully', date: 'Just Now', completed: true, current: true },
        { title: 'Seller Quality Verification', date: 'Pending', completed: false },
        { title: 'Dispatched to Transport Hub', date: 'Pending', completed: false },
        { title: 'Out for Local Delivery', date: 'Pending', completed: false }
      ]
    };

    setActiveOrders([newOrder, ...activeOrders]);
    setCheckoutStep('success');
  };

  const handleProcessReturn = () => {
    if (!selectedOrderForReturn) return;
    
    setActiveOrders(prev => prev.map(order => {
      if (order.orderId === selectedOrderForReturn.orderId) {
        return {
          ...order,
          currentStatus: 'Returned',
          isReturned: true,
          returnReason: returnReason,
          returnFeedback: returnFeedback
        };
      }
      return order;
    }));

    setReturnModalOpen(false);
    setSelectedOrderForReturn(null);
    setReturnFeedback('');
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
            {filteredListings.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition">
                <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
                <div className="p-4 space-y-2">
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold uppercase">{item.category}</span>
                  <h3 className="font-extrabold text-slate-900 text-sm">{item.title}</h3>
                  <p className="text-xl font-black text-emerald-700">₹{item.price} <span className="text-xs text-slate-500 font-normal">/ {item.unit}</span></p>
                  
                  <div className="bg-emerald-50 text-emerald-900 p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-emerald-200">
                    <Truck size={14} className="text-emerald-600" /> Seller Promised Delivery: <b>{item.expectedDeliveryDays} Days</b>
                  </div>

                  <button 
                    onClick={() => { setCart([item]); setCartModalOpen(true); }}
                    className="w-full bg-slate-950 hover:bg-emerald-600 text-white font-extrabold text-xs py-2.5 rounded-xl transition mt-2"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: DETAILED ORDER TRACKING & RETURN SECTION */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tight">Order Tracking & History</h2>
                <p className="text-xs text-slate-500">Track real-time shipment location and seller committed delivery dates.</p>
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
                    <span className="bg-emerald-500/20 text-emerald-300 font-black px-3 py-1 rounded-full border border-emerald-500/40 uppercase text-[10px]">
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
                        <p className="text-sm font-black text-emerald-700 pt-1">₹{order.item.price} / {order.item.unit}</p>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                        <Clock size={15} className="text-amber-600" />
                        <span>Seller Promised Delivery Date:</span>
                      </div>
                      <p className="text-sm font-black text-slate-950 pl-5">{order.sellerSetDeliveryDate}</p>
                    </div>

                    <div className="text-xs space-y-1 text-slate-600">
                      <p><b>Payment Method:</b> {order.paymentMethod}</p>
                      <p><b>Delivery Address:</b> {order.deliveryAddress}</p>
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

                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      {order.isReturned ? (
                        <div className="bg-rose-50 border border-rose-200 text-rose-900 p-3 rounded-2xl w-full text-xs">
                          <p className="font-extrabold flex items-center gap-1.5"><RotateCcw size={14} /> Return Requested</p>
                          <p className="text-[11px] text-rose-700"><b>Reason:</b> {order.returnReason} | <b>Feedback:</b> {order.returnFeedback}</p>
                        </div>
                      ) : (
                        <button 
                          onClick={() => { setSelectedOrderForReturn(order); setReturnModalOpen(true); }}
                          className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition border border-slate-200"
                        >
                          <RotateCcw size={14} /> Request Return / Replacement
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* RETURN MODAL */}
      {returnModalOpen && selectedOrderForReturn && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setReturnModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-black"><X size={20} /></button>
            
            <div className="space-y-1">
              <h3 className="text-lg font-black uppercase text-slate-950 flex items-center gap-2"><RotateCcw size={20} className="text-rose-600" /> Return / Replace Item</h3>
              <p className="text-xs text-slate-500">Order ID: <b>{selectedOrderForReturn.orderId}</b> ({selectedOrderForReturn.item.title})</p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Select Return Reason *</label>
                <select 
                  value={returnReason} 
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-emerald-500"
                >
                  <option value="Quality Mismatch">Crop / Seed Quality Mismatch</option>
                  <option value="Damaged in Transport">Damaged / Rotten during Transport</option>
                  <option value="Wrong Item Delivered">Wrong Item Delivered</option>
                  <option value="Delivery Delayed">Delivery Delayed beyond Seller Promised Date</option>
                  <option value="Other">Other Issues</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Feedback / Detailed Reason *</label>
                <textarea 
                  rows={3}
                  value={returnFeedback}
                  onChange={(e) => setReturnFeedback(e.target.value)}
                  placeholder="Batayein ki return kyo kar rahe hain (e.g., Seeds are dry or quality is bad)..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>
            </div>

            <button 
              onClick={handleProcessReturn}
              disabled={!returnFeedback.trim()}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-3 rounded-2xl text-xs uppercase transition shadow-md disabled:opacity-50"
            >
              Submit Return Request
            </button>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {cartModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-end z-50">
          <div className="bg-white text-slate-900 h-full w-full max-w-md p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="font-black text-lg uppercase flex items-center gap-2"><ShoppingBag size={20} /> Checkout Order</h3>
                <X size={22} onClick={() => { setCartModalOpen(false); setCheckoutStep('cart'); }} className="cursor-pointer text-slate-400 hover:text-black" />
              </div>

              {checkoutStep === 'cart' && (
                <div className="space-y-4 pt-4">
                  {cart.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded-xl" />
                        <div className="flex-1">
                          <p className="font-extrabold text-xs text-slate-900">{item.title}</p>
                          <p className="text-sm font-black text-slate-950 pt-1">₹{item.price} / {item.unit}</p>
                        </div>
                      </div>

                      <div className="bg-emerald-100/60 border border-emerald-300 text-emerald-900 p-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
                        <Truck size={16} className="text-emerald-700" />
                        <div>
                          <p className="text-[10px] text-emerald-800 uppercase">Seller Guaranteed Delivery</p>
                          <p className="font-extrabold">Within {item.expectedDeliveryDays} Days (05 Sep 2026)</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {checkoutStep === 'payment' && (
                <div className="space-y-3 pt-4">
                  <p className="text-xs font-bold text-slate-600">Choose Payment Method:</p>
                  
                  <div onClick={() => setPaymentMethod('upi')} className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer ${paymentMethod === 'upi' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                      <CreditCard size={20} className="text-emerald-600" />
                      <div>
                        <p className="font-extrabold text-xs">UPI (PhonePe / GPay)</p>
                        <p className="text-[10px] text-slate-500">Fast digital payment</p>
                      </div>
                    </div>
                    {paymentMethod === 'upi' && <Check size={18} className="text-emerald-600" />}
                  </div>

                  <div onClick={() => setPaymentMethod('cod')} className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer ${paymentMethod === 'cod' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                      <Wallet size={20} className="text-slate-700" />
                      <div>
                        <p className="font-extrabold text-xs">Cash on Delivery at Mandi Hub</p>
                        <p className="text-[10px] text-slate-500">Pay cash when product arrives</p>
                      </div>
                    </div>
                    {paymentMethod === 'cod' && <Check size={18} className="text-emerald-600" />}
                  </div>
                </div>
              )}

              {checkoutStep === 'success' && (
                <div className="py-12 text-center space-y-3">
                  <Package size={54} className="text-emerald-500 mx-auto" />
                  <h4 className="text-xl font-black">Order Placed Successfully!</h4>
                  <p className="text-xs text-slate-500">Aapka order seller tak pohoch gaya hai.</p>
                  <button 
                    onClick={() => { setCartModalOpen(false); setActiveTab('orders'); setCheckoutStep('cart'); }}
                    className="bg-emerald-500 text-black font-extrabold text-xs px-6 py-2.5 rounded-full transition"
                  >
                    View Order Progress
                  </button>
                </div>
              )}
            </div>

            {checkoutStep !== 'success' && (
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between font-black text-lg text-slate-950">
                  <span>Total Payable:</span>
                  <span className="text-emerald-700">₹{cart.reduce((acc, x) => acc + x.price, 0)}</span>
                </div>

                {checkoutStep === 'cart' ? (
                  <button onClick={() => setCheckoutStep('payment')} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3.5 rounded-2xl text-xs uppercase shadow-md transition">
                    Proceed to Payment
                  </button>
                ) : (
                  <button onClick={handleConfirmOrder} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3.5 rounded-2xl text-xs uppercase shadow-md transition">
                    Place Order & Track Live
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}