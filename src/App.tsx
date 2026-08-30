import React, { useState } from 'react';
import { 
  Search, Camera, ShieldCheck, MapPin, Phone, 
  User, PlusCircle, MessageSquare, Send, CheckCircle2, 
  Globe, Sparkles, ShoppingBag, ArrowRight, Wallet, Flame, 
  Menu, X, Star, Heart, Mic, RefreshCw, TrendingUp,
  CreditCard, Sprout, AlertCircle, Check, DollarSign
} from 'lucide-react';

type Tab = 'all' | 'crops' | 'f2f-seeds' | 'rentals' | 'b2b' | 'mandi' | 'ai-doctor';
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
  minOrder?: string;
  rentalSlot?: string;
  sourceApp?: 'KisanSetu' | 'MandiNet';
}

export default function App() {
  const [lang, setLang] = useState<Language>('hi');
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  
  // Checkout & Payment Modals
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment' | 'success'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod' | 'escrow'>('upi');

  // Sell/Rent Modal
  const [sellModalOpen, setSellModalOpen] = useState(false);

  // AI Doctor & Scan State
  const [aiDoctorModal, setAiDoctorModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [doctorDiagnosis, setDoctorDiagnosis] = useState<null | {
    disease: string;
    confidence: string;
    symptoms: string;
    chemicalTreatment: string;
    organicTreatment: string;
    fertilizerAdvice: string;
  }>(null);

  // AI Chat Assistant State
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Namaste! Main Aapka KisanSetu AI Doctor & Agri Expert hoon. Fasal ki bimari, fertilizer dose ya mandi rate ke bare mein kuch bhi poochhein.' }
  ]);
  const [currentInput, setCurrentInput] = useState('');

  // Extended Database with Farmer-to-Farmer Seeds & Equipment Rentals
  const [listings] = useState<Listing[]>([
    { id: '1', title: 'A-Grade Hybrid Wheat Seed (Lok-1 Desi)', type: 'seed', category: 'F2F Seed', price: 35, unit: 'kg', city: 'Indore', state: 'MP', location: 'Indore Mandi Zone', sellerName: 'Patel Organic Farms', sellerRating: 4.8, phone: '+91 9876543210', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80', aiVerified: true, isFarmerDirect: true, sourceApp: 'KisanSetu' },
    { id: '2', title: 'Fresh Desi Red Tomatoes (A-Grade)', type: 'crop', category: 'Vegetable', price: 26, unit: 'kg', city: 'Bhopal', state: 'MP', location: 'Karond Mandi, Bhopal', sellerName: 'Vikram Singh', sellerRating: 4.7, phone: '+91 9988776655', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80', aiVerified: true, minOrder: '100 kg', sourceApp: 'MandiNet' },
    { id: '3', title: 'Mahindra 575 DI Harvester Rental (Slot: 2PM-6PM)', type: 'rental', category: 'Machinery', price: 1100, unit: 'hr', city: 'Ujjain', state: 'MP', location: 'Dewas Bypass Hub', sellerName: 'Suresh Verma', sellerRating: 4.9, phone: '+91 9826012345', image: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=600&q=80', aiVerified: true, rentalSlot: 'Immediate Slot Available', sourceApp: 'KisanSetu' },
    { id: '4', title: 'Organic Potato (Jyoti Variety)', type: 'crop', category: 'Vegetable', price: 18, unit: 'kg', city: 'Indore', state: 'MP', location: 'Rau Bypass Cold Storage', sellerName: 'Rau Agro Store', sellerRating: 4.5, phone: '+91 9425098765', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80', aiVerified: false, minOrder: '500 kg', sourceApp: 'MandiNet' },
    { id: '5', title: 'Farmer Direct Soyabean Seed (JS 9560)', type: 'seed', category: 'F2F Seed', price: 72, unit: 'kg', city: 'Dhar', state: 'MP', location: 'Badnawar Village', sellerName: 'Kailash Choudhary', sellerRating: 4.9, phone: '+91 9893011223', image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80', aiVerified: true, isFarmerDirect: true, sourceApp: 'KisanSetu' },
    { id: '6', title: 'Organic Vermicompost Khad (NPK Rich)', type: 'b2b', category: 'Fertilizer', price: 8, unit: 'kg', city: 'Gwalior', state: 'MP', location: 'Industrial Area', sellerName: 'BioAgri Tech', sellerRating: 4.6, phone: '+91 9111223344', image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=600&q=80', aiVerified: true, minOrder: '1000 kg', sourceApp: 'KisanSetu' }
  ]);

  const mandiTicker = [
    { name: 'Indore APMC', commodity: 'Gehu (Lok-1)', rate: '₹2,850/Q', change: '+₹20' },
    { name: 'Karond Bhopal', commodity: 'Tomato', rate: '₹2,600/Q', change: '-₹40' },
    { name: 'Ujjain Mandi', commodity: 'Soybean', rate: '₹4,310/Q', change: '+₹15' },
    { name: 'Mandsaur', commodity: 'Garlic', rate: '₹11,000/Q', change: '+₹150' },
  ];

  const [cart, setCart] = useState<Listing[]>([listings[0], listings[2]]);

  const toggleWishlist = (id: string) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSendMessage = () => {
    if (!currentInput.trim()) return;
    const userMsg = currentInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setCurrentInput('');

    setTimeout(() => {
      let reply = `Aapke sawaal "${userMsg}" ke hisab se: Kheti mein NPK 19:19:19 ka spray early growth stage par sabse best hota hai. Mandi mein rates filhal stable hain.`;
      setChatMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 800);
  };

  const startPlantDoctorDiagnosis = () => {
    setIsScanning(true);
    setDoctorDiagnosis(null);
    setTimeout(() => {
      setIsScanning(false);
      setDoctorDiagnosis({
        disease: 'Yellow Leaf Curl Virus & Nitrogen Deficiency',
        confidence: '96.4% Accuracy',
        symptoms: 'Patto ka peela padna aur edges ka curl hona.',
        chemicalTreatment: 'Imidacloprid 17.8% SL @ 0.5ml/L water spray karein.',
        organicTreatment: 'Neem oil (10,000 PPM) 3ml/L water + Vermicompost khad dalein.',
        fertilizerAdvice: 'Urea @ 45kg/acre ki dose 3 din ke andar pani ke saath dein.'
      });
    }, 2500);
  };

  const filteredListings = listings.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.city.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'crops') return item.type === 'crop';
    if (activeTab === 'f2f-seeds') return item.type === 'seed' && item.isFarmerDirect;
    if (activeTab === 'rentals') return item.type === 'rental';
    if (activeTab === 'b2b') return item.type === 'b2b';
    return true;
  });

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }} className="min-h-screen bg-slate-100 text-slate-900 pb-20 w-full overflow-x-hidden">
      
      {/* ================= 1. HEADER & TOP TICKER (AMAZON / MYNTRA FULL-WIDTH STYLE) ================= */}
      <header className="bg-slate-950 text-white sticky top-0 z-50 w-full border-b border-slate-800 shadow-md">
        
        {/* Mandi Live Rate Ticker */}
        <div className="bg-emerald-700 text-white text-[11px] font-bold px-4 lg:px-10 py-1 flex justify-between items-center whitespace-nowrap overflow-x-auto">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5"><Sparkles size={13} /> Govt Sync Live Mandi Rates</span>
            <div className="hidden md:flex space-x-4 border-l border-emerald-500 pl-4">
              {mandiTicker.map((m, idx) => (
                <span key={idx} className="text-[10px]">
                  {m.name}: <b className="text-amber-200">{m.rate}</b> <span className={m.change.includes('+') ? 'text-emerald-200' : 'text-rose-200'}>({m.change})</span>
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px]">State: <b className="text-emerald-200">Madhya Pradesh</b></span>
            <select value={lang} onChange={(e) => setLang(e.target.value as Language)} className="bg-emerald-800 text-white text-[10px] rounded px-1 py-0.5 border-none outline-none">
              <option value="hi">हिंदी</option>
              <option value="en">English</option>
              <option value="pb">ਪੰਜਾਬੀ</option>
            </select>
          </div>
        </div>

        {/* Main Nav Bar */}
        <div className="w-full px-4 lg:px-10 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden text-white"><Menu size={24} /></button>
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('all')}>
              <span className="text-2xl font-black tracking-tighter uppercase italic text-white">URBAN<span className="text-emerald-400">AGRI</span></span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-3xl relative mx-2">
            <Search className="absolute left-4 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Indore/Bhopal sellers, crops, seeds, diseases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-2 bg-slate-900 border border-slate-700 text-white placeholder-slate-400 text-xs font-medium rounded-full focus:outline-none focus:border-emerald-400"
            />
            <Mic size={16} onClick={() => setChatModalOpen(true)} className="absolute right-3.5 top-2.5 text-emerald-400 cursor-pointer hover:scale-110 transition" />
          </div>

          {/* Header Action Triggers */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setAiDoctorModal(true)} 
              className="hidden sm:flex bg-emerald-500/10 border border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-black font-extrabold px-3 py-1.5 rounded-full text-xs items-center gap-1.5 transition"
            >
              <Sprout size={15} /> AI Doctor
            </button>

            <button 
              onClick={() => setSellModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-4 py-2 rounded-full text-xs flex items-center gap-1.5 shadow-md transition"
            >
              <PlusCircle size={15} /> SELL / RENT
            </button>

            <div onClick={() => setCartModalOpen(true)} className="relative cursor-pointer text-slate-300 hover:text-white">
              <ShoppingBag size={22} />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-black text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="hidden lg:flex w-full px-10 bg-slate-900 text-slate-300 py-2.5 overflow-x-auto space-x-8 text-xs font-bold border-t border-slate-800 uppercase tracking-wider justify-center">
          {[
            { id: 'all', label: 'All Feeds' },
            { id: 'crops', label: 'Crop Market' },
            { id: 'f2f-seeds', label: 'Farmer-to-Farmer Seed' },
            { id: 'rentals', label: 'Machine Rental' },
            { id: 'b2b', label: 'B2B Bulk Khad' },
            { id: 'mandi', label: 'Mandi Rates' },
            { id: 'ai-doctor', label: 'AI Agri Doctor' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => {
                if(tab.id === 'ai-doctor') setAiDoctorModal(true);
                else setActiveTab(tab.id as Tab);
              }} 
              className={activeTab === tab.id ? 'text-emerald-400 font-black border-b-2 border-emerald-400 pb-1' : 'hover:text-white transition'}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* ================= 2. MAIN E-COMMERCE PRODUCTS & FEED ================= */}
      <main className="w-full">

        {/* Hero Offer Banner */}
        {activeTab === 'all' && (
          <div className="w-full bg-slate-950 text-white relative overflow-hidden py-10 px-6 lg:px-16 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between">
            <div className="z-10 max-w-xl space-y-4 text-left">
              <span className="bg-emerald-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Farmer Direct Hub</span>
              <h1 className="text-3xl md:text-5xl font-black italic tracking-tight leading-none uppercase">DIRECT SEEDS, RENTALS & <span className="text-emerald-400">AI AGRI DOCTOR</span></h1>
              <p className="text-xs md:text-sm text-slate-300">Farmer-to-Farmer seed exchange, hourly tractor/harvester booking with secure escrow payments.</p>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setActiveTab('f2f-seeds')} className="bg-emerald-500 text-black font-extrabold px-6 py-2.5 rounded-full text-xs hover:bg-emerald-400 transition flex items-center gap-2">
                  BUY F2F SEEDS <ArrowRight size={15} />
                </button>
                <button onClick={() => setAiDoctorModal(true)} className="bg-slate-800 text-white font-extrabold px-5 py-2.5 rounded-full text-xs hover:bg-slate-700 transition border border-slate-700 flex items-center gap-2">
                  <Sprout size={15} /> SCAN PLANT DISEASE
                </button>
              </div>
            </div>
            <div className="mt-6 md:mt-0 relative w-full md:w-1/2 h-48 md:h-64 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
              <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80" alt="Agri" className="w-full h-full object-cover opacity-80" />
            </div>
          </div>
        )}

        {/* Product Cards Grid */}
        <div className="w-full px-4 lg:px-10 py-6 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight">{activeTab} LISTINGS</h2>
              <p className="text-xs text-slate-500 font-medium">Direct listings from MP Farmers & Local APMC Mandis</p>
            </div>
            <span className="text-xs text-slate-500 font-bold">{filteredListings.length} Products Found</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="relative h-52 bg-slate-100 overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    
                    {item.isFarmerDirect && (
                      <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider">
                        <Sprout size={11} /> FARMER-TO-FARMER SEED
                      </span>
                    )}

                    <button 
                      onClick={() => toggleWishlist(item.id)}
                      className="absolute top-3 right-3 p-1.5 bg-white/80 rounded-full text-slate-700 hover:text-rose-500 transition shadow"
                    >
                      <Heart size={18} className={wishlist.includes(item.id) ? "fill-rose-500 text-rose-500" : ""} />
                    </button>

                    {item.aiVerified && (
                      <span className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1 rounded flex items-center gap-1 uppercase">
                        <ShieldCheck size={12} className="text-emerald-400" /> AI QUALITY VERIFIED
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{item.category}</span>
                    <h3 className="font-extrabold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-emerald-600 transition">{item.title}</h3>
                    
                    <div className="flex items-baseline gap-1 pt-1">
                      <span className="text-2xl font-black text-slate-950">₹{item.price}</span>
                      <span className="text-xs text-slate-500 font-bold">/ {item.unit}</span>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-1 font-medium"><MapPin size={12} className="text-slate-400" /> {item.location}</p>

                    {item.rentalSlot && <p className="text-[11px] text-blue-800 bg-blue-50 px-2 py-1 rounded font-bold border border-blue-200">Slot: {item.rentalSlot}</p>}
                    {item.minOrder && <p className="text-[11px] text-amber-800 bg-amber-50 px-2 py-1 rounded font-bold border border-amber-200">Min Order: {item.minOrder}</p>}
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
                  <div className="flex justify-between items-center text-xs text-slate-600 font-bold">
                    <span className="truncate">Seller: {item.sellerName}</span>
                    <span className="bg-white px-2 py-0.5 rounded border text-[10px] font-black">★ {item.sellerRating.toFixed(1)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a 
                      href={`tel:${item.phone}`}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-900 font-extrabold text-xs py-2 rounded-xl flex justify-center items-center gap-1 transition"
                    >
                      <Phone size={13} /> Call Seller
                    </a>
                    <button 
                      onClick={() => {
                        setCart(prev => [...prev, item]);
                        setCartModalOpen(true);
                      }}
                      className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs py-2 rounded-xl flex justify-center items-center gap-1 shadow-sm transition"
                    >
                      <ShoppingBag size={13} /> Buy / Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ================= 3. AI AGRI DOCTOR & DISEASE DIAGNOSIS MODAL ================= */}
      {aiDoctorModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white w-full max-w-xl rounded-3xl p-6 border border-slate-800 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setAiDoctorModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
            
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black uppercase text-emerald-400 flex justify-center items-center gap-2"><Sprout size={20} /> AI Plant Doctor & Fertilizer Scan</h3>
              <p className="text-xs text-slate-400">Patto ki photo upload karein - AI Bimaari, Spray aur Fertilizer dose batayega</p>
            </div>

            <div className="relative h-56 bg-slate-950 rounded-2xl border-2 border-dashed border-emerald-500/40 flex flex-col items-center justify-center overflow-hidden">
              {isScanning ? (
                <div className="space-y-3 text-center">
                  <RefreshCw className="animate-spin text-emerald-400 mx-auto" size={36} />
                  <p className="text-xs font-bold text-emerald-300">Analyzing leaf pathology & fungal pattern...</p>
                </div>
              ) : doctorDiagnosis ? (
                <div className="p-4 space-y-2 text-left w-full">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-xs font-black text-emerald-400 uppercase">{doctorDiagnosis.disease}</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700">{doctorDiagnosis.confidence}</span>
                  </div>
                  <p className="text-xs text-slate-300"><b>Symptoms:</b> {doctorDiagnosis.symptoms}</p>
                  <p className="text-xs text-amber-300"><b>Chemical Spray:</b> {doctorDiagnosis.chemicalTreatment}</p>
                  <p className="text-xs text-emerald-300"><b>Organic Solution:</b> {doctorDiagnosis.organicTreatment}</p>
                  <p className="text-xs text-blue-300"><b>Fertilizer Dose:</b> {doctorDiagnosis.fertilizerAdvice}</p>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <Camera size={44} className="text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">Click button below to test Plant Leaf Scan</p>
                </div>
              )}
            </div>

            <button 
              onClick={startPlantDoctorDiagnosis}
              disabled={isScanning}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3.5 rounded-2xl text-xs uppercase transition shadow-lg"
            >
              {isScanning ? 'Analyzing Plant Disease...' : 'Scan Leaf & Get Solution'}
            </button>
          </div>
        </div>
      )}

      {/* ================= 4. CHECKOUT & MULTI-MODE PAYMENT SYSTEM ================= */}
      {cartModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-end z-50">
          <div className="bg-white text-slate-900 h-full w-full max-w-md p-6 flex flex-col justify-between shadow-2xl border-l">
            <div>
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="font-black text-lg uppercase flex items-center gap-2"><ShoppingBag size={20} /> Checkout ({cart.length} Items)</h3>
                <X size={22} onClick={() => { setCartModalOpen(false); setCheckoutStep('cart'); }} className="cursor-pointer text-slate-400 hover:text-black" />
              </div>

              {checkoutStep === 'cart' && (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pt-4 pr-1">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded-xl" />
                      <div className="flex-1">
                        <p className="font-extrabold text-xs text-slate-900 line-clamp-1">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.location}</p>
                        <p className="text-sm font-black text-slate-950 pt-1">₹{item.price} / {item.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {checkoutStep === 'payment' && (
                <div className="space-y-4 pt-4">
                  <p className="text-xs font-bold text-slate-600">Select Payment Method:</p>
                  
                  <div 
                    onClick={() => setPaymentMethod('upi')} 
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer ${paymentMethod === 'upi' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard size={20} className="text-emerald-600" />
                      <div>
                        <p className="font-extrabold text-xs">UPI Payment (PhonePe / GPay)</p>
                        <p className="text-[10px] text-slate-500">Instant direct transfer</p>
                      </div>
                    </div>
                    {paymentMethod === 'upi' && <Check size={18} className="text-emerald-600" />}
                  </div>

                  <div 
                    onClick={() => setPaymentMethod('escrow')} 
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer ${paymentMethod === 'escrow' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={20} className="text-emerald-600" />
                      <div>
                        <p className="font-extrabold text-xs">Rental Escrow Guard</p>
                        <p className="text-[10px] text-slate-500">Payment holds till machine work finishes</p>
                      </div>
                    </div>
                    {paymentMethod === 'escrow' && <Check size={18} className="text-emerald-600" />}
                  </div>

                  <div 
                    onClick={() => setPaymentMethod('cod')} 
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer ${paymentMethod === 'cod' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Wallet size={20} className="text-slate-700" />
                      <div>
                        <p className="font-extrabold text-xs">Mandi Token Cash on Delivery</p>
                        <p className="text-[10px] text-slate-500">Pay cash upon delivery at Mandi Yard</p>
                      </div>
                    </div>
                    {paymentMethod === 'cod' && <Check size={18} className="text-emerald-600" />}
                  </div>
                </div>
              )}

              {checkoutStep === 'success' && (
                <div className="py-12 text-center space-y-3">
                  <CheckCircle2 size={54} className="text-emerald-500 mx-auto" />
                  <h4 className="text-xl font-black">Order & Booking Confirmed!</h4>
                  <p className="text-xs text-slate-500">Seller details and Mandi Pass sent to your mobile number.</p>
                </div>
              )}
            </div>

            {checkoutStep !== 'success' && (
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between font-black text-lg text-slate-950">
                  <span>Total Amount:</span>
                  <span className="text-emerald-700">₹{cart.reduce((acc, x) => acc + x.price, 0)}</span>
                </div>

                {checkoutStep === 'cart' ? (
                  <button 
                    onClick={() => setCheckoutStep('payment')}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3.5 rounded-2xl text-xs uppercase shadow-md transition"
                  >
                    Select Payment Method
                  </button>
                ) : (
                  <button 
                    onClick={() => setCheckoutStep('success')}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3.5 rounded-2xl text-xs uppercase shadow-md transition"
                  >
                    Confirm & Pay Now
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= 5. FLOATING AI CHAT ASSISTANT ================= */}
      {chatModalOpen && (
        <div className="fixed bottom-20 right-4 sm:right-10 w-96 max-w-[90vw] bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl z-50 overflow-hidden flex flex-col h-[450px]">
          <div className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center">
            <span className="font-black text-xs uppercase flex items-center gap-2 text-emerald-400"><Sparkles size={16} /> KisanSetu AI Voice/Chat</span>
            <X size={18} onClick={() => setChatModalOpen(false)} className="cursor-pointer text-slate-400" />
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`p-3 rounded-2xl max-w-[80%] ${msg.sender === 'user' ? 'bg-emerald-500 text-black ml-auto font-bold' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-slate-800 flex gap-2">
            <input 
              type="text" 
              placeholder="Ask fertilizer dose, mandi rate..." 
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-slate-900 text-white text-xs px-3 py-2 rounded-xl outline-none border border-slate-800 focus:border-emerald-400"
            />
            <button onClick={handleSendMessage} className="bg-emerald-500 text-black p-2 rounded-xl"><Send size={16} /></button>
          </div>
        </div>
      )}

      {/* Floating Chat Trigger */}
      {!chatModalOpen && (
        <button 
          onClick={() => setChatModalOpen(true)}
          className="fixed bottom-20 right-6 bg-emerald-500 text-black font-black p-3.5 rounded-full shadow-2xl z-40 hover:scale-110 transition flex items-center gap-2"
        >
          <Sparkles size={20} /> <span className="hidden sm:inline text-xs">Ask AI Expert</span>
        </button>
      )}

      {/* ================= 6. MOBILE NAVIGATION BAR ================= */}
      <nav className="fixed bottom-0 left-0 w-full lg:hidden bg-slate-950 text-slate-400 border-t border-slate-800 px-3 py-2 flex justify-around items-center z-40 text-[9px] font-bold uppercase">
        {[
          { id: 'all', label: 'Home', icon: <Sparkles size={18} /> },
          { id: 'f2f-seeds', label: 'Seeds', icon: <Sprout size={18} /> },
          { id: 'rentals', label: 'Rentals', icon: <Wallet size={18} /> },
          { id: 'mandi', label: 'Mandi', icon: <TrendingUp size={18} /> }
        ].map(nav => (
          <button 
            key={nav.id} 
            onClick={() => setActiveTab(nav.id as Tab)} 
            className={`flex flex-col items-center gap-1 ${activeTab === nav.id ? 'text-emerald-400 font-extrabold' : ''}`}
          >
            {nav.icon}
            {nav.label}
          </button>
        ))}
      </nav>

    </div>
  );
}