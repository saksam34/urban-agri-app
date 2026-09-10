import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// TYPES & INTERFACES
// ==========================================
interface UserProfile {
  name: string;
  phone: string;
  role: 'FARMER' | 'BUYER' | 'CORPORATE';
  isLoggedIn: boolean;
}

interface QualityGuideline {
  parameter: string;
  value: string;
}

interface B2BDemand {
  id: string;
  company: string;
  crop: string;
  offeredPrice: string;
  targetQuantity: string;
  fulfilledQuantity: string;
  fulfilledPercent: number;
  plantLocation: string;
  officerContact: string;
  cutoffDate: string;
  qualityGuidelines: QualityGuideline[];
  paymentTerms: string;
}

interface ConfirmedSlot {
  id: string;
  company: string;
  crop: string;
  quantity: string;
  deliveryDate: string;
  logisticsOption: string;
  contractSignedOtp: boolean;
  status: 'CONFIRMED' | 'DISPATCHED' | 'QUALITY_CHECK_PASSED' | 'COMPLETED';
}

interface MarketProduct {
  id: string;
  title: string;
  categoryTag: string;
  category: 'CROPS' | 'SEEDS' | 'RENTALS';
  pricePerUnit: number;
  unit: string;
  sellerName: string;
  sellerUpi: string;
  location: string;
  distanceKm: number;
  image: string;
}

interface OrderTimelineStep {
  title: string;
  date: string;
  done: boolean;
  current?: boolean;
}

interface Order {
  id: string;
  date: string;
  itemTitle: string;
  sellerName: string;
  sellerUpi: string;
  itemPrice: number;
  transportCost: number;
  totalPrice: number;
  paymentMode: string;
  paymentStatus: 'ESCROW_LOCKED' | 'RELEASED_TO_SELLER' | 'REFUNDED';
  deliveryStatus: 'PROCESSING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  cancelReason?: string;
  timeline: OrderTimelineStep[];
}

// ---------- NEW: Mandi Bhav (Live Market Price) types ----------
interface MandiRate {
  mandiName: string;
  minRate: number;
  maxRate: number;
  modalRate: number;
  trend: 'up' | 'down' | 'stable';
}

// ---------- NEW: Harvester / Tractor (Rapido-style) types ----------
interface HarvesterListing {
  id: string;
  machineName: string;
  ownerName: string;
  ownerPhone: string;
  baseLat: number;
  baseLng: number;
  baseLocationLabel: string;
  perKmRate: number;
  perHourRate: number;
  workRateAcresPerHour: number;
  image: string;
  rating: number;
}

interface HarvesterBooking {
  id: string;
  machineName: string;
  ownerName: string;
  fieldLat: number | null;
  fieldLng: number | null;
  fieldLabel: string;
  distanceKm: number;
  fieldAreaAcres: number;
  estimatedHours: number;
  travelCost: number;
  workCost: number;
  totalCost: number;
  status: 'REQUESTED' | 'ACCEPTED' | 'ON_THE_WAY' | 'WORKING' | 'COMPLETED';
  pin: string;
}

// ---------- NEW: GPS Khet Mapping types ----------
interface GeoPoint {
  lat: number;
  lng: number;
}

// ==========================================
// STATIC REFERENCE DATA
// ==========================================
const INDIAN_STATES = [
  'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Haryana', 'Uttar Pradesh',
  'Rajasthan', 'Gujarat', 'Karnataka', 'Bihar', 'West Bengal',
  'Andhra Pradesh', 'Tamil Nadu'
];

const STATE_MANDI_NAMES: Record<string, string[]> = {
  'Madhya Pradesh': ['Indore Mandi', 'Ujjain Mandi', 'Dewas Mandi', 'Bhopal Mandi'],
  'Maharashtra': ['Pune APMC', 'Nashik Mandi', 'Nagpur Mandi', 'Aurangabad Mandi'],
  'Punjab': ['Ludhiana Mandi', 'Amritsar Mandi', 'Patiala Mandi'],
  'Haryana': ['Karnal Mandi', 'Hisar Mandi', 'Rohtak Mandi'],
  'Uttar Pradesh': ['Kanpur Mandi', 'Agra Mandi', 'Meerut Mandi', 'Lucknow Mandi'],
  'Rajasthan': ['Jaipur Mandi', 'Kota Mandi', 'Jodhpur Mandi'],
  'Gujarat': ['Rajkot Mandi', 'Ahmedabad Mandi', 'Surat Mandi'],
  'Karnataka': ['Bengaluru APMC', 'Hubli Mandi', 'Belgaum Mandi'],
  'Bihar': ['Patna Mandi', 'Muzaffarpur Mandi'],
  'West Bengal': ['Kolkata Mandi', 'Siliguri Mandi'],
  'Andhra Pradesh': ['Guntur Mandi', 'Vijayawada Mandi'],
  'Tamil Nadu': ['Chennai Koyambedu Mandi', 'Coimbatore Mandi']
};

const CROP_BASE_PRICES: Record<string, number> = {
  'Wheat': 26,
  'Rice (Paddy)': 22,
  'Tomato': 24,
  'Potato': 18,
  'Onion': 20,
  'Soybean': 46,
  'Cotton': 68,
  'Maize': 21,
  'Sugarcane': 3.5,
  'Chana (Gram)': 58
};

// Simple deterministic pseudo-random generator so rates stay stable per render
// unless the user hits "Refresh Live Rates".
function seededRandom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(Math.sin(h)) % 1;
}

function generateMandiRates(state: string, crop: string, refreshSeed: number): MandiRate[] {
  const mandis = STATE_MANDI_NAMES[state] || [`${state} Central Mandi`];
  const base = CROP_BASE_PRICES[crop] || 25;
  return mandis.map((name) => {
    const r = seededRandom(`${name}-${crop}-${refreshSeed}`);
    const variance = (r - 0.5) * base * 0.25; // +/- ~12.5%
    const modal = Math.max(1, Math.round((base + variance) * 10) / 10);
    const min = Math.round((modal - base * 0.06) * 10) / 10;
    const max = Math.round((modal + base * 0.06) * 10) / 10;
    const trendVal = seededRandom(`${name}-${crop}-trend-${refreshSeed}`);
    const trend: 'up' | 'down' | 'stable' = trendVal > 0.6 ? 'up' : trendVal < 0.35 ? 'down' : 'stable';
    return { mandiName: name, minRate: min, maxRate: max, modalRate: modal, trend };
  });
}

// Haversine distance in km between two lat/lng points
function haversineDistanceKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

// Shoelace formula for polygon area from lat/lng points (approx, good for small field-sized plots)
function calculatePolygonAreaAcres(points: GeoPoint[]): number {
  if (points.length < 3) return 0;
  const R = 6371000; // meters
  const toXY = (p: GeoPoint, origin: GeoPoint) => {
    const x = ((p.lng - origin.lng) * Math.PI / 180) * R * Math.cos((origin.lat * Math.PI) / 180);
    const y = ((p.lat - origin.lat) * Math.PI / 180) * R;
    return { x, y };
  };
  const origin = points[0];
  const xy = points.map((p) => toXY(p, origin));
  let area = 0;
  for (let i = 0; i < xy.length; i++) {
    const j = (i + 1) % xy.length;
    area += xy[i].x * xy[j].y - xy[j].x * xy[i].y;
  }
  area = Math.abs(area) / 2; // square meters
  const acres = area / 4046.86;
  return Math.round(acres * 100) / 100;
}

const PESTICIDE_OPTIONS = [
  { name: 'Urea (Nitrogen Fertilizer)', dosePerAcre: 45, unit: 'kg' },
  { name: 'DAP (Phosphorus Fertilizer)', dosePerAcre: 25, unit: 'kg' },
  { name: 'General Fungicide Spray', dosePerAcre: 0.6, unit: 'l' },
  { name: 'General Insecticide Spray', dosePerAcre: 0.4, unit: 'l' },
  { name: 'Weedicide', dosePerAcre: 0.8, unit: 'l' }
];

export default function App() {
  // Authentication State
  const [user, setUser] = useState<UserProfile>({
    name: 'Vikram Patel',
    phone: '9876543210',
    role: 'FARMER',
    isLoggedIn: false
  });
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [authPhone, setAuthPhone] = useState<string>('');
  const [authName, setAuthName] = useState<string>('');
  const [authRole, setAuthRole] = useState<'FARMER' | 'BUYER' | 'CORPORATE'>('FARMER');

  // Navigation State — Mandi Bhav is now the home / default screen
  const [activeTab, setActiveTab] = useState<string>('mandi');
  const [marketView, setMarketView] = useState<'b2b' | 'direct'>('direct');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedB2B, setSelectedB2B] = useState<B2BDemand | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<MarketProduct | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'ADDRESS' | 'PAYMENT' | 'SUCCESS'>('ADDRESS');

  // B2B Booking State
  const [pledgeQty, setPledgeQty] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [selectedLogistics, setSelectedLogistics] = useState<string>('Company Truck Pick-up (@ ₹8/km)');
  const [otpInput, setOtpInput] = useState<string>('');

  // Checkout Flow State
  const [address, setAddress] = useState({ name: '', phone: '', city: '', pincode: '', addressLine: '' });
  const [paymentMode, setPaymentMode] = useState<string>('UPI');
  const [upiIdInput, setUpiIdInput] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  //Cacncellation State
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Ordered by Mistake');

  // AI Quality Inspection & AI Chatbot
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [aiInspectionStatus, setAiInspectionStatus] = useState<string | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([
    { sender: 'bot', text: 'Namaste! Main UrbanAgri AI Crop Doctor hoon. Fasal ki photo bhejein ya disease ka naam/lakshan likhein — main crop-disease database, weather pattern aur soil data ka use karke sahi solution dunga.' }
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  // ---------- NEW: Mandi Bhav State ----------
  const [mandiState, setMandiState] = useState<string>('Madhya Pradesh');
  const [mandiCrop, setMandiCrop] = useState<string>('Wheat');
  const [mandiCropSearch, setMandiCropSearch] = useState<string>('');
  const [mandiRefreshSeed, setMandiRefreshSeed] = useState<number>(1);
  const [mandiLastUpdated, setMandiLastUpdated] = useState<string>('Just Now');

  // ---------- NEW: GPS Khet Mapping State ----------
  const [gpsPoints, setGpsPoints] = useState<GeoPoint[]>([]);
  const [gpsWatching, setGpsWatching] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsCurrentPos, setGpsCurrentPos] = useState<GeoPoint | null>(null);
  const [khasraNumber, setKhasraNumber] = useState<string>('');
  const [khasraLookupResult, setKhasraLookupResult] = useState<number | null>(null);
  const [selectedPesticide, setSelectedPesticide] = useState<string>(PESTICIDE_OPTIONS[0].name);
  const watchIdRef = useRef<number | null>(null);

  const measuredAreaAcres = gpsPoints.length >= 3
    ? calculatePolygonAreaAcres(gpsPoints)
    : (khasraLookupResult ?? 0);

  // ---------- NEW: Harvester / Tractor Booking (Rapido-style) State ----------
  const [harvesterListings] = useState<HarvesterListing[]>([
    {
      id: 'hv-1',
      machineName: 'Mahindra 575 DI Harvester',
      ownerName: 'Suresh Verma',
      ownerPhone: '+91 90123 45671',
      baseLat: 22.9623,
      baseLng: 76.0534,
      baseLocationLabel: 'Dewas, MP',
      perKmRate: 25,
      perHourRate: 1100,
      workRateAcresPerHour: 1.4,
      image: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=500',
      rating: 4.7
    },
    {
      id: 'hv-2',
      machineName: 'John Deere 5310 Tractor + Rotavator',
      ownerName: 'Om Prakash Yadav',
      ownerPhone: '+91 90123 45672',
      baseLat: 22.7196,
      baseLng: 75.8577,
      baseLocationLabel: 'Indore, MP',
      perKmRate: 20,
      perHourRate: 650,
      workRateAcresPerHour: 2.1,
      image: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c8f6f?w=500',
      rating: 4.5
    },
    {
      id: 'hv-3',
      machineName: 'New Holland TC5.30 Combine Harvester',
      ownerName: 'Ramesh Chandra',
      ownerPhone: '+91 90123 45673',
      baseLat: 23.1793,
      baseLng: 75.7849,
      baseLocationLabel: 'Ujjain, MP',
      perKmRate: 28,
      perHourRate: 1350,
      workRateAcresPerHour: 1.6,
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500',
      rating: 4.8
    }
  ]);
  const [selectedHarvester, setSelectedHarvester] = useState<HarvesterListing | null>(null);
  const [fieldLocation, setFieldLocation] = useState<GeoPoint | null>(null);
  const [fieldLocationLabel, setFieldLocationLabel] = useState<string>('');
  const [manualHours, setManualHours] = useState<string>('');
  const [harvesterBookings, setHarvesterBookings] = useState<HarvesterBooking[]>([]);
  const [fetchingFieldGps, setFetchingFieldGps] = useState<boolean>(false);

  // Direct Marketplace Products
  const [marketProducts] = useState<MarketProduct[]>([
    {
      id: 'prod-1',
      title: 'A-Grade Hybrid Wheat Seed (Lok-1 Desi)',
      categoryTag: 'F2F SEED',
      category: 'SEEDS',
      pricePerUnit: 35,
      unit: 'kg',
      sellerName: 'Patel Organic Farms',
      sellerUpi: 'patelfarms@upi',
      location: 'Ujjain, MP',
      distanceKm: 15,
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500'
    },
    {
      id: 'prod-2',
      title: 'Fresh Desi Red Tomatoes (A-Grade)',
      categoryTag: 'VEGETABLE',
      category: 'CROPS',
      pricePerUnit: 26,
      unit: 'kg',
      sellerName: 'Vikram Singh',
      sellerUpi: 'vikram.singh@upi',
      location: 'Dhar, MP',
      distanceKm: 22,
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500'
    },
    {
      id: 'prod-3',
      title: 'Mahindra 575 DI Harvester Rental',
      categoryTag: 'MACHINERY',
      category: 'RENTALS',
      pricePerUnit: 1100,
      unit: 'hr',
      sellerName: 'Suresh Verma',
      sellerUpi: 'sureshverma@upi',
      location: 'Dewas, MP',
      distanceKm: 10,
      image: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=500'
    }
  ]);

  // Initial B2B Demands Data — now includes a live "rate they're offering" for farmer-to-company direct selling
  const [b2bDemands] = useState<B2BDemand[]>([
    {
      id: 'b2b-101',
      company: 'ITC Limited',
      crop: 'A-Grade Processable Potato (Chipsona)',
      offeredPrice: '₹29.5/kg',
      targetQuantity: '120 Tons',
      fulfilledQuantity: '45 Tons',
      fulfilledPercent: 37.5,
      plantLocation: 'Indore Plant, MP',
      officerContact: '+91 98765 43210',
      cutoffDate: '15 Sep 2026',
      qualityGuidelines: [
        { parameter: 'Moisture Content', value: '< 10%' },
        { parameter: 'Pesticide Residue', value: 'Zero Chemical Residue' },
        { parameter: 'TSS Index', value: '> 4.5 Brix' },
        { parameter: 'Size / Diameter', value: '> 45 mm' }
      ],
      paymentTerms: '20% Advance post-contract, 80% Escrow release post-gate check.'
    },
    {
      id: 'b2b-102',
      company: 'Britannia Industries',
      crop: 'Durum Wheat (High Solid Content)',
      offeredPrice: '₹28/kg',
      targetQuantity: '200 Tons',
      fulfilledQuantity: '110 Tons',
      fulfilledPercent: 55.0,
      plantLocation: 'Gwalior Facility, MP',
      officerContact: '+91 98123 45678',
      cutoffDate: '20 Sep 2026',
      qualityGuidelines: [
        { parameter: 'Moisture Content', value: '< 12%' },
        { parameter: 'Protein Content', value: '> 11%' }
      ],
      paymentTerms: '100% Escrow protection; instant settlement post weighbridge.'
    }
  ]);

  // Confirmed B2B Supply Slots
  const [confirmedSlots, setConfirmedSlots] = useState<ConfirmedSlot[]>([]);

  // Orders System
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-883920',
      date: 'Today, 02:30 PM',
      itemTitle: 'A-Grade Hybrid Wheat Seed (Lok-1 Desi)',
      sellerName: 'Patel Organic Farms',
      sellerUpi: 'patelfarms@upi',
      itemPrice: 35,
      transportCost: 120,
      totalPrice: 155,
      paymentMode: 'UPI App (Escrow Locked)',
      paymentStatus: 'ESCROW_LOCKED',
      deliveryStatus: 'IN_TRANSIT',
      timeline: [
        { title: 'Payment Completed & Held in Escrow', date: 'Today, 02:30 PM', done: true },
        { title: 'Order Confirmed by Seller', date: 'Today, 02:32 PM', done: true },
        { title: 'In-Transit to Buyer Location', date: 'Today, 04:00 PM', done: true, current: true },
        { title: 'Delivered & Quality Verified', date: 'Pending', done: false },
        { title: 'Escrow Released to Seller UPI', date: 'Pending', done: false }
      ]
    }
  ]);

  // Cleanup GPS watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Authentication Handlers
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authPhone.length < 10) {
      alert('Kripya valid 10-digit mobile number enter karein.');
      return;
    }
    setUser({
      name: authMode === 'SIGNUP' ? authName || 'Farmer User' : 'Vikram Patel',
      phone: authPhone,
      role: authRole,
      isLoggedIn: true
    });
    setActiveModal(null);
    alert(`Welcome ${authMode === 'SIGNUP' ? authName : 'back'}! Logged in as ${authRole}.`);
  };

  const handleLogout = () => {
    setUser({ ...user, isLoggedIn: false });
    alert('Logged out successfully.');
  };

  // Handler: B2B Supply Slot Booking
  const handleB2BSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedB2B) return;
    if (otpInput.length < 4) {
      alert('Kripya valid OTP enter karein contract sign karne ke liye.');
      return;
    }

    const newSlot: ConfirmedSlot = {
      id: `SLOT-${Math.floor(1000 + Math.random() * 9000)}`,
      company: selectedB2B.company,
      crop: selectedB2B.crop,
      quantity: `${pledgeQty} Tons`,
      deliveryDate: deliveryDate,
      logisticsOption: selectedLogistics,
      contractSignedOtp: true,
      status: 'CONFIRMED'
    };

    setConfirmedSlots([newSlot, ...confirmedSlots]);
    alert(`Slot Confirmed! Digital Contract signed via OTP (${otpInput}) for ${selectedB2B.company}.`);
    setActiveModal(null);
    setPledgeQty('');
    setOtpInput('');
  };

  // Handler: Payment & Order Placement
  const handlePaymentComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      const transportFee = Math.round(selectedProduct.distanceKm * 8);
      const grandTotal = selectedProduct.pricePerUnit + transportFee;

      const newOrder: Order = {
        id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        date: 'Just Now',
        itemTitle: selectedProduct.title,
        sellerName: selectedProduct.sellerName,
        sellerUpi: selectedProduct.sellerUpi,
        itemPrice: selectedProduct.pricePerUnit,
        transportCost: transportFee,
        totalPrice: grandTotal,
        paymentMode: `${paymentMode} (Escrow Protected)`,
        paymentStatus: 'ESCROW_LOCKED',
        deliveryStatus: 'IN_TRANSIT',
        timeline: [
          { title: 'Payment Completed & Amount Held in Escrow', date: 'Just Now', done: true, current: true },
          { title: 'Order Confirmed & Sent to Seller', date: 'Pending', done: false },
          { title: 'Goods In-Transit', date: 'Pending', done: false },
          { title: 'Delivery Completed & Approved', date: 'Pending', done: false },
          { title: 'Escrow Released to Seller UPI', date: 'Pending', done: false }
        ]
      };

      setOrders([newOrder, ...orders]);
      setCheckoutStep('SUCCESS');
    }, 1200);
  };

  // Handler: Order Cancellation
  const handleOrderCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;

    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === selectedOrderId) {
          return {
            ...ord,
            deliveryStatus: 'CANCELLED',
            paymentStatus: 'REFUNDED',
            cancelReason: cancelReason,
            timeline: [
              ...ord.timeline.map(t => ({ ...t, current: false })),
              { title: `Order Cancelled (${cancelReason})`, date: 'Just Now', done: true, current: true },
              { title: 'Escrow Refund Transferred to Buyer Account', date: 'Just Now', done: true }
            ]
          };
        }
        return ord;
      })
    );
    setActiveModal(null);
    alert('Order cancelled! Payment held in Escrow has been refunded to your account.');
  };

  // Handler: Image Quality Inspection (AI Crop Doctor — visual grading)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCropImage(URL.createObjectURL(file));
      setAiInspectionStatus(null);
      setAiAnalyzing(true);
      setTimeout(() => {
        setAiAnalyzing(false);
        setAiInspectionStatus('GRADE A APPROVED');
        setChatMessages(prev => [...prev, {
          sender: 'bot',
          text: 'Photo cross-checked against crop-grading database (moisture, TSS, blemish & pest-residue patterns) + current mandi quality specs.\n✅ Moisture: 9.1% (Limit < 10%)\n✅ TSS: 4.8 Brix\n✅ Zero visible pest/fungal residue detected\nGrade: A — is lot ko processing companies (ITC/Britannia) ki B2B demand me bhi bhej sakte hain.'
        }]);
      }, 1400);
    }
  };

  // Handler: AI Chatbot — richer, resource-referencing disease diagnosis
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    setTimeout(() => {
      const lower = userText.toLowerCase();
      let botReply = '';

      if (lower.includes('contract') || lower.includes('payment')) {
        botReply = 'UrbanAgri Contract Guidelines: Payment Escrow me lock rehta hai jab tak quality-check pass nahi ho jata. Uske baad seller ke UPI par automatic release hota hai.';
      } else if (
        lower.includes('disease') || lower.includes('rog') || lower.includes('keeda') ||
        lower.includes('daag') || lower.includes('sukh') || lower.includes('pest') ||
        lower.includes('bimari') || lower.includes('fungus')
      ) {
        botReply =
          'Diagnosis in-progress — main in resources ko cross-check kar raha hoon: (1) ICAR crop-disease database, (2) ghatna-sthal ka current weather/humidity pattern, (3) us mandi-region ka known pest-outbreak record, (4) aapki upload ki gayi photo (agar hai).\n\n' +
          'Sabse accurate diagnosis ke liye, kripya ek saaf photo upload karein (patti/tana/fal ka close-up), crop ka naam, aur lakshan (daag ka rang, patti muddna, keede dikhna) batayein. Jab tak photo nahi milti, main sirf general guidance de sakta hoon, exact dawai nahi — galat dawai se fasal aur zyada kharab ho sakti hai.';
      } else if (lower.includes('area') || lower.includes('khet') && lower.includes('napna')) {
        botReply = 'Khet ka area accurately measure karne ke liye "GPS Khet Mapping" tab use karein — wahan aap GPS se corner points mark kar sakte hain ya Khasra number daal sakte hain. Area milne ke baad dawai/fertilizer ki exact matra bhi calculate ho jayegi.';
      } else {
        botReply = `AI Analysis for "${userText}": Current mandi trend data ke anusar, is crop ka rate agle hafte ~4% badh sakta hai. Suggested action: Mandi Bhav tab me apne state/mandi ka live rate check karein pehle bechne se.`;
      }
      setChatMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 700);
  };

  // ---------- NEW: GPS Khet Mapping Handlers ----------
  const handleStartGpsWatch = () => {
    if (!navigator.geolocation) {
      setGpsError('Is device/browser me GPS available nahi hai.');
      return;
    }
    setGpsError(null);
    setGpsWatching(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsCurrentPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        setGpsError('GPS access denied ya unavailable: ' + err.message);
        setGpsWatching(false);
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
  };

  const handleStopGpsWatch = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsWatching(false);
  };

  const handleMarkCorner = () => {
    if (!gpsCurrentPos) {
      setGpsError('Pehle GPS location fetch hone dein (Start dabayein aur thodi der khule aasman ke neeche rukein).');
      return;
    }
    setGpsPoints(prev => [...prev, gpsCurrentPos]);
  };

  const handleResetMapping = () => {
    setGpsPoints([]);
    setKhasraLookupResult(null);
    setKhasraNumber('');
  };

  const handleKhasraLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!khasraNumber.trim()) return;
    // Simulated land-record lookup (in production, this would call the state's Bhulekh/Khasra API)
    const simulatedArea = Math.round((1.5 + seededRandom(khasraNumber) * 3.5) * 100) / 100;
    setKhasraLookupResult(simulatedArea);
    setGpsPoints([]);
  };

  const pesticideCalc = PESTICIDE_OPTIONS.find(p => p.name === selectedPesticide)!;
  const totalPesticideNeeded = Math.round(pesticideCalc.dosePerAcre * measuredAreaAcres * 100) / 100;

  // ---------- NEW: Harvester Booking Handlers (Rapido-style) ----------
  const handleFetchFieldGps = () => {
    if (!navigator.geolocation) {
      alert('GPS is device par available nahi hai.');
      return;
    }
    setFetchingFieldGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFieldLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setFieldLocationLabel(`Current Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        setFetchingFieldGps(false);
      },
      (err) => {
        alert('GPS fetch fail: ' + err.message);
        setFetchingFieldGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const distanceToHarvester = selectedHarvester && fieldLocation
    ? Math.round(haversineDistanceKm(
        { lat: selectedHarvester.baseLat, lng: selectedHarvester.baseLng },
        fieldLocation
      ) * 10) / 10
    : 0;

  const effectiveFieldArea = measuredAreaAcres > 0 ? measuredAreaAcres : 0;
  const autoEstimatedHours = selectedHarvester && effectiveFieldArea > 0
    ? Math.round((effectiveFieldArea / selectedHarvester.workRateAcresPerHour) * 10) / 10
    : 0;
  const finalHours = manualHours ? parseFloat(manualHours) || 0 : autoEstimatedHours;

  const travelCost = selectedHarvester ? Math.round(distanceToHarvester * selectedHarvester.perKmRate) : 0;
  const workCost = selectedHarvester ? Math.round(finalHours * selectedHarvester.perHourRate) : 0;
  const totalHarvesterCost = travelCost + workCost;

  const handleConfirmHarvesterBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHarvester || !fieldLocation) {
      alert('Kripya field ki location select karein.');
      return;
    }
    if (finalHours <= 0) {
      alert('Kripya kaam ke ghante enter karein ya pehle GPS Khet Mapping se area measure karein.');
      return;
    }
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const newBooking: HarvesterBooking = {
      id: `HV-${Math.floor(10000 + Math.random() * 90000)}`,
      machineName: selectedHarvester.machineName,
      ownerName: selectedHarvester.ownerName,
      fieldLat: fieldLocation.lat,
      fieldLng: fieldLocation.lng,
      fieldLabel: fieldLocationLabel,
      distanceKm: distanceToHarvester,
      fieldAreaAcres: effectiveFieldArea,
      estimatedHours: finalHours,
      travelCost,
      workCost,
      totalCost: totalHarvesterCost,
      status: 'REQUESTED',
      pin
    };
    setHarvesterBookings([newBooking, ...harvesterBookings]);
    alert(`Booking Request Bheji Gayi! Driver OTP/PIN: ${pin} (pahunchne par share karein). Estimated Total: ₹${totalHarvesterCost}`);
    setActiveModal(null);
    setSelectedHarvester(null);
    setFieldLocation(null);
    setFieldLocationLabel('');
    setManualHours('');
  };

  // Filtered direct marketplace items based on tab & search
  const filteredProducts = marketProducts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'crops') return p.category === 'CROPS';
    if (activeTab === 'seeds') return p.category === 'SEEDS';
    if (activeTab === 'rentals') return p.category === 'RENTALS';
    return true;
  });

  const filteredCropList = Object.keys(CROP_BASE_PRICES).filter(c =>
    c.toLowerCase().includes(mandiCropSearch.toLowerCase())
  );
  const currentMandiRates = generateMandiRates(mandiState, mandiCrop, mandiRefreshSeed);

  const trendColor = (t: 'up' | 'down' | 'stable') => t === 'up' ? '#22c55e' : t === 'down' ? '#ef4444' : '#94a3b8';
  const trendIcon = (t: 'up' | 'down' | 'stable') => t === 'up' ? '▲' : t === 'down' ? '▼' : '●';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b1120', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* HEADER BAR */}
      <header style={{ backgroundColor: '#0b1120', borderBottom: '1px solid #1e293b', padding: '12px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1, minWidth: '260px' }}>
          <div style={{ color: '#22c55e', fontSize: '20px', fontWeight: '900', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>URBAN</span>
            <span style={{ color: '#ffffff' }}>AGRI</span>
          </div>

          <div style={{ position: 'relative', flex: 1, maxWidth: '520px' }}>
            <input
              type="text"
              placeholder="Search crops, seeds, order tracking, sellers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', backgroundColor: '#070c18', border: '1px solid #1e293b', borderRadius: '20px', padding: '8px 16px 8px 36px', color: '#cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '13px' }}>🔍</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setActiveTab('orders')}
            style={{ backgroundColor: 'transparent', border: 'none', color: '#cbd5e1', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>🛍 My Orders</span>
            <span style={{ backgroundColor: '#1e293b', color: '#22c55e', fontSize: '11px', fontWeight: '700', borderRadius: '10px', padding: '2px 7px' }}>
              {orders.length}
            </span>
          </button>

          {user.isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>👤 {user.name} ({user.role})</span>
              <button onClick={handleLogout} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#ef4444', padding: '6px 12px', borderRadius: '16px', fontSize: '12px', cursor: 'pointer' }}>
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveModal('auth')}
              style={{ backgroundColor: '#22c55e', color: '#000', fontWeight: '700', border: 'none', padding: '7px 18px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer' }}
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* NAVIGATION TABS BAR */}
      <nav style={{ backgroundColor: '#070c18', borderBottom: '1px solid #1e293b', padding: '0 28px', display: 'flex', alignItems: 'center', gap: '22px', overflowX: 'auto' }}>
        {[
          { id: 'mandi', label: '🏠 Mandi Bhav' },
          { id: 'all-market', label: 'All Market' },
          { id: 'crops', label: 'Crops' },
          { id: 'seeds', label: 'Farmer Seeds' },
          { id: 'rentals', label: 'Equipment Listings' },
          { id: 'harvester', label: '🚜 Book Harvester/Tractor' },
          { id: 'gps', label: '📍 GPS Khet Mapping' },
          { id: 'orders', label: 'Track Orders & Returns' }
        ].map(tabItem => (
          <button
            key={tabItem.id}
            onClick={() => { setActiveTab(tabItem.id); if (['all-market','crops','seeds','rentals'].includes(tabItem.id)) setMarketView('direct'); }}
            style={{ padding: '12px 0', border: 'none', background: 'none', whiteSpace: 'nowrap', color: activeTab === tabItem.id ? '#22c55e' : '#94a3b8', fontWeight: activeTab === tabItem.id ? '700' : '500', fontSize: '13px', borderBottom: activeTab === tabItem.id ? '2px solid #22c55e' : '2px solid transparent', cursor: 'pointer' }}
          >
            {tabItem.label}
          </button>
        ))}
        <button
          onClick={() => setActiveModal('aiDoctor')}
          style={{ padding: '12px 0', border: 'none', background: 'none', whiteSpace: 'nowrap', color: '#22c55e', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          ✨ AI Crop Doctor
        </button>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main style={{ maxWidth: '1180px', margin: '0 auto', padding: '32px 20px' }}>

        {/* ================= HOME: MANDI BHAV (LIVE PRICES) ================= */}
        {activeTab === 'mandi' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#ffffff', margin: 0 }}>
                Mandi Bhav — State-wise Live Rates
              </h2>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                Demo/Sample rates (eNAM-format) — apna state aur crop चुनें har mandi ka rate dekhne ke liye. Last updated: {mandiLastUpdated}
              </p>
            </div>

            {/* State + Crop selectors */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <div style={{ flex: '1 1 260px' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>SELECT STATE</label>
                <select
                  value={mandiState}
                  onChange={e => setMandiState(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #1e293b', backgroundColor: '#070c18', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                >
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ flex: '1 1 260px', position: 'relative' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>SEARCH CROP</label>
                <input
                  type="text"
                  placeholder="e.g. Wheat, Onion, Soybean..."
                  value={mandiCropSearch}
                  onChange={e => setMandiCropSearch(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #1e293b', backgroundColor: '#070c18', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
                {mandiCropSearch && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#070c18', border: '1px solid #1e293b', borderRadius: '8px', marginTop: '4px', zIndex: 10, maxHeight: '180px', overflowY: 'auto' }}>
                    {filteredCropList.length === 0 && (
                      <div style={{ padding: '10px', fontSize: '12px', color: '#64748b' }}>Koi crop nahi mila</div>
                    )}
                    {filteredCropList.map(c => (
                      <div
                        key={c}
                        onClick={() => { setMandiCrop(c); setMandiCropSearch(''); }}
                        style={{ padding: '10px', fontSize: '13px', color: '#cbd5e1', cursor: 'pointer', borderBottom: '1px solid #1e293b' }}
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  onClick={() => { setMandiRefreshSeed(s => s + 1); setMandiLastUpdated('Just Now'); }}
                  style={{ backgroundColor: '#22c55e', color: '#000', fontWeight: '700', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
                >
                  🔄 Refresh Live Rates
                </button>
              </div>
            </div>

            {/* Crop chips quick select */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {Object.keys(CROP_BASE_PRICES).map(c => (
                <button
                  key={c}
                  onClick={() => setMandiCrop(c)}
                  style={{ padding: '6px 14px', borderRadius: '16px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: mandiCrop === c ? '1px solid #22c55e' : '1px solid #1e293b', backgroundColor: mandiCrop === c ? '#071811' : '#070c18', color: mandiCrop === c ? '#22c55e' : '#94a3b8' }}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Mandi rate cards for selected state + crop */}
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>
              {mandiCrop} rates in {mandiState} — {currentMandiRates.length} Mandis
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {currentMandiRates.map((r, idx) => (
                <div key={idx} style={{ backgroundColor: '#070c18', border: '1px solid #1e293b', borderRadius: '14px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{r.mandiName}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{mandiState}</div>
                    </div>
                    <span style={{ color: trendColor(r.trend), fontSize: '12px', fontWeight: '700' }}>
                      {trendIcon(r.trend)} {r.trend.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '22px', fontWeight: '900', color: '#22c55e' }}>₹{r.modalRate}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>/kg (modal)</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                    Range: ₹{r.minRate} – ₹{r.maxRate} /kg
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px', backgroundColor: '#071811', border: '1px solid #22c55e', borderRadius: '12px', padding: '14px' }}>
              <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0 }}>
                💡 Tip: Agar company (ITC/Britannia jaisi) direct rate is se accha de rahi hai, toh "All Market → B2B Corporate Contracts" tab me jaakar seedha unhe bech sakte hain — beech ke aadhtiya commission bachta hai.
              </p>
            </div>
          </div>
        )}

        {/* ================= FARMER / B2B MARKETPLACE TABS ================= */}
        {['all-market', 'crops', 'seeds', 'rentals'].includes(activeTab) && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#ffffff', margin: 0 }}>
                  {marketView === 'direct' ? 'DIRECT FARMER MARKETPLACE' : 'INDUSTRY DIRECT B2B PORTAL'}
                </h2>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Showing {filteredProducts.length} Products available near your location
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', backgroundColor: '#070c18', padding: '4px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                <button
                  onClick={() => setMarketView('direct')}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer', backgroundColor: marketView === 'direct' ? '#22c55e' : 'transparent', color: marketView === 'direct' ? '#000' : '#94a3b8' }}
                >
                  Farmer Direct
                </button>
                <button
                  onClick={() => setMarketView('b2b')}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer', backgroundColor: marketView === 'b2b' ? '#22c55e' : 'transparent', color: marketView === 'b2b' ? '#000' : '#94a3b8' }}
                >
                  B2B Corporate Contracts
                </button>
              </div>
            </div>

            {confirmedSlots.length > 0 && (
              <div style={{ backgroundColor: '#071811', border: '1px solid #22c55e', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                <h4 style={{ color: '#22c55e', margin: '0 0 10px 0', fontSize: '13px' }}>📌 Active Industry Supply Slots</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                  {confirmedSlots.map(slot => (
                    <div key={slot.id} style={{ backgroundColor: '#0b1120', padding: '10px', borderRadius: '6px', fontSize: '12px' }}>
                      <strong>{slot.company}</strong> - {slot.crop} ({slot.quantity})
                      <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>Delivery: {slot.deliveryDate}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {marketView === 'direct' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                {filteredProducts.map(prod => {
                  const calculatedTransport = Math.round(prod.distanceKm * 8);
                  return (
                    <div
                      key={prod.id}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        color: '#0f172a'
                      }}
                    >
                      <div style={{ position: 'relative', height: '180px' }}>
                        <img src={prod.image} alt={prod.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#0b1120', color: '#ffffff', fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '12px', letterSpacing: '0.5px' }}>
                          {prod.categoryTag}
                        </span>
                      </div>

                      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                        <div>
                          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: '0 0 10px 0', lineHeight: '1.3' }}>
                            {prod.title}
                          </h3>

                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '14px' }}>
                            <span style={{ fontSize: '22px', fontWeight: '900', color: '#15803d' }}>₹{prod.pricePerUnit}</span>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>/{prod.unit}</span>
                          </div>

                          <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Seller:</span>
                              <strong style={{ color: '#334155' }}>{prod.sellerName}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Seller UPI:</span>
                              <span style={{ fontFamily: 'monospace', color: '#475569' }}>{prod.sellerUpi}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', color: '#64748b' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🚚 Transport ({prod.distanceKm} km):</span>
                              <strong style={{ color: '#0f172a' }}>₹{calculatedTransport}</strong>
                            </div>
                          </div>
                        </div>

                        <div style={{ marginTop: '18px' }}>
                          <button
                            onClick={() => {
                              if (!user.isLoggedIn) {
                                setActiveModal('auth');
                              } else {
                                setSelectedProduct(prod);
                                setCheckoutStep('ADDRESS');
                                setActiveModal('myntraCheckout');
                              }
                            }}
                            style={{
                              width: '100%',
                              backgroundColor: '#111827',
                              color: '#ffffff',
                              fontWeight: '700',
                              fontSize: '13px',
                              padding: '12px 0',
                              borderRadius: '24px',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            Buy Now & Pay via UPI App
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {marketView === 'b2b' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
                {b2bDemands.map(demand => (
                  <div key={demand.id} style={{ backgroundColor: '#070c18', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <span style={{ backgroundColor: '#1e293b', color: '#38bdf8', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px' }}>
                          {demand.company}
                        </span>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '6px', color: '#f8fafc' }}>{demand.crop}</h3>
                        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>📍 {demand.plantLocation}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '18px', fontWeight: '800', color: '#22c55e' }}>{demand.offeredPrice}</span>
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#0b1120', padding: '10px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #1e293b' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#cbd5e1', marginBottom: '4px' }}>📋 Quality Specs:</div>
                      {demand.qualityGuidelines.map((q, idx) => (
                        <div key={idx} style={{ fontSize: '11px', color: '#94a3b8' }}>• {q.parameter}: <strong style={{ color: '#fff' }}>{q.value}</strong></div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        if (!user.isLoggedIn) {
                          setActiveModal('auth');
                        } else {
                          setSelectedB2B(demand);
                          setActiveModal('slotBooking');
                        }
                      }}
                      style={{ width: '100%', backgroundColor: '#22c55e', color: '#000', fontWeight: '700', border: 'none', padding: '10px 0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      Book Supply Slot & Sign Contract
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ================= BOOK HARVESTER / TRACTOR (Rapido-style) ================= */}
        {activeTab === 'harvester' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#ffffff', marginBottom: '4px' }}>
              🚜 Book Harvester / Tractor
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>
              Rapido-style booking — machine chunein, apne khet ki location pin karein, aur travel + working cost turant dekhein.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {harvesterListings.map(hv => (
                <div key={hv.id} style={{ backgroundColor: '#070c18', border: '1px solid #1e293b', borderRadius: '16px', overflow: 'hidden' }}>
                  <img src={hv.image} alt={hv.machineName} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: '0 0 4px 0' }}>{hv.machineName}</h3>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 8px 0' }}>👤 {hv.ownerName} · ⭐ {hv.rating} · 📍 {hv.baseLocationLabel}</p>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#94a3b8', marginBottom: '12px' }}>
                      <span>🛣 ₹{hv.perKmRate}/km travel</span>
                      <span>⏱ ₹{hv.perHourRate}/hr work</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '12px' }}>
                      Working speed: ~{hv.workRateAcresPerHour} acre/hour
                    </div>
                    <button
                      onClick={() => {
                        if (!user.isLoggedIn) { setActiveModal('auth'); return; }
                        setSelectedHarvester(hv);
                        setActiveModal('harvesterBooking');
                      }}
                      style={{ width: '100%', backgroundColor: '#22c55e', color: '#000', fontWeight: '700', border: 'none', padding: '10px 0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {harvesterBookings.length > 0 && (
              <div style={{ marginTop: '28px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>My Harvester/Tractor Bookings</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  {harvesterBookings.map(b => (
                    <div key={b.id} style={{ backgroundColor: '#070c18', border: '1px solid #1e293b', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <strong style={{ fontSize: '13px', color: '#fff' }}>{b.id}</strong>
                        <span style={{ backgroundColor: '#064e3b', color: '#6ee7b7', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '10px' }}>{b.status}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{b.machineName} · {b.ownerName}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Field: {b.fieldLabel}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Distance: {b.distanceKm} km · Area: {b.fieldAreaAcres || '—'} acre · Hours: {b.estimatedHours}</div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#22c55e', marginTop: '6px' }}>Total: ₹{b.totalCost}</div>
                      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Driver PIN: {b.pin}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= GPS KHET MAPPING ================= */}
        {activeTab === 'gps' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#ffffff', marginBottom: '4px' }}>
              📍 GPS Khet Mapping
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px' }}>
              Khet ke corners par khade hokar GPS se area measure karein, ya Khasra number se record nikalein. Fir exact dawai/fertilizer ki matra aur harvester ke kaam ke ghante calculate karein.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* GPS Corner Mapping */}
              <div style={{ backgroundColor: '#070c18', border: '1px solid #1e293b', borderRadius: '16px', padding: '18px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '10px' }}>Option 1: GPS se Corner Mark Karein</h3>

                {gpsError && (
                  <div style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', fontSize: '11px', padding: '8px', borderRadius: '6px', marginBottom: '10px' }}>{gpsError}</div>
                )}

                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  {!gpsWatching ? (
                    <button onClick={handleStartGpsWatch} style={{ backgroundColor: '#22c55e', color: '#000', fontWeight: '700', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                      ▶ Start GPS
                    </button>
                  ) : (
                    <button onClick={handleStopGpsWatch} style={{ backgroundColor: '#991b1b', color: '#fff', fontWeight: '700', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                      ⏹ Stop GPS
                    </button>
                  )}
                  <button onClick={handleMarkCorner} disabled={!gpsCurrentPos} style={{ backgroundColor: '#1e293b', color: '#fff', fontWeight: '700', border: '1px solid #334155', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', cursor: gpsCurrentPos ? 'pointer' : 'not-allowed', opacity: gpsCurrentPos ? 1 : 0.5 }}>
                    📍 Mark Corner ({gpsPoints.length})
                  </button>
                  <button onClick={handleResetMapping} style={{ backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #334155', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
                    Reset
                  </button>
                </div>
                {gpsCurrentPos && (
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                    Current GPS: {gpsCurrentPos.lat.toFixed(6)}, {gpsCurrentPos.lng.toFixed(6)}
                  </div>
                )}

                {gpsPoints.length > 0 && (
                  <div style={{ backgroundColor: '#0b1120', borderRadius: '8px', padding: '10px', fontSize: '11px', color: '#94a3b8', marginBottom: '10px' }}>
                    {gpsPoints.map((p, i) => (
                      <div key={i}>Corner {i + 1}: {p.lat.toFixed(6)}, {p.lng.toFixed(6)}</div>
                    ))}
                  </div>
                )}

                <p style={{ fontSize: '10px', color: '#475569', margin: 0 }}>
                  Kam se kam 3 corners chahiye area calculate karne ke liye. Khet ki boundary par har corner pe khade hokar "Mark Corner" dabayein.
                </p>
              </div>

              {/* Khasra Lookup */}
              <div style={{ backgroundColor: '#070c18', border: '1px solid #1e293b', borderRadius: '16px', padding: '18px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '10px' }}>Option 2: Khasra Number Se Nikalein</h3>
                <form onSubmit={handleKhasraLookup}>
                  <input
                    type="text"
                    placeholder="e.g. 245/2"
                    value={khasraNumber}
                    onChange={e => setKhasraNumber(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #1e293b', backgroundColor: '#0b1120', color: '#fff', fontSize: '13px', boxSizing: 'border-box', marginBottom: '10px' }}
                  />
                  <button type="submit" style={{ width: '100%', backgroundColor: '#22c55e', color: '#000', fontWeight: '700', border: 'none', padding: '10px 0', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                    Land Record Nikalein
                  </button>
                </form>
                <p style={{ fontSize: '10px', color: '#475569', marginTop: '8px' }}>
                  Demo lookup hai (Bhulekh/Khasra registry API integration ke liye placeholder). Production me yeh state land-record system se connect hoga.
                </p>
                {khasraLookupResult !== null && (
                  <div style={{ marginTop: '10px', backgroundColor: '#071811', border: '1px solid #22c55e', borderRadius: '8px', padding: '10px', fontSize: '12px', color: '#22c55e' }}>
                    Khasra {khasraNumber}: <strong>{khasraLookupResult} acre</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Measured Area Result + Pesticide Calculator */}
            {measuredAreaAcres > 0 && (
              <div style={{ marginTop: '20px', backgroundColor: '#071811', border: '1px solid #22c55e', borderRadius: '16px', padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#22c55e', marginBottom: '4px' }}>
                  Khet ka Area: {measuredAreaAcres} acre ({Math.round(measuredAreaAcres * 0.4047 * 100) / 100} hectare)
                </h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>Ab is area ke hisaab se dawai/khaad ki sahi matra calculate karein:</p>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div style={{ flex: '1 1 240px' }}>
                    <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '6px' }}>SELECT INPUT</label>
                    <select
                      value={selectedPesticide}
                      onChange={e => setSelectedPesticide(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #1e293b', backgroundColor: '#0b1120', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                    >
                      {PESTICIDE_OPTIONS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                  <div style={{ backgroundColor: '#0b1120', borderRadius: '8px', padding: '12px 18px', border: '1px solid #1e293b' }}>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Total Chahiye</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>{totalPesticideNeeded} {pesticideCalc.unit}</div>
                  </div>
                </div>

                <div style={{ marginTop: '18px', borderTop: '1px solid #1e293b', paddingTop: '14px' }}>
                  <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0 }}>
                    🚜 Is area ke hisaab se harvester/tractor kitna time lega, yeh "Book Harvester/Tractor" tab me machine select karte waqt automatically calculate ho jayega.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TRACK ORDERS & RETURNS TAB ================= */}
        {activeTab === 'orders' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px', letterSpacing: '0.5px' }}>MY ORDERS & RETURNS</h2>

            {orders.length === 0 ? (
              <p style={{ color: '#94a3b8' }}>No active orders found.</p>
            ) : (
              orders.map(order => (
                <div key={order.id} style={{ backgroundColor: '#070c18', borderRadius: '12px', border: '1px solid #1e293b', overflow: 'hidden', marginBottom: '20px' }}>
                  <div style={{ backgroundColor: '#0b1120', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Order ID: </span>
                      <strong style={{ color: '#22c55e' }}>{order.id}</strong>
                    </div>
                    <span style={{ backgroundColor: order.deliveryStatus === 'CANCELLED' ? '#7f1d1d' : '#064e3b', color: order.deliveryStatus === 'CANCELLED' ? '#fca5a5' : '#6ee7b7', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
                      {order.deliveryStatus}
                    </span>
                  </div>

                  <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>{order.itemTitle}</h4>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>Seller: {order.sellerName} | UPI: {order.sellerUpi}</p>

                      <div style={{ backgroundColor: '#0b1120', padding: '12px', borderRadius: '8px', fontSize: '12px', margin: '12px 0', border: '1px solid #1e293b' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span>Item Total:</span><span>₹{order.itemPrice}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span>Transport Cost:</span><span>₹{order.transportCost}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#22c55e', paddingTop: '6px', borderTop: '1px solid #1e293b' }}>
                          <span>Total Held in Escrow:</span><span>₹{order.totalPrice}</span>
                        </div>
                      </div>

                      {order.deliveryStatus !== 'CANCELLED' && (
                        <button
                          onClick={() => { setSelectedOrderId(order.id); setActiveModal('cancelOrder'); }}
                          style={{ backgroundColor: '#991b1b', color: '#fff', border: 'none', width: '100%', padding: '8px 0', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
                        >
                          Cancel Order / Request Instant Refund
                        </button>
                      )}
                    </div>

                    <div style={{ borderLeft: '1px solid #1e293b', paddingLeft: '20px' }}>
                      <h5 style={{ fontSize: '11px', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>Live Escrow Status</h5>
                      {order.timeline.map((step, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'flex-start' }}>
                          <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: step.done ? '#22c55e' : '#1e293b', color: step.done ? '#000' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700' }}>
                            {step.done ? '✓' : idx + 1}
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', color: step.done ? '#fff' : '#64748b', fontWeight: step.current ? '700' : '400' }}>{step.title}</div>
                            <div style={{ fontSize: '10px', color: '#475569' }}>{step.date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* FLOATING AI CROP DOCTOR BUTTON */}
      <button
        onClick={() => setActiveModal('aiDoctor')}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#064e3b',
          color: '#22c55e',
          border: '1px solid #22c55e',
          borderRadius: '24px',
          padding: '10px 18px',
          fontSize: '13px',
          fontWeight: '700',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          zIndex: 900,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span>🤖</span> Ask AI Doctor
      </button>

      {/* ==========================================
          MODALS
         ========================================== */}

      {/* MODAL: AUTHENTICATION */}
      {activeModal === 'auth' && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', color: '#0f172a', width: '100%', maxWidth: '380px', borderRadius: '16px', padding: '24px', position: 'relative' }}>
            <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>

            <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <button onClick={() => setAuthMode('LOGIN')} style={{ background: 'none', border: 'none', fontWeight: '800', fontSize: '15px', color: authMode === 'LOGIN' ? '#15803d' : '#64748b', cursor: 'pointer' }}>
                Sign In
              </button>
              <button onClick={() => setAuthMode('SIGNUP')} style={{ background: 'none', border: 'none', fontWeight: '800', fontSize: '15px', color: authMode === 'SIGNUP' ? '#15803d' : '#64748b', cursor: 'pointer' }}>
                New Account
              </button>
            </div>

            <form onSubmit={handleAuthSubmit}>
              {authMode === 'SIGNUP' && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Full Name</label>
                  <input type="text" required placeholder="e.g. Vikram Singh" value={authName} onChange={e => setAuthName(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Mobile Number</label>
                <input type="tel" maxLength={10} required placeholder="10-digit mobile number" value={authPhone} onChange={e => setAuthPhone(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Role</label>
                <select value={authRole} onChange={e => setAuthRole(e.target.value as any)} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}>
                  <option value="FARMER">Farmer / Producer</option>
                  <option value="BUYER">Trader / Retail Buyer</option>
                  <option value="CORPORATE">Corporate B2B Buyer</option>
                </select>
              </div>

              <button type="submit" style={{ width: '100%', backgroundColor: '#15803d', color: '#fff', border: 'none', padding: '10px 0', borderRadius: '20px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                {authMode === 'LOGIN' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MYNTRA-STYLE CHECKOUT */}
      {activeModal === 'myntraCheckout' && selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', color: '#0f172a', width: '100%', maxWidth: '420px', borderRadius: '16px', padding: '24px', position: 'relative' }}>
            <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>

            {checkoutStep === 'ADDRESS' && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: '#0f172a' }}>Delivery Address</h3>
                <form onSubmit={e => { e.preventDefault(); setCheckoutStep('PAYMENT'); }}>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Name</label>
                    <input type="text" required placeholder="Full Name" value={address.name} onChange={e => setAddress({ ...address, name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Phone</label>
                    <input type="tel" required placeholder="Mobile Number" value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Address Line</label>
                    <input type="text" required placeholder="Village / Tehsil / City" value={address.addressLine} onChange={e => setAddress({ ...address, addressLine: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
                  </div>
                  <button type="submit" style={{ width: '100%', backgroundColor: '#111827', color: '#fff', padding: '10px 0', borderRadius: '20px', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                    Proceed to Payment
                  </button>
                </form>
              </div>
            )}

            {checkoutStep === 'PAYMENT' && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px', color: '#0f172a' }}>Escrow Payment</h3>
                <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '12px' }}>Payment stays safely locked until goods are delivered — jaise Myntra/PhonePe escrow model.</p>

                <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span>Item ({selectedProduct.title}):</span><span>₹{selectedProduct.pricePerUnit}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span>Transport ({selectedProduct.distanceKm} km):</span><span>₹{Math.round(selectedProduct.distanceKm * 8)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: '#15803d', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
                    <span>Total Payable:</span><span>₹{selectedProduct.pricePerUnit + Math.round(selectedProduct.distanceKm * 8)}</span>
                  </div>
                </div>

                <form onSubmit={handlePaymentComplete}>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Payment Mode</label>
                    <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}>
                      <option value="UPI App">Direct UPI App (GPay/PhonePe/Paytm)</option>
                      <option value="Net Banking">Net Banking</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>UPI ID</label>
                    <input type="text" required placeholder="e.g. mobile@upi" value={upiIdInput} onChange={e => setUpiIdInput(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} />
                  </div>
                  <button type="submit" disabled={isProcessingPayment} style={{ width: '100%', backgroundColor: '#15803d', color: '#fff', padding: '10px 0', borderRadius: '20px', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                    {isProcessingPayment ? 'Processing Payment...' : 'Complete Payment'}
                  </button>
                </form>
              </div>
            )}

            {checkoutStep === 'SUCCESS' && (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎉</div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#15803d' }}>Order Confirmed!</h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Your payment is held in Escrow and will be released after delivery.</p>
                <button onClick={() => { setActiveModal(null); setActiveTab('orders'); }} style={{ width: '100%', backgroundColor: '#111827', color: '#fff', padding: '10px 0', borderRadius: '20px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
                  Track Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: B2B SLOT BOOKING */}
      {activeModal === 'slotBooking' && selectedB2B && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: '#070c18', border: '1px solid #1e293b', color: '#fff', width: '100%', maxWidth: '400px', borderRadius: '16px', padding: '24px', position: 'relative' }}>
            <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Book B2B Supply Slot</h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>{selectedB2B.company} • {selectedB2B.crop}</p>

            <form onSubmit={handleB2BSlotSubmit}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '11px', color: '#cbd5e1' }}>Pledged Quantity (Tons)</label>
                <input type="number" required placeholder="e.g. 10" value={pledgeQty} onChange={e => setPledgeQty(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #1e293b', backgroundColor: '#0b1120', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '11px', color: '#cbd5e1' }}>Delivery Date</label>
                <input type="date" required value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #1e293b', backgroundColor: '#0b1120', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '11px', color: '#cbd5e1' }}>Logistics</label>
                <select value={selectedLogistics} onChange={e => setSelectedLogistics(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #1e293b', backgroundColor: '#0b1120', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }}>
                  <option>Company Truck Pick-up (@ ₹8/km)</option>
                  <option>Self Delivery to Plant</option>
                </select>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '11px', color: '#cbd5e1' }}>OTP for Digital Contract</label>
                <input type="text" maxLength={6} required placeholder="Enter OTP" value={otpInput} onChange={e => setOtpInput(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #1e293b', backgroundColor: '#0b1120', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" style={{ width: '100%', backgroundColor: '#22c55e', color: '#000', padding: '10px 0', borderRadius: '8px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
                Sign Contract & Confirm Slot
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: HARVESTER / TRACTOR BOOKING (Rapido-style) */}
      {activeModal === 'harvesterBooking' && selectedHarvester && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: '#070c18', border: '1px solid #1e293b', color: '#fff', width: '100%', maxWidth: '440px', borderRadius: '16px', padding: '24px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>{selectedHarvester.machineName}</h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>{selectedHarvester.ownerName} · Base: {selectedHarvester.baseLocationLabel}</p>

            <form onSubmit={handleConfirmHarvesterBooking}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '11px', color: '#cbd5e1' }}>Khet ki Location (Pin)</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button type="button" onClick={handleFetchFieldGps} disabled={fetchingFieldGps} style={{ flex: 1, backgroundColor: '#1e293b', color: '#22c55e', border: '1px solid #334155', padding: '9px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                    {fetchingFieldGps ? 'Fetching GPS...' : '📍 Use Current GPS Location'}
                  </button>
                </div>
                {fieldLocation && (
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>{fieldLocationLabel}</div>
                )}
              </div>

              {measuredAreaAcres > 0 && (
                <div style={{ backgroundColor: '#071811', border: '1px solid #22c55e', borderRadius: '8px', padding: '8px', fontSize: '11px', color: '#22c55e', marginBottom: '10px' }}>
                  GPS Khet Mapping se measured area mil gaya: {measuredAreaAcres} acre (auto-filled below)
                </div>
              )}

              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '11px', color: '#cbd5e1' }}>Kaam ke Ghante (khali chhodein agar area GPS se pata hai)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder={autoEstimatedHours > 0 ? `Auto: ${autoEstimatedHours} hrs` : 'e.g. 3'}
                  value={manualHours}
                  onChange={e => setManualHours(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #1e293b', backgroundColor: '#0b1120', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ backgroundColor: '#0b1120', border: '1px solid #1e293b', borderRadius: '8px', padding: '12px', fontSize: '12px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Distance ({distanceToHarvester} km × ₹{selectedHarvester.perKmRate}/km):</span><span>₹{travelCost}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Work ({finalHours} hrs × ₹{selectedHarvester.perHourRate}/hr):</span><span>₹{workCost}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: '#22c55e', borderTop: '1px solid #1e293b', paddingTop: '6px' }}>
                  <span>Estimated Total:</span><span>₹{totalHarvesterCost}</span>
                </div>
              </div>

              <button type="submit" style={{ width: '100%', backgroundColor: '#22c55e', color: '#000', padding: '10px 0', borderRadius: '8px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
                Confirm Booking Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AI CROP DOCTOR */}
      {activeModal === 'aiDoctor' && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: '#070c18', border: '1px solid #1e293b', color: '#fff', width: '100%', maxWidth: '440px', borderRadius: '16px', padding: '24px', position: 'relative' }}>
            <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#22c55e', marginBottom: '2px' }}>✨ AI Crop Doctor</h3>
            <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '14px' }}>Vision-based grading + disease knowledge-base + weather/soil signals</p>

            <div style={{ backgroundColor: '#0b1120', padding: '10px', borderRadius: '8px', border: '1px solid #1e293b', marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', marginBottom: '6px' }}>📷 Upload Crop Photo for Quality/Disease Inspection</div>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ fontSize: '11px' }} />
              {cropImage && <img src={cropImage} alt="Crop Test" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px', marginTop: '8px' }} />}
              {aiAnalyzing && <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>⏳ Analyzing against grading & disease database...</div>}
              {aiInspectionStatus && !aiAnalyzing && <div style={{ fontSize: '11px', color: '#22c55e', marginTop: '6px', fontWeight: '700' }}>✅ {aiInspectionStatus} — details neeche chat me</div>}
            </div>

            <div style={{ backgroundColor: '#0b1120', borderRadius: '8px', padding: '10px', height: '180px', overflowY: 'auto', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.sender === 'user' ? '#22c55e' : '#1e293b', color: msg.sender === 'user' ? '#000' : '#fff', padding: '6px 10px', borderRadius: '10px', fontSize: '11px', maxWidth: '90%', whiteSpace: 'pre-line' }}>
                  {msg.text}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '6px' }}>
              <input type="text" placeholder="Disease/lakshan Hindi ya English me likhein..." value={chatInput} onChange={e => setChatInput(e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #1e293b', backgroundColor: '#0b1120', color: '#fff', fontSize: '12px' }} />
              <button type="submit" style={{ backgroundColor: '#22c55e', color: '#000', border: 'none', padding: '0 14px', borderRadius: '6px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>Send</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CANCEL ORDER */}
      {activeModal === 'cancelOrder' && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', color: '#0f172a', width: '100%', maxWidth: '360px', borderRadius: '16px', padding: '24px', position: 'relative' }}>
            <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: '#0f172a' }}>Cancel Order</h3>
            <form onSubmit={handleOrderCancelSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#475569' }}>Reason</label>
                <select value={cancelReason} onChange={e => setCancelReason(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }}>
                  <option value="Ordered by Mistake">Ordered by Mistake</option>
                  <option value="Delivery Delayed">Delivery Delayed</option>
                  <option value="Quality Requirements Changed">Quality Requirements Changed</option>
                </select>
              </div>
              <button type="submit" style={{ width: '100%', backgroundColor: '#dc2626', color: '#fff', padding: '10px 0', borderRadius: '20px', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '13px' }}>
                Confirm Cancellation & Instant Refund
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
