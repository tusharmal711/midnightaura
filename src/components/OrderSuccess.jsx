import { useEffect, useRef } from "react";
import { FiCheck, FiShoppingBag } from "react-icons/fi";

function CelebrationCanvas() {
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

    const COLORS = ["#a078ff","#FFE51F","#ff6b9d","#00e5ff","#ff9f43","#54a0ff","#ffd32a","#ff4757","#7bed9f"];

    class Particle {
      constructor(x, y, burst) {
        this.x = x; this.y = y; this.burst = burst;
        const angle = Math.random() * Math.PI * 2;
        const speed = burst ? 4 + Math.random() * 10 : 1 + Math.random() * 3;
        this.vx = Math.cos(angle) * speed * (burst ? 1 : 0.5);
        this.vy = Math.sin(angle) * speed * (burst ? -1 : -0.5) - (burst ? 2 : 1);
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.size = burst ? 6 + Math.random() * 8 : 4 + Math.random() * 6;
        this.life = 1;
        this.decay = burst ? 0.012 + Math.random() * 0.018 : 0.008 + Math.random() * 0.012;
        this.rot = Math.random() * 360;
        this.rotV = (Math.random() - 0.5) * 8;
        this.shape = Math.random() < 0.5 ? "rect" : "circle";
        this.gravity = 0.18;
      }
      update() {
        this.vy += this.gravity;
        this.x += this.vx; this.y += this.vy;
        this.vx *= 0.98; this.life -= this.decay;
        this.rot += this.rotV;
      }
      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rot * Math.PI) / 180);
        if (this.shape === "circle") {
          ctx.beginPath(); ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillRect(-this.size / 2, -this.size / 3, this.size, this.size * 0.6);
        }
        ctx.restore();
      }
    }

    let particles = [];
    let animId;

    const burst = (x, y, n = 60) => {
      for (let i = 0; i < n; i++) particles.push(new Particle(x, y, true));
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // gentle rain
      for (let i = 0; i < 4; i++)
        particles.push(new Particle(Math.random() * canvas.width, -10, false));
      particles = particles.filter((p) => p.life > 0);
      particles.forEach((p) => { p.update(); p.draw(ctx); });
      animId = requestAnimationFrame(loop);
    };

    const cx = canvas.width / 2, cy = canvas.height / 2;
    setTimeout(() => {
      burst(cx, cy, 80);
      burst(cx - 80, cy + 40, 40);
      burst(cx + 80, cy + 40, 40);
      setTimeout(() => burst(cx, cy - 30, 50), 300);
      setTimeout(() => { burst(cx - 60, cy, 30); burst(cx + 60, cy, 30); }, 500);
    }, 200);

    loop();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
    />
  );
}

// --- Replace your success block with this ---
if (success) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Raleway:wght@300;400;500;600&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`* { box-sizing: border-box; } body { margin: 0; } input { outline: none; }`}</style>
      <div
        className="min-h-screen bg-[#0E1320] flex items-center justify-center px-4 relative overflow-hidden"
        style={{ fontFamily: "'Raleway', sans-serif" }}
      >
        <CelebrationCanvas />
        <div className="text-center flex flex-col items-center gap-4 max-w-xs relative z-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#a078ff] to-[#7c3aed] flex items-center justify-center"
            style={{ animation: "pulse-glow 1.4s ease-in-out infinite", boxShadow: "0 0 40px rgba(160,120,255,0.5)" }}>
            <FiCheck size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#e8e0ff]" style={{ fontFamily: "'Cinzel', serif" }}>Order Placed!</h2>
          <p className="text-sm text-[#8880aa] leading-relaxed">
            Your order has been successfully placed.<br />
            You'll receive a confirmation shortly.
          </p>
          <button
            onClick={() => navigate("/user/dashboard")}
            className="mt-2 px-8 py-3 rounded-xl bg-gradient-to-br from-[#FFE51F] to-[#FFD600] text-[#111827] text-sm font-bold flex items-center gap-2"
            style={{ fontFamily: "'Poppins', sans-serif", boxShadow: "0 0 20px rgba(255,229,31,0.35)" }}
          >
            <FiShoppingBag size={16} /> Continue Shopping
          </button>
        </div>
      </div>
    </>
  );
}