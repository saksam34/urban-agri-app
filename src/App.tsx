import React, { useState, useEffect } from 'react';
import { 
  Search, ShoppingBag, Truck, Package, Clock, RotateCcw,
  X, Check, CreditCard, Wallet, Ban, QrCode, ExternalLink, ShieldCheck,
  Bot, Sparkles, Send, Stethoscope, Camera, Leaf, AlertCircle, RefreshCw
} from 'lucide-react';

type Tab = 'all' | 'crops' | 'f2f-seeds' | 'rentals' | 'ai-doctor' | 'orders';

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
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
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

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  time: string;
  image?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // ================= AI CROP DOCTOR STATES =================
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Namaste Kisan Bhai! Main Aapka AI Agriculture Assistant hoon. Apni fasal ki bimari ki photo upload karein ya samasya batayein, main turant aushadhi (pesticides/fungicides) aur upay dunga.',
      time: 'Just Now'
    }
  ]);
  const [userQuery, setUserQuery] = useState('');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  // Quick Disease Prompts
  const quickDiseasePrompts = [
    "Pila Ratua (Yellow Rust) in Wheat",
    "Tomato Leaf Curl Virus Treatment",
    "Cotton Pink Bollworm Organic Solution",
    "Best Fertilizer Schedule for Paddy"
  ];

  // ================= CHECKOUT & PAYMENT STATES =================
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment_gateway' | 'processing' | 'success'>('cart');
  const [paymentApp, setPaymentApp] = useState<'phonepe' | 'gpay' | 'paytm' | 'qr'>('phonepe');
  const [paymentTimer, setPaymentTimer] = useState<number>(300); // 5-Minute Gateway Window
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // ================= RETURN & CANCEL MODAL STATES =================
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ActiveOrder | null>(null);
  const [actionReason, setActionReason] = useState('Ordered by Mistake');
  const [actionFeedback, setActionFeedback] = useState('');

  // Transport Rate Logistics Engine
  const deliveryRatePerKm = 8; // ₹8 per km cheap transport vehicle charge

  // Marketplace Catalog Database
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

  // Live Orders Tracker Database State
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([
    {
      orderId: 'ORD-889201',
      item: listings[0],
      orderDate: '02 Sep 2026, 10:30 AM',
      sellerSetDeliveryDate: '05 Sep 2026 (Before 6:00 PM)',
      currentStatus: 'In-Transit',
      paymentMethod: 'PhonePe Direct UPI',
      paymentStatus: 'PAID',
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

  // Payment Session Countdown Timer (5 Minutes)
  useEffect(() => {
    let timer: any;
    if (checkoutStep === 'payment_gateway' && paymentTimer > 0) {
      timer = setInterval(() => {
        setPaymentTimer((prev) => prev - 1);
      }, 1000);
    } else if (paymentTimer === 0 && checkoutStep === 'payment_gateway') {
      setPaymentError("Payment session expired! Order was NOT placed.");
      setCheckoutStep('cart');
    }
    return () => clearInterval(timer);
  }, [checkoutStep, paymentTimer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // ================= AI CROP DOCTOR HANDLER =================
  const handleSendAiQuery = (customPrompt?: string) => {
    const textToSend = customPrompt || userQuery;
    if (!textToSend.trim()) return;

    const newMsg: ChatMessage = { sender: 'user', text: textToSend, time: 'Just Now' };
    setChatMessages(prev => [...prev, newMsg]);
    if (!customPrompt) setUserQuery('');
    setIsAiAnalyzing(true);

    // AI Disease Response Logic Simulation
    setTimeout(() => {
      let aiResponse = "";
      const lowerQuery = textToSend.toLowerCase();

      if (lowerQuery.includes("yellow rust") || lowerQuery.includes("pila ratua") || lowerQuery.includes("wheat")) {
        aiResponse = "🌾 **Pila Ratua (Yellow Rust) Diagnosis:**\n• **Laksan:** Gehu ki pattiyo par peele rang ki dharidhar fafund.\n• **Upay:** Propiconazole 25% EC (Tilt) @ 200ml/acre ko 200 Litre pani me milakar 15 din ke antaral par chidkaw karein.";
      } else if (lowerQuery.includes("tomato") || lowerQuery.includes("leaf curl")) {
        aiResponse = "🍅 **Tomato Leaf Curl Virus Diagnosis:**\n• **Laksan:** Tamatar ki pattiyan upar ki taraf mudne lagti hain.\n• **Upay:** Safed makkhi (Whitefly) ko niyantrit karein. Imidacloprid 17.8% SL @ 0.5ml/Litre pani me milakar spray karein.";
      } else {
        aiResponse = `🌱 **AI Crop Doctor Response for "${textToSend}":**\nKisan Bhai, fasal me kit ya fafund ke prabhav ko rokne ke liye NPK balance rakhein aur Neem Oil (10,000 PPM) @ 3ml/Litre ka prathmik chidkaw karein. Badi samsya ke liye kripya patti ki photo upload karein.`;
      }

      setChatMessages(prev => [...prev, {
        sender: 'ai',
        text: aiResponse,
        time: 'Just Now'
      }]);
      setIsAiAnalyzing(false);
    }, 1600);
  };

  // ================= STRICT PAYMENT GATEWAY VERIFICATION =================
  const processStrictPayment = () => {
    setPaymentError(null);
    setCheckoutStep('processing');

    // Simulate Payment Gateway Callback & Verification from PhonePe/GPay/Paytm
    setTimeout(() => {
      if (cart.length === 0) return;
      const currentItem = cart[0];
      const deliveryCharge = currentItem.estimatedDistanceKm * deliveryRatePerKm;
      const grandTotal = currentItem.price + deliveryCharge;

      // Create new Order AFTER payment confirmation
      const newOrder: ActiveOrder = {
        orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        item: currentItem,
        orderDate: 'Today, Just Now',
        sellerSetDeliveryDate: '06 Sep 2026 (Promised by Seller)',
        currentStatus: 'Placed',
        paymentMethod: `UPI App Intent (${paymentApp.toUpperCase()})`,
        paymentStatus: 'PAID',
        deliveryAddress: 'Registered Kisan Address, MP',
        itemPrice: currentItem.price,
        deliveryCharge: deliveryCharge,
        totalAmount: grandTotal,
        timeline: [
          { title: 'Payment Confirmed & Order Placed', date: 'Just Now', completed: true, current: true },
          { title: 'Packed & Verified by Seller', date: 'Pending', completed: false },
          { title: 'Dispatched via Local Transport', date: 'Pending', completed: false },
          { title: 'Out for Local Delivery', date: 'Pending', completed: false }
        ]
      };

      setActiveOrders([newOrder, ...activeOrders]);
      setCheckoutStep('success');
    }, 3000);
  };

  // ================= CANCELLATION & RETURN HANDLERS =================
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
  };

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

  // Filter Catalog
  const filteredListings = listings.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'crops') return item.type === 'crop';
    if (activeTab === 'f2f-seeds') return item.type === 'seed';
    if (activeTab === 'rentals') return item.type === 'rental';
    return true;
  });

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }} className="min-h-screen bg-slate-100 text-slate-900 pb-20 w-full overflow-x-hidden">
      
      {/* HEADER NAVIGATION BAR */}
      <header className="bg-slate-950 text-white sticky top-0 z-50 w-full border-b border-slate-800 shadow-md">
        <div className="w-full px-4 lg:px-10 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('all')}>
            <span className="text-2xl font-black tracking-tighter uppercase italic text-white">URBAN<span className="text-emerald-400">AGRI</span></span>
          </div>

          {/* Search Engine Input */}
          <div className="flex-1 max-w-2xl relative mx-2">
            <Search className="absolute left-4 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search crops, seeds, order tracking, sellers..."
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

            <div onClick={() => { setCartModalOpen(true); setCheckoutStep('cart'); }} className="relative cursor-pointer text-slate-300 hover:text-white">
              <ShoppingBag size={22} />
              {cart.length > 0 && <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-black text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">{cart.length}</span>}
            </div>
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="flex w-full px-6 bg-slate-900 text-slate-300 py-2.5 overflow-x-auto space-x-6 text-xs font-bold border-t border-slate-800 uppercase tracking-wider justify-center">
          <button onClick={() => setActiveTab('all')} className={activeTab === 'all' ? 'text-emerald-400 font-black border-b-2 border-emerald-400 pb-1' : ''}>All Market</button>
          <button onClick={() => setActiveTab('crops')} className={activeTab === 'crops' ? 'text-emerald-400 font-black border-b-2 border-emerald-400 pb-1' : ''}>Crops</button>
          <button onClick={() => setActiveTab('f2f-seeds')} className={activeTab === 'f2f-seeds' ? 'text-emerald-400 font-black border-b-2 border-emerald-400 pb-1' : ''}>Farmer Seeds</button>
          <button onClick={() => setActiveTab('rentals')} className={activeTab === 'rentals' ? 'text-emerald-400 font-black border-b-2 border-emerald-400 pb-1' : ''}>Equipment Rentals</button>
          <button onClick={() => setActiveTab('ai-doctor')} className={`flex items-center gap-1 text-emerald-400 ${activeTab === 'ai-doctor' ? 'font-black border-b-2 border-emerald-400 pb-1' : ''}`}><Sparkles size={14} /> AI Crop Doctor</button>
          <button onClick={() => setActiveTab('orders')} className={activeTab === 'orders' ? 'text-emerald-400 font-black border-b-2 border-emerald-400 pb-1' : ''}>Track Orders & Returns</button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="w-full px-4 lg:px-10 py-6 max-w-7xl mx-auto">

        {/* 1. AI CROP DOCTOR & DISEASE DIAGNOSIS SCREEN */}
        {activeTab === 'ai-doctor' && (
          <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden flex flex-col h-[650px]">
            <div className="bg-slate-950 text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500 text-black rounded-2xl">
                  <Stethoscope size={22} />
                </div>
                <div>
                  <h3 className="font-black text-sm flex items-center gap-2 uppercase tracking-wide">AI Agriculture Doctor <Sparkles size={14} className="text-emerald-400" /></h3>
                  <p className="text-[11px] text-slate-400">Plant Disease Identification, Organic & Pesticide Solutions</p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-mono border border-emerald-500/40">ONLINE 24/7</span>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-lg p-4 rounded-2xl text-xs space-y-2 leading-relaxed ${msg.sender === 'user' ? 'bg-emerald-600 text-white rounded-br-none shadow' : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none shadow-sm'}`}>
                    <p className="whitespace-pre-line font-medium">{msg.text}</p>
                    <span className="text-[9px] opacity-60 block text-right">{msg.time}</span>
                  </div>
                </div>
              ))}
              {isAiAnalyzing && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 p-3.5 rounded-2xl text-xs text-slate-600 flex items-center gap-2.5 shadow-sm">
                    <Sparkles size={16} className="text-emerald-500 animate-spin" />
                    <span>AI Plant Pathologist is analyzing crop parameters...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Disease Suggestion Chips */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-black text-slate-500 uppercase whitespace-nowrap">Quick Diagnose:</span>
              {quickDiseasePrompts.map((prompt, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSendAiQuery(prompt)} 
                  className="bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 text-[11px] px-3 py-1 rounded-full whitespace-nowrap transition font-medium"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* User Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <button className="p-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition" title="Upload Leaf Photo">
                <Camera size={18} />
              </button>
              <input 
                type="text"
                placeholder="Describe plant symptoms (e.g. Gehu ki patti peele pad rahe hai)..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendAiQuery()}
                className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button onClick={() => handleSendAiQuery()} className="p-2.5 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition">
                <Send size={18} />
              </button>
            </div>
          </div>
        )}

        {/* 2. MARKETPLACE CATALOG GRID */}
        {activeTab !== 'orders' && activeTab !== 'ai-doctor' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black uppercase text-slate-950 tracking-tight">Direct Farmer Marketplace</h2>
              <p className="text-xs text-slate-500 font-medium">Showing {filteredListings.length} Products</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map(item => {
                const estDeliveryCharge = item.estimatedDistanceKm * deliveryRatePerKm;
                return (
                  <div key={item.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
                    <div>
                      <div className="relative">
                        <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
                        <span className="absolute top-3 left-3 text-[10px] bg-slate-950/80 text-emerald-400 px-3 py-1 rounded-full font-black uppercase backdrop-blur-sm">{item.category}</span>
                      </div>
                      <div className="p-5 space-y-3">
                        <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{item.title}</h3>
                        <p className="text-2xl font-black text-emerald-700">₹{item.price} <span className="text-xs text-slate-500 font-normal">/ {item.unit}</span></p>
                        
                        <div className="bg-slate-50 text-slate-800 p-3 rounded-2xl text-xs space-y-1.5 border border-slate-200">
                          <p className="flex justify-between items-center">
                            <span className="text-slate-500">Seller:</span>
                            <b className="text-slate-900">{item.sellerName}</b>
                          </p>
                          <p className="flex justify-between items-center">
                            <span className="text-slate-500">Seller UPI:</span>
                            <b className="font-mono text-slate-700">{item.sellerUpiId}</b>
                          </p>
                          <p className="font-bold flex items-center justify-between border-t pt-1.5 mt-1">
                            <span className="flex items-center gap-1 text-slate-700"><Truck size={14} className="text-emerald-600" /> Transport ({item.estimatedDistanceKm} km):</span>
                            <b className="text-slate-950">₹{estDeliveryCharge}</b>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <button 
                        onClick={() => { setCart([item]); setCheckoutStep('cart'); setCartModalOpen(true); setPaymentTimer(300); }}
                        className="w-full bg-slate-950 hover:bg-emerald-600 text-white font-extrabold text-xs py-3 rounded-2xl transition flex items-center justify-center gap-2 shadow-sm"
                      >
                        Buy Now & Pay via UPI App
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. ORDER TRACKING & HISTORY SCREEN */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tight">Order Tracking & History</h2>
                <p className="text-xs text-slate-500">Track shipment, seller UPI details, and manage cancellations/returns.</p>
              </div>
            </div>

            {activeOrders.map(order => (
              <div key={order.orderId} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="bg-slate-950 text-white p-4 flex flex-wrap justify-between items-center gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold">Order ID:</span> <b className="text-emerald-400 font-mono text-sm">{order.orderId}</b>
                    <span className="ml-4 text-slate-400">Date:</span> <b>{order.orderDate}</b>
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
                  <div className="space-y-4 border-r border-slate-100 pr-4">
                    <div className="flex gap-4 items-center">
                      <img src={order.item.image} alt={order.item.title} className="w-20 h-20 object-cover rounded-2xl border" />
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{order.item.title}</h4>
                        <p className="text-xs text-slate-500">Seller: <b>{order.item.sellerName}</b></p>
                        <p className="text-xs text-slate-500">Seller UPI: <b className="font-mono text-slate-700">{order.item.sellerUpiId}</b></p>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs space-y-1.5">
                      <p className="font-extrabold text-slate-900 border-b pb-1">Verified Payment Breakdown:</p>
                      <p className="flex justify-between"><span>Item Price:</span> <b>₹{order.itemPrice}</b></p>
                      <p className="flex justify-between"><span>Cheapest Transport:</span> <b>₹{order.deliveryCharge}</b></p>
                      <p className="flex justify-between text-emerald-700 font-black border-t pt-1"><span>Total Paid:</span> <b>₹{order.totalAmount}</b></p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                        <Clock size={15} className="text-amber-600" />
                        <span>Seller Promised Delivery:</span>
                      </div>
                      <p className="text-xs font-black text-slate-950 pl-5">{order.sellerSetDeliveryDate}</p>
                    </div>
                  </div>

                  {/* LIVE SHIPMENT TIMELINE */}
                  <div className="lg:col-span-2 space-y-4">
                    <h5 className="font-black text-xs uppercase text-slate-400 tracking-wider">Live Tracking Timeline</h5>
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {order.timeline.map((step, idx) => (
                        <div key={idx} className="relative flex items-start gap-4">
                          <span className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step.completed ? 'bg-emerald-500 text-black' : 'bg-slate-200 text-slate-500'}`}>
                            {step.completed ? '✓' : idx + 1}
                          </span>
                          <div>
                            <p className={`text-xs font-extrabold ${step.current ? 'text-emerald-600' : step.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                              {step.title} {step.current && <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full ml-2">Current Status</span>}
                            </p>
                            <p className="text-[11px] text-slate-500">{step.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center gap-2">
                      {(order.currentStatus === 'Placed' || order.currentStatus === 'Processing') && (
                        <button 
                          onClick={() => { setSelectedOrder(order); setCancelModalOpen(true); }}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition"
                        >
                          <Ban size={14} /> Cancel Order
                        </button>
                      )}
                      {order.currentStatus === 'Delivered' && !order.isReturned && (
                        <button 
                          onClick={() => { setSelectedOrder(order); setReturnModalOpen(true); }}
                          className="bg-slate-100 hover:bg-rose-50 text-slate-700 font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition border border-slate-200"
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

      {/* 4. STRICT THIRD-PARTY PAYMENT GATEWAY MODAL */}
      {cartModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-end z-50">
          <div className="bg-white text-slate-900 h-full w-full max-w-md p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div>
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="font-black text-lg uppercase flex items-center gap-2"><ShoppingBag size={20} /> Checkout & Payment Gate</h3>
                <X size={22} onClick={() => setCartModalOpen(false)} className="cursor-pointer text-slate-400 hover:text-black" />
              </div>

              {paymentError && (
                <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-600" /> {paymentError}
                </div>
              )}

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
                      <div className="flex justify-between"><span>Item Price:</span> <b>₹{cart[0].price}</b></div>
                      <div className="flex justify-between text-slate-600">
                        <span>Cheapest Transport Charge:</span> 
                        <b>₹{cart[0].estimatedDistanceKm * deliveryRatePerKm}</b>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-black text-sm pt-1 border-t">
                        <span>Grand Total Amount:</span> 
                        <span>₹{cart[0].price + (cart[0].estimatedDistanceKm * deliveryRatePerKm)}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => { setCheckoutStep('payment_gateway'); setPaymentTimer(300); }} 
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3.5 rounded-2xl text-xs uppercase shadow-md transition flex items-center justify-center gap-2"
                  >
                    Select Payment App & Pay <ExternalLink size={15} />
                  </button>
                </div>
              )}

              {checkoutStep === 'payment_gateway' && cart.length > 0 && (
                <div className="space-y-4 pt-4">
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-2xl flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5"><Clock size={16} className="text-amber-600" /> Payment Session Timer:</span>
                    <span className="font-mono font-black text-amber-700 text-sm bg-amber-200 px-2 py-0.5 rounded-lg">{formatTimer(paymentTimer)}</span>
                  </div>

                  <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Seller UPI Account Details</p>
                    <p className="text-xs">Recipient Name: <b className="text-emerald-400">{cart[0].sellerName}</b></p>
                    <p className="text-xs">Seller UPI ID: <b className="text-emerald-400 font-mono">{cart[0].sellerUpiId}</b></p>
                    <p className="text-lg font-black text-emerald-400 pt-1">Total Payable Amount: ₹{cart[0].price + (cart[0].estimatedDistanceKm * deliveryRatePerKm)}</p>
                  </div>

                  <div className="space-y-2">
                    <div onClick={() => setPaymentApp('phonepe')} className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer ${paymentApp === 'phonepe' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                      <span className="font-extrabold text-xs flex items-center gap-2"><CreditCard size={16} className="text-purple-600" /> PhonePe UPI App</span>
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
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${cart[0].sellerUpiId}&pn=${encodeURIComponent(cart[0].sellerName)}`} alt="Seller QR" className="mx-auto w-32 h-32 rounded-lg border p-1" />
                    </div>
                  )}

                  <button 
                    onClick={processStrictPayment}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3.5 rounded-2xl text-xs uppercase shadow-md transition flex items-center justify-center gap-2"
                  >
                    Simulate Payment Complete & Place Order
                  </button>
                </div>
              )}

              {checkoutStep === 'processing' && (
                <div className="py-20 text-center space-y-4">
                  <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
                  <h4 className="font-black text-sm uppercase text-slate-800">Verifying Direct Payment with Seller Bank...</h4>
                  <p className="text-xs text-slate-500">Checking callback response from `{cart[0]?.sellerUpiId}`. Please wait.</p>
                </div>
              )}

              {checkoutStep === 'success' && (
                <div className="py-12 text-center space-y-3">
                  <ShieldCheck size={54} className="text-emerald-500 mx-auto" />
                  <h4 className="text-xl font-black">Payment Verified & Order Placed!</h4>
                  <p className="text-xs text-slate-500">Paisa seller account me receive ho gaya hai. Live Tracking history me order add ho gaya hai.</p>
                  <button 
                    onClick={() => { setCartModalOpen(false); setActiveTab('orders'); setCheckoutStep('cart'); }}
                    className="bg-emerald-500 text-black font-extrabold text-xs px-6 py-2.5 rounded-full transition"
                  >
                    View Order Tracking
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. CANCELLATION MODAL */}
      {cancelModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setCancelModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-black"><X size={20} /></button>
            <h3 className="text-lg font-black uppercase text-rose-600 flex items-center gap-2"><Ban size={20} /> Cancel Order</h3>
            <p className="text-xs text-slate-500">Kripya order cancel karne ka karan chunein:</p>
            <select 
              value={actionReason} 
              onChange={(e) => setActionReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold"
            >
              <option value="Ordered by Mistake">Ordered by Mistake</option>
              <option value="Delivery Date Too Late">Delivery Date Too Late</option>
              <option value="Changed My Mind">Changed My Mind</option>
            </select>
            <button onClick={handleCancelOrder} className="w-full bg-rose-600 text-white font-black py-3 rounded-2xl text-xs uppercase">Confirm Cancellation</button>
          </div>
        </div>
      )}

      {/* 6. RETURN MODAL */}
      {returnModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl relative">
            <button onClick={() => setReturnModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-black"><X size={20} /></button>
            <h3 className="text-lg font-black uppercase text-slate-950 flex items-center gap-2"><RotateCcw size={20} className="text-rose-600" /> Return / Replacement Request</h3>
            <textarea 
              rows={3} 
              value={actionFeedback} 
              onChange={(e) => setActionFeedback(e.target.value)}
              placeholder="Return feedback ya defect detail enter karein..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs"
            ></textarea>
            <button onClick={handleProcessReturn} className="w-full bg-rose-600 text-white font-black py-3 rounded-2xl text-xs uppercase">Submit Request</button>
          </div>
        </div>
      )}

      {/* FLOATING QUICK AI CROP DOCTOR TRIGGER */}
      <div className="fixed bottom-6 right-6 z-40">
        <button 
          onClick={() => setActiveTab('ai-doctor')}
          className="bg-slate-950 text-white border-2 border-emerald-400 p-3.5 rounded-full shadow-2xl flex items-center gap-2 hover:bg-slate-900 transition"
        >
          <Bot size={22} className="text-emerald-400" />
          <span className="text-xs font-black pr-1 hidden sm:inline">Ask AI Doctor</span>
        </button>
      </div>

    </div>
  );
}