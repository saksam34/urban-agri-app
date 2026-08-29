import React, { useState, useMemo } from "react";

// ==========================================
// MASTER MOCK DATABASE (Aggregated B2B Agri)
// ==========================================

const INDIAN_STATES = [
  "Madhya Pradesh",
  "Maharashtra",
  "Punjab",
  "Rajasthan",
  "Uttar Pradesh",
  "Gujarat"
];

const MP_CITIES = [
  "All MP Cities", "Indore", "Bhopal", "Ujjain", "Gwalior", 
  "Jabalpur", "Mandsaur", "Dhar", "Sehore", "Hoshangabad", "Dewas"
];

const MASTER_PRODUCTS = [
  {
    id: "p1",
    name: "FRESH DESI TOMATOES (A-GRADE)",
    category: "CROP_MARKET",
    type: "Vegetables",
    variety: "Desi Hybrid Red",
    price: 26,
    unit: "kg",
    minOrder: "100 kg",
    state: "Madhya Pradesh",
    city: "Bhopal",
    location: "Karond Mandi Road, Bhopal",
    sellerName: "Sharma Vegetable Farm",
    sellerPhone: "+91 98270 33441",
    sellerRating: 4.7,
    verified: true,
    source: "MandiNet",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500"
  },
  {
    id: "p2",
    name: "ORGANIC POTATO (JYOTI VARIETY)",
    category: "CROP_MARKET",
    type: "Vegetables",
    variety: "Jyoti (High Starch)",
    price: 18,
    unit: "kg",
    minOrder: "500 kg",
    state: "Madhya Pradesh",
    city: "Indore",
    location: "Rau Bypass Agro Zone, Indore",
    sellerName: "Rau Cold Storage B2B",
    sellerPhone: "+91 98261 99887",
    sellerRating: 4.5,
    verified: true,
    source: "MandiNet",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500"
  },
  {
    id: "p3",
    name: "DESI GARLIC BATCH (MANDSAUR)",
    category: "CROP_MARKET",
    type: "Vegetables",
    variety: "Riyawan Grade-1",
    price: 110,
    unit: "kg",
    minOrder: "50 kg",
    state: "Madhya Pradesh",
    city: "Mandsaur",
    location: "Main APMC Yard, Mandsaur",
    sellerName: "Mandsaur Wholesale Trade",
    sellerPhone: "+91 94240 12345",
    sellerRating: 4.8,
    verified: true,
    source: "KisanSetu",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500"
  },
  {
    id: "p4",
    name: "HYBRID SHARBATI WHEAT SEEDS",
    category: "HYBRID_SEEDS",
    type: "Grains",
    variety: "Sharbati C23 Certified",
    price: 3200,
    unit: "Quintal",
    minOrder: "5 Quintals",
    state: "Madhya Pradesh",
    city: "Sehore",
    location: "Ashta Road, Sehore",
    sellerName: "Sehore Certified Seeds Corp",
    sellerPhone: "+91 98265 44332",
    sellerRating: 4.9,
    verified: true,
    source: "KisanSetu",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500"
  },
  {
    id: "p5",
    name: "EXOTIC BROCCOLI (CRATE PACKING)",
    category: "CROP_MARKET",
    type: "Exotic",
    variety: "Green Magic Premium",
    price: 75,
    unit: "kg",
    minOrder: "30 kg",
    state: "Madhya Pradesh",
    city: "Ujjain",
    location: "Dewas Road Hydroponics Hub, Ujjain",
    sellerName: "Ujjain Hydroponic Farm",
    sellerPhone: "+91 97521 88990",
    sellerRating: 4.6,
    verified: true,
    source: "KisanSetu",
    image: "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=500"
  }
];

const MACHINERY_RENTALS_DATA = [
  {
    id: "m1",
    name: "John Deere Harvester (AC Cab, Heavy Duty)",
    rate: 1200,
    unit: "hour",
    city: "Indore",
    location: "Sanwer Industrial Area, Indore",
    sellerName: "Malwa Heavy Machinery Hire",
    sellerPhone: "+91 98260 77889",
    verified: true,
    slots: ["07:00 AM - 11:00 AM", "11:30 AM - 03:30 PM", "04:00 PM - 08:00 PM"],
    image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=500"
  },
  {
    id: "m2",
    name: "Mahindra 575 DI Tractor + Automatic Seed Drill",
    rate: 550,
    unit: "hour",
    city: "Bhopal",
    location: "Bairagarh Farms, Bhopal",
    sellerName: "Kareli Krishi Yantra Hire",
    sellerPhone: "+91 94251 33445",
    verified: true,
    slots: ["06:00 AM - 10:00 AM", "10:30 AM - 02:30 PM", "03:00 PM - 07:00 PM"],
    image: "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=500"
  },
  {
    id: "m3",
    name: "Agri Fertilizer Spraying Drone (16L Tank)",
    rate: 1500,
    unit: "acre",
    city: "Dhar",
    location: "Pithampur Agro Tech Park, Dhar",
    sellerName: "Dhar AeroAgri Drone Services",
    sellerPhone: "+91 99810 44556",
    verified: true,
    slots: ["06:00 AM - 09:00 AM", "04:00 PM - 07:00 PM"],
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=500"
  }
];

const ORGANIC_KHAD_DATA = [
  {
    id: "k1",
    name: "Earthworm Vermicompost (Kechua Khad)",
    packaging: "50 kg Bag",
    bagPrice: 350,
    tonPrice: 6000,
    city: "Indore",
    location: "Bicholi Mardana Bio Organics, Indore",
    sellerName: "BioAgri Organic Solutions",
    sellerPhone: "+91 98262 33221",
    verified: true
  },
  {
    id: "k2",
    name: "Neem Cake Organic Fertilizer (Nimboli Khad)",
    packaging: "40 kg Bag",
    bagPrice: 640,
    tonPrice: 14500,
    city: "Hoshangabad",
    location: "Itarsi Road Organics, Hoshangabad",
    sellerName: "Narmada Bio-Fertilizers",
    sellerPhone: "+91 94254 77881",
    verified: true
  },
  {
    id: "k3",
    name: "Decomposed Cow Dung Manure (Gobar Khad)",
    packaging: "1 Trolley Load (~2.5 Tons)",
    bagPrice: 2800,
    tonPrice: 1100,
    city: "Dewas",
    location: "Bypass Gaushala Complex, Dewas",
    sellerName: "Shree Ram Gaushala Organic",
    sellerPhone: "+91 98932 66554",
    verified: true
  }
];

const ALL_INDIA_MANDIS = [
  {
    state: "Madhya Pradesh",
    mandis: [
      {
        name: "Indore APMC Mandi (Khadauti)",
        district: "Indore",
        rates: [
          { crop: "Wheat (Sharbati)", category: "Crops", rate: "₹3,150 / Qtl", change: "+₹30", trend: "up" },
          { crop: "Tomato (Desi Red)", category: "Vegetables", rate: "₹2,200 / Qtl", change: "-₹40", trend: "down" },
          { crop: "Potato (Jyoti)", category: "Vegetables", rate: "₹1,600 / Qtl", change: "+₹10", trend: "up" }
        ]
      },
      {
        name: "Karond Mandi",
        district: "Bhopal",
        rates: [
          { crop: "Soybean (Yellow)", category: "Crops", rate: "₹4,450 / Qtl", change: "+₹15", trend: "up" },
          { crop: "Garlic (Desi)", category: "Vegetables", rate: "₹11,800 / Qtl", change: "+₹200", trend: "up" }
        ]
      },
      {
        name: "Mandsaur Grain & Veg APMC",
        district: "Mandsaur",
        rates: [
          { crop: "Garlic (Riyawan Grade-1)", category: "Vegetables", rate: "₹14,200 / Qtl", change: "+₹350", trend: "up" },
          { crop: "Onion (Red)", category: "Vegetables", rate: "₹1,850 / Qtl", change: "-₹20", trend: "down" }
        ]
      }
    ]
  },
  {
    state: "Maharashtra",
    mandis: [
      {
        name: "Lasalgaon APMC Market",
        district: "Nashik",
        rates: [
          { crop: "Onion (Red Export Quality)", category: "Vegetables", rate: "₹2,100 / Qtl", change: "+₹50", trend: "up" },
          { crop: "Pomegranate (Bhagwa)", category: "Fruit Crop", rate: "₹8,500 / Qtl", change: "+₹120", trend: "up" }
        ]
      },
      {
        name: "Vashi Wholesale Market",
        district: "Mumbai",
        rates: [
          { crop: "Green Chilies (Jwala)", category: "Vegetables", rate: "₹4,200 / Qtl", change: "-₹80", trend: "down" }
        ]
      }
    ]
  },
  {
    state: "Punjab",
    mandis: [
      {
        name: "Khanna Grain Market",
        district: "Ludhiana",
        rates: [
          { crop: "Paddy Rice (Basmati 1121)", category: "Crops", rate: "₹4,350 / Qtl", change: "+₹45", trend: "up" },
          { crop: "Wheat (PBW 550)", category: "Crops", rate: "₹2,275 / Qtl", change: "₹0", trend: "stable" }
        ]
      }
    ]
  },
  {
    state: "Rajasthan",
    mandis: [
      {
        name: "Kota Krishi Upaj Mandi",
        district: "Kota",
        rates: [
          { crop: "Coriander (Dhaniya)", category: "Crops", rate: "₹7,200 / Qtl", change: "+₹110", trend: "up" },
          { crop: "Mustard (Sarson)", category: "Crops", rate: "₹5,350 / Qtl", change: "-₹30", trend: "down" }
        ]
      }
    ]
  }
];

const B2B_WHOLESALE_DIRECTORY = [
  { name: "Malwa Fresh Bulk Supplies", owner: "Rajesh Patidar", phone: "+91 98260 11223", city: "Indore", target: "Hotels, Canteens & Cloud Kitchens", minQty: "50 kg" },
  { name: "Narmada Agro Processing Units", owner: "Suresh Sharma", phone: "+91 94250 88771", city: "Hoshangabad", target: "Potato Chip Factories & Processing", minQty: "1,000 kg" },
  { name: "Mahakaal Organic Hub", owner: "Virendra Singh", phone: "+91 97520 44332", city: "Ujjain", target: "Wholesale Mandi Traders", minQty: "100 kg" },
  { name: "Mandsaur Garlic Exporters", owner: "Dinesh Dhakad", phone: "+91 94240 12345", city: "Mandsaur", target: "Exporters & Processing Plants", minQty: "500 kg" }
];

// ==========================================
// MAIN REACT APPLICATION COMPONENT
// ==========================================

export default function UrbanAgriMasterApp() {
  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState("CROP_MARKET");
  const [selectedCity, setSelectedCity] = useState("All MP Cities");
  const [globalSearch, setGlobalSearch] = useState("");

  // All-India Mandi Specific States
  const [mandiState, setMandiState] = useState("Madhya Pradesh");
  const [mandiSearchQuery, setMandiSearchQuery] = useState("");

  // Commerce & Cart State
  const [productsList, setProductsList] = useState(MASTER_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  // Rental Slot Modal State
  const [selectedRentalMachine, setSelectedRentalMachine] = useState(null);
  const [chosenSlot, setChosenSlot] = useState("");

  // New Listing Form Popup State
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [newListing, setNewListing] = useState({
    name: "", category: "CROP_MARKET", price: "", unit: "kg", city: "Indore", sellerName: "", sellerPhone: "", image: ""
  });

  // Filtered Products Logic
  const filteredProducts = useMemo(() => {
    return productsList.filter((item) => {
      const matchTab = activeTab === "ALL" || item.category === activeTab;
      const matchCity = selectedCity === "All MP Cities" || item.city === selectedCity;
      const matchQuery = item.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
                         item.sellerName.toLowerCase().includes(globalSearch.toLowerCase());
      return matchTab && matchCity && matchQuery;
    });
  }, [productsList, activeTab, selectedCity, globalSearch]);

  // Cart Functions
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.qty), 0);
  }, [cart]);

  // Handle New Listing Submission
  const handleCreateListing = (e) => {
    e.preventDefault();
    if (!newListing.name || !newListing.price || !newListing.sellerPhone) {
      alert("Kripya saari zaruri details bharein!");
      return;
    }
    const created = {
      ...newListing,
      id: "custom_" + Date.now(),
      price: Number(newListing.price),
      sellerRating: 5.0,
      verified: true,
      source: "KisanSetu Direct",
      minOrder: "10 kg",
      image: newListing.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500"
    };
    setProductsList([created, ...productsList]);
    setIsSellModalOpen(false);
    setNewListing({ name: "", category: "CROP_MARKET", price: "", unit: "kg", city: "Indore", sellerName: "", sellerPhone: "", image: "" });
    alert("Aapka Produce/Machine Live Market Feed mein list ho gaya hai!");
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#f3f4f6", minHeight: "100vh", color: "#111827" }}>
      
      {/* 1. TOP HEADER & NAVIGATION BAR */}
      <header style={{ backgroundColor: "#14281d", color: "#fff", position: "sticky", top: 0, zIndex: 100 }}>
        {/* Top Info Strip */}
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "6px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", borderBottom: "1px solid #234230" }}>
          <span>✨ Live MP Agri Data Hub | OLX & Local Mandi Aggregated</span>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <span>📍 State: <strong>Madhya Pradesh (All)</strong></span>
            <span>City: 
              <select 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{ backgroundColor: "transparent", color: "#22c55e", border: "none", marginLeft: "4px", fontWeight: "bold", cursor: "pointer" }}
              >
                {MP_CITIES.map((c) => <option key={c} value={c} style={{ color: "#000" }}>{c}</option>)}
              </select>
            </span>
            <span style={{ cursor: "pointer" }}>🌐 हिंदी / ENG</span>
          </div>
        </div>

        {/* Brand & Search Bar Section */}
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px" }}>
          <h1 
            onClick={() => setActiveTab("CROP_MARKET")}
            style={{ margin: 0, fontSize: "24px", letterSpacing: "1px", cursor: "pointer", fontWeight: "900" }}
          >
            URBAN<span style={{ color: "#22c55e" }}>AGRI</span>
          </h1>

          {/* Search Box */}
          <div style={{ flex: 1, maxWidth: "550px", position: "relative" }}>
            <input 
              type="text" 
              placeholder="Search Indore/Bhopal sellers, crops, seeds, harvester..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 16px 10px 38px", borderRadius: "20px", border: "none", fontSize: "13px", outline: "none", backgroundColor: "#fff", color: "#000" }}
            />
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }}>🔍</span>
          </div>

          {/* Quick Actions */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button 
              onClick={() => setIsSellModalOpen(true)}
              style={{ backgroundColor: "#22c55e", color: "#000", border: "none", padding: "8px 16px", borderRadius: "20px", fontWeight: "bold", fontSize: "12px", cursor: "pointer" }}
            >
              ⊕ SELL / RENT
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              style={{ backgroundColor: "#234230", border: "1px solid #22c55e", color: "#fff", padding: "8px 14px", borderRadius: "20px", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
            >
              🛒 Cart <span style={{ backgroundColor: "#22c55e", color: "#000", padding: "2px 6px", borderRadius: "10px", fontSize: "11px", fontWeight: "bold" }}>{cart.length}</span>
            </button>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px", display: "flex", gap: "24px", fontSize: "13px", fontWeight: "600", overflowX: "auto" }}>
          {[
            { id: "ALL", label: "ALL ESSENTIALS" },
            { id: "CROP_MARKET", label: "CROP MARKET" },
            { id: "HYBRID_SEEDS", label: "HYBRID SEEDS" },
            { id: "MACHINERY_RENTALS", label: "MACHINERY RENTALS" },
            { id: "LIVE_MANDI", label: "ALL-INDIA LIVE MANDI" },
            { id: "INDUSTRY_B2B", label: "INDUSTRY B2B" },
            { id: "ORGANIC_KHAD", label: "ORGANIC KHAD" }
          ].map((tab) => (
            <div 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                paddingBottom: "12px",
                cursor: "pointer",
                color: activeTab === tab.id ? "#22c55e" : "#9ca3af",
                borderBottom: activeTab === tab.id ? "3px solid #22c55e" : "none",
                whiteSpace: "nowrap"
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>
      </header>

      {/* 2. MAIN BODY SECTION */}
      <main style={{ maxWidth: "1280px", margin: "24px auto", padding: "0 16px" }}>

        {/* CATEGORY 1: CROP & HYBRID SEEDS MARKET FEED */}
        {(activeTab === "ALL" || activeTab === "CROP_MARKET" || activeTab === "HYBRID_SEEDS") && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h2 style={{ fontSize: "16px", color: "#4b5563", margin: 0, fontWeight: "800", letterSpacing: "0.5px" }}>
                  {activeTab === "HYBRID_SEEDS" ? "CERTIFIED SEEDS CATALOG" : "CROPS PRODUCTS & VEGETABLES"}
                </h2>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>Filter Active: {selectedCity}</span>
              </div>
              <span style={{ fontSize: "12px", color: "#6b7280" }}>{filteredProducts.length} Listings Available</span>
            </div>

            {/* Responsive Card Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
              {filteredProducts.map((prod) => (
                <div key={prod.id} style={{ backgroundColor: "#fff", borderRadius: "12px", overflow: "hidden", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", position: "relative" }}>
                  
                  {/* Source Badge */}
                  <div style={{ position: "absolute", top: "10px", left: "10px", backgroundColor: "rgba(0,0,0,0.6)", color: "#fff", fontSize: "10px", padding: "3px 8px", borderRadius: "4px", fontWeight: "bold" }}>
                    📍 {prod.source}
                  </div>

                  <img src={prod.image} alt={prod.name} style={{ width: "100%", height: "180px", objectFit: "cover" }} />

                  <div style={{ padding: "16px" }}>
                    {prod.verified && (
                      <span style={{ backgroundColor: "#22c55e", color: "#fff", fontSize: "9px", padding: "2px 6px", borderRadius: "3px", fontWeight: "bold" }}>
                        ✓ VERIFIED SELLER
                      </span>
                    )}

                    <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: "bold", marginTop: "8px" }}>
                      {prod.type} • Variety: {prod.variety}
                    </div>

                    <h3 style={{ fontSize: "14px", fontWeight: "800", margin: "4px 0", height: "36px", overflow: "hidden" }}>
                      {prod.name}
                    </h3>

                    <div style={{ fontSize: "18px", fontWeight: "900", color: "#111827", margin: "6px 0" }}>
                      ₹{prod.price} <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "normal" }}>/ {prod.unit}</span>
                    </div>

                    <div style={{ fontSize: "11px", color: "#d97706", fontWeight: "bold", marginBottom: "6px" }}>
                      Min Bulk Order: {prod.minOrder}
                    </div>

                    <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "12px" }}>
                      📍 Location: <strong>{prod.location}</strong>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "#374151", borderTop: "1px solid #f3f4f6", paddingTop: "8px", marginBottom: "12px" }}>
                      <span>Seller: <strong>{prod.sellerName}</strong></span>
                      <span style={{ color: "#f59e0b", fontWeight: "bold" }}>★ {prod.sellerRating}</span>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <button 
                        onClick={() => addToCart(prod)}
                        style={{ backgroundColor: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", padding: "8px", borderRadius: "6px", fontWeight: "bold", fontSize: "11px", cursor: "pointer" }}
                      >
                        + CART
                      </button>
                      <button 
                        onClick={() => { addToCart(prod); setIsCheckoutOpen(true); }}
                        style={{ backgroundColor: "#22c55e", color: "#fff", border: "none", padding: "8px", borderRadius: "6px", fontWeight: "bold", fontSize: "11px", cursor: "pointer" }}
                      >
                        BUY NOW
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CATEGORY 2: ALL-INDIA LIVE MANDI RATES WITH DIRECT SEARCH */}
        {activeTab === "LIVE_MANDI" && (
          <div>
            <div style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", margin: "0 0 10px 0" }}>📊 All-India Live Mandi Rate Aggregator</h2>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 16px 0" }}>
                Select state or search any Mandi/District directly to get live crop price updates.
              </p>

              {/* State Filter Buttons */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
                {INDIAN_STATES.map((st) => (
                  <button
                    key={st}
                    onClick={() => setMandiState(st)}
                    style={{
                      backgroundColor: mandiState === st ? "#14281d" : "#e5e7eb",
                      color: mandiState === st ? "#fff" : "#374151",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      cursor: "pointer"
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Mandi Direct Search Input */}
              <input 
                type="text" 
                placeholder="🔍 Search Mandi Name or District (e.g., Indore, Lasalgaon, Kota)..."
                value={mandiSearchQuery}
                onChange={(e) => setMandiSearchQuery(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "6px", border: "1px solid #d1d5db", fontSize: "13px" }}
              />
            </div>

            {/* Mandi Table Display */}
            {ALL_INDIA_MANDIS
              .filter((st) => st.state === mandiState)
              .map((stData) => (
                <div key={stData.state}>
                  {stData.mandis
                    .filter((m) => m.name.toLowerCase().includes(mandiSearchQuery.toLowerCase()) || m.district.toLowerCase().includes(mandiSearchQuery.toLowerCase()))
                    .map((mandi, idx) => (
                      <div key={idx} style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", marginBottom: "16px", border: "1px solid #e5e7eb" }}>
                        <h3 style={{ margin: "0 0 12px 0", color: "#14281d", fontSize: "16px" }}>🏛️ {mandi.name} ({mandi.district})</h3>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                          <thead>
                            <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left", color: "#6b7280" }}>
                              <th style={{ padding: "8px" }}>Crop / Commodity</th>
                              <th style={{ padding: "8px" }}>Category</th>
                              <th style={{ padding: "8px" }}>Current Mandi Rate</th>
                              <th style={{ padding: "8px" }}>24h Price Change</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mandi.rates.map((rateItem, rIdx) => (
                              <tr key={rIdx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                <td style={{ padding: "10px 8px", fontWeight: "bold" }}>{rateItem.crop}</td>
                                <td style={{ padding: "10px 8px" }}>{rateItem.category}</td>
                                <td style={{ padding: "10px 8px", color: "#16a34a", fontWeight: "bold" }}>{rateItem.rate}</td>
                                <td style={{ padding: "10px 8px", color: rateItem.trend === "up" ? "#16a34a" : rateItem.trend === "down" ? "#dc2626" : "#6b7280", fontWeight: "bold" }}>
                                  {rateItem.change}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                </div>
              ))}
          </div>
        )}

        {/* CATEGORY 3: MACHINERY RENTALS & SLOT BOOKING */}
        {activeTab === "MACHINERY_RENTALS" && (
          <div>
            <h2 style={{ fontSize: "18px", margin: "0 0 16px 0" }}>🚜 Agricultural Machinery Rentals with Slot Booking</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {MACHINERY_RENTALS_DATA.map((mac) => (
                <div key={mac.id} style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "16px" }}>
                  <img src={mac.image} alt={mac.name} style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "8px" }} />
                  <h3 style={{ fontSize: "15px", margin: "10px 0 4px 0" }}>{mac.name}</h3>
                  <div style={{ color: "#16a34a", fontSize: "18px", fontWeight: "bold" }}>₹{mac.rate} <small style={{ fontSize: "12px", color: "#6b7280" }}>/ {mac.unit}</small></div>
                  <div style={{ fontSize: "12px", color: "#6b7280", margin: "8px 0" }}>
                    📍 Location: {mac.location}<br />
                    🏢 Owner: <strong>{mac.sellerName}</strong>
                  </div>
                  <button 
                    onClick={() => setSelectedRentalMachine(mac)}
                    style={{ width: "100%", backgroundColor: "#f59e0b", color: "#fff", border: "none", padding: "10px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", marginTop: "8px" }}
                  >
                    📅 Book Rental Slot
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CATEGORY 4: INDUSTRY B2B DIRECTORY */}
        {activeTab === "INDUSTRY_B2B" && (
          <div>
            <h2 style={{ fontSize: "18px", margin: "0 0 16px 0" }}>🏭 MP Verified Wholesale Sellers (For Hotels, Canteens & Factories)</h2>
            <div style={{ backgroundColor: "#fff", borderRadius: "12px", overflow: "hidden", border: "1px solid #e5e7eb" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                <thead style={{ backgroundColor: "#14281d", color: "#fff" }}>
                  <tr>
                    <th style={{ padding: "12px" }}>Supplier Name</th>
                    <th style={{ padding: "12px" }}>City</th>
                    <th style={{ padding: "12px" }}>Target Audience</th>
                    <th style={{ padding: "12px" }}>Min Bulk Order</th>
                    <th style={{ padding: "12px" }}>Direct Phone Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {B2B_WHOLESALE_DIRECTORY.map((s, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "12px", fontWeight: "bold" }}>{s.name}<br/><small style={{ color: "#6b7280", fontWeight: "normal" }}>Owner: {s.owner}</small></td>
                      <td style={{ padding: "12px" }}>📍 {s.city}</td>
                      <td style={{ padding: "12px" }}>{s.target}</td>
                      <td style={{ padding: "12px", color: "#dc2626", fontWeight: "bold" }}>{s.minQty}</td>
                      <td style={{ padding: "12px" }}>
                        <a href={`tel:${s.phone}`} style={{ backgroundColor: "#e8f5e9", color: "#16a34a", padding: "6px 10px", borderRadius: "4px", textDecoration: "none", fontWeight: "bold" }}>📞 {s.phone}</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CATEGORY 5: ORGANIC KHAD & FERTILIZERS */}
        {activeTab === "ORGANIC_KHAD" && (
          <div>
            <h2 style={{ fontSize: "18px", margin: "0 0 16px 0" }}>🌱 Natural & Organic Khad Wholesale Catalog</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {ORGANIC_KHAD_DATA.map((k) => (
                <div key={k.id} style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#14281d" }}>{k.name}</h3>
                  <div style={{ fontSize: "13px", color: "#374151" }}>Packaging: <strong>{k.packaging}</strong></div>
                  <div style={{ fontSize: "18px", fontWeight: "bold", color: "#16a34a", margin: "8px 0" }}>
                    ₹{k.bagPrice} <small style={{ fontSize: "12px", color: "#6b7280" }}>(Bulk Rate: ₹{k.tonPrice} / Ton)</small>
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "12px" }}>
                    📍 Location: {k.location}<br/>
                    🏢 Supplier: {k.sellerName}
                  </div>
                  <a href={`tel:${k.sellerPhone}`} style={{ display: "block", textAlign: "center", backgroundColor: "#16a34a", color: "#fff", textDecoration: "none", padding: "8px", borderRadius: "6px", fontWeight: "bold" }}>
                    📞 Call Supplier: {k.sellerPhone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* 3. CART SIDEBAR OVERLAY */}
      {isCartOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ backgroundColor: "#fff", width: "100%", maxWidth: "400px", height: "100%", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb", paddingBottom: "12px" }}>
                <h3 style={{ margin: 0 }}>🛒 Bulk Shopping Cart</h3>
                <button onClick={() => setIsCartOpen(false)} style={{ border: "none", background: "none", fontSize: "18px", cursor: "pointer" }}>✕</button>
              </div>

              {cart.length === 0 ? (
                <p style={{ textAlign: "center", color: "#6b7280", marginTop: "40px" }}>Aapka Cart khaali hai!</p>
              ) : (
                <div style={{ marginTop: "16px", maxHeight: "60vh", overflowY: "auto" }}>
                  {cart.map((item) => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                      <div>
                        <div style={{ fontWeight: "bold", fontSize: "13px" }}>{item.name}</div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>₹{item.price} × {item.qty}</div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} style={{ color: "#dc2626", border: "none", background: "none", cursor: "pointer", fontWeight: "bold" }}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "bold", marginBottom: "16px" }}>
                  <span>Total Amount:</span>
                  <span style={{ color: "#16a34a" }}>₹{cartTotal}</span>
                </div>
                <button 
                  onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                  style={{ width: "100%", backgroundColor: "#22c55e", color: "#fff", border: "none", padding: "12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
                >
                  Proceed to Payment Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. PAYMENT CHECKOUT MODAL */}
      {isCheckoutOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "12px", maxWidth: "450px", width: "100%" }}>
            <h3 style={{ margin: "0 0 12px 0" }}>💳 Secure B2B Payment Gateway</h3>
            <div style={{ fontSize: "14px", marginBottom: "16px", color: "#374151" }}>Total Payable: <strong style={{ color: "#16a34a" }}>₹{cartTotal}</strong></div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>Select Payment Mode:</label>
              {["UPI (GPay / PhonePe / Paytm)", "Direct Mandi Bank Transfer (NEFT/RTGS)", "Cash on Delivery (Mandi Token Amount)"].map((mode) => (
                <div key={mode} style={{ marginBottom: "8px" }}>
                  <input 
                    type="radio" 
                    id={mode} 
                    name="payMode" 
                    checked={paymentMethod === mode} 
                    onChange={() => setPaymentMethod(mode)} 
                  />
                  <label htmlFor={mode} style={{ fontSize: "13px", marginLeft: "6px" }}>{mode}</label>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setIsCheckoutOpen(false)} style={{ padding: "8px 14px", border: "none", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
              <button 
                onClick={() => {
                  alert(`Payment Successful via ${paymentMethod}! Order confirmation SMS seller ko bhej diya gaya hai.`);
                  setCart([]);
                  setIsCheckoutOpen(false);
                }}
                style={{ backgroundColor: "#16a34a", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
              >
                Pay & Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. RENTAL SLOT BOOKING MODAL */}
      {selectedRentalMachine && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "12px", maxWidth: "400px", width: "100%" }}>
            <h3 style={{ margin: "0 0 8px 0" }}>Confirm Rental Time Slot</h3>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 16px 0" }}>{selectedRentalMachine.name}</p>

            <label style={{ fontSize: "12px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>Available Time Slots:</label>
            <select 
              value={chosenSlot} 
              onChange={(e) => setChosenSlot(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", marginBottom: "20px" }}
            >
              <option value="">-- Choose Slot --</option>
              {selectedRentalMachine.slots.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setSelectedRentalMachine(null)} style={{ padding: "8px 14px", border: "none", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
              <button 
                onClick={() => {
                  if(!chosenSlot) return alert("Pehle slot chuniyega!");
                  alert(`Booking Request for ${chosenSlot} sent to ${selectedRentalMachine.sellerName}! Owner confirmation ke liye call karega.`);
                  setSelectedRentalMachine(null);
                  setChosenSlot("");
                }}
                style={{ backgroundColor: "#16a34a", color: "#fff", padding: "8px 16px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
              >
                Confirm Slot Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. SELL / RENT PRODUCT POPUP MODAL */}
      {isSellModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "12px", maxWidth: "480px", width: "100%" }}>
            <h3 style={{ margin: "0 0 16px 0" }}>⊕ List Crop or Machine for Sale/Rent</h3>
            <form onSubmit={handleCreateListing}>
              <input 
                type="text" 
                placeholder="Crop / Machinery Title (e.g. Desi Tomato Batch)" 
                value={newListing.name}
                onChange={(e) => setNewListing({ ...newListing, name: e.target.value })}
                style={{ width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                <input 
                  type="number" 
                  placeholder="Price (₹)" 
                  value={newListing.price}
                  onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
                <select 
                  value={newListing.city}
                  onChange={(e) => setNewListing({ ...newListing, city: e.target.value })}
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                >
                  {MP_CITIES.filter(c => c !== "All MP Cities").map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <input 
                type="text" 
                placeholder="Your / Enterprise Name" 
                value={newListing.sellerName}
                onChange={(e) => setNewListing({ ...newListing, sellerName: e.target.value })}
                style={{ width: "100%", padding: "8px", marginBottom: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
              <input 
                type="text" 
                placeholder="Mobile Contact Number (+91)" 
                value={newListing.sellerPhone}
                onChange={(e) => setNewListing({ ...newListing, sellerPhone: e.target.value })}
                style={{ width: "100%", padding: "8px", marginBottom: "16px", borderRadius: "4px", border: "1px solid #ccc" }}
              />

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setIsSellModalOpen(false)} style={{ padding: "8px 14px", border: "none", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ backgroundColor: "#22c55e", color: "#000", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>Publish Listing</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}