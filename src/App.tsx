import React, { useState } from 'react';

// --- TYPES & INTERFACES ---
interface IndustryDemand {
  id: string;
  company: string;
  crop: string;
  pricePerKg: number;
  totalQuantityTons: number;
  fulfilledTons: number;
  location: string;
  officerContact: string;
  guidelines: {
    moisture: string;
    pesticide: string;
    grade: string;
  };
}

interface OrderItem {
  id: string;
  title: string;
  seller: string;
  sellerUpi: string;
  itemPrice: number;
  transportCost: number;
  totalPaid: number;
  promisedDelivery: string;
  status: 'PAYMENT_PENDING' | 'CONFIRMED' | 'PACKED' | 'DISPATCHED' | 'OUT_FOR_DELIVERY' | 'CANCELLED';
  cancelReason?: string;
  date: string;
}

// --- B2B INDUSTRY DEMANDS INITIAL DATA ---
const INITIAL_DEMANDS: IndustryDemand[] = [
  {
    id: 'DEM-101',
    company: 'ITC Limited',
    crop: 'A-Grade Processable Potato (Chipsona)',
    pricePerKg: 29.5,
    totalQuantityTons: 120,
    fulfilledTons: 45,
    location: 'Indore Plant, MP',
    officerContact: '+91 98765 43210',
    guidelines: { moisture: '< 10%', pesticide: 'Zero Residue', grade: 'High Starch, TSS > 4.5 Brix' }
  },
  {
    id: 'DEM-102',
    company: 'Britannia Industries',
    crop: 'Durum Wheat (High Solid Content)',
    pricePerKg: 28.0,
    totalQuantityTons: 200,
    fulfilledTons: 110,
    location: 'Gwalior Facility, MP',
    officerContact: '+91 91234 56789',
    guidelines: { moisture: '< 12%', pesticide: 'FSSAI Approved', grade: 'Protein > 11%' }
  },
  {
    id: 'DEM-103',
    company: 'Mother Dairy',
    crop: 'Fresh Hybrid Red Tomatoes',
    pricePerKg: 26.0,
    totalQuantityTons: 45,
    fulfilledTons: 12,
    location: 'Bhopal Cold Chain, MP',
    officerContact: '+91 99887 76655',
    guidelines: { moisture: 'Standard', pesticide: 'Organic Certified', grade: 'Firm Red, Grade A' }
  }
];

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('All Market');
  const [activeSubTab, setActiveSubTab] = useState<'b2b' | 'all-market'>('b2b');

  // Business Logic States
  const [demands] = useState<IndustryDemand[]>(INITIAL_DEMANDS);
  const [selectedDemand, setSelectedDemand] = useState<IndustryDemand | null>(null);
  const [slotQuantity, setSlotQuantity] = useState<number>(5);
  
  // Payment System State (Myntra Style Workflow)
  const [checkoutItem, setCheckoutItem] = useState<{ title: string; seller: string; upi: string; price: number; transport: number } | null>(null);
  const [upiPaymentMethod, setUpiPaymentMethod] = useState<'GPay' | 'PhonePe' | 'Paytm' | 'UPI_ID'>('GPay');

  // Orders State (Exact Match to UrbanAgri UI)
  const [orders, setOrders] = useState<OrderItem[]>([
    {
      id: 'ORD-246452',
      title: 'A-Grade Hybrid Wheat Seed (Lok-1 Desi)',
      seller: 'Patel Organic Farms',
      sellerUpi: 'patelfarms@upi',
      itemPrice: 35,
      transportCost: 120,
      totalPaid: 155,
      promisedDelivery: '06 Sep 2026',
      status: 'CANCELLED',
      cancelReason: 'Ordered by Mistake',
      date: 'Today, Just Now'
    }
  ]);

  // Modals & Chatbot States
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Ordered by Mistake');
  const [showAiDoctor, setShowAiDoctor] = useState<boolean>(false);
  const [aiImagePreview, setAiImagePreview] = useState<string | null>(null);
  const [aiInspectionResult, setAiInspectionResult] = useState<string | null>(null);

  // --- HANDLERS ---
  const handleSlotBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDemand) return;
    alert(`OTP Verified! Direct Digital Contract signed for ${slotQuantity} Tons of ${selectedDemand.crop} with ${selectedDemand.company}. Escrow payment activated!`);
    setSelectedDemand(null);
  };

  const handleExecutePayment = () => {
    if (!checkoutItem) return;
    const newOrder: OrderItem = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      title: checkoutItem.title,
      seller: checkoutItem.seller,
      sellerUpi: checkoutItem.upi,
      itemPrice: checkoutItem.price,
      transportCost: checkoutItem.transport,
      totalPaid: checkoutItem.price + checkoutItem.transport,
      promisedDelivery: '10 Sep 2026',
      status: 'CONFIRMED',
      date: 'Today, Just Now'
    };

    setOrders([newOrder, ...orders]);
    setCheckoutItem(null);
    setActiveTab('Track Orders & Returns');
    alert(`Payment Successful via ${upiPaymentMethod}! ₹${checkoutItem.price + checkoutItem.transport} transferred to Seller: ${checkoutItem.upi}. Order Placed!`);
  };

  const confirmOrderCancellation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingOrderId) return;
    setOrders(orders.map(o => o.id === cancellingOrderId ? { ...o, status: 'CANCELLED', cancelReason } : o));
    setCancellingOrderId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAiImagePreview(URL.createObjectURL(file));
      setAiInspectionResult('Analyzing crop quality via Gemini Vision AI...');
      setTimeout(() => {
        setAiInspectionResult('Quality Analysis: Grade A (Starch: 18.2%, Moisture: 9.8%, Defect-Free). Approved for B2B Industry Procurement!');
      }, 2000);
    }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc', fontFamily: 'Segoe UI, sans-serif' }}>
      
      {/* 1. TOP NAVBAR (MATCHING URBANAGRI) */}
      <header style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#22c55e', letterSpacing: '1px' }}>URBANAGRI</span>
          <span style={{ fontSize: '11px', background: '#334155', padding: '2px 6px', borderRadius: '4px', color: '#94a3b8' }}>Farmer App</span>
        </div>

        <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {['All Market', 'Crops', 'Farmer Seeds', 'Equipment Rentals', 'AI Crop Doctor', 'Track Orders & Returns'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === tab ? '#22c55e' : (tab === 'AI Crop Doctor' ? '#4ade80' : '#cbd5e1'),
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              {tab === 'AI Crop Doctor' && <span>✨</span>}
              {tab}
            </button>
          ))}
        </nav>

        <button style={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff', padding: '6px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
          Sign In
        </button>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>

        {/* SUB-NAVIGATION TOGGLE FOR ALL MARKET */}
        {activeTab === 'All Market' && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <button 
              onClick={() => setActiveSubTab('b2b')} 
              style={{ backgroundColor: activeSubTab === 'b2b' ? '#22c55e' : '#1e293b', color: activeSubTab === 'b2b' ? '#000' : '#fff', border: '1px solid #334155', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              🏢 Industry Direct B2B Demands
            </button>
            <button 
              onClick={() => setActiveSubTab('all-market')} 
              style={{ backgroundColor: activeSubTab === 'all-market' ? '#22c55e' : '#1e293b', color: activeSubTab === 'all-market' ? '#000' : '#fff', border: '1px solid #334155', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              🧑‍🌾 Direct Farmer Marketplace
            </button>
          </div>
        )}

        {/* SECTION A: B2B INDUSTRY DEMANDS PORTAL */}
        {(activeTab === 'All Market' && activeSubTab === 'b2b') && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', margin: '0 0 6px 0' }}>Industry Demands & Direct B2B Procurement</h2>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>Sell produce directly to top companies with locked pricing and escrow protection.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
              {demands.map((demand) => (
                <div key={demand.id} style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '12px', backgroundColor: '#0284c7', padding: '2px 8px', borderRadius: '4px', color: '#fff', fontWeight: 'bold' }}>{demand.company}</span>
                      <h3 style={{ margin: '8px 0 4px 0', fontSize: '17px' }}>{demand.crop}</h3>
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>📍 {demand.location}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#22c55e' }}>₹{demand.pricePerKg}/kg</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Procurement Rate</div>
                    </div>
                  </div>

                  {/* Company Quality Guidelines */}
                  <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px', fontSize: '12px', margin: '14px 0', border: '1px solid #1e293b' }}>
                    <div style={{ fontWeight: 'bold', color: '#cbd5e1', marginBottom: '6px' }}>📋 Quality Guidelines:</div>
                    <div style={{ color: '#94a3b8' }}>• Moisture: {demand.guidelines.moisture}</div>
                    <div style={{ color: '#94a3b8' }}>• Pesticide Limit: {demand.guidelines.pesticide}</div>
                    <div style={{ color: '#94a3b8' }}>• Required Grade: {demand.guidelines.grade}</div>
                  </div>

                  {/* Target Fulfilled Progress Bar */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span>Target Needed: <strong>{demand.totalQuantityTons} Tons</strong></span>
                      <span style={{ color: '#22c55e' }}>Fulfilled: <strong>{demand.fulfilledTons} Tons</strong></span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${(demand.fulfilledTons / demand.totalQuantityTons) * 100}%`, height: '100%', backgroundColor: '#22c55e' }}></div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => setSelectedDemand(demand)}
                      style={{ flex: 1, backgroundColor: '#22c55e', color: '#000', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                      📅 Book Supply Slot
                    </button>
                    <button 
                      onClick={() => alert(`Direct Procurement Officer Contact: ${demand.officerContact}`)}
                      style={{ backgroundColor: '#334155', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
                      📞 Contact
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION B: DIRECT FARMER MARKETPLACE */}
        {(activeTab === 'Crops' || activeTab === 'Farmer Seeds' || activeTab === 'Equipment Rentals' || (activeTab === 'All Market' && activeSubTab === 'all-market')) && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', margin: 0 }}>DIRECT FARMER MARKETPLACE</h2>
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>Showing 3 Products</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {[
                { tag: 'F2F SEED', title: 'A-Grade Hybrid Wheat Seed (Lok-1 Desi)', seller: 'Patel Organic Farms', upi: 'patelfarms@upi', price: 35, unit: '/ kg', transport: 120, dist: '15 km', icon: '🌾' },
                { tag: 'VEGETABLE', title: 'Fresh Desi Red Tomatoes (A-Grade)', seller: 'Vikram Singh', upi: 'vikram.singh@upi', price: 26, unit: '/ kg', transport: 176, dist: '22 km', icon: '🍅' },
                { tag: 'MACHINERY', title: 'Mahindra 575 DI Harvester Rental', seller: 'Suresh Verma', upi: 'sureshverma@upi', price: 1100, unit: '/ hr', transport: 80, dist: '10 km', icon: '🚜' }
              ].map((item, idx) => (
                <div key={idx} style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '16px', border: '1px solid #334155' }}>
                  <div style={{ height: '150px', backgroundColor: '#334155', borderRadius: '8px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#16a34a', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px' }}>
                      {item.tag}
                    </span>
                    {item.icon}
                  </div>

                  <h3 style={{ fontSize: '16px', margin: '0 0 8px 0', color: '#fff' }}>{item.title}</h3>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#22c55e', marginBottom: '12px' }}>
                    ₹{item.price} <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'normal' }}>{item.unit}</span>
                  </div>

                  <div style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: '6px', fontSize: '12px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', marginBottom: '4px' }}>
                      <span>Seller:</span>
                      <strong>{item.seller}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '6px' }}>
                      <span>Seller UPI:</span>
                      <span>{item.upi}</span>
                    </div>
                    <div style={{ borderTop: '1px dashed #334155', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                      <span>🚚 Transport ({item.dist}):</span>
                      <strong>₹{item.transport}</strong>
                    </div>
                  </div>

                  <button 
                    onClick={() => setCheckoutItem({ title: item.title, seller: item.seller, upi: item.upi, price: item.price, transport: item.transport })}
                    style={{ width: '100%', backgroundColor: '#22c55e', color: '#000', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                    Buy Now & Pay via UPI App
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION C: ORDER TRACKING & HISTORY */}
        {activeTab === 'Track Orders & Returns' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 4px 0' }}>ORDER TRACKING & HISTORY</h1>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>Track shipment, seller UPI details, and manage cancellations/returns.</p>
            </div>

            {orders.map((order) => (
              <div key={order.id} style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden', marginBottom: '24px' }}>
                
                {/* Header Bar */}
                <div style={{ backgroundColor: '#0f172a', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
                  <div style={{ fontSize: '14px' }}>
                    <span>Order ID: <strong style={{ color: '#22c55e' }}>{order.id}</strong></span>
                    <span style={{ marginLeft: '16px', color: '#94a3b8' }}>Date: <strong>{order.date}</strong></span>
                  </div>
                  <div>
                    {order.status === 'CANCELLED' ? (
                      <span style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '4px' }}>CANCELLED</span>
                    ) : (
                      <button 
                        onClick={() => setCancellingOrderId(order.id)}
                        style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
                  
                  {/* Left Column */}
                  <div>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                      <div style={{ width: '80px', height: '80px', backgroundColor: '#b45309', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🌾</div>
                      <div>
                        <h3 style={{ margin: '0 0 6px 0', fontSize: '16px' }}>{order.title}</h3>
                        <div style={{ fontSize: '13px', color: '#cbd5e1' }}>Seller: <strong>{order.seller}</strong></div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>Seller UPI: {order.sellerUpi}</div>
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#0f172a', borderRadius: '8px', padding: '16px', border: '1px solid #1e293b' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '12px', color: '#cbd5e1' }}>Verified Payment Breakdown:</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                        <span>Item Price:</span>
                        <span>₹{order.itemPrice}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', marginBottom: '10px' }}>
                        <span>Cheapest Transport:</span>
                        <span>₹{order.transportCost}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', color: '#fff', borderTop: '1px dashed #334155', paddingTop: '10px' }}>
                        <span>Total Paid:</span>
                        <span>₹{order.totalPaid}</span>
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#451a03', border: '1px solid #78350f', padding: '12px', borderRadius: '8px', marginTop: '16px', fontSize: '13px', color: '#fde68a' }}>
                      ⏱️ <strong>Seller Promised Delivery:</strong><br />
                      {order.promisedDelivery} (Promised by Seller)
                    </div>
                  </div>

                  {/* Right Column: Tracking Timeline */}
                  <div style={{ borderLeft: '1px solid #334155', paddingLeft: '30px' }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#94a3b8', letterSpacing: '0.5px' }}>LIVE TRACKING TIMELINE</h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                        <span style={{ color: '#22c55e', fontSize: '18px' }}>✓</span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Payment Confirmed & Order Placed</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Just Now</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', opacity: order.status === 'CANCELLED' ? 0.4 : 1 }}>
                        <span style={{ color: order.status === 'CONFIRMED' ? '#64748b' : '#22c55e', fontSize: '16px' }}>2</span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Packed & Verified by Seller</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Pending</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', opacity: order.status === 'CANCELLED' ? 0.4 : 1 }}>
                        <span style={{ color: '#64748b', fontSize: '16px' }}>3</span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Dispatched via Local Transport</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Pending</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', opacity: order.status === 'CANCELLED' ? 0.4 : 1 }}>
                        <span style={{ color: '#64748b', fontSize: '16px' }}>4</span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Out for Local Delivery</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Pending</div>
                        </div>
                      </div>

                      {order.status === 'CANCELLED' && (
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', borderTop: '1px dashed #334155', paddingTop: '14px' }}>
                          <span style={{ color: '#ef4444', fontSize: '18px' }}>✓</span>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ef4444' }}>
                              Order Cancelled ({order.cancelReason})
                            </div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Just Now</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* SECTION D: AI CROP DOCTOR & VISION QUALITY INSPECTION */}
        {activeTab === 'AI Crop Doctor' && (
          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid #334155' }}>
            <h2>✨ AI Crop Doctor & Quality Inspection (Gemini Vision)</h2>
            <p style={{ color: '#94a3b8' }}>Upload crop photo for automated quality assessment and disease diagnosis.</p>

            <div style={{ border: '2px dashed #475569', borderRadius: '8px', padding: '30px', textAlign: 'center', marginBottom: '20px' }}>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="crop-upload" />
              <label htmlFor="crop-upload" style={{ backgroundColor: '#22c55e', color: '#000', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-block' }}>
                📸 Upload Crop Photo for Inspection
              </label>

              {aiImagePreview && (
                <div style={{ marginTop: '20px' }}>
                  <img src={aiImagePreview} alt="Crop Preview" style={{ maxHeight: '200px', borderRadius: '8px' }} />
                </div>
              )}
            </div>

            {aiInspectionResult && (
              <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid #22c55e', color: '#4ade80' }}>
                <strong>AI Inspection Status:</strong>
                <div>{aiInspectionResult}</div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* --- MODAL 1: MYNTRA-STYLE DIRECT BUYER-SELLER UPI PAYMENT MODAL --- */}
      {checkoutItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', width: '450px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 12px 0' }}>Direct Peer Payment via UPI</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 16px 0' }}>
              Directly pay to Seller: <strong>{checkoutItem.seller}</strong> ({checkoutItem.upi})
            </p>

            <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>Produce Price:</span>
                <span>₹{checkoutItem.price}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>Transport Pickup Fee:</span>
                <span>₹{checkoutItem.transport}</span>
              </div>
              <div style={{ borderTop: '1px solid #334155', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>Total Amount Payable:</span>
                <span style={{ color: '#22c55e' }}>₹{checkoutItem.price + checkoutItem.transport}</span>
              </div>
            </div>

            <h4 style={{ fontSize: '14px', margin: '0 0 8px 0' }}>Select Payment App:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {['GPay', 'PhonePe', 'Paytm', 'UPI_ID'].map((method) => (
                <button
                  key={method}
                  onClick={() => setUpiPaymentMethod(method as any)}
                  style={{
                    backgroundColor: upiPaymentMethod === method ? '#22c55e' : '#0f172a',
                    color: upiPaymentMethod === method ? '#000' : '#fff',
                    border: '1px solid #334155',
                    padding: '10px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {method}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setCheckoutItem(null)} style={{ flex: 1, backgroundColor: '#334155', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleExecutePayment} style={{ flex: 1, backgroundColor: '#22c55e', color: '#000', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Pay & Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: B2B CONTRACT SLOT BOOKING MODAL --- */}
      {selectedDemand && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', width: '420px', border: '1px solid #334155' }}>
            <h3>Book Supply Slot & Sign Contract</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>Company: <strong>{selectedDemand.company}</strong> ({selectedDemand.crop})</p>

            <form onSubmit={handleSlotBookingSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>Supply Quantity (in Tons):</label>
                <input 
                  type="number" 
                  min="1" 
                  max={selectedDemand.totalQuantityTons - selectedDemand.fulfilledTons}
                  value={slotQuantity} 
                  onChange={(e) => setSlotQuantity(Number(e.target.value))}
                  style={{ width: '100%', padding: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }} 
                />
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px', fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>
                🔒 Payment Terms: Advances via Escrow Protection, Balance paid post-quality check at drop-off.
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setSelectedDemand(null)} style={{ flex: 1, backgroundColor: '#334155', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ flex: 1, backgroundColor: '#22c55e', color: '#000', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Sign Digital Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: CANCEL ORDER MODAL --- */}
      {cancellingOrderId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', width: '400px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Cancel Order</h3>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px 0' }}>Please select a valid reason for cancelling this order.</p>

            <form onSubmit={confirmOrderCancellation}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px' }}>Select Reason:</label>
                <select 
                  value={cancelReason} 
                  onChange={(e) => setCancelReason(e.target.value)}
                  style={{ width: '100%', padding: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}
                >
                  <option value="Ordered by Mistake">Ordered by Mistake</option>
                  <option value="Delivery Date Too Late">Delivery Date Too Late</option>
                  <option value="Found Better Local Price">Found Better Local Price</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button type="button" onClick={() => setCancellingOrderId(null)} style={{ flex: 1, backgroundColor: '#475569', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}>
                  Back
                </button>
                <button type="submit" style={{ flex: 1, backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING AI DOCTOR BUTTON */}
      <button 
        onClick={() => setShowAiDoctor(!showAiDoctor)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#22c55e',
          color: '#000',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '30px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 99
        }}
      >
        <span>🤖</span> Ask AI Doctor
      </button>

    </div>
  );
}