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
  { id:"MA001", name:"Uchiha Itachi Tee",  category:"Men",      subCategory:"T-Shirt", price:799,  stock:142, status:"Active", sizeStock:{S:30,M:40,L:42,XL:20,XXL:10}, color:null, image:null },
  { id:"MA002", name:"Moon Aura Tee",       category:"Men",      subCategory:"Jeans",   price:749,  stock:98,  status:"Active", sizeStock:{S:20,M:28,L:30,XL:15,XXL:5 }, color:null, image:null },
  { id:"MA003", name:"Tokyo Drift Tee",     category:"Men",      subCategory:"T-Shirt", price:799,  stock:0,   status:"Out",    sizeStock:{S:0, M:0, L:0, XL:0, XXL:0 }, color:null, image:null },
  { id:"MA004", name:"Shadow Hunter Tee",   category:"Men",      subCategory:"Jeans",   price:849,  stock:56,  status:"Active", sizeStock:{S:10,M:16,L:18,XL:8, XXL:4 }, color:null, image:null },
  { id:"MA005", name:"Neon Ghost Hoodie",   category:"Hoodies",  subCategory:null,      price:1299, stock:34,  status:"Active", sizeStock:{S:8, M:10,L:10,XL:4, XXL:2 }, color:null, image:null },
  { id:"MA006", name:"Astral Wave Hoodie",  category:"Hoodies",  subCategory:null,      price:1399, stock:12,  status:"Low",    sizeStock:{S:2, M:4, L:3, XL:2, XXL:1 }, color:null, image:null },
  { id:"MA007", name:"Lunar Drop Earrings", category:"Earrings", subCategory:null,      price:349,  stock:200, status:"Active", sizeStock:null,                           color:null, image:null },
  { id:"MA008", name:"Void Chain Necklace", category:"Necklaces",subCategory:null,      price:499,  stock:0,   status:"Out",    sizeStock:null,                           color:null, image:null },
  { id:"MA009", name:"Oversized Kanji Tee", category:"Oversized",subCategory:null,      price:899,  stock:67,  status:"Active", sizeStock:{S:15,M:20,L:18,XL:10,XXL:4},  color:null, image:null },
  { id:"MA010", name:"Aurora Crop Top",     category:"Women",    subCategory:"Top",     price:749,  stock:8,   status:"Low",    sizeStock:{S:2, M:3, L:2, XL:1, XXL:0 }, color:null, image:null },
];

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

const needsSizes  = c => CLOTHING_CATEGORIES.includes(c)||SIZE_ONLY_CATEGORIES.includes(c);
const needsSubCat = c => CLOTHING_CATEGORIES.includes(c);

// ─── Fullscreen Lightbox ──────────────────────────────────────────────────────
function Lightbox({ src, productName, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    const onKey = (e) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 240);
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        background: visible ? "rgba(0,0,0,0.96)" : "rgba(0,0,0,0)",
        backdropFilter: visible ? "blur(20px)" : "blur(0px)",
        WebkitBackdropFilter: visible ? "blur(20px)" : "blur(0px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.24s ease, backdrop-filter 0.24s ease",
        cursor: "zoom-out",
      }}
    >
      {/* ✕ Close button */}
      <button
        onClick={e => { e.stopPropagation(); handleClose(); }}
        style={{
          position: "fixed", top: 18, right: 18,
          width: 46, height: 46, borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#fff", fontSize: 18, lineHeight: 1,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", zIndex: 100000,
          transition: "background 0.15s, transform 0.15s",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.7)",
          backdropFilter: "blur(8px)",
        }}
        onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.18)"; e.currentTarget.style.transform="scale(1.1)"; }}
        onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.08)"; e.currentTarget.style.transform="scale(1)"; }}
      >
        ✕
      </button>

      {/* Image card */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: "min(500px, 88vw)",
          maxHeight: "88vh",
          borderRadius: 22,
          overflow: "hidden",
          boxShadow: "0 60px 160px rgba(0,0,0,0.95), 0 0 0 1px rgba(139,92,246,0.3)",
          transform: visible ? "scale(1) translateY(0)" : "scale(0.76) translateY(40px)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.32s cubic-bezier(0.34,1.42,0.64,1), opacity 0.22s ease",
          cursor: "default",
        }}
      >
        <img
          src={src}
          alt={productName}
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", maxHeight: "88vh" }}
        />

        {/* Bottom info bar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "48px 22px 22px",
          background: "linear-gradient(transparent, rgba(0,0,0,0.88))",
        }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em" }}>{productName}</div>
          <div style={{ color: "rgba(255,255,255,0.38)", fontSize: 11, marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Press ESC or click outside to close
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Image Hover Zoom Popup ───────────────────────────────────────────────────
function ImageZoomPopup({ src, anchorRect, productName, onOpenLightbox }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  if (!src || !anchorRect) return null;

  const popupW = 160, popupH = 213, margin = 14;
  let left = anchorRect.right + margin;
  let top  = anchorRect.top + anchorRect.height / 2 - popupH / 2;
  top  = Math.max(8, Math.min(top, window.innerHeight - popupH - 8));
  if (left + popupW > window.innerWidth - 8) left = anchorRect.left - popupW - margin;

  return (
    <div
      onClick={e => { e.stopPropagation(); onOpenLightbox(); }}
      style={{
        position: "fixed", left, top,
        width: popupW, height: popupH,
        zIndex: 9998,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.9), 0 0 0 1.5px rgba(139,92,246,0.45)",
        transform: visible ? "scale(1)" : "scale(0.7)",
        opacity: visible ? 1 : 0,
        transformOrigin: "left center",
        transition: "transform 0.24s cubic-bezier(0.34,1.56,0.64,1), opacity 0.18s ease",
        cursor: "zoom-in",
      }}
    >
      <img src={src} alt={productName}
        style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", pointerEvents:"none" }}/>

      {/* Top "EXPAND" hint */}
      <div style={{
        position:"absolute", top:0, left:0, right:0,
        padding:"8px 10px 22px",
        background:"linear-gradient(rgba(0,0,0,0.6), transparent)",
        display:"flex", alignItems:"center", justifyContent:"center", gap:5,
      }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="2.5">
          <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
          <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
        </svg>
        <span style={{ fontSize:9, fontWeight:800, color:"rgba(255,255,255,0.75)", letterSpacing:"0.06em" }}>CLICK TO EXPAND</span>
      </div>

      {/* Bottom name */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0,
        padding:"22px 10px 10px",
        background:"linear-gradient(transparent, rgba(0,0,0,0.82))",
        fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.9)",
        letterSpacing:"0.04em", lineHeight:1.3,
      }}>
        {productName}
      </div>
    </div>
  );
}

// ─── Image Cropper ────────────────────────────────────────────────────────────
const CROP_RATIO = 3/4;

function ImageCropper({ src, onDone, onCancel }) {
  const imgRef   = useRef(null);
  const dragging = useRef(false);
  const resizing = useRef(null);
  const lastPos  = useRef({x:0,y:0});
  const [imgLoaded, setImgLoaded] = useState(false);
  const [crop,    setCrop]    = useState({ x:0,y:0,w:0,h:0 });
  const [natural, setNatural] = useState({ w:1,h:1 });
  const [display, setDisplay] = useState({ w:0,h:0,offX:0,offY:0 });

  const handleImgLoad = useCallback((e) => {
    const img=e.target, natW=img.naturalWidth, natH=img.naturalHeight;
    setNatural({w:natW,h:natH});
    const maxW=440,maxH=330;
    let dispW=natW,dispH=natH;
    if(dispW>maxW){dispH=dispH*(maxW/dispW);dispW=maxW;}
    if(dispH>maxH){dispW=dispW*(maxH/dispH);dispH=maxH;}
    dispW=Math.round(dispW);dispH=Math.round(dispH);
    const offX=Math.round((maxW-dispW)/2),offY=Math.round((maxH-dispH)/2);
    setDisplay({w:dispW,h:dispH,offX,offY});
    const cw=dispW,ch=Math.min(Math.round(cw/CROP_RATIO),dispH);
    setCrop({x:offX,y:offY+Math.round((dispH-ch)/2),w:cw,h:ch});
    setImgLoaded(true);
  },[]);

  const getHandle=useCallback((mx,my,c)=>{
    const hs=10,handles=[{id:"tl",x:c.x,y:c.y},{id:"tr",x:c.x+c.w,y:c.y},{id:"bl",x:c.x,y:c.y+c.h},{id:"br",x:c.x+c.w,y:c.y+c.h}];
    for(const h of handles)if(Math.abs(mx-h.x)<hs&&Math.abs(my-h.y)<hs)return h.id;
    return null;
  },[]);

  const clamp=(v,mn,mx)=>Math.max(mn,Math.min(mx,v));

  const onMouseDown=useCallback((e)=>{
    const r=e.currentTarget.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
    const h=getHandle(mx,my,crop);
    if(h)resizing.current=h;
    else if(mx>=crop.x&&mx<=crop.x+crop.w&&my>=crop.y&&my<=crop.y+crop.h)dragging.current=true;
    lastPos.current={x:mx,y:my};e.preventDefault();
  },[crop,getHandle]);

  const onMouseMove=useCallback((e)=>{
    if(!dragging.current&&!resizing.current)return;
    const r=e.currentTarget.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
    const dx=mx-lastPos.current.x,dy=my-lastPos.current.y;
    lastPos.current={x:mx,y:my};
    const{offX,offY,w:dw,h:dh}=display,minX=offX,maxX=offX+dw,minY=offY,maxY=offY+dh;
    setCrop(prev=>{
      let{x,y,w,h}=prev;
      if(dragging.current){x=clamp(x+dx,minX,maxX-w);y=clamp(y+dy,minY,maxY-h);}
      else if(resizing.current){
        const r2=resizing.current;let nx=x,ny=y,nw=w,nh=h;
        if(r2==="br"){nw=clamp(w+dx,50,maxX-x);nh=Math.round(nw/CROP_RATIO);}
        if(r2==="tr"){nw=clamp(w+dx,50,maxX-x);nh=Math.round(nw/CROP_RATIO);ny=clamp(y+h-nh,minY,y+h-50);}
        if(r2==="bl"){nw=clamp(w-dx,50,x-minX+w);nx=clamp(x+dx,minX,x+w-50);nh=Math.round(nw/CROP_RATIO);}
        if(r2==="tl"){nw=clamp(w-dx,50,x-minX+w);nx=clamp(x+dx,minX,x+w-50);nh=Math.round(nw/CROP_RATIO);ny=clamp(y+h-nh,minY,y+h-50);}
        if(nx<minX)nx=minX;if(ny<minY)ny=minY;
        if(nx+nw>maxX){nw=maxX-nx;nh=Math.round(nw/CROP_RATIO);}
        if(ny+nh>maxY){nh=maxY-ny;nw=Math.round(nh*CROP_RATIO);}
        x=nx;y=ny;w=nw;h=nh;
      }
      return{x,y,w,h};
    });
  },[display]);

  const onMouseUp=useCallback(()=>{dragging.current=false;resizing.current=null;},[]);

  const handleCrop=()=>{
    const img=imgRef.current,{x,y,w,h}=crop,{offX,offY,w:dw,h:dh}=display;
    const scaleX=natural.w/dw,scaleY=natural.h/dh;
    const canvas=document.createElement("canvas");
    canvas.width=Math.round(w*scaleX);canvas.height=Math.round(h*scaleY);
    canvas.getContext("2d").drawImage(img,(x-offX)*scaleX,(y-offY)*scaleY,w*scaleX,h*scaleY,0,0,canvas.width,canvas.height);
    onDone(canvas.toDataURL("image/jpeg",0.92));
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{position:"relative",width:440,height:330,background:"#0d0b1e",borderRadius:12,overflow:"hidden",margin:"0 auto",maxWidth:"100%"}}>
        <img ref={imgRef} src={src} alt="crop" onLoad={handleImgLoad} style={{position:"absolute",left:display.offX,top:display.offY,width:display.w,height:display.h,display:"block",userSelect:"none",pointerEvents:"none"}}/>
        {imgLoaded&&(
          <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",cursor:"crosshair"}}
            onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
            <defs><mask id="cropMask"><rect width="100%" height="100%" fill="white"/><rect x={crop.x} y={crop.y} width={crop.w} height={crop.h} fill="black"/></mask></defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#cropMask)"/>
            <rect x={crop.x} y={crop.y} width={crop.w} height={crop.h} fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="6 3"/>
            {[1/3,2/3].map((t,i)=>(<g key={i}><line x1={crop.x+crop.w*t} y1={crop.y} x2={crop.x+crop.w*t} y2={crop.y+crop.h} stroke="rgba(167,139,250,0.25)" strokeWidth="1"/><line x1={crop.x} y1={crop.y+crop.h*t} x2={crop.x+crop.w} y2={crop.y+crop.h*t} stroke="rgba(167,139,250,0.25)" strokeWidth="1"/></g>))}
            {[{id:"tl",cx:crop.x,cy:crop.y},{id:"tr",cx:crop.x+crop.w,cy:crop.y},{id:"bl",cx:crop.x,cy:crop.y+crop.h},{id:"br",cx:crop.x+crop.w,cy:crop.y+crop.h}].map(h=>(<rect key={h.id} x={h.cx-6} y={h.cy-6} width={12} height={12} rx={3} fill="#a78bfa" stroke="#fff" strokeWidth="1.5" style={{cursor:"nwse-resize"}}/>))}
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

// ─── Add / Edit Product Modal ─────────────────────────────────────────────────
function ProductModal({ onClose, onSave, products, editProduct }) {
  const isEdit = !!editProduct;
  const [name,      setName]      = useState(editProduct?.name ?? "");
  const [category,  setCategory]  = useState(editProduct?.category ?? "Men");
  const [subCat,    setSubCat]    = useState(editProduct?.subCategory ?? "T-Shirt");
  const [price,     setPrice]     = useState(editProduct?.price ?? "");
  const [stock,     setStock]     = useState(editProduct?.stock ?? "");
  const [sizeStock, setSizeStock] = useState(() => {
    if(editProduct?.sizeStock) return SIZES.reduce((acc,s)=>({...acc,[s]:editProduct.sizeStock[s]??""}),{});
    return initSizeStock();
  });
  const [color,      setColor]     = useState(editProduct?.color?.name ?? "");
  const [rawImage,   setRawImage]  = useState(null);
  const [croppedImg, setCroppedImg]= useState(editProduct?.image ?? null);
  const [cropping,   setCropping]  = useState(false);
  const [error,      setError]     = useState("");
  const fileRef = useRef();

  const hasSizes  = needsSizes(category);
  const hasSubCat = needsSubCat(category);

  const handleCategoryChange = cat => {
    setCategory(cat); setSubCat(needsSubCat(cat)?SUB_CATEGORIES[cat][0]:null);
    setSizeStock(initSizeStock()); setStock(""); setError("");
  };

  const totalSizeStock = hasSizes ? SIZES.reduce((a,s)=>a+(Number(sizeStock[s])||0),0) : Number(stock)||0;

  const handleFileChange = e => {
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=ev=>{setRawImage(ev.target.result);setCropping(true);setCroppedImg(null);};
    reader.readAsDataURL(file); e.target.value="";
  };

  const handleCropDone   = d=>{setCroppedImg(d);setCropping(false);setRawImage(null);};
  const handleCropCancel = ()=>{setCropping(false);setRawImage(null);};

  const handleSubmit = () => {
    if(!name.trim()) return setError("Product name is required.");
    if(!price||isNaN(price)||Number(price)<=0) return setError("Enter a valid price.");
    if(hasSizes){if(!SIZES.some(s=>Number(sizeStock[s])>0)) return setError("Enter stock for at least one size.");}
    else{if(stock===""||isNaN(stock)||Number(stock)<0) return setError("Enter a valid stock quantity.");}
    setError("");
    const fs=hasSizes?SIZES.reduce((acc,s)=>({...acc,[s]:Number(sizeStock[s])||0}),{}):null;
    onSave({ id:isEdit?editProduct.id:nextId(products), name:name.trim(), category, subCategory:hasSubCat?subCat:null, price:Number(price), stock:hasSizes?totalSizeStock:Number(stock), status:computeStatus(stock,fs), sizeStock:fs, color:PRODUCT_COLORS.find(c=>c.name===color)||null, image:croppedImg });
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
        style={{position:"fixed",inset:0,zIndex:9000,background:"rgba(5,3,18,0.82)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
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
                <div><label style={lbl}>Product Name</label><input className="ms-input" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Neon Ghost Hoodie" style={base}/></div>
                <div style={{display:"grid",gridTemplateColumns:hasSubCat?"1fr 1fr":"1fr",gap:12}}>
                  <div><label style={lbl}>Category</label><select className="ms-input" value={category} onChange={e=>handleCategoryChange(e.target.value)} style={sel}>{ALL_CATEGORIES.map(c=><option key={c} value={c} style={{background:"#18143a"}}>{c}</option>)}</select></div>
                  {hasSubCat&&<div><label style={lbl}>Sub Category</label><select className="ms-input" value={subCat} onChange={e=>setSubCat(e.target.value)} style={sel}>{SUB_CATEGORIES[category].map(s=><option key={s} value={s} style={{background:"#18143a"}}>{s}</option>)}</select></div>}
                </div>
                <div><label style={lbl}>Price (₹)</label><input className="ms-input no-spin" type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="e.g. 999" style={base}/></div>
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
                <div>
                  <label style={lbl}>Product Image</label>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{display:"none"}}/>
                  {croppedImg?(
                    <div style={{position:"relative",display:"inline-block"}}>
                      <img src={croppedImg} alt="product" style={{width:90,height:120,objectFit:"cover",borderRadius:10,border:"2px solid rgba(139,92,246,0.4)",display:"block"}}/>
                      <button onClick={()=>fileRef.current.click()} style={{position:"absolute",top:-6,right:-6,width:22,height:22,borderRadius:"50%",background:"#7c3aed",border:"none",color:"#fff",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✎</button>
                    </div>
                  ):(
                    <button onClick={()=>fileRef.current.click()} style={{width:"100%",padding:"18px",borderRadius:12,background:"rgba(139,92,246,0.07)",border:"2px dashed rgba(139,92,246,0.25)",color:"rgba(167,139,250,0.7)",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      Click to upload image
                      <span style={{fontSize:11,opacity:.6}}>JPG, PNG · Will be cropped 3:4</span>
                    </button>
                  )}
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

// ─── Image Thumbnail — hover zoom + click lightbox ────────────────────────────
function ImageThumbCell({ image, name, thumbW=38, thumbH=50, onOpenLightbox }) {
  const [hovered,    setHovered]    = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const ref = useRef(null);

  const handleMouseEnter = () => {
    if (image && ref.current) { setAnchorRect(ref.current.getBoundingClientRect()); setHovered(true); }
  };
  const handleMouseLeave = () => { setHovered(false); setAnchorRect(null); };

  return (
    <>
      <div ref={ref} onMouseEnter={handleMouseEnter}  onMouseLeave={handleMouseLeave}
        style={{
          width:thumbW, height:thumbH, borderRadius:8, overflow:"hidden",
          background:"rgba(255,255,255,0.06)",
          border: hovered&&image ? "1.5px solid rgba(139,92,246,0.6)" : "1px solid rgba(255,255,255,0.08)",
          flexShrink:0, cursor:image?"zoom-in":"default",
          transition:"border-color 0.15s, box-shadow 0.15s",
          boxShadow: hovered&&image ? "0 0 0 3px rgba(139,92,246,0.18)" : "none",
        }}>
        {image
          ? <img src={image} alt={name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
        }
      </div>

      {hovered && image && (
        <ImageZoomPopup
          src={image} anchorRect={anchorRect} productName={name}
          onOpenLightbox={() => { setHovered(false); setAnchorRect(null); onOpenLightbox(image, name); }}
        />
      )}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ListingProducts() {
  const [products,    setProducts]    = useState(INITIAL_PRODUCTS);
  const [search,      setSearch]      = useState("");
  const [filter,      setFilter]      = useState("All");
  const [showModal,   setShowModal]   = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [lightbox,    setLightbox]    = useState(null); // { src, name } | null

  const filterTabs = ["All",...ALL_CATEGORIES];
  const filtered   = products.filter(p=>
    (filter==="All"||p.category===filter)&&
    (p.name.toLowerCase().includes(search.toLowerCase())||p.id.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = product => {
    if(editProduct) setProducts(prev=>prev.map(p=>p.id===product.id?product:p));
    else            setProducts(prev=>[...prev,product]);
  };

  const openAdd     = ()  => { setEditProduct(null); setShowModal(true); };
  const openEdit    = (p) => { setEditProduct(p); setShowModal(true); };
  const closeModal  = ()  => { setShowModal(false); setEditProduct(null); };
  const openLightbox  = (src, name) => setLightbox({ src, name });
  const closeLightbox = () => setLightbox(null);

  const displayCategory = p => p.subCategory ? `${p.subCategory} (${p.category})` : p.category;

  return (
    <div>
      {showModal && <ProductModal onClose={closeModal} onSave={handleSave} products={products} editProduct={editProduct}/>}
      {lightbox  && <Lightbox src={lightbox.src} productName={lightbox.name} onClose={closeLightbox}/>}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{color:"#fff"}}>Listing Products</h1>
          <p className="text-sm mt-0.5" style={{color:"rgba(255,255,255,0.38)"}}>{products.length} products in your catalogue</p>
        </div>
        <button onClick={openAdd} className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{background:"linear-gradient(135deg,#7c3aed,#6d28d9)",color:"#fff",boxShadow:"0 4px 16px rgba(124,58,237,0.35)",border:"none",cursor:"pointer"}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-5 mb-4" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or ID…"
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none"
              style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.85)",caretColor:"#a78bfa"}}/>
          </div>
          <div className="flex gap-2 flex-wrap">
            {filterTabs.map(c=>(
              <button key={c} onClick={()=>setFilter(c)} className="px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                style={filter===c
                  ?{background:"linear-gradient(135deg,rgba(139,92,246,0.28),rgba(124,58,237,0.18))",color:"#c4b5fd",border:"1px solid rgba(139,92,246,0.4)"}
                  :{background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.45)",border:"1px solid rgba(255,255,255,0.08)"}
                }>{c}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
        {/* Desktop header */}
        <div className="hidden sm:grid px-5 py-3 text-xs font-semibold uppercase tracking-widest"
          style={{gridTemplateColumns:"56px 80px 1fr 160px 90px 60px 50px 120px 60px",color:"rgba(255,255,255,0.3)",borderBottom:"1px solid rgba(255,255,255,0.07)",background:"rgba(255,255,255,0.02)"}}>
          <span>Img</span><span>ID</span><span>Product</span><span>Category</span>
          <span className="text-right">Price</span><span className="text-center">Stock</span>
          <span className="text-center">Color</span>
          <span className="text-right">Status</span><span className="text-center">Edit</span>
        </div>

        {filtered.length===0 ? (
          <div className="py-16 text-center" style={{color:"rgba(255,255,255,0.35)"}}>No products found.</div>
        ) : filtered.map((p,i) => (
          <div key={p.id}
            className="hidden sm:grid px-5 py-3 items-center group transition-colors duration-150"
            style={{gridTemplateColumns:"56px 80px 1fr 160px 90px 60px 50px 120px 60px",borderBottom:i<filtered.length-1?"1px solid rgba(255,255,255,0.05)":"none"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,0.05)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>

            <ImageThumbCell image={p.image} name={p.name} thumbW={38} thumbH={50} onOpenLightbox={openLightbox}/>
            <span className="text-xs font-mono" style={{color:"rgba(255,255,255,0.4)"}}>{p.id}</span>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <span className="text-sm font-medium" style={{color:"#fff"}}>{p.name}</span>
              {p.sizeStock&&<SizeTooltip sizeStock={p.sizeStock}/>}
            </div>
            <span className="text-xs" style={{color:"rgba(255,255,255,0.45)"}}>{displayCategory(p)}</span>
            <span className="text-sm font-semibold text-right" style={{color:"#f5c542"}}>₹{p.price}</span>
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
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
          </div>
        ))}

        {/* Mobile rows */}
        {filtered.map((p,i)=>(
          <div key={p.id+"-m"} className="sm:hidden px-4 py-4"
            style={{borderBottom:i<filtered.length-1?"1px solid rgba(255,255,255,0.05)":"none"}}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <ImageThumbCell image={p.image} name={p.name} thumbW={44} thumbH={58} onOpenLightbox={openLightbox}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                  <div style={{color:"#fff",fontWeight:600,fontSize:14}}>{p.name}</div>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                    <Badge status={p.status}/>
                    <button onClick={()=>openEdit(p)} style={{padding:"5px 7px",borderRadius:8,background:"rgba(139,92,246,0.15)",color:"#a78bfa",border:"1px solid rgba(139,92,246,0.25)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                  </div>
                </div>
                <div style={{color:"rgba(255,255,255,0.35)",fontSize:11,marginTop:2}}>{p.id} · {displayCategory(p)}</div>
                <div style={{display:"flex",gap:12,marginTop:8,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{color:"#f5c542",fontWeight:700,fontSize:14}}>₹{p.price}</span>
                  <span style={{color:"rgba(255,255,255,0.5)",fontSize:12}}>Stock: <span style={{color:p.stock===0?"#f87171":p.stock<15?"#fbbf24":"#fff",fontWeight:600}}>{p.stock}</span></span>
                  {p.color&&<div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:12,height:12,borderRadius:"50%",background:p.color.hex,border:"1.5px solid rgba(255,255,255,0.2)"}}/><span style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>{p.color.name}</span></div>}
                  {p.sizeStock&&<SizeTooltip sizeStock={p.sizeStock}/>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}