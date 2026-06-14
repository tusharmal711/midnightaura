import { useState, useRef, useEffect } from "react";

const SEGMENTS = [
  { label: "5% OFF",      color: "#E8531A", textColor: "#fff",    probability: 0.17 },
  { label: "NO DISCOUNT", color: "#0a0f1e", textColor: "#9ca3af", probability: 0.07 },
  { label: "10% OFF",     color: "#2563EB", textColor: "#fff",    probability: 0.10 },
  { label: "5% OFF",      color: "#d97706", textColor: "#fff",    probability: 0.17 },
  { label: "NO DISCOUNT", color: "#0a0f1e", textColor: "#9ca3af", probability: 0.06 },
  { label: "15% OFF",     color: "#059669", textColor: "#fff",    probability: 0.10 },
  { label: "5% OFF",      color: "#7c3aed", textColor: "#fff",    probability: 0.16 },
  { label: "10% OFF",     color: "#0284c7", textColor: "#fff",    probability: 0.10 },
  { label: "NO DISCOUNT", color: "#0a0f1e", textColor: "#9ca3af", probability: 0.07 },
  { label: "50% OFF",     color: "#be185d", textColor: "#fff",    probability: 0.03 },
];

const ACTIVE = SEGMENTS;
const TOTAL  = ACTIVE.reduce((s, seg) => s + seg.probability, 0);
const SLICE  = 360 / ACTIVE.length;

function pickSegment() {
  let r = Math.random() * TOTAL;
  for (let i = 0; i < ACTIVE.length; i++) {
    r -= ACTIVE[i].probability;
    if (r <= 0) return i;
  }
  return ACTIVE.length - 1;
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function segmentPath(cx, cy, r, startAngle, endAngle) {
  const s = polarToCartesian(cx, cy, r, startAngle);
  const e = polarToCartesian(cx, cy, r, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M${cx},${cy} L${s.x},${s.y} A${r},${r},0,${large},1,${e.x},${e.y} Z`;
}

function easeOut(t) { return 1 - Math.pow(1 - t, 4); }

function genCode(label) {
  const tag  = label.replace("% OFF", "").replace(" ", "");
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `SAVE${tag}-${rand}`;
}

const PRIZES = [
  { label: "50% OFF",     color: "#be185d", icon: "🔥" },
  { label: "15% OFF",     color: "#059669", icon: "✨" },
  { label: "10% OFF",     color: "#2563EB", icon: "⚡" },
  { label: "5% OFF",      color: "#d97706", icon: "🎁" },
  { label: "No Discount", color: "#4b5563", icon: "😶" },
];

/* ── Audio helpers ── */
function createAudioContext() {
  try {
    return new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    return null;
  }
}

// Single tick click (like a ratchet) — louder
function playTick(ctx, pitch = 440) {
  if (!ctx) return;
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(pitch, ctx.currentTime);
  gain.gain.setValueAtTime(0.55, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.05);
}

// Win fanfare — louder
function playWinSound(ctx) {
  if (!ctx) return;
  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.13);
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.13);
    gain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + i * 0.13 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.13 + 0.25);
    osc.start(ctx.currentTime + i * 0.13);
    osc.stop(ctx.currentTime + i * 0.13 + 0.3);
  });
}

// No-discount dull thud — louder
function playLoseSound(ctx) {
  if (!ctx) return;
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "triangle";
  osc.frequency.setValueAtTime(180, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.65, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.4);
}

export default function SpinnerDiscount() {
  const [rotation, setRotation]     = useState(0);
  const [spinning, setSpinning]     = useState(false);
  const [result, setResult]         = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [hasSpun, setHasSpun]       = useState(false);
  const [code, setCode]             = useState("");
  const [isMobile, setIsMobile]     = useState(
    typeof window !== "undefined" ? window.innerWidth < 641 : false
  );

  const animRef       = useRef(null);
  const currentRotRef = useRef(0);
  const audioCtxRef   = useRef(null);
  const lastTickRef   = useRef(0); // tracks last segment boundary crossed for tick

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 641);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const WS = isMobile ? 280 : 310;
  const cx = WS / 2;
  const cy = WS / 2;
  const R  = WS / 2 - 14;

  function spin() {
    if (spinning || hasSpun) return;
    setResult(null);
    setShowResult(false);

    // Init / resume audio context on user gesture
    if (!audioCtxRef.current) audioCtxRef.current = createAudioContext();
    const ctx = audioCtxRef.current;
    if (ctx && ctx.state === "suspended") ctx.resume();

    const winIndex    = pickSegment();
    const extraSpins  = 6 + Math.floor(Math.random() * 3);
    const segMid      = winIndex * SLICE + SLICE / 2;
    const targetAngle = extraSpins * 360 + (360 - segMid);
    const startRot    = currentRotRef.current;
    const startTime   = performance.now();
    const duration    = 4200 + Math.random() * 800;

    lastTickRef.current = Math.floor(startRot / SLICE); // last segment index crossed
    setSpinning(true);

    function animate(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const angle    = startRot + easeOut(progress) * targetAngle;
      currentRotRef.current = angle;
      setRotation(angle);

      // Tick sound: fire whenever we cross a new segment boundary
      const currentSeg = Math.floor(angle / SLICE);
      if (currentSeg !== lastTickRef.current) {
        lastTickRef.current = currentSeg;
        // Speed = how fast we're moving; map to pitch so fast = high, slow = low
        const speed      = (easeOut(Math.min((elapsed + 16) / duration, 1)) - easeOut(progress));
        const speedNorm  = Math.max(0, Math.min(1, speed * 60)); // normalise
        const pitch      = 200 + speedNorm * 600; // 200 Hz slow → 800 Hz fast
        playTick(ctx, pitch);
      }

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setHasSpun(true);
        const won = ACTIVE[winIndex];
        setResult(won);
        if (won.label !== "NO DISCOUNT") {
          setCode(genCode(won.label));
          setTimeout(() => playWinSound(ctx), 350);
        } else {
          setTimeout(() => playLoseSound(ctx), 350);
        }
        setTimeout(() => setShowResult(true), 300);
      }
    }
    animRef.current = requestAnimationFrame(animate);
  }

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  const isWin = result && result.label !== "NO DISCOUNT";

  return (
    <section style={{
      background: "#0E1320",
      padding: "2.5rem 1rem",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <span style={{
            display: "inline-block", background: "rgba(236,72,153,0.15)",
            color: "#f472b6", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
            textTransform: "uppercase", padding: "4px 14px", borderRadius: 20,
            border: "1px solid rgba(244,114,182,0.25)", marginBottom: 10,
          }}>
            Weekly Spin
          </span>
          <h2 style={{ color: "#fff", fontSize: "clamp(1.3rem, 3.5vw, 1.9rem)", fontWeight: 700, margin: "0 0 6px", lineHeight: 1.2 }}>
            Spin &amp; Win a Discount
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: 0 }}>
            One free spin per week. Up to 50% off your order.
          </p>
        </div>

        {/* Main layout */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `${WS + 24}px 1fr`,
          gap: "2.5rem",
          alignItems: "center",
        }}>

          {/* Wheel column */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <div style={{ position: "relative", width: WS + 24, height: WS + 24 }}>

              {/* Gold ring */}
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                boxShadow: "0 0 0 5px #b8860b, 0 0 0 9px #ffd700, 0 0 0 12px #b8860b, 0 0 28px rgba(255,215,0,0.2)",
                zIndex: 2, pointerEvents: "none",
              }} />

              {/* Bulbs */}
              {[...Array(20)].map((_, i) => {
                const angle = (i / 20) * 360;
                const pos   = polarToCartesian(WS / 2 + 12, WS / 2 + 12, WS / 2 + 6, angle);
                return (
                  <div key={i} style={{
                    position: "absolute",
                    left: pos.x - 4, top: pos.y - 4,
                    width: 8, height: 8, borderRadius: "50%",
                    background: i % 2 === 0 ? "#ffd700" : "#fffde7",
                    boxShadow: "0 0 5px rgba(255,215,0,0.9)",
                    zIndex: 3, pointerEvents: "none",
                  }} />
                );
              })}

              {/* SVG Wheel */}
              <svg
                width={WS} height={WS} viewBox={`0 0 ${WS} ${WS}`}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  display: "block",
                  borderRadius: "50%",
                  position: "absolute",
                  top: 12, left: 12,
                }}
              >
                <defs>
                  <radialGradient id="hub" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fff9c4" />
                    <stop offset="55%" stopColor="#ffd700" />
                    <stop offset="100%" stopColor="#a07000" />
                  </radialGradient>
                </defs>
                {ACTIVE.map((seg, i) => {
                  const start  = i * SLICE;
                  const end    = start + SLICE;
                  const mid    = start + SLICE / 2;
                  const textR  = R * 0.63;
                  const tp     = polarToCartesian(cx, cy, textR, mid);
                  const tAngle = mid - 90;
                  const isSmall = seg.label.length > 7;
                  return (
                    <g key={i}>
                      <path d={segmentPath(cx, cy, R, start, end)} fill={seg.color} stroke="#ffd700" strokeWidth="1.2" />
                      <text
                        x={tp.x} y={tp.y}
                        transform={`rotate(${tAngle}, ${tp.x}, ${tp.y})`}
                        textAnchor="middle" dominantBaseline="middle"
                        fill={seg.textColor}
                        fontSize={isSmall ? "9.5" : "11.5"}
                        fontWeight="800"
                        fontFamily="Inter, sans-serif"
                        style={{ userSelect: "none" }}
                      >
                        {seg.label}
                      </text>
                    </g>
                  );
                })}
                <circle cx={cx} cy={cy} r={24} fill="url(#hub)" stroke="#8a6000" strokeWidth="2" />
                <circle cx={cx} cy={cy} r={10} fill="rgba(255,255,255,0.5)" />
              </svg>

              {/* Pointer */}
              <div style={{
                position: "absolute", top: 2, left: "50%",
                transform: "translateX(-50%)", zIndex: 10,
              }}>
                <svg width="22" height="30" viewBox="0 0 22 30">
                  <polygon points="11,30 0,0 22,0" fill="#f43f5e" />
                  <polygon points="11,25 4,5 18,5" fill="#fb7185" opacity="0.55" />
                </svg>
              </div>
            </div>

            {/* Spin button */}
            <button
              onClick={spin}
              disabled={spinning || hasSpun}
              style={{
                width: "100%",
                maxWidth: 220,
                padding: "12px 0",
                background: hasSpun
                  ? "rgba(255,255,255,0.06)"
                  : spinning
                    ? "rgba(244,63,94,0.5)"
                    : "linear-gradient(135deg, #f43f5e 0%, #9333ea 100%)",
                border: hasSpun ? "1px solid rgba(255,255,255,0.1)" : "none",
                borderRadius: 10,
                color: hasSpun ? "rgba(255,255,255,0.25)" : "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: hasSpun ? "not-allowed" : spinning ? "wait" : "pointer",
                letterSpacing: "0.03em",
                transition: "opacity 0.2s, transform 0.15s",
                transform: spinning ? "scale(0.97)" : "scale(1)",
              }}
            >
              {spinning ? "Spinning…" : hasSpun ? "Already spun this week" : "Spin the Wheel"}
            </button>
          </div>

          {/* Right panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {showResult && result ? (
              <div style={{
                background: isWin
                  ? "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(139,92,246,0.12) 100%)"
                  : "rgba(255,255,255,0.04)",
                border: isWin ? "1px solid rgba(16,185,129,0.35)" : "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, padding: "1.1rem 1.25rem",
                animation: "fadeUp 0.4s ease-out",
              }}>
                {isWin ? (
                  <>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>🎉</div>
                    <p style={{ color: "#10b981", fontWeight: 700, fontSize: 13, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Congratulations!</p>
                    <h3 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 800, margin: "0 0 10px" }}>{result.label}</h3>
                    <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, margin: "0 0 10px" }}>
                      Voucher added to your profile
                    </p>
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: "rgba(0,0,0,0.35)", borderRadius: 8, padding: "8px 14px",
                      border: "1px dashed rgba(255,215,0,0.35)",
                    }}>
                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Voucher code</span>
                      <span style={{ color: "#fbbf24", fontWeight: 800, fontSize: 13, letterSpacing: "0.1em", fontFamily: "monospace" }}>{code}</span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, margin: "8px 0 0", textAlign: "right" }}>Valid for 7 days · Use at checkout</p>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>😔</div>
                    <h3 style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 4px" }}>No discount this time</h3>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>Come back next week for another spin!</p>
                  </>
                )}
              </div>
            ) : (
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, padding: "1rem 1.25rem",
              }}>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 12px", fontWeight: 600 }}>
                  Possible Prizes
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {PRIZES.map((p) => (
                    <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: p.color + "28", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                        {p.icon}
                      </div>
                      <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: 600 }}>{p.label}</span>
                      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14, padding: "1rem 1.25rem",
            }}>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 10px", fontWeight: 600 }}>
                How it works
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { n: "1", text: "Hit Spin to rotate the wheel" },
                  { n: "2", text: "Win a discount voucher instantly" },
                  { n: "3", text: "Apply the code at checkout" },
                ].map((step) => (
                  <div key={step.n} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: "rgba(244,63,94,0.2)", color: "#f472b6",
                      fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>{step.n}</div>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12.5, lineHeight: 1.5, paddingTop: 1 }}>{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          section > div > div:nth-child(2) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}