// ListingProducts.jsx
import { useState, useRef, useCallback, useEffect } from "react";

const SIZE_ONLY_CATEGORIES = ["Hoodies", "Oversized"];
const CLOTHING_CATEGORIES  = ["Men", "Women", "Kids"];
const ALL_CATEGORIES       = ["Men", "Women", "Kids", "Earrings", "Necklaces", "Oversized", "Hoodies"];

const SUB_CATEGORIES = {
  Men:   ["T-Shirt", "Jeans"],
  Women: ["T-Shirt", "Top"],
  Kids:  ["T-Shirt", "Pant", "Shirt"],
};

const SIZES         = ["S", "M", "L", "XL", "XXL"];
const initSizeStock = () => SIZES.reduce((acc, s) => ({ ...acc, [s]: "" }), {});

const DISCOUNT_OPTIONS = [
  { label: "No Discount", value: 0 },
  { label: "10% Off",     value: 10 },
  { label: "50% Off",     value: 50 },
  { label: "75% Off",     value: 75 },
];

const DELIVERY_OPTIONS = [
  "Tomorrow",
  "Within 3 Days",
  "Within 5 Days",
  "Within 10 Days",
];

const PRODUCT_COLORS = [
  { name: "Black",     hex: "#111111" }, { name: "White",     hex: "#f5f5f5" },
  { name: "Navy Blue", hex: "#1e3a5f" }, { name: "Royal Blue",hex: "#2563eb" },
  { name: "Sky Blue",  hex: "#38bdf8" }, { name: "Teal",      hex: "#0d9488" },
  { name: "Green",     hex: "#16a34a" }, { name: "Olive",     hex: "#65a30d" },
  { name: "Yellow",    hex: "#eab308" }, { name: "Orange",    hex: "#ea580c" },
  { name: "Red",       hex: "#dc2626" }, { name: "Maroon",    hex: "#7f1d1d" },
  { name: "Pink",      hex: "#ec4899" }, { name: "Purple",    hex: "#9333ea" },
  { name: "Lavender",  hex: "#c4b5fd" }, { name: "Brown",     hex: "#92400e" },
  { name: "Beige",     hex: "#d4b896" }, { name: "Grey",      hex: "#6b7280" },
  { name: "Charcoal",  hex: "#374151" }, { name: "Off White", hex: "#faf7f2" },
  { name: "Cream",     hex: "#fef3c7" }, { name: "Mint",      hex: "#6ee7b7" },
  { name: "Coral",     hex: "#fb7185" }, { name: "Mustard",   hex: "#ca8a04" },
];

const INITIAL_PRODUCTS = [
  { id:"MA001", name:"Uchiha Itachi Tee",  category:"Men",      subCategory:"T-Shirt", price:799,  discount:0,  delivery:"Within 3 Days", stock:142, status:"Active", sizeStock:{S:30,M:40,L:42,XL:20,XXL:10}, color:null, images:[null,null,null], details:[{field:"Material",value:"100% Cotton"},{field:"Fit",value:"Regular"}] },
  { id:"MA002", name:"Moon Aura Tee",       category:"Men",      subCategory:"Jeans",   price:749,  discount:10, delivery:"Tomorrow",      stock:98,  status:"Active", sizeStock:{S:20,M:28,L:30,XL:15,XXL:5 }, color:null, images:[null,null,null], details:[{field:"Material",value:"Denim"},{field:"Fit",value:"Slim"}] },
  { id:"MA003", name:"Tokyo Drift Tee",     category:"Men",      subCategory:"T-Shirt", price:799,  discount:0,  delivery:"Within 5 Days", stock:0,   status:"Out",    sizeStock:{S:0, M:0, L:0, XL:0, XXL:0 }, color:null, images:[null,null,null], details:[{field:"Material",value:"Polyester"},{field:"Fit",value:"Regular"}] },
  { id:"MA004", name:"Shadow Hunter Tee",   category:"Men",      subCategory:"Jeans",   price:849,  discount:50, delivery:"Within 3 Days", stock:56,  status:"Active", sizeStock:{S:10,M:16,L:18,XL:8, XXL:4 }, color:null, images:[null,null,null], details:[{field:"Material",value:"Cotton Blend"},{field:"Fit",value:"Regular"}] },
  { id:"MA005", name:"Neon Ghost Hoodie",   category:"Hoodies",  subCategory:null,      price:1299, discount:0,  delivery:"Within 5 Days", stock:34,  status:"Active", sizeStock:{S:8, M:10,L:10,XL:4, XXL:2 }, color:null, images:[null,null,null], details:[{field:"Material",value:"Fleece"},{field:"Style",value:"Pullover"}] },
  { id:"MA006", name:"Astral Wave Hoodie",  category:"Hoodies",  subCategory:null,      price:1399, discount:10, delivery:"Within 3 Days", stock:12,  status:"Low",    sizeStock:{S:2, M:4, L:3, XL:2, XXL:1 }, color:null, images:[null,null,null], details:[{field:"Material",value:"Fleece"},{field:"Style",value:"Zip-Up"}] },
  { id:"MA007", name:"Lunar Drop Earrings", category:"Earrings", subCategory:null,      price:349,  discount:0,  delivery:"Tomorrow",      stock:200, status:"Active", sizeStock:null,                           color:null, images:[null,null,null], details:[{field:"Material",value:"Sterling Silver"},{field:"Weight",value:"5g"}] },
  { id:"MA008", name:"Void Chain Necklace", category:"Necklaces",subCategory:null,      price:499,  discount:75, delivery:"Within 10 Days",stock:0,   status:"Out",    sizeStock:null,                           color:null, images:[null,null,null], details:[{field:"Material",value:"Gold Plated"},{field:"Length",value:"18 inch"}] },
  { id:"MA009", name:"Oversized Kanji Tee", category:"Oversized",subCategory:null,      price:899,  discount:0,  delivery:"Within 3 Days", stock:67,  status:"Active", sizeStock:{S:15,M:20,L:18,XL:10,XXL:4},  color:null, images:[null,null,null], details:[{field:"Material",value:"100% Cotton"},{field:"Fit",value:"Oversized"}] },
  { id:"MA010", name:"Aurora Crop Top",     category:"Women",    subCategory:"Top",     price:749,  discount:10, delivery:"Tomorrow",      stock:8,   status:"Low",    sizeStock:{S:2, M:3, L:2, XL:1, XXL:0 }, color:null, images:[null,null,null], details:[{field:"Material",value:"Rayon"},{field:"Style",value:"Crop"}] },
  { id:"MA011", name:"Sakura Blossom Tee",  category:"Women",    subCategory:"T-Shirt", price:699,  discount:0,  delivery:"Within 5 Days", stock:45,  status:"Active", sizeStock:{S:10,M:15,L:12,XL:6, XXL:2 }, color:null, images:[null,null,null], details:[{field:"Material",value:"Cotton"},{field:"Print",value:"Floral"}] },
  { id:"MA012", name:"Dragonball Hoodie",   category:"Hoodies",  subCategory:null,      price:1499, discount:50, delivery:"Within 3 Days", stock:22,  status:"Active", sizeStock:{S:5, M:8, L:6, XL:2, XXL:1 }, color:null, images:[null,null,null], details:[{field:"Material",value:"Fleece"},{field:"Print",value:"Graphic"}] },
  { id:"MA013", name:"Celestial Pendant",   category:"Necklaces",subCategory:null,      price:599,  discount:0,  delivery:"Within 10 Days",stock:80,  status:"Active", sizeStock:null,                           color:null, images:[null,null,null], details:[{field:"Material",value:"925 Silver"},{field:"Stone",value:"Zircon"}] },
  { id:"MA014", name:"Kids Dino Print Tee", category:"Kids",     subCategory:"T-Shirt", price:449,  discount:0,  delivery:"Within 5 Days", stock:55,  status:"Active", sizeStock:{S:15,M:20,L:12,XL:6, XXL:2 }, color:null, images:[null,null,null], details:[{field:"Material",value:"Soft Cotton"},{field:"Print",value:"Dino"}] },
  { id:"MA015", name:"Star Stud Earrings",  category:"Earrings", subCategory:null,      price:299,  discount:0,  delivery:"Tomorrow",      stock:0,   status:"Out",    sizeStock:null,                           color:null, images:[null,null,null], details:[{field:"Material",value:"Brass"},{field:"Finish",value:"Gold"}] },
];

const PRODUCTS_PER_PAGE = 10;

const STATUS_STYLES = {
  Active:{ bg:"rgba(34,197,94,0.12)",  color:"#4ade80", border:"rgba(34,197,94,0.3)"  },
  Low:   { bg:"rgba(234,179,8,0.12)",  color:"#fbbf24", border:"rgba(234,179,8,0.3)"  },
  Out:   { bg:"rgba(239,68,68,0.12)",  color:"#f87171", border:"rgba(239,68,68,0.3)"  },
};

function Badge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Active;
  return (
    <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, whiteSpace:"nowrap" }}>
      {status==="Out"?"Out of Stock":status==="Low"?"Low Stock":"Active"}
    </span>
  );
}

function computeStatus(stock, sizeStock) {
  const total = sizeStock ? Object.values(sizeStock).reduce((a,b)=>a+(Number(b)||0),0) : Number(stock)||0;
  if (total===0) return "Out";
  if (total<15)  return "Low";
  return "Active";
}

function nextId(products) {
  const nums = products.map(p=>parseInt(p.id.replace("MA",""))).filter(Boolean);
  return "MA"+String(nums.length?Math.max(...nums)+1:1).padStart(3,"0");
}

function discountedPrice(price, discount) {
  if (!discount) return price;
  return Math.round(price * (1 - discount / 100));
}

const needsSizes  = c => CLOTHING_CATEGORIES.includes(c)||SIZE_ONLY_CATEGORIES.includes(c);
const needsSubCat = c => CLOTHING_CATEGORIES.includes(c);

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ src, productName, onClose, images, initialIdx }) {
  const [visible, setVisible] = useState(false);
  const [idx, setIdx] = useState(initialIdx ?? 0);
  const validImages = images ? images.filter(Boolean) : (src ? [src] : []);
  const current = validImages[idx] || src;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") setIdx(i => (i - 1 + validImages.length) % validImages.length);
      if (e.key === "ArrowRight") setIdx(i => (i + 1) % validImages.length);
    };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [validImages.length]);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 240); };

  return (
    <div onClick={handleClose} style={{ position:"fixed", inset:0, zIndex:99999, background:visible?"rgba(0,0,0,0.96)":"rgba(0,0,0,0)", backdropFilter:visible?"blur(20px)":"blur(0px)", WebkitBackdropFilter:visible?"blur(20px)":"blur(0px)", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.24s ease, backdrop-filter 0.24s ease", cursor:"zoom-out" }}>
      <button onClick={e=>{e.stopPropagation();handleClose();}} style={{ position:"fixed", top:18, right:18, width:46, height:46, borderRadius:"50%", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", color:"#fff", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", zIndex:100000, transition:"background 0.15s, transform 0.15s", opacity:visible?1:0, transform:visible?"scale(1)":"scale(0.7)", backdropFilter:"blur(8px)" }} onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.18)";e.currentTarget.style.transform="scale(1.1)";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.08)";e.currentTarget.style.transform="scale(1)";}}>✕</button>

      {/* Left arrow */}
      {validImages.length > 1 && (
        <button onClick={e=>{e.stopPropagation();setIdx(i=>(i-1+validImages.length)%validImages.length);}}
          style={{ position:"fixed", left:18, top:"50%", transform:"translateY(-50%)", width:48, height:48, borderRadius:"50%", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.18)", color:"#fff", fontSize:22, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", zIndex:100000, backdropFilter:"blur(8px)", opacity:visible?1:0, transition:"opacity 0.2s,background 0.15s" }}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.22)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.1)"}>‹</button>
      )}
      {/* Right arrow */}
      {validImages.length > 1 && (
        <button onClick={e=>{e.stopPropagation();setIdx(i=>(i+1)%validImages.length);}}
          style={{ position:"fixed", right:18, top:"50%", transform:"translateY(-50%)", width:48, height:48, borderRadius:"50%", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.18)", color:"#fff", fontSize:22, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", zIndex:100000, backdropFilter:"blur(8px)", opacity:visible?1:0, transition:"opacity 0.2s,background 0.15s" }}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.22)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.1)"}>›</button>
      )}

      <div onClick={e=>e.stopPropagation()} style={{ position:"relative", maxWidth:"min(500px, 88vw)", maxHeight:"88vh", borderRadius:22, overflow:"hidden", boxShadow:"0 60px 160px rgba(0,0,0,0.95), 0 0 0 1px rgba(139,92,246,0.3)", transform:visible?"scale(1) translateY(0)":"scale(0.76) translateY(40px)", opacity:visible?1:0, transition:"transform 0.32s cubic-bezier(0.34,1.42,0.64,1), opacity 0.22s ease", cursor:"default" }}>
        <img src={current} alt={productName} style={{ width:"100%", height:"100%", objectFit:"contain", display:"block", maxHeight:"88vh" }}/>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"48px 22px 22px", background:"linear-gradient(transparent, rgba(0,0,0,0.88))" }}>
          <div style={{ color:"#fff", fontWeight:700, fontSize:16 }}>{productName}</div>
          {validImages.length > 1 && (
            <div style={{ display:"flex", gap:5, marginTop:8, justifyContent:"center" }}>
              {validImages.map((_,i) => (
                <button key={i} onClick={()=>setIdx(i)} style={{ width:i===idx?18:6, height:6, borderRadius:3, background:i===idx?"#a78bfa":"rgba(255,255,255,0.4)", border:"none", cursor:"pointer", padding:0, transition:"width 0.2s" }}/>
              ))}
            </div>
          )}
          <div style={{ color:"rgba(255,255,255,0.38)", fontSize:11, marginTop:6 }}>Press ESC or click outside to close</div>
        </div>
      </div>
    </div>
  );
}

// ─── Image Cropper ────────────────────────────────────────────────────────────
const CROP_RATIO = 3/4;
function ImageCropper({ src, onDone, onCancel }) {
  const containerRef = useRef(null);
  const imgRef       = useRef(null);
  const dragging     = useRef(false);
  const resizing     = useRef(null);
  const lastPos      = useRef({x:0,y:0});
  const [imgLoaded, setImgLoaded] = useState(false);
  const [crop,    setCrop]    = useState({ x:0,y:0,w:0,h:0 });
  const [natural, setNatural] = useState({ w:1,h:1 });
  const [display, setDisplay] = useState({ w:0,h:0,offX:0,offY:0 });
  const [containerSize, setContainerSize] = useState({ w:300, h:250 });

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setContainerSize({ w: Math.floor(width), h: Math.floor(width * 0.75) });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const handleImgLoad = useCallback((e) => {
    const img = e.target;
    setNatural({ w:img.naturalWidth, h:img.naturalHeight });
  }, []);

  useEffect(() => {
    if (natural.w === 1 && natural.h === 1) return;
    const maxW = containerSize.w, maxH = containerSize.h;
    let dispW = natural.w, dispH = natural.h;
    if (dispW > maxW) { dispH = dispH*(maxW/dispW); dispW = maxW; }
    if (dispH > maxH) { dispW = dispW*(maxH/dispH); dispH = maxH; }
    dispW = Math.round(dispW); dispH = Math.round(dispH);
    const offX = Math.round((maxW-dispW)/2);
    const offY = Math.round((maxH-dispH)/2);
    setDisplay({ w:dispW, h:dispH, offX, offY });
    const cw = dispW;
    const ch = Math.min(Math.round(cw/CROP_RATIO), dispH);
    setCrop({ x:offX, y:offY+Math.round((dispH-ch)/2), w:cw, h:ch });
    setImgLoaded(true);
  }, [containerSize, natural]);

  const getHandle = useCallback((mx,my,c) => {
    const hs=16;
    const handles=[{id:"tl",x:c.x,y:c.y},{id:"tr",x:c.x+c.w,y:c.y},{id:"bl",x:c.x,y:c.y+c.h},{id:"br",x:c.x+c.w,y:c.y+c.h}];
    for (const h of handles) if (Math.abs(mx-h.x)<hs&&Math.abs(my-h.y)<hs) return h.id;
    return null;
  }, []);

  const clamp=(v,mn,mx)=>Math.max(mn,Math.min(mx,v));
  const getEventPos=(e,rect)=>{
    if(e.touches){const t=e.touches[0];return{x:t.clientX-rect.left,y:t.clientY-rect.top};}
    return{x:e.clientX-rect.left,y:e.clientY-rect.top};
  };

  const onPointerDown=useCallback((e)=>{
    const rect=e.currentTarget.getBoundingClientRect();
    const{x:mx,y:my}=getEventPos(e,rect);
    const h=getHandle(mx,my,crop);
    if(h)resizing.current=h;
    else if(mx>=crop.x&&mx<=crop.x+crop.w&&my>=crop.y&&my<=crop.y+crop.h)dragging.current=true;
    lastPos.current={x:mx,y:my};e.preventDefault();
  },[crop,getHandle]);

  const onPointerMove=useCallback((e)=>{
    if(!dragging.current&&!resizing.current)return;
    const rect=e.currentTarget.getBoundingClientRect();
    const{x:mx,y:my}=getEventPos(e,rect);
    const dx=mx-lastPos.current.x,dy=my-lastPos.current.y;
    lastPos.current={x:mx,y:my};
    const{offX,offY,w:dw,h:dh}=display;
    const minX=offX,maxX=offX+dw,minY=offY,maxY=offY+dh;
    setCrop(prev=>{
      let{x,y,w,h}=prev;
      if(dragging.current){x=clamp(x+dx,minX,maxX-w);y=clamp(y+dy,minY,maxY-h);}
      else if(resizing.current){
        const r=resizing.current;let nx=x,ny=y,nw=w,nh=h;
        if(r==="br"){nw=clamp(w+dx,50,maxX-x);nh=Math.round(nw/CROP_RATIO);}
        if(r==="tr"){nw=clamp(w+dx,50,maxX-x);nh=Math.round(nw/CROP_RATIO);ny=clamp(y+h-nh,minY,y+h-50);}
        if(r==="bl"){nw=clamp(w-dx,50,x-minX+w);nx=clamp(x+dx,minX,x+w-50);nh=Math.round(nw/CROP_RATIO);}
        if(r==="tl"){nw=clamp(w-dx,50,x-minX+w);nx=clamp(x+dx,minX,x+w-50);nh=Math.round(nw/CROP_RATIO);ny=clamp(y+h-nh,minY,y+h-50);}
        if(nx<minX)nx=minX;if(ny<minY)ny=minY;
        if(nx+nw>maxX){nw=maxX-nx;nh=Math.round(nw/CROP_RATIO);}
        if(ny+nh>maxY){nh=maxY-ny;nw=Math.round(nh*CROP_RATIO);}
        x=nx;y=ny;w=nw;h=nh;
      }
      return{x,y,w,h};
    });e.preventDefault();
  },[display]);

  const onPointerUp=useCallback(()=>{dragging.current=false;resizing.current=null;},[]);

  const handleCrop=()=>{
    const img=imgRef.current;
    const{x,y,w,h}=crop;
    const{offX,offY,w:dw,h:dh}=display;
    const scaleX=natural.w/dw,scaleY=natural.h/dh;
    const canvas=document.createElement("canvas");
    canvas.width=Math.round(w*scaleX);canvas.height=Math.round(h*scaleY);
    canvas.getContext("2d").drawImage(img,(x-offX)*scaleX,(y-offY)*scaleY,w*scaleX,h*scaleY,0,0,canvas.width,canvas.height);
    onDone(canvas.toDataURL("image/jpeg",0.92));
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div ref={containerRef} style={{ position:"relative", width:"100%", height:containerSize.h, background:"#0d0b1e", borderRadius:12, overflow:"hidden", touchAction:"none", userSelect:"none" }}>
        <img ref={imgRef} src={src} alt="crop" onLoad={handleImgLoad} style={{ position:"absolute", left:display.offX, top:display.offY, width:display.w, height:display.h, display:"block", userSelect:"none", pointerEvents:"none" }}/>
        {imgLoaded&&(
          <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",cursor:"crosshair",touchAction:"none"}} onMouseDown={onPointerDown} onMouseMove={onPointerMove} onMouseUp={onPointerUp} onMouseLeave={onPointerUp} onTouchStart={onPointerDown} onTouchMove={onPointerMove} onTouchEnd={onPointerUp}>
            <defs><mask id="cropMask"><rect width="100%" height="100%" fill="white"/><rect x={crop.x} y={crop.y} width={crop.w} height={crop.h} fill="black"/></mask></defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#cropMask)"/>
            <rect x={crop.x} y={crop.y} width={crop.w} height={crop.h} fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="6 3"/>
            {[1/3,2/3].map((t,i)=>(<g key={i}><line x1={crop.x+crop.w*t} y1={crop.y} x2={crop.x+crop.w*t} y2={crop.y+crop.h} stroke="rgba(167,139,250,0.25)" strokeWidth="1"/><line x1={crop.x} y1={crop.y+crop.h*t} x2={crop.x+crop.w} y2={crop.y+crop.h*t} stroke="rgba(167,139,250,0.25)" strokeWidth="1"/></g>))}
            {[{id:"tl",cx:crop.x,cy:crop.y},{id:"tr",cx:crop.x+crop.w,cy:crop.y},{id:"bl",cx:crop.x,cy:crop.y+crop.h},{id:"br",cx:crop.x+crop.w,cy:crop.y+crop.h}].map(h=>(<rect key={h.id} x={h.cx-10} y={h.cy-10} width={20} height={20} rx={4} fill="#a78bfa" stroke="#fff" strokeWidth="1.5" style={{cursor:"nwse-resize"}}/>))}
          </svg>
        )}
      </div>
      <p style={{textAlign:"center",fontSize:11,color:"rgba(255,255,255,0.3)",margin:0}}>Drag to move · Drag corners to resize · Ratio locked 3:4</p>
      <div style={{display:"flex",gap:10}}>
        <button onClick={onCancel} style={{flex:1,padding:"10px",borderRadius:10,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.45)",fontSize:13,fontWeight:600,cursor:"pointer"}}>← Back</button>
        <button onClick={handleCrop} style={{flex:2,padding:"10px",borderRadius:10,background:"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 16px rgba(109,40,217,0.4)"}}>✓ Apply Crop</button>
      </div>
    </div>
  );
}

// ─── Product Details Editor ───────────────────────────────────────────────────
function ProductDetailsEditor({ details, setDetails, base, lbl }) {
  const addField = () => setDetails(prev => [...prev, { field: "", value: "" }]);
  const removeField = (i) => setDetails(prev => prev.filter((_,idx)=>idx!==i));
  const updateField = (i, key, val) => setDetails(prev => prev.map((d,idx)=>idx===i?{...d,[key]:val}:d));
  return (
    <div>
      <label style={lbl}>Product Details</label>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {details.map((d,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:8,alignItems:"center"}}>
            <input className="ms-input" value={d.field} onChange={e=>updateField(i,"field",e.target.value)} placeholder="Field (e.g. Material)" style={{...base,fontSize:12}}/>
            <input className="ms-input" value={d.value} onChange={e=>updateField(i,"value",e.target.value)} placeholder="Value (e.g. Cotton)" style={{...base,fontSize:12}}/>
            <button onClick={()=>removeField(i)} style={{width:30,height:30,borderRadius:8,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",color:"#f87171",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
          </div>
        ))}
        <button onClick={addField} style={{padding:"9px",borderRadius:10,background:"rgba(139,92,246,0.08)",border:"1px dashed rgba(139,92,246,0.3)",color:"#a78bfa",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Field
        </button>
      </div>
    </div>
  );
}

// ─── Add / Edit Product Modal ─────────────────────────────────────────────────
function ProductModal({ onClose, onSave, products, editProduct }) {
  const isEdit = !!editProduct;
  const [name,      setName]      = useState(editProduct?.name ?? "");
  const [category,  setCategory]  = useState(editProduct?.category ?? "Men");
  const [subCat,    setSubCat]    = useState(editProduct?.subCategory ?? "T-Shirt");
  const [price,     setPrice]     = useState(editProduct?.price ?? "");
  const [discount,  setDiscount]  = useState(editProduct?.discount ?? 0);
  const [delivery,  setDelivery]  = useState(editProduct?.delivery ?? "Within 3 Days");
  const [stock,     setStock]     = useState(editProduct?.stock ?? "");
  const [sizeStock, setSizeStock] = useState(()=>{
    if(editProduct?.sizeStock) return SIZES.reduce((acc,s)=>({...acc,[s]:editProduct.sizeStock[s]??""}),{});
    return initSizeStock();
  });
  const [color,     setColor]     = useState(editProduct?.color?.name ?? "");
  const [details,   setDetails]   = useState(editProduct?.details ?? [{field:"",value:""}]);
  // Three images: index 0,1,2
  const [images,    setImages]    = useState(editProduct?.images ?? [null,null,null]);
  const [rawImage,  setRawImage]  = useState(null);
  const [cropIdx,   setCropIdx]   = useState(null);
  const [cropping,  setCropping]  = useState(false);
  const [error,     setError]     = useState("");
  const fileRefs = [useRef(), useRef(), useRef()];

  const hasSizes  = needsSizes(category);
  const hasSubCat = needsSubCat(category);

  const handleCategoryChange = cat => {
    setCategory(cat); setSubCat(needsSubCat(cat)?SUB_CATEGORIES[cat][0]:null);
    setSizeStock(initSizeStock()); setStock(""); setError("");
  };

  const totalSizeStock = hasSizes ? SIZES.reduce((a,s)=>a+(Number(sizeStock[s])||0),0) : Number(stock)||0;
  const finalPrice = discountedPrice(Number(price)||0, discount);

  const handleFileChange = (e, idx) => {
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=ev=>{setRawImage(ev.target.result);setCropIdx(idx);setCropping(true);};
    reader.readAsDataURL(file); e.target.value="";
  };

  const handleCropDone = d => {
    setImages(prev=>{const next=[...prev];next[cropIdx]=d;return next;});
    setCropping(false); setRawImage(null); setCropIdx(null);
  };
  const handleCropCancel = () => { setCropping(false); setRawImage(null); setCropIdx(null); };

  const handleSubmit = () => {
    if(!name.trim()) return setError("Product name is required.");
    if(!price||isNaN(price)||Number(price)<=0) return setError("Enter a valid price.");
    if(hasSizes){if(!SIZES.some(s=>Number(sizeStock[s])>0)) return setError("Enter stock for at least one size.");}
    else{if(stock===""||isNaN(stock)||Number(stock)<0) return setError("Enter a valid stock quantity.");}
    if(images.some(img=>img===null)) return setError("Please upload all 3 product images.");
    setError("");
    const fs=hasSizes?SIZES.reduce((acc,s)=>({...acc,[s]:Number(sizeStock[s])||0}),{}):null;
    onSave({
      id:isEdit?editProduct.id:nextId(products),
      name:name.trim(), category, subCategory:hasSubCat?subCat:null,
      price:Number(price), discount, delivery,
      stock:hasSizes?totalSizeStock:Number(stock),
      status:computeStatus(stock,fs), sizeStock:fs,
      color:PRODUCT_COLORS.find(c=>c.name===color)||null,
      images, details:details.filter(d=>d.field.trim()),
    });
    onClose();
  };

  const base={width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.055)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:12,color:"#f0ecff",padding:"11px 14px",fontSize:13.5,outline:"none",caretColor:"#a78bfa"};
  const lbl={fontSize:10,fontWeight:800,letterSpacing:"0.12em",color:"rgba(167,139,250,0.55)",textTransform:"uppercase",marginBottom:7,display:"block"};
  const arrowSvg=`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7' viewBox='0 0 11 7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' stroke='rgba(167,139,250,0.6)' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`;
  const sel={...base,cursor:"pointer",appearance:"none",backgroundImage:arrowSvg,backgroundRepeat:"no-repeat",backgroundPosition:"right 13px center",paddingRight:36};
  const selectedColor=PRODUCT_COLORS.find(c=>c.name===color);

  return (
    <>
      <style>{`
        .ms-scroll::-webkit-scrollbar{display:none}.ms-scroll{-ms-overflow-style:none;scrollbar-width:none}
        .ms-input:focus{border-color:rgba(139,92,246,0.5)!important;background:rgba(139,92,246,0.08)!important}
        .ms-input::placeholder{color:rgba(255,255,255,0.18)}
        input[type=number].no-spin::-webkit-inner-spin-button,input[type=number].no-spin::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
        input[type=number].no-spin{-moz-appearance:textfield}
      `}</style>
      <div onClick={e=>e.target===e.currentTarget&&!cropping&&onClose()}
        style={{position:"fixed",inset:0,zIndex:9000,background:"rgba(5,3,18,0.82)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div className="ms-scroll" style={{background:"linear-gradient(170deg,#18143a 0%,#100e22 100%)",border:"1px solid rgba(139,92,246,0.18)",borderRadius:22,width:"100%",maxWidth:cropping?500:490,boxShadow:"0 40px 120px rgba(0,0,0,0.85),inset 0 1px 0 rgba(255,255,255,0.04)",maxHeight:"92vh",overflowY:"auto",display:"flex",flexDirection:"column"}}>
          <div style={{height:3,borderRadius:"22px 22px 0 0",background:"linear-gradient(90deg,#6d28d9,#a855f7,#7c3aed)"}}/>
          <div style={{padding:"22px 24px 20px",display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
            <div>
              <h2 style={{color:"#fff",fontSize:18,fontWeight:800,margin:0,letterSpacing:"-0.02em"}}>{cropping?"Crop Image":isEdit?"Edit Product":"Add New Product"}</h2>
              <p style={{color:"rgba(255,255,255,0.28)",fontSize:12,margin:"5px 0 0"}}>{cropping?"Drag to adjust crop area":isEdit?`Editing ${editProduct.id}`:"Fill in the details to list a new item"}</p>
            </div>
            {!cropping&&<button onClick={onClose} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,width:32,height:32,cursor:"pointer",color:"rgba(255,255,255,0.4)",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>}
          </div>
          <div style={{height:1,background:"rgba(255,255,255,0.05)",margin:"0 24px"}}/>
          <div style={{padding:"22px 24px 26px",display:"flex",flexDirection:"column",gap:17}}>
            {cropping ? <ImageCropper src={rawImage} onDone={handleCropDone} onCancel={handleCropCancel}/> : (
              <>
                {/* Name */}
                <div><label style={lbl}>Product Name</label><input className="ms-input" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Neon Ghost Hoodie" style={base}/></div>

                {/* Category / SubCategory */}
                <div style={{display:"grid",gridTemplateColumns:hasSubCat?"1fr 1fr":"1fr",gap:12}}>
                  <div><label style={lbl}>Category</label><select className="ms-input" value={category} onChange={e=>handleCategoryChange(e.target.value)} style={sel}>{ALL_CATEGORIES.map(c=><option key={c} value={c} style={{background:"#18143a"}}>{c}</option>)}</select></div>
                  {hasSubCat&&<div><label style={lbl}>Sub Category</label><select className="ms-input" value={subCat} onChange={e=>setSubCat(e.target.value)} style={sel}>{SUB_CATEGORIES[category].map(s=><option key={s} value={s} style={{background:"#18143a"}}>{s}</option>)}</select></div>}
                </div>

                {/* Price */}
                <div><label style={lbl}>Price (₹)</label><input className="ms-input no-spin" type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="e.g. 999" style={base}/></div>

                {/* Discount */}
                <div>
                  <label style={lbl}>Discount</label>
                  <select className="ms-input" value={discount} onChange={e=>setDiscount(Number(e.target.value))} style={sel}>
                    {DISCOUNT_OPTIONS.map(d=><option key={d.value} value={d.value} style={{background:"#18143a"}}>{d.label}</option>)}
                  </select>
                  {discount>0&&price&&!isNaN(price)&&Number(price)>0&&(
                    <div style={{marginTop:8,padding:"8px 14px",background:"rgba(34,197,94,0.07)",border:"1px solid rgba(34,197,94,0.18)",borderRadius:10,display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:12,color:"rgba(255,255,255,0.45)",textDecoration:"line-through"}}>₹{Number(price)}</span>
                      <span style={{fontSize:15,fontWeight:800,color:"#4ade80"}}>₹{finalPrice}</span>
                      <span style={{fontSize:11,color:"#4ade80",background:"rgba(34,197,94,0.15)",padding:"2px 8px",borderRadius:6,fontWeight:700,marginLeft:"auto"}}>{discount}% OFF</span>
                    </div>
                  )}
                </div>

                {/* Estimated Delivery */}
                <div>
                  <label style={lbl}>Estimated Delivery</label>
                  <select className="ms-input" value={delivery} onChange={e=>setDelivery(e.target.value)} style={sel}>
                    {DELIVERY_OPTIONS.map(d=><option key={d} value={d} style={{background:"#18143a"}}>{d}</option>)}
                  </select>
                </div>

                {/* Stock */}
                {hasSizes?(
                  <div>
                    <label style={lbl}>Stock by Size</label>
                    <div style={{background:"rgba(109,40,217,0.07)",border:"1px solid rgba(139,92,246,0.14)",borderRadius:14,padding:"14px 12px",display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:9}}>
                      {SIZES.map(sz=>(<div key={sz} style={{textAlign:"center"}}><div style={{fontSize:9.5,fontWeight:800,color:"#a78bfa",letterSpacing:"0.06em",marginBottom:6,background:"rgba(139,92,246,0.14)",borderRadius:6,padding:"3px 0"}}>{sz}</div><input type="number" min="0" className="ms-input no-spin" value={sizeStock[sz]} onChange={e=>setSizeStock(p=>({...p,[sz]:e.target.value}))} placeholder="0" style={{...base,padding:"9px 4px",fontSize:14,fontWeight:600,textAlign:"center"}}/></div>))}
                    </div>
                    {totalSizeStock>0&&<p style={{margin:"7px 0 0",fontSize:11,color:"rgba(255,255,255,0.28)",textAlign:"right"}}>Total: <span style={{color:"#a78bfa",fontWeight:700}}>{totalSizeStock}</span> units</p>}
                  </div>
                ):(
                  <div><label style={lbl}>Stock Quantity</label><input className="ms-input no-spin" type="number" min="0" value={stock} onChange={e=>setStock(e.target.value)} placeholder="e.g. 50" style={base}/></div>
                )}

                {/* Color */}
                <div>
                  <label style={lbl}>Product Color</label>
                  <div style={{position:"relative"}}>
                    <select className="ms-input" value={color} onChange={e=>setColor(e.target.value)} style={{...sel,paddingLeft:selectedColor?40:14}}>
                      <option value="" style={{background:"#18143a"}}>Select a color…</option>
                      {PRODUCT_COLORS.map(c=><option key={c.name} value={c.name} style={{background:"#18143a"}}>{c.name}</option>)}
                    </select>
                    {selectedColor&&<div style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",width:16,height:16,borderRadius:"50%",background:selectedColor.hex,border:"2px solid rgba(255,255,255,0.25)",pointerEvents:"none"}}/>}
                  </div>
                  {color&&<div style={{marginTop:8,display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"rgba(255,255,255,0.04)",borderRadius:10,border:"1px solid rgba(255,255,255,0.07)"}}>
                    <div style={{width:24,height:24,borderRadius:6,background:selectedColor?.hex,border:"2px solid rgba(255,255,255,0.2)",flexShrink:0}}/>
                    <span style={{fontSize:13,color:"rgba(255,255,255,0.7)",fontWeight:500}}>{color}</span>
                    <span style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginLeft:"auto"}}>{selectedColor?.hex}</span>
                  </div>}
                </div>

                {/* Product Details */}
                <ProductDetailsEditor details={details} setDetails={setDetails} base={base} lbl={lbl}/>

                {/* ── CHANGE 1: Three Images side by side ── */}
                <div>
                  <label style={lbl}>Product Images (3 Required)</label>
                  {[0,1,2].map(idx=>(
                    <input key={idx} ref={fileRefs[idx]} type="file" accept="image/*" onChange={e=>handleFileChange(e,idx)} style={{display:"none"}}/>
                  ))}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                    {[0,1,2].map(idx=>(
                      <div key={idx} style={{display:"flex",flexDirection:"column",gap:6}}>
                        <div style={{fontSize:9,fontWeight:700,color:"rgba(167,139,250,0.4)",letterSpacing:"0.08em",textAlign:"center"}}>IMG {idx+1}</div>
                        {images[idx]?(
                          <div style={{position:"relative"}}>
                            <div style={{aspectRatio:"3/4",borderRadius:10,overflow:"hidden",border:"2px solid rgba(139,92,246,0.4)",cursor:"pointer"}} onClick={()=>fileRefs[idx].current.click()}>
                              <img src={images[idx]} alt={`product-${idx+1}`} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                            </div>
                            <button onClick={()=>fileRefs[idx].current.click()} style={{position:"absolute",top:-6,right:-6,width:22,height:22,borderRadius:"50%",background:"#7c3aed",border:"none",color:"#fff",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1}}>✎</button>
                            <div style={{marginTop:4,textAlign:"center"}}>
                              <span style={{color:"#4ade80",fontWeight:600,fontSize:10}}>✓ Done</span>
                            </div>
                          </div>
                        ):(
                          <button onClick={()=>fileRefs[idx].current.click()} style={{aspectRatio:"3/4",width:"100%",borderRadius:10,background:"rgba(139,92,246,0.07)",border:"2px dashed rgba(139,92,246,0.25)",color:"rgba(167,139,250,0.7)",fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,padding:"8px 4px",boxSizing:"border-box"}}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            <span style={{fontSize:10}}>Upload</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p style={{margin:"8px 0 0",fontSize:10,color:"rgba(255,255,255,0.25)",textAlign:"center"}}>JPG, PNG · 3:4 ratio · All 3 required</p>
                </div>

                {error&&<div style={{background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.18)",borderRadius:10,padding:"10px 14px",color:"#fca5a5",fontSize:12,display:"flex",alignItems:"center",gap:8}}><span>⚠</span>{error}</div>}
                <div style={{display:"flex",gap:10,marginTop:2}}>
                  <button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:12,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.45)",fontSize:13,fontWeight:600,cursor:"pointer"}}>Cancel</button>
                  <button onClick={handleSubmit} style={{flex:2,padding:"12px",borderRadius:12,background:"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:"0 6px 24px rgba(109,40,217,0.45)",letterSpacing:"0.02em"}}>{isEdit?"✓ Save Changes":"+ Add Product"}</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Size Tooltip ─────────────────────────────────────────────────────────────
function SizeTooltip({ sizeStock }) {
  const [show, setShow] = useState(false);
  if (!sizeStock) return null;
  return (
    <div style={{position:"relative",display:"inline-block"}} onMouseEnter={()=>setShow(true)} onMouseLeave={()=>setShow(false)}>
      <span style={{fontSize:10,color:"#a78bfa",border:"1px solid rgba(139,92,246,0.3)",borderRadius:4,padding:"1px 6px",cursor:"default",fontWeight:700}}>sizes</span>
      {show&&(
        <div style={{position:"absolute",bottom:"calc(100% + 8px)",left:"50%",transform:"translateX(-50%)",background:"#1e1a38",border:"1px solid rgba(139,92,246,0.25)",borderRadius:12,padding:"10px 14px",zIndex:50,whiteSpace:"nowrap",boxShadow:"0 10px 40px rgba(0,0,0,0.6)"}}>
          <div style={{display:"flex",gap:12}}>
            {SIZES.map(sz=>(<div key={sz} style={{textAlign:"center"}}><div style={{fontSize:9,color:"#a78bfa",fontWeight:700,marginBottom:3}}>{sz}</div><div style={{fontSize:14,fontWeight:700,color:sizeStock[sz]===0?"#f87171":sizeStock[sz]<5?"#fbbf24":"#e2d9f3"}}>{sizeStock[sz]}</div></div>))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CHANGE 3: Stacked Fan Cell (no arrows, click to open lightbox) ───────────
function StackedImageCell({ images, name, onOpenLightbox }) {
  const validImages = (images||[]).filter(Boolean);
  const thumbW = 38, thumbH = 50;

  if (validImages.length === 0) {
    return (
      <div style={{width:thumbW+16,height:thumbH,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <div style={{width:thumbW,height:thumbH,borderRadius:8,overflow:"hidden",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </div>
      </div>
    );
  }

  // Show all images fanned/stacked side by side, no arrows
  // For 1 image: single card. For 2-3: offset each slightly so they look layered/fanned
  const count = validImages.length;
  const offsetX = 8; // horizontal offset between stacked images
  const totalW = thumbW + (count - 1) * offsetX;

  return (
    <div style={{position:"relative",width:totalW,height:thumbH,flexShrink:0}}>
      {validImages.map((img, i) => {
        const zIndex = i + 1;
        const left = i * offsetX;
        const scale = 1 - (count - 1 - i) * 0.04;
        const opacity = 0.6 + (i / Math.max(count - 1, 1)) * 0.4;
        return (
          <div
            key={i}
            onClick={() => onOpenLightbox(images, name, i)}
            title={`View image ${i+1}`}
            style={{
              position: "absolute",
              left,
              top: 0,
              width: thumbW,
              height: thumbH,
              borderRadius: 8,
              overflow: "hidden",
              background: "rgba(255,255,255,0.06)",
              border: i === count - 1 ? "2px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.12)",
              cursor: "zoom-in",
              zIndex,
              transform: `scale(${scale})`,
              transformOrigin: "bottom center",
              opacity,
              transition: "transform 0.15s, opacity 0.15s, border 0.15s",
              boxShadow: i === count - 1 ? "0 4px 12px rgba(0,0,0,0.5)" : "0 2px 6px rgba(0,0,0,0.3)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = `scale(1.06)`;
              e.currentTarget.style.opacity = "1";
              e.currentTarget.style.zIndex = "10";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = `scale(${scale})`;
              e.currentTarget.style.opacity = `${opacity}`;
              e.currentTarget.style.zIndex = `${zIndex}`;
            }}
          >
            <img src={img} alt={`${name} ${i+1}`} style={{width:"100%",height:"100%",objectFit:"cover",display:"block",pointerEvents:"none"}}/>
          </div>
        );
      })}
    </div>
  );
}

// ─── CHANGE 2: Product View Popup — NO scrollbar ──────────────────────────────
function ProductViewPopup({ product, onClose, onEdit }) {
  const [visible, setVisible] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const validImages = (product.images||[]).filter(Boolean);
  const fp = discountedPrice(product.price, product.discount);

  useEffect(()=>{
    const t=setTimeout(()=>setVisible(true),10);
    const onKey=(e)=>{if(e.key==="Escape")handleClose();};
    window.addEventListener("keydown",onKey);
    return()=>{clearTimeout(t);window.removeEventListener("keydown",onKey);};
  },[]);

  const handleClose=()=>{setVisible(false);setTimeout(onClose,240);};

  return (
    <>
      <style>{`.pvp-noscroll::-webkit-scrollbar{display:none}.pvp-noscroll{-ms-overflow-style:none;scrollbar-width:none}`}</style>
      <div onClick={e=>e.target===e.currentTarget&&handleClose()} style={{position:"fixed",inset:0,zIndex:9500,background:visible?"rgba(5,3,18,0.88)":"rgba(5,3,18,0)",backdropFilter:visible?"blur(12px)":"blur(0px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,transition:"background 0.24s,backdrop-filter 0.24s"}}>
        {/* ── NO scrollbar: overflow hidden, fixed height, inner scroll hidden ── */}
        <div className="pvp-noscroll" style={{background:"linear-gradient(170deg,#18143a 0%,#100e22 100%)",border:"1px solid rgba(139,92,246,0.22)",borderRadius:22,width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 40px 120px rgba(0,0,0,0.9)",transform:visible?"scale(1) translateY(0)":"scale(0.92) translateY(24px)",opacity:visible?1:0,transition:"transform 0.3s cubic-bezier(0.34,1.42,0.64,1),opacity 0.22s"}}>
          <div style={{height:3,borderRadius:"22px 22px 0 0",background:"linear-gradient(90deg,#6d28d9,#a855f7,#7c3aed)"}}/>

          {/* Header */}
          <div style={{padding:"20px 22px 16px",display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:11,color:"rgba(167,139,250,0.5)",fontWeight:700,letterSpacing:"0.1em",marginBottom:4}}>{product.id} · {product.category}{product.subCategory?` / ${product.subCategory}`:""}</div>
              <h2 style={{color:"#fff",fontSize:18,fontWeight:800,margin:0,letterSpacing:"-0.02em"}}>{product.name}</h2>
            </div>
            <div style={{display:"flex",gap:8,flexShrink:0}}>
              <button onClick={()=>{handleClose();setTimeout(()=>onEdit(product),260);}} style={{padding:"6px 14px",borderRadius:10,background:"rgba(139,92,246,0.15)",border:"1px solid rgba(139,92,246,0.3)",color:"#a78bfa",fontSize:12,fontWeight:700,cursor:"pointer"}}>Edit</button>
              <button onClick={handleClose} style={{width:32,height:32,borderRadius:10,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.4)",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
            </div>
          </div>
          <div style={{height:1,background:"rgba(255,255,255,0.06)",margin:"0 22px"}}/>

          <div style={{padding:"20px 22px 24px",display:"flex",flexDirection:"column",gap:18}}>
            {/* Image Slider */}
            {validImages.length>0&&(
              <div>
                <div style={{fontSize:10,fontWeight:700,color:"rgba(167,139,250,0.45)",letterSpacing:"0.1em",marginBottom:10}}>PRODUCT IMAGES</div>
                <div style={{position:"relative",borderRadius:16,overflow:"hidden",background:"#0d0b1e",aspectRatio:"3/4",maxWidth:200,margin:"0 auto"}}>
                  <img src={validImages[imgIdx]} alt={product.name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                  {validImages.length>1&&(
                    <>
                      <button onClick={()=>setImgIdx(i=>(i-1+validImages.length)%validImages.length)} style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",width:28,height:28,borderRadius:"50%",background:"rgba(0,0,0,0.55)",backdropFilter:"blur(4px)",border:"none",color:"#fff",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
                      <button onClick={()=>setImgIdx(i=>(i+1)%validImages.length)} style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",width:28,height:28,borderRadius:"50%",background:"rgba(0,0,0,0.55)",backdropFilter:"blur(4px)",border:"none",color:"#fff",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
                      <div style={{position:"absolute",bottom:10,left:0,right:0,display:"flex",justifyContent:"center",gap:5}}>
                        {validImages.map((_,i)=><button key={i} onClick={()=>setImgIdx(i)} style={{width:i===imgIdx?18:6,height:6,borderRadius:3,background:i===imgIdx?"#a78bfa":"rgba(255,255,255,0.4)",border:"none",cursor:"pointer",padding:0,transition:"width 0.2s"}}/>)}
                      </div>
                    </>
                  )}
                </div>
                {validImages.length>1&&(
                  <div style={{display:"flex",gap:8,marginTop:10,justifyContent:"center"}}>
                    {validImages.map((img,i)=>(
                      <div key={i} onClick={()=>setImgIdx(i)} style={{width:44,height:58,borderRadius:8,overflow:"hidden",cursor:"pointer",border:i===imgIdx?"2px solid #a78bfa":"2px solid rgba(255,255,255,0.1)",transition:"border-color 0.15s"}}>
                        <img src={img} alt={`${product.name} ${i+1}`} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Price */}
            <div style={{background:"rgba(255,255,255,0.03)",borderRadius:14,padding:"14px 16px",border:"1px solid rgba(255,255,255,0.07)"}}>
              <div style={{fontSize:10,fontWeight:700,color:"rgba(167,139,250,0.45)",letterSpacing:"0.1em",marginBottom:10}}>PRICING</div>
              <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                {product.discount>0?(
                  <>
                    <span style={{fontSize:22,fontWeight:800,color:"#f5c542"}}>₹{fp}</span>
                    <span style={{fontSize:14,color:"rgba(255,255,255,0.3)",textDecoration:"line-through"}}>₹{product.price}</span>
                    <span style={{fontSize:11,fontWeight:700,color:"#4ade80",background:"rgba(34,197,94,0.12)",padding:"3px 10px",borderRadius:8,border:"1px solid rgba(34,197,94,0.2)"}}>{product.discount}% OFF</span>
                  </>
                ):(
                  <span style={{fontSize:22,fontWeight:800,color:"#f5c542"}}>₹{product.price}</span>
                )}
              </div>
            </div>

            {/* Status, Delivery, Color */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"12px 14px",border:"1px solid rgba(255,255,255,0.07)"}}>
                <div style={{fontSize:9,fontWeight:700,color:"rgba(167,139,250,0.4)",letterSpacing:"0.1em",marginBottom:6}}>STATUS</div>
                <Badge status={product.status}/>
              </div>
              <div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"12px 14px",border:"1px solid rgba(255,255,255,0.07)"}}>
                <div style={{fontSize:9,fontWeight:700,color:"rgba(167,139,250,0.4)",letterSpacing:"0.1em",marginBottom:6}}>DELIVERY</div>
                <div style={{fontSize:12,color:"#c4b5fd",fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="m16 8 5 3v5h-5V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  {product.delivery}
                </div>
              </div>
              {product.color&&(
                <div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"12px 14px",border:"1px solid rgba(255,255,255,0.07)"}}>
                  <div style={{fontSize:9,fontWeight:700,color:"rgba(167,139,250,0.4)",letterSpacing:"0.1em",marginBottom:6}}>COLOR</div>
                  <div style={{display:"flex",alignItems:"center",gap:7}}>
                    <div style={{width:18,height:18,borderRadius:5,background:product.color.hex,border:"2px solid rgba(255,255,255,0.2)"}}/>
                    <span style={{fontSize:12,color:"rgba(255,255,255,0.7)",fontWeight:600}}>{product.color.name}</span>
                  </div>
                </div>
              )}
              <div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"12px 14px",border:"1px solid rgba(255,255,255,0.07)"}}>
                <div style={{fontSize:9,fontWeight:700,color:"rgba(167,139,250,0.4)",letterSpacing:"0.1em",marginBottom:6}}>TOTAL STOCK</div>
                <div style={{fontSize:16,fontWeight:800,color:product.stock===0?"#f87171":product.stock<15?"#fbbf24":"#fff"}}>{product.stock}</div>
              </div>
            </div>

            {/* Size Stock */}
            {product.sizeStock&&(
              <div style={{background:"rgba(109,40,217,0.07)",borderRadius:12,padding:"14px",border:"1px solid rgba(139,92,246,0.14)"}}>
                <div style={{fontSize:9,fontWeight:700,color:"rgba(167,139,250,0.4)",letterSpacing:"0.1em",marginBottom:10}}>STOCK BY SIZE</div>
                <div style={{display:"flex",gap:10,justifyContent:"space-between"}}>
                  {SIZES.map(sz=>(
                    <div key={sz} style={{textAlign:"center",flex:1}}>
                      <div style={{fontSize:9,fontWeight:800,color:"#a78bfa",marginBottom:4}}>{sz}</div>
                      <div style={{fontSize:15,fontWeight:700,color:product.sizeStock[sz]===0?"#f87171":product.sizeStock[sz]<5?"#fbbf24":"#e2d9f3"}}>{product.sizeStock[sz]}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Product Details */}
            {product.details&&product.details.length>0&&(
              <div>
                <div style={{fontSize:10,fontWeight:700,color:"rgba(167,139,250,0.45)",letterSpacing:"0.1em",marginBottom:10}}>PRODUCT DETAILS</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {product.details.map((d,i)=>(
                    <div key={i} style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"10px 12px",border:"1px solid rgba(255,255,255,0.07)"}}>
                      <div style={{fontSize:9,fontWeight:700,color:"rgba(167,139,250,0.4)",letterSpacing:"0.08em",marginBottom:4}}>{d.field.toUpperCase()}</div>
                      <div style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.8)"}}>{d.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;
  const pages = [];
  for (let i = 1; i <= total; i++) pages.push(i);
  let visible = pages;
  if (total > 7) {
    if (current <= 4) visible = [...pages.slice(0,5), "...", total];
    else if (current >= total - 3) visible = [1, "...", ...pages.slice(total-5)];
    else visible = [1, "...", current-1, current, current+1, "...", total];
  }
  const btnBase = { minWidth:36, height:36, borderRadius:9, border:"1px solid rgba(255,255,255,0.08)", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" };
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"20px 0 4px",flexWrap:"wrap"}}>
      <button onClick={()=>onChange(current-1)} disabled={current===1} style={{...btnBase,padding:"0 12px",background:"rgba(255,255,255,0.04)",color:current===1?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.6)",cursor:current===1?"not-allowed":"pointer"}}>← Prev</button>
      {visible.map((p,i)=>p==="..."?<span key={`e-${i}`} style={{color:"rgba(255,255,255,0.3)",padding:"0 4px",fontSize:13}}>…</span>:<button key={p} onClick={()=>onChange(p)} style={{...btnBase,background:p===current?"linear-gradient(135deg,#7c3aed,#6d28d9)":"rgba(255,255,255,0.04)",color:p===current?"#fff":"rgba(255,255,255,0.55)",border:p===current?"1px solid rgba(139,92,246,0.5)":"1px solid rgba(255,255,255,0.08)",boxShadow:p===current?"0 4px 14px rgba(109,40,217,0.35)":"none"}}>{p}</button>)}
      <button onClick={()=>onChange(current+1)} disabled={current===total} style={{...btnBase,padding:"0 12px",background:"rgba(255,255,255,0.04)",color:current===total?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.6)",cursor:current===total?"not-allowed":"pointer"}}>Next →</button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ListingProducts() {
  const [products,    setProducts]    = useState(INITIAL_PRODUCTS);
  const [search,      setSearch]      = useState("");
  const [filter,      setFilter]      = useState("All");
  const [showModal,   setShowModal]   = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  // lightbox now supports multi-image with index
  const [lightbox,    setLightbox]    = useState(null); // {images, name, idx}
  const [viewProduct, setViewProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filterTabs = ["All",...ALL_CATEGORIES];

  const filtered = products.filter(p=>
    (filter==="All"||p.category===filter)&&
    (p.name.toLowerCase().includes(search.toLowerCase())||p.id.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length/PRODUCTS_PER_PAGE));
  const safePage   = Math.min(currentPage, totalPages);
  const paginated  = filtered.slice((safePage-1)*PRODUCTS_PER_PAGE, safePage*PRODUCTS_PER_PAGE);

  useEffect(()=>{setCurrentPage(1);},[filter,search]);

  const handleSave = product => {
    if (editProduct) setProducts(prev=>prev.map(p=>p.id===product.id?product:p));
    else             setProducts(prev=>[...prev,product]);
  };

  const openAdd    = ()  => { setEditProduct(null); setShowModal(true); };
  const openEdit   = (p) => { setEditProduct(p); setShowModal(true); };
  const closeModal = ()  => { setShowModal(false); setEditProduct(null); };

  // Updated: lightbox takes images array + initial index
  const openLightbox  = (images, name, idx=0) => setLightbox({images, name, idx});
  const closeLightbox = () => setLightbox(null);

  const displayCategory = p => p.subCategory?`${p.subCategory} (${p.category})`:p.category;

  return (
    <div>
      {showModal&&<ProductModal onClose={closeModal} onSave={handleSave} products={products} editProduct={editProduct}/>}
      {lightbox&&(
        <Lightbox
          images={lightbox.images}
          productName={lightbox.name}
          initialIdx={lightbox.idx}
          onClose={closeLightbox}
        />
      )}
      {viewProduct&&<ProductViewPopup product={viewProduct} onClose={()=>setViewProduct(null)} onEdit={(p)=>{setViewProduct(null);openEdit(p);}}/>}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{color:"#fff"}}>Listing Products</h1>
          <p className="text-sm mt-0.5" style={{color:"rgba(255,255,255,0.38)"}}>{products.length} products in your catalogue</p>
        </div>
        <button onClick={openAdd} className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold" style={{background:"linear-gradient(135deg,#7c3aed,#6d28d9)",color:"#fff",boxShadow:"0 4px 16px rgba(124,58,237,0.35)",border:"none",cursor:"pointer"}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-5 mb-4" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or ID…" className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.85)",caretColor:"#a78bfa"}}/>
          </div>
          <div className="flex gap-2 flex-wrap">
            {filterTabs.map(c=>(
              <button key={c} onClick={()=>setFilter(c)} className="px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                style={filter===c?{background:"linear-gradient(135deg,rgba(139,92,246,0.28),rgba(124,58,237,0.18))",color:"#c4b5fd",border:"1px solid rgba(139,92,246,0.4)"}:{background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.45)",border:"1px solid rgba(255,255,255,0.08)"}}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
        {/* Desktop header */}
        <div className="hidden sm:grid px-5 py-3 text-xs font-semibold uppercase tracking-widest"
          style={{gridTemplateColumns:"72px 80px 1fr 140px 120px 60px 50px 110px 52px 44px",color:"rgba(255,255,255,0.3)",borderBottom:"1px solid rgba(255,255,255,0.07)",background:"rgba(255,255,255,0.02)"}}>
          <span>Imgs</span><span>ID</span><span>Product</span><span>Category</span>
          <span className="text-right">Price</span><span className="text-center">Stock</span>
          <span className="text-center">Color</span>
          <span className="text-right">Status</span>
          <span className="text-center">Edit</span>
          <span className="text-center">View</span>
        </div>

        {filtered.length===0?(
          <div className="py-16 text-center" style={{color:"rgba(255,255,255,0.35)"}}>No products found.</div>
        ):paginated.map((p,i)=>{
          const fp=discountedPrice(p.price,p.discount);
          return (
            <div key={p.id} className="hidden sm:grid px-5 py-3 items-center group transition-colors duration-150"
              style={{gridTemplateColumns:"72px 80px 1fr 140px 120px 60px 50px 110px 52px 44px",borderBottom:i<paginated.length-1?"1px solid rgba(255,255,255,0.05)":"none"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,0.05)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>

              {/* CHANGE 3: Stacked fan cell instead of slider */}
              <StackedImageCell images={p.images} name={p.name} onOpenLightbox={openLightbox}/>

              <span className="text-xs font-mono" style={{color:"rgba(255,255,255,0.4)"}}>{p.id}</span>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <span className="text-sm font-medium" style={{color:"#fff"}}>{p.name}</span>
                {p.sizeStock&&<SizeTooltip sizeStock={p.sizeStock}/>}
              </div>
              <span className="text-xs" style={{color:"rgba(255,255,255,0.45)"}}>{displayCategory(p)}</span>
              <div className="text-right">
                <div style={{color:"#f5c542",fontWeight:700,fontSize:13}}>₹{fp}</div>
                {p.discount>0&&<div style={{color:"rgba(255,255,255,0.3)",fontSize:10,textDecoration:"line-through"}}>₹{p.price} <span style={{textDecoration:"none",color:"#4ade80",fontWeight:700}}>({p.discount}%)</span></div>}
              </div>
              <span className="text-sm text-center font-medium" style={{color:p.stock===0?"#f87171":p.stock<15?"#fbbf24":"rgba(255,255,255,0.7)"}}>{p.stock}</span>
              <div style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
                {p.color?<div title={p.color.name} style={{width:18,height:18,borderRadius:"50%",background:p.color.hex,border:"2px solid rgba(255,255,255,0.2)"}}/>:<span style={{fontSize:11,color:"rgba(255,255,255,0.2)"}}>—</span>}
              </div>
              <div className="flex justify-end items-center"><Badge status={p.status}/></div>
              <div className="flex justify-center">
                <button onClick={()=>openEdit(p)} title="Edit product"
                  style={{padding:"6px 8px",borderRadius:9,background:"rgba(139,92,246,0.13)",color:"#a78bfa",border:"1px solid rgba(139,92,246,0.22)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.15s,transform 0.12s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(139,92,246,0.28)";e.currentTarget.style.transform="scale(1.08)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(139,92,246,0.13)";e.currentTarget.style.transform="scale(1)";}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              </div>
              <div className="flex justify-center">
                <button onClick={()=>setViewProduct(p)} title="View details"
                  style={{padding:"6px 8px",borderRadius:9,background:"rgba(34,197,94,0.1)",color:"#4ade80",border:"1px solid rgba(34,197,94,0.22)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.15s,transform 0.12s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(34,197,94,0.22)";e.currentTarget.style.transform="scale(1.08)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(34,197,94,0.1)";e.currentTarget.style.transform="scale(1)";}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>
          );
        })}

        {/* Mobile rows */}
        {paginated.map((p,i)=>{
          const fp=discountedPrice(p.price,p.discount);
          return (
            <div key={p.id+"-m"} className="sm:hidden px-4 py-4" style={{borderBottom:i<paginated.length-1?"1px solid rgba(255,255,255,0.05)":"none"}}>
              <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <StackedImageCell images={p.images} name={p.name} onOpenLightbox={openLightbox}/>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                    <div style={{color:"#fff",fontWeight:600,fontSize:14}}>{p.name}</div>
                    <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
                      <Badge status={p.status}/>
                      <button onClick={()=>setViewProduct(p)} style={{padding:"5px 7px",borderRadius:8,background:"rgba(34,197,94,0.1)",color:"#4ade80",border:"1px solid rgba(34,197,94,0.22)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      <button onClick={()=>openEdit(p)} style={{padding:"5px 7px",borderRadius:8,background:"rgba(139,92,246,0.15)",color:"#a78bfa",border:"1px solid rgba(139,92,246,0.25)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                    </div>
                  </div>
                  <div style={{color:"rgba(255,255,255,0.35)",fontSize:11,marginTop:2}}>{p.id} · {displayCategory(p)}</div>
                  <div style={{display:"flex",gap:10,marginTop:8,alignItems:"center",flexWrap:"wrap"}}>
                    <div>
                      <span style={{color:"#f5c542",fontWeight:700,fontSize:14}}>₹{fp}</span>
                      {p.discount>0&&<span style={{color:"rgba(255,255,255,0.35)",fontSize:10,marginLeft:5,textDecoration:"line-through"}}>₹{p.price}</span>}
                      {p.discount>0&&<span style={{color:"#4ade80",fontSize:10,marginLeft:4,fontWeight:700}}>({p.discount}%)</span>}
                    </div>
                    <span style={{color:"rgba(255,255,255,0.5)",fontSize:12}}>Stock: <span style={{color:p.stock===0?"#f87171":p.stock<15?"#fbbf24":"#fff",fontWeight:600}}>{p.stock}</span></span>
                    {p.color&&<div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:12,height:12,borderRadius:"50%",background:p.color.hex,border:"1.5px solid rgba(255,255,255,0.2)"}}/><span style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>{p.color.name}</span></div>}
                    {p.sizeStock&&<SizeTooltip sizeStock={p.sizeStock}/>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {filtered.length>0&&(
        <div style={{marginTop:4}}>
          <div style={{textAlign:"center",fontSize:12,color:"rgba(255,255,255,0.28)",marginBottom:4}}>
            Showing {(safePage-1)*PRODUCTS_PER_PAGE+1}–{Math.min(safePage*PRODUCTS_PER_PAGE,filtered.length)} of {filtered.length} products
          </div>
          <Pagination current={safePage} total={totalPages} onChange={p=>{setCurrentPage(p);window.scrollTo({top:0,behavior:"smooth"});}}/>
        </div>
      )}
    </div>
  );
}