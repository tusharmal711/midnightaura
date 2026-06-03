import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiShoppingBag, FiPackage, FiCheck, FiList } from "react-icons/fi";
import { IoIosFlash } from "react-icons/io";
import { BsPatchCheckFill } from "react-icons/bs";

// ── Yellow Celebration Canvas ─────────────────────────────────────────────────
function YellowCelebrationCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const parent = canvas.parentElement;

    const resize = () => {
      canvas.width = parent.offsetWidth;
      canvas.height = parent.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const COLORS = [
      "#FFE51F", "#FFD600", "#FFC107", "#FFAB00",
      "#FFE082", "#FFF176", "#FF8F00", "#FFCA28",
      "#ffffff", "#fffde7", "#fff59d",
    ];

    class Particle {
      constructor(x, y, burst) {
        this.x = x;
        this.y = y;
        this.burst = burst;
        const angle = Math.random() * Math.PI * 2;
        const speed = burst ? 5 + Math.random() * 12 : 1.5 + Math.random() * 3.5;
        this.vx = Math.cos(angle) * speed * (burst ? 1 : 0.4);
        this.vy = Math.sin(angle) * speed * (burst ? -1 : -0.6) - (burst ? 3 : 1);
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.size = burst ? 7 + Math.random() * 10 : 4 + Math.random() * 7;
        this.life = 1;
        this.decay = burst
          ? 0.01 + Math.random() * 0.016
          : 0.006 + Math.random() * 0.01;
        this.rot = Math.random() * 360;
        this.rotV = (Math.random() - 0.5) * 10;
        this.gravity = 0.16;
        const r = Math.random();
        this.shape = r < 0.4 ? "rect" : r < 0.7 ? "circle" : r < 0.85 ? "diamond" : "star";
      }

      update() {
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.life -= this.decay;
        this.rot += this.rotV;
      }

      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rot * Math.PI) / 180);

        if (this.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.shape === "rect") {
          ctx.fillRect(-this.size / 2, -this.size / 3, this.size, this.size * 0.55);
        } else if (this.shape === "diamond") {
          const s = this.size / 2;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.6, 0);
          ctx.lineTo(0, s);
          ctx.lineTo(-s * 0.6, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          const outer = this.size / 2;
          const inner = outer * 0.45;
          const spikes = 5;
          ctx.beginPath();
          for (let i = 0; i < spikes * 2; i++) {
            const r2 = i % 2 === 0 ? outer : inner;
            const a = (i * Math.PI) / spikes - Math.PI / 2;
            i === 0
              ? ctx.moveTo(Math.cos(a) * r2, Math.sin(a) * r2)
              : ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
          }
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
    }

    let particles = [];
    let animId;

    const burst = (x, y, n = 70) => {
      for (let i = 0; i < n; i++) particles.push(new Particle(x, y, true));
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < 5; i++) {
        particles.push(new Particle(Math.random() * canvas.width, -10, false));
      }
      particles = particles.filter((p) => p.life > 0);
      particles.forEach((p) => { p.update(); p.draw(ctx); });
      animId = requestAnimationFrame(loop);
    };

    setTimeout(() => {
      const cx = canvas.width / 2;
      const cy = canvas.height * 0.45;
      burst(cx, cy, 90);
      burst(cx - 100, cy + 60, 45);
      burst(cx + 100, cy + 60, 45);
      setTimeout(() => burst(cx, cy - 40, 60), 280);
      setTimeout(() => { burst(cx - 70, cy + 20, 35); burst(cx + 70, cy + 20, 35); }, 520);
      setTimeout(() => burst(cx, cy + 30, 50), 800);
    }, 150);

    loop();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
}

// ── Animated glow ring ────────────────────────────────────────────────────────
function GlowRing() {
  return (
    <div className="relative flex items-center justify-center">
      <div
        className="absolute w-36 h-36 rounded-full border-2 border-[#FFE51F]/30"
        style={{ animation: "ring-pulse 2s ease-out infinite" }}
      />
      <div
        className="absolute w-28 h-28 rounded-full border border-[#FFE51F]/50"
        style={{ animation: "ring-pulse 2s ease-out infinite 0.4s" }}
      />
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center z-10"
        style={{
          background: "linear-gradient(135deg, #FFE51F, #FFB300)",
          boxShadow: "0 0 50px rgba(255,229,31,0.7), 0 0 100px rgba(255,229,31,0.3)",
          animation: "core-breathe 1.6s ease-in-out infinite",
        }}
      >
        <FiCheck size={38} className="text-[#111827]" strokeWidth={3} />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Raleway:wght@300;400;500;600&family=Poppins:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }

        @keyframes ring-pulse {
          0%   { transform: scale(0.85); opacity: 0.8; }
          100% { transform: scale(1.6);  opacity: 0; }
        }
        @keyframes core-breathe {
          0%,100% { box-shadow: 0 0 50px rgba(255,229,31,0.7), 0 0 100px rgba(255,229,31,0.3); }
          50%      { box-shadow: 0 0 80px rgba(255,229,31,0.95), 0 0 160px rgba(255,229,31,0.5); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes badge-pop {
          0%   { opacity: 0; transform: scale(0.6) translateY(10px); }
          70%  { transform: scale(1.08) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes flash-yellow {
          0%,100% { background-color: #0E1320; }
          50%     { background-color: #161825; }
        }
        .slide-up-1 { animation: slide-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.2s both; }
        .slide-up-2 { animation: slide-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.4s both; }
        .slide-up-3 { animation: slide-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.6s both; }
        .slide-up-4 { animation: slide-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.8s both; }
        .slide-up-5 { animation: slide-up 0.6s cubic-bezier(0.22,1,0.36,1) 1.0s both; }
        .badge-pop  { animation: badge-pop 0.5s cubic-bezier(0.22,1,0.36,1) 1s both; }
        .page-flash { animation: flash-yellow 2s ease-in-out 0.1s 3; }
        .btn-ghost:hover { background: rgba(255,229,31,0.08) !important; border-color: rgba(255,229,31,0.45) !important; }
      `}</style>

      <div
        className="page-flash min-h-screen bg-[#0E1320] flex items-center justify-center px-4 relative overflow-hidden"
        style={{ fontFamily: "'Raleway', sans-serif", backgroundColor: "#0E1320" }}
      >
        {/* Radial glow background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,229,31,0.07) 0%, transparent 70%)",
          }}
        />

        <YellowCelebrationCanvas />

        {/* Content card */}
        <div
          className="relative z-10 flex flex-col items-center text-center gap-6 max-w-sm w-full"
          style={{
            borderRadius: 28,
            padding: "44px 36px 40px",
          }}
        >
          {/* Icon */}
          <div className="slide-up-1">
            <GlowRing />
          </div>

          {/* Heading */}
          <div className="slide-up-2 flex flex-col gap-2">
            <h1
              className="text-3xl font-bold text-[#FFE51F]"
              style={{
                fontFamily: "'Cinzel', serif",
                textShadow: "0 0 30px rgba(255,229,31,0.5)",
              }}
            >
              Order Placed!
            </h1>
            <p className="text-sm text-[#b8b0cc] leading-relaxed">
              Your order has been successfully confirmed.<br />
              You'll receive a notification shortly.
            </p>
          </div>

          {/* Divider */}
          <div
            className="slide-up-3 w-full h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,229,31,0.3), transparent)",
            }}
          />

          {/* Trust badges */}
          <div className="slide-up-3 grid grid-cols-3 gap-3 w-full">
            {[
              { icon: <FiPackage size={17} />,        label: "Packed Safely"  },
              { icon: <IoIosFlash size={17} />,        label: "Fast Dispatch"  },
              { icon: <BsPatchCheckFill size={17} />,  label: "Verified Order" },
            ].map((b, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl"
                style={{
                  background: "rgba(255,229,31,0.05)",
                  border: "1px solid rgba(255,229,31,0.12)",
                }}
              >
                <span className="text-[#FFE51F]">{b.icon}</span>
                <span className="text-[9px] text-[#8880aa] leading-tight text-center">
                  {b.label}
                </span>
              </div>
            ))}
          </div>

          {/* Payment Successful pill */}
          {/* <div
            className="badge-pop flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
            style={{
              background: "rgba(255,229,31,0.1)",
              border: "1px solid rgba(255,229,31,0.25)",
              color: "#FFE51F",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            <FiCheck size={12} />
            Payment Successful
          </div> */}

          {/* ── CTA buttons ── */}
          <div className="slide-up-4 w-full flex flex-col gap-3">

            {/* Primary — Continue Shopping */}
            <button
              onClick={() => navigate("/user/dashboard")}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #FFE51F, #FFD600)",
                color: "#111827",
                fontFamily: "'Poppins', sans-serif",
                boxShadow: "0 0 24px rgba(255,229,31,0.4), 0 4px 20px rgba(255,214,0,0.3)",
              }}
            >
              <FiShoppingBag size={16} />
              Continue Shopping
            </button>

            {/* Secondary — My Orders */}
            <button
              onClick={() => navigate("/user/profile/orders")}
              className="btn-ghost w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: "rgba(255,229,31,0.04)",
                border: "1px solid rgba(255,229,31,0.22)",
                color: "#FFE51F",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              <FiList size={16} />
              My Orders
            </button>

          </div>
        </div>
      </div>
    </>
  );
}