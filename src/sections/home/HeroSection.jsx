import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import heroFirstImage from "../../assets/images/appImage/hero-first.png";
import ads from "../../assets/images/appImage/ads.png";
const slides = [
  {
    id: 0,
    image: heroFirstImage,
    tag: "NEW DROP",
    title: ["OWN THE", "NIGHT"],
    sub: "Premium Streetwear for Every Aura.\nStand Out. Be Bold. Be You.",
    accent: ["#b44fff", "#ff6b35"],
    badge: "UP TO 30% OFF",
    cta: "buy",                          // → BUY NOW
  },
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900&q=80",
    tag: "BESTSELLER",
    title: ["FEEL THE", "VIBE"],
    sub: "Crafted for the streets.\nWorn by legends.",
    accent: ["#00c6ff", "#0072ff"],
    badge: "FREE SHIPPING",
    cta: "customize",                    // → CUSTOMIZE T-SHIRT
  },
  {
    id: 2,
    image:ads,
    tag: "LIMITED",
    title: ["BREAK THE", "MOLD"],
    sub: "Limited edition drops every week.\nDon't sleep on it.",
    accent: ["#f7971e", "#ffd200"],
    badge: "ONLY 50 LEFT",
    cta: "buy",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&q=80",
    tag: "EXCLUSIVE",
    title: ["RISE &", "GRIND"],
    sub: "Wear your hustle.\nEvery thread tells a story.",
    accent: ["#11998e", "#38ef7d"],
    badge: "NEW ARRIVALS",
    cta: "customize",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=900&q=80",
    tag: "COLLECTION",
    title: ["DEFINE YOUR", "ERA"],
    sub: "Iconic silhouettes.\nTimeless street culture.",
    accent: ["#e96c6c", "#ee0979"],
    badge: "SEASON SALE",
    cta: "buy",
  },
];

const INTERVAL = 3000;

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev]       = useState(null);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const goTo = (idx) => {
    if (animating || idx === current) return;
    setAnimating(true);
    setPrev(current);
    setCurrent(idx);
    setTimeout(() => { setPrev(null); setAnimating(false); }, 700);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent((c) => {
        const n = (c + 1) % slides.length;
        setPrev(c);
        setAnimating(true);
        setTimeout(() => { setPrev(null); setAnimating(false); }, 700);
        return n;
      });
    }, INTERVAL);
    return () => clearInterval(timerRef.current);
  }, []);

  const s = slides[current];
  const p = prev !== null ? slides[prev] : null;

  const isBuy = s.cta === "buy";

  return (
    <div className="px-4 pt-4 pb-2 max-w-screen-xl mx-auto">
      <div
        className="relative rounded-2xl overflow-hidden select-none"
        style={{ minHeight: 400 }}
      >
        {/* Outgoing slide */}
        {p && (
          <div
            className="absolute inset-0 z-10"
            style={{ animation: "slideOut 0.7s cubic-bezier(.77,0,.18,1) forwards" }}
          >
            <img src={p.image} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center top" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(120deg,rgba(0,0,0,0.72) 40%,rgba(0,0,0,0.18) 100%)" }} />
          </div>
        )}

        {/* Active slide */}
        <div
          className="absolute inset-0 z-20"
          style={{ animation: animating ? "slideIn 0.7s cubic-bezier(.77,0,.18,1) forwards" : "none" }}
        >
          <img src={s.image} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center top" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(120deg,rgba(0,0,0,0.72) 40%,rgba(0,0,0,0.18) 100%)" }} />

          {/* Accent glow blobs */}
          <div className="absolute top-8 right-20 w-56 h-56 rounded-full opacity-30 blur-2xl pointer-events-none"
            style={{ background: `radial-gradient(circle, ${s.accent[0]}, transparent 70%)` }} />
          <div className="absolute bottom-8 right-8 w-40 h-40 rounded-full opacity-20 blur-2xl pointer-events-none"
            style={{ background: `radial-gradient(circle, ${s.accent[1]}, transparent 70%)` }} />

          {/* Stars */}
          {[...Array(14)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white pointer-events-none"
              style={{
                width: i % 3 === 0 ? 2 : 1,
                height: i % 3 === 0 ? 2 : 1,
                top: `${10 + (i * 17) % 70}%`,
                left: `${5 + (i * 23) % 55}%`,
                opacity: 0.15 + (i % 5) * 0.1,
              }}
            />
          ))}

          {/* City skyline */}
          <svg className="absolute bottom-0 left-0 right-0 w-full opacity-25 pointer-events-none"
            viewBox="0 0 800 120" preserveAspectRatio="none" fill="#000">
            <rect x="0" y="70" width="30" height="50" /><rect x="20" y="45" width="20" height="75" />
            <rect x="50" y="60" width="25" height="60" /><rect x="80" y="30" width="15" height="90" />
            <rect x="100" y="55" width="30" height="65" /><rect x="140" y="20" width="20" height="100" />
            <rect x="165" y="40" width="25" height="80" /><rect x="195" y="10" width="18" height="110" />
            <rect x="218" y="35" width="30" height="85" /><rect x="255" y="25" width="15" height="95" />
            <rect x="640" y="30" width="20" height="90" /><rect x="665" y="15" width="18" height="105" />
            <rect x="688" y="40" width="25" height="80" /><rect x="718" y="22" width="15" height="98" />
            <rect x="738" y="48" width="30" height="72" /><rect x="772" y="35" width="18" height="85" />
          </svg>

          {/* Ground glow */}
          <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
            style={{ background: `linear-gradient(to top, ${s.accent[0]}55, transparent)`, opacity: 0.5 }} />

          {/* Content */}
          <div
            className="relative z-10 p-8 md:p-10 flex flex-col max-w-lg"
            key={current}
            style={{ animation: "contentIn 0.6s 0.2s both" }}
          >
            {/* Tag pill */}
            <span
              className="w-fit text-[10px] font-extrabold tracking-[0.2em] px-3 py-1 rounded-full mb-3"
              style={{ background: `linear-gradient(90deg, ${s.accent[0]}, ${s.accent[1]})`, color: "#fff" }}
            >
              {s.tag}
            </span>

            <h1 className="text-5xl md:text-6xl font-black leading-none tracking-tight">
              <span className="text-white">{s.title[0]}</span>
              <br />
              <span className="italic" style={{
                background: `linear-gradient(90deg, ${s.accent[0]}, ${s.accent[1]})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                {s.title[1]}
              </span>
            </h1>

            <p className="mt-4 text-white/60 text-sm leading-relaxed whitespace-pre-line">{s.sub}</p>

            <div className="flex flex-wrap items-center gap-3 mt-6">

              {/* CTA button — changes per slide, animates in with contentIn */}
              {isBuy ? (
                <button
                  onClick={() => navigate("/shop", { state: { slideId: s.id, tag: s.tag } })}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white hover:scale-105 hover:shadow-lg active:scale-95 transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${s.accent[0]}, ${s.accent[1]})`,
                    boxShadow: `0 4px 24px ${s.accent[0]}55`,
                  }}
                >
                  BUY NOW →
                </button>
              ) : (
                <button
                  onClick={() => navigate("/customize")}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white hover:scale-105 hover:shadow-lg active:scale-95 transition-all animate-[blinkGlow_1.5s_infinite]"
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    boxShadow: "0 4px 24px #10b98155",
                  }}
                >
                  CUSTOMIZE T-SHIRT →
                </button>
              )}

              {/* Badge pill */}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm">
                <span className="text-yellow-400 text-xs">⚡</span>
                <div>
                  <p className="text-[10px] text-white/50 leading-none">Limited Time Offer</p>
                  <p className="text-sm font-bold" style={{
                    background: `linear-gradient(90deg, ${s.accent[0]}, ${s.accent[1]})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}>
                    {s.badge}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-5 left-0 right-0 z-30 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                height: 8,
                width: i === current ? 28 : 8,
                borderRadius: 99,
                background: i === current
                  ? `linear-gradient(90deg, ${s.accent[0]}, ${s.accent[1]})`
                  : "rgba(255,255,255,0.25)",
                border: "none",
                cursor: "pointer",
                transition: "width 0.4s cubic-bezier(.77,0,.18,1), background 0.4s",
                boxShadow: i === current ? `0 0 10px 2px ${s.accent[0]}88` : "none",
                padding: 0,
              }}
            />
          ))}
        </div>

        <style>{`
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(60px) scale(0.98); }
            to   { opacity: 1; transform: translateX(0)   scale(1);    }
          }
          @keyframes slideOut {
            from { opacity: 1; transform: translateX(0)    scale(1);    }
            to   { opacity: 0; transform: translateX(-60px) scale(0.98); }
          }
          @keyframes contentIn {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0);    }
          }
          @keyframes blinkGlow {
            0%, 100% { box-shadow: 0 0 8px rgba(16,185,129,0.4), 0 0 16px rgba(16,185,129,0.3); }
            50%       { box-shadow: 0 0 20px rgba(16,185,129,0.8), 0 0 35px rgba(16,185,129,0.5); }
          }
        `}</style>
      </div>
    </div>
  );
}