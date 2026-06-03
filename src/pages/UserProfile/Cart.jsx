import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import { API } from "../../api";

const SECRET_KEY    = "midnightaura_secret_key";
const BASE_URL      = "http://localhost:8008";
const DELIVERY_RATE = 0.08;

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");
const imgUrl = (path) => path ? (path.startsWith("/") ? `${BASE_URL}${path}` : path) : null;
const encodeProductId = (id) => encodeURIComponent(CryptoJS.AES.encrypt(String(id), SECRET_KEY).toString());
const getStoredEmail = () => {
  try { const s = localStorage.getItem("user"); if (s) { const p = JSON.parse(s); if (p?.email) return p.email; } } catch (_) {}
  try { const c = Cookies.get("user"); if (c) { const p = JSON.parse(c); if (p?.email) return p.email; } } catch (_) {}
  return null;
};

// ── Image Lightbox ────────────────────────────────────────────────────────────
function ImageLightbox({ images, startIndex = 0, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const touchX = useRef(null);
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowLeft") prev(); if (e.key === "ArrowRight") next(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);
  const onTS = (e) => { touchX.current = e.touches[0].clientX; };
  const onTE = (e) => { if (!touchX.current) return; const d = touchX.current - e.changedTouches[0].clientX; if (Math.abs(d) > 40) d > 0 ? next() : prev(); touchX.current = null; };
  return createPortal(
    <div style={{ position:"fixed",inset:0,zIndex:999999,background:"rgba(0,0,0,0.95)",backdropFilter:"blur(20px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }} onClick={onClose}>
      <button onClick={onClose} style={{ position:"absolute",top:16,right:16,width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1,fontSize:16 }}>✕</button>
      <p style={{ position:"absolute",top:20,left:"50%",transform:"translateX(-50%)",color:"rgba(255,255,255,0.45)",fontSize:12,letterSpacing:"0.1em" }}>{idx+1} / {images.length}</p>
      <div style={{ width:"100%",height:"100dvh",display:"flex",alignItems:"center",justifyContent:"center" }} onClick={(e)=>e.stopPropagation()} onTouchStart={onTS} onTouchEnd={onTE}>
        <img src={imgUrl(images[idx])} alt="" style={{ maxHeight:"100dvh",maxWidth:"100%",objectFit:"contain",userSelect:"none",display:"block" }} draggable={false} />
      </div>
      {images.length > 1 && (<>
        <button onClick={(e)=>{e.stopPropagation();prev();}} style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",width:38,height:38,borderRadius:"50%",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.18)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>
        <button onClick={(e)=>{e.stopPropagation();next();}} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",width:38,height:38,borderRadius:"50%",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.18)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></button>
        <div style={{ position:"absolute",bottom:20,display:"flex",gap:6 }}>
          {images.map((_,i)=>(<div key={i} onClick={(e)=>{e.stopPropagation();setIdx(i);}} style={{ width:i===idx?20:7,height:7,borderRadius:99,background:i===idx?"#a78bfa":"rgba(255,255,255,0.25)",cursor:"pointer",transition:"all 0.2s" }} />))}
        </div>
      </>)}
    </div>, document.body
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ background:"linear-gradient(145deg,rgba(21,23,35,0.85),rgba(14,19,32,0.95))",border:"1px solid rgba(255,255,255,0.06)",borderRadius:18,padding:16,display:"flex",gap:14 }}>
      <div style={{ width:90,height:90,borderRadius:14,background:"rgba(255,255,255,0.05)",flexShrink:0,animation:"shimmer 1.5s ease-in-out infinite" }} />
      <div style={{ flex:1,display:"flex",flexDirection:"column",gap:9,paddingTop:4 }}>
        {[60,40,50,35].map((w,i)=>(<div key={i} style={{ height:9,width:`${w}%`,borderRadius:5,background:"rgba(255,255,255,0.05)",animation:"shimmer 1.5s ease-in-out infinite" }} />))}
      </div>
    </div>
  );
}

// ── Cart Item Card ────────────────────────────────────────────────────────────
function CartItemCard({ item, onRemove, onQtyChange, removing, qtyLoading }) {
  const navigate = useNavigate();
  const [stockMessage, setStockMessage] = useState("");
  const [lightbox, setLightbox] = useState(null);
  const p = item.product;
  const images = p?.images?.length ? p.images : (p?.thumbnail ? [p.thumbnail] : []);
  const thumb = p?.thumbnail;
  const unitPrice = p?.finalPrice || 0;
  const mrp = p?.mrp || 0;
  const discount = p?.discount || 0;
  const lineTotal = unitPrice * item.quantity;
  const lineMrp = mrp * item.quantity;
  const lineSaving = lineMrp - lineTotal;
  const maxQty = item.size && p?.sizeStock?.[item.size] ? Math.min(p.sizeStock[item.size],10) : Math.min(p?.totalStock||10,10);

  const handleQtyIncrease = () => {
    if (item.quantity >= maxQty) { setStockMessage(`Only ${maxQty} items available in stock`); setTimeout(()=>setStockMessage(""),2500); return; }
    onQtyChange(item.cartId, item.quantity+1);
  };
  const handleBuyNow = (e) => { e.stopPropagation(); if (p?.productId) navigate(`/product-view/${encodeProductId(p.productId)}`); };

  return (
    <>
      <div style={{ background:"linear-gradient(145deg,rgba(21,23,35,0.88) 0%,rgba(11,15,26,0.95) 100%)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:18,overflow:"hidden",backdropFilter:"blur(24px)",boxShadow:"0 4px 24px rgba(0,0,0,0.28),inset 0 1px 0 rgba(255,255,255,0.04)" }}>
        <div style={{ padding:"10px 10px 8px",display:"flex",gap:10,alignItems:"flex-start" }}>
          <div onClick={()=>images.length&&setLightbox(0)} style={{ width:90,height:90,borderRadius:14,overflow:"hidden",flexShrink:0,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",cursor:images.length?"zoom-in":"default",position:"relative" }}>
            {thumb ? <img src={imgUrl(thumb)} alt={p?.name} style={{ width:"100%",height:"100%",objectFit:"cover" }} /> : <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,0.15)",fontSize:9 }}>No img</div>}
            {images.length>1 && <div style={{ position:"absolute",bottom:5,right:5,background:"rgba(0,0,0,0.65)",borderRadius:5,padding:"2px 6px",fontSize:8,color:"rgba(255,255,255,0.7)",fontWeight:700 }}>+{images.length-1}</div>}
          </div>
          <div style={{ flex:1,minWidth:0 }}>
            <p style={{ color:"#f0f0f5",fontSize:13.5,fontWeight:600,lineHeight:1.35,marginBottom:4,fontFamily:"'Poppins',sans-serif" }}>{p?.name||"Product Unavailable"}</p>
            <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:7 }}>
              {item.size && <span style={{ background:"rgba(139,92,246,0.12)",border:"1px solid rgba(139,92,246,0.3)",color:"#c4b5fd",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99 }}>Size: {item.size}</span>}
              {p?.category && <span style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.4)",fontSize:10,padding:"2px 8px",borderRadius:99 }}>{p.category}{p.subCategory?` · ${p.subCategory}`:""}</span>}
              {p?.color && <span style={{ display:"flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.45)",fontSize:10,padding:"2px 8px",borderRadius:99 }}><span style={{ width:8,height:8,borderRadius:"50%",background:p.color.hex||"#888",flexShrink:0 }} />{p.color.name}</span>}
            </div>
            <div style={{ display:"flex",alignItems:"baseline",gap:7,flexWrap:"wrap" }}>
              <span style={{ color:"#4ade80",fontWeight:700,fontSize:16,fontFamily:"'Poppins',sans-serif" }}>{fmt(lineTotal)}</span>
              {discount>0 && (<><span style={{ color:"rgba(255,255,255,0.3)",fontSize:11,textDecoration:"line-through" }}>{fmt(lineMrp)}</span><span style={{ color:"#4ade80",fontSize:10,fontWeight:700,background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.2)",padding:"1px 6px",borderRadius:99 }}>{discount}% off</span></>)}
            </div>
            {discount>0 && <p style={{ color:"rgba(74,222,128,0.7)",fontSize:10,marginTop:2 }}>You save {fmt(lineSaving)} on this item</p>}
          </div>
        </div>
        <div style={{ padding:"0 10px 8px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap" }}>
          <div style={{ display:"flex",alignItems:"center",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,overflow:"hidden" }}>
            <button disabled={item.quantity<=1||qtyLoading} onClick={()=>onQtyChange(item.cartId,item.quantity-1)} style={{ width:34,height:32,display:"flex",alignItems:"center",justifyContent:"center",background:"none",border:"none",color:item.quantity<=1?"rgba(255,255,255,0.2)":"#c4b5fd",cursor:item.quantity<=1?"not-allowed":"pointer",fontSize:16,fontWeight:700 }}>−</button>
            <span style={{ minWidth:32,textAlign:"center",color:"#f0f0f5",fontSize:13,fontWeight:700,borderLeft:"1px solid rgba(255,255,255,0.08)",borderRight:"1px solid rgba(255,255,255,0.08)",padding:"0 4px",lineHeight:"32px" }}>{qtyLoading?"…":item.quantity}</span>
            <button onClick={handleQtyIncrease} style={{ width:34,height:32,display:"flex",alignItems:"center",justifyContent:"center",background:"none",border:"none",color:item.quantity>=maxQty?"rgba(255,255,255,0.2)":"#c4b5fd",cursor:item.quantity>=maxQty?"not-allowed":"pointer",fontSize:16,fontWeight:700 }}>+</button>
          </div>
          <span style={{ color:"rgba(255,255,255,0.28)",fontSize:10 }}>{fmt(unitPrice)} × {item.quantity}</span>
          <div style={{ display:"flex",gap:7,marginLeft:"auto" }}>
            <button onClick={()=>onRemove(item.cartId)} disabled={removing} style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:9,background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.22)",color:"#f87171",cursor:removing?"not-allowed":"pointer",fontSize:11,fontWeight:600,opacity:removing?0.5:1 }}>
              {removing?<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation:"spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>:<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>}
              Remove
            </button>
            <button onClick={handleBuyNow} style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:9,background:"rgba(250,204,21,0.12)",border:"1px solid rgba(250,204,21,0.3)",color:"#facc15",cursor:"pointer",fontSize:11,fontWeight:700 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Buy Now
            </button>
          </div>
        </div>
        {stockMessage && <div style={{ color:"#facc15",fontSize:11,marginTop:2,marginLeft:14,marginBottom:8,fontWeight:600 }}>{stockMessage}</div>}
      </div>
      {lightbox!==null && images.length>0 && <ImageLightbox images={images} startIndex={lightbox} onClose={()=>setLightbox(null)} />}
    </>
  );
}

// ── Confirm Clear Modal ───────────────────────────────────────────────────────
function ConfirmClearModal({ onConfirm, onCancel, clearing }) {
  return createPortal(
    <div style={{ position:"fixed",inset:0,zIndex:99999,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px" }} onClick={onCancel}>
      <div onClick={(e)=>e.stopPropagation()} style={{ background:"linear-gradient(145deg,rgba(21,23,35,0.98),rgba(11,15,26,0.99))",border:"1px solid rgba(239,68,68,0.2)",borderRadius:20,padding:"28px 24px",width:"100%",maxWidth:340,boxShadow:"0 20px 60px rgba(0,0,0,0.6)",animation:"fadeUp 0.2s ease" }}>
        <div style={{ width:48,height:48,borderRadius:14,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </div>
        <h2 style={{ color:"#f0f0f5",fontSize:16,fontWeight:800,textAlign:"center",margin:"0 0 8px",fontFamily:"'Poppins',sans-serif" }}>Clear entire cart?</h2>
        <p style={{ color:"rgba(255,255,255,0.4)",fontSize:12.5,textAlign:"center",margin:"0 0 24px",lineHeight:1.55 }}>All items will be removed from your cart. This action cannot be undone.</p>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={onCancel} disabled={clearing} style={{ flex:1,padding:"11px 0",borderRadius:11,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.6)",cursor:"pointer",fontSize:13,fontWeight:600 }}>Cancel</button>
          <button onClick={onConfirm} disabled={clearing} style={{ flex:1,padding:"11px 0",borderRadius:11,background:clearing?"rgba(239,68,68,0.2)":"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.35)",color:"#f87171",cursor:clearing?"not-allowed":"pointer",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
            {clearing?<><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation:"spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Clearing…</>:<>Clear All</>}
          </button>
        </div>
      </div>
    </div>, document.body
  );
}

// ── Address Banner ────────────────────────────────────────────────────────────
function AddressBanner({ address }) {
  if (!address) return null;
  const line = [address.addressLine1,address.addressLine2,address.city,address.state,address.pincode].filter(Boolean).join(", ");
  return (
    <div style={{ background:"linear-gradient(135deg,rgba(21,23,35,0.85),rgba(14,19,32,0.95))",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"flex-start",gap:10 }}>
      <div style={{ width:30,height:30,borderRadius:9,background:"rgba(139,92,246,0.12)",border:"1px solid rgba(139,92,246,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
      <div style={{ flex:1 }}>
        <p style={{ color:"rgba(255,255,255,0.4)",fontSize:9,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2 }}>
          Deliver to: <span style={{ color:"#c4b5fd" }}>{address.name||"Home"}</span>
          {address.type && <span style={{ marginLeft:6,background:"rgba(139,92,246,0.15)",border:"1px solid rgba(139,92,246,0.3)",color:"#a78bfa",padding:"1px 7px",borderRadius:99,fontSize:8,fontWeight:700 }}>{address.type.toUpperCase()}</span>}
        </p>
        <p style={{ color:"rgba(255,255,255,0.55)",fontSize:11.5,lineHeight:1.45 }}>{line}</p>
      </div>
    </div>
  );
}

// ── Price Summary ─────────────────────────────────────────────────────────────
function PriceSummary({ summary, onPlaceOrder }) {
  const { subtotal, totalDiscount, deliveryCharge, totalAmount, totalItems } = summary;
  const rows = [
    { label:`MRP (${totalItems} item${totalItems>1?"s":""})`, value:fmt(subtotal), valueColor:"#f0f0f5" },
    { label:"Discount", value:`− ${fmt(totalDiscount)}`, valueColor:"#4ade80" },
    { label:"Delivery Charges (8%)", value:fmt(deliveryCharge), valueColor:"#f0f0f5" },
  ];
  return (
    <div style={{ background:"linear-gradient(145deg,rgba(21,23,35,0.88),rgba(11,15,26,0.95))",border:"1px solid rgba(255,255,255,0.07)",borderRadius:18,overflow:"hidden",backdropFilter:"blur(24px)" }}>
      <div style={{ padding:"16px 18px 0" }}>
        <p style={{ color:"rgba(255,255,255,0.35)",fontSize:9,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:14 }}>Price Details</p>
        <div style={{ display:"flex",flexDirection:"column",gap:11 }}>
          {rows.map((r)=>(<div key={r.label} style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}><span style={{ color:"rgba(255,255,255,0.45)",fontSize:12.5 }}>{r.label}</span><span style={{ color:r.valueColor,fontSize:12.5,fontWeight:600 }}>{r.value}</span></div>))}
        </div>
        <div style={{ margin:"14px 0",height:1,background:"rgba(255,255,255,0.06)" }} />
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
          <span style={{ color:"#f0f0f5",fontSize:14,fontWeight:700 }}>Total Amount</span>
          <span style={{ color:"#f0f0f5",fontSize:15,fontWeight:800,fontFamily:"'Poppins',sans-serif" }}>{fmt(totalAmount)}</span>
        </div>
      </div>
      {totalDiscount>0 && <div style={{ margin:"0 18px 14px",padding:"8px 12px",borderRadius:10,background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.2)",textAlign:"center" }}><span style={{ color:"#4ade80",fontSize:11.5,fontWeight:700 }}>🎉 You'll save {fmt(totalDiscount)} on this order!</span></div>}
      <div style={{ padding:"0 18px 18px" }}>
        <button onClick={onPlaceOrder} style={{ width:"100%",padding:"13px 0",borderRadius:13,fontSize:15,fontWeight:800,background:"linear-gradient(135deg,#eab308,#ca8a04)",color:"#000",border:"none",cursor:"pointer",letterSpacing:"0.02em",boxShadow:"0 4px 20px rgba(234,179,8,0.35)",transition:"all 0.2s",fontFamily:"'Poppins',sans-serif" }}
          onMouseEnter={(e)=>{e.currentTarget.style.boxShadow="0 6px 28px rgba(234,179,8,0.5)";e.currentTarget.style.transform="translateY(-1px)";}}
          onMouseLeave={(e)=>{e.currentTarget.style.boxShadow="0 4px 20px rgba(234,179,8,0.35)";e.currentTarget.style.transform="translateY(0)";}}>
          Place Order
        </button>
      </div>
    </div>
  );
}

// ── Main Cart Page ────────────────────────────────────────────────────────────
export default function Cart() {
  const navigate = useNavigate();
  const [customerId,     setCustomerId]     = useState(null);
  const [cartItems,      setCartItems]      = useState([]);
  const [address,        setAddress]        = useState(null);
  const [summary,        setSummary]        = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [removing,       setRemoving]       = useState({});
  const [qtyLoading,     setQtyLoading]     = useState({});
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing,       setClearing]       = useState(false);

  useEffect(() => {
    const run = async () => {
      try { const email=getStoredEmail(); if (!email){setLoading(false);return;} const res=await API.post("/user/getProfile",{email}); if (res.data.success) setCustomerId(res.data.user?.customerId||null); }
      catch (err){ console.error("[Cart] fetchCustomerId:",err); setLoading(false); }
    };
    run();
  }, []);

  useEffect(() => { if (!customerId) return; fetchCart(); }, [customerId]); // eslint-disable-line

  const fetchCart = async () => {
    setLoading(true);
    try { const res=await API.get(`/cart/getCart/${customerId}`); if (res.data.success){setCartItems(res.data.data||[]);setAddress(res.data.address||null);setSummary(res.data.summary||null);} }
    catch (err){ console.error("[Cart] fetchCart:",err); }
    finally { setLoading(false); }
  };

  const recomputeSummary = useCallback((items) => {
    let subtotal=0,totalDiscount=0;
    items.forEach((item)=>{ const mrp=item.product?.mrp||0,price=item.product?.finalPrice||0; subtotal+=mrp*item.quantity; totalDiscount+=(mrp-price)*item.quantity; });
    const after=subtotal-totalDiscount, dc=Math.round(after*DELIVERY_RATE);
    setSummary({ subtotal:Math.round(subtotal),totalDiscount:Math.round(totalDiscount),deliveryCharge:dc,totalAmount:Math.round(after+dc),totalItems:items.length });
  }, []);

  const handleRemove = async (cartId) => {
    setRemoving((r)=>({...r,[cartId]:true}));
    try { const res=await API.delete(`/cart/remove/${cartId}`,{data:{customerId}}); if (res.data.success){const u=cartItems.filter((i)=>i.cartId!==cartId);setCartItems(u);recomputeSummary(u);} }
    catch (err){ console.error("[Cart] remove:",err); }
    finally { setRemoving((r)=>({...r,[cartId]:false})); }
  };

  const handleQtyChange = async (cartId, newQty) => {
    if (newQty<1) return;
    setQtyLoading((q)=>({...q,[cartId]:true}));
    const updated=cartItems.map((i)=>i.cartId===cartId?{...i,quantity:newQty}:i);
    setCartItems(updated); recomputeSummary(updated);
    try { await API.patch(`/cart/updateQuantity/${cartId}`,{customerId,quantity:newQty}); }
    catch (err){ console.error("[Cart] updateQty:",err); const r=cartItems.map((i)=>i.cartId===cartId?{...i,quantity:i.quantity}:i); setCartItems(r); recomputeSummary(r); }
    finally { setQtyLoading((q)=>({...q,[cartId]:false})); }
  };

  const handleClearCart = async () => {
    setClearing(true);
    try { const res=await API.delete("/cart/clearCart",{data:{customerId}}); if (res.data.success){setCartItems([]);setSummary(null);setShowClearModal(false);} }
    catch (err){ console.error("[Cart] clearCart:",err); }
    finally { setClearing(false); }
  };

  const handlePlaceOrder = () => navigate("/place-order");
  const isEmpty = !loading && cartItems.length === 0;

  return (
    /*
     * -mx-5 -mt-5  →  cancels the ProfileLayout mobile wrapper's p-5 padding
     *                  so the cart fills edge-to-edge on mobile.
     * md:mx-0 md:mt-0 → restores normal flow on desktop where the layout
     *                    uses a separate padded main pane (no card wrapper).
     */
    <div
      className="-mx-5 -mt-5 md:mx-0 md:mt-0"
      style={{ minHeight:"100%", padding:"0 0 30px", background:"transparent" }}
    >
      <style>{`
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing:border-box; }
      `}</style>

      {/* Header */}
      <div style={{ padding:"14px 16px 0", marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ color:"#f0f0f5",fontSize:20,fontWeight:800,margin:0,letterSpacing:"-0.02em",fontFamily:"'Poppins',sans-serif" }}>My Cart</h1>
            {!loading && summary && <p style={{ color:"rgba(255,255,255,0.35)",fontSize:11,marginTop:1 }}>{summary.totalItems} item{summary.totalItems!==1?"s":""}</p>}
          </div>
          {!loading && cartItems.length>0 && (
            <button onClick={()=>setShowClearModal(true)}
              style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 13px",borderRadius:10,background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.22)",color:"#f87171",cursor:"pointer",fontSize:11.5,fontWeight:700,transition:"all 0.18s" }}
              onMouseEnter={(e)=>{e.currentTarget.style.background="rgba(239,68,68,0.14)";e.currentTarget.style.borderColor="rgba(239,68,68,0.38)";}}
              onMouseLeave={(e)=>{e.currentTarget.style.background="rgba(239,68,68,0.07)";e.currentTarget.style.borderColor="rgba(239,68,68,0.22)";}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              Clear Cart
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding:"0 12px" }}>
        {loading && (
          <div style={{ display:"flex",flexDirection:"column",gap:12,animation:"fadeUp 0.3s ease" }}>
            {[1,2,3].map((i)=><SkeletonCard key={i} />)}
          </div>
        )}

        {isEmpty && (
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",paddingTop:80,gap:16,animation:"fadeUp 0.3s ease" }}>
            <div style={{ width:72,height:72,borderRadius:20,background:"rgba(139,92,246,0.09)",border:"1px solid rgba(139,92,246,0.2)",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <p style={{ color:"rgba(255,255,255,0.65)",fontSize:15,fontWeight:600 }}>Your cart is empty</p>
            <p style={{ color:"rgba(255,255,255,0.28)",fontSize:12 }}>Add items to get started</p>
            <button onClick={()=>navigate("/user/dashboard")} style={{ marginTop:8,padding:"10px 28px",borderRadius:99,background:"linear-gradient(135deg,#7c3aed,#6d28d9)",color:"#fff",border:"none",cursor:"pointer",fontSize:13,fontWeight:700,boxShadow:"0 4px 18px rgba(124,58,237,0.35)" }}>Start Shopping</button>
          </div>
        )}

        {!loading && cartItems.length>0 && (
          <div style={{ display:"flex",flexDirection:"column",gap:12,animation:"fadeUp 0.3s ease" }}>
            {address && <AddressBanner address={address} />}
            {cartItems.map((item)=>(
              <CartItemCard key={item.cartId} item={item} onRemove={handleRemove} onQtyChange={handleQtyChange} removing={!!removing[item.cartId]} qtyLoading={!!qtyLoading[item.cartId]} />
            ))}
            {summary && <PriceSummary summary={summary} onPlaceOrder={handlePlaceOrder} />}
            <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"10px 0 4px",opacity:0.45 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span style={{ color:"rgba(255,255,255,0.45)",fontSize:10.5 }}>Safe & secure payments · 100% authentic products</span>
            </div>
          </div>
        )}
      </div>

      {showClearModal && <ConfirmClearModal onConfirm={handleClearCart} onCancel={()=>setShowClearModal(false)} clearing={clearing} />}
    </div>
  );
}