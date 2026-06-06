import { useEffect, useState } from "react";

export default function InstallApp({ variant = "banner" }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled]           = useState(false);
  const [dismissed, setDismissed]           = useState(false);

  // Check if already running as installed PWA
  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
    } else {
      // Fallback: guide user manually (browser doesn't support auto-prompt)
      alert(
        "To install:\n• Chrome/Edge: tap the menu (⋮) → 'Add to Home screen' or 'Install app'\n• Safari: tap Share → 'Add to Home Screen'"
      );
    }
  };

  // Don't show if already installed as PWA or user installed this session
  if (isStandalone || installed) return null;

  // ── Banner variant: only show when browser fires the prompt ─────────────────
  if (variant === "banner") {
    if (!deferredPrompt || dismissed) return null;
    return (
      <div
        className="fixed bottom-4 left-1/2 z-[9999] flex items-center gap-4 px-5 py-3.5 rounded-2xl shadow-2xl"
        style={{
          transform: "translateX(-50%)",
          width: "min(90vw, 420px)",
          background: "linear-gradient(135deg,#1a1f35,#2a1f4f)",
          border: "1px solid rgba(124,58,237,0.35)",
          boxShadow: "0 8px 40px rgba(124,58,237,0.3)",
        }}
      >
        <div
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#7c3aed,#ec4899)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="3" width="14" height="18" rx="2.5" stroke="white" strokeWidth="1.8"/>
            <circle cx="12" cy="18.5" r="1" fill="white"/>
            <path d="M10 11l2 2 2-2M12 8v5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold leading-tight">Install Chomoktomok</p>
          <p className="text-white/50 text-xs mt-0.5">Add to home screen for faster access</p>
        </div>
        <button
          onClick={installApp}
          className="shrink-0 px-4 py-1.5 rounded-lg text-white text-xs font-bold transition hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(90deg,#7c3aed,#ec4899)" }}
        >
          Install
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-white/30 hover:text-white/70 transition text-lg leading-none"
          aria-label="Dismiss"
        >✕</button>
      </div>
    );
  }

  // ── Button variant: ALWAYS visible in footer (never hidden by prompt state) ──
  return (
    <button
      onClick={installApp}
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 w-full"
      style={{
        background: "linear-gradient(135deg,#1a1f35 0%,#2a1f4f 100%)",
        border: "1px solid rgba(124,58,237,0.4)",
        boxShadow: "0 4px 20px rgba(124,58,237,0.2)",
      }}
    >
      {/* Android phone with download arrow */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="2" width="14" height="20" rx="2.5" stroke="url(#pg)" strokeWidth="1.7"/>
        <circle cx="12" cy="19" r="1" fill="url(#pg)"/>
        <path d="M9.5 10.5l2.5 2.5 2.5-2.5M12 7v6" stroke="#a78bfa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
          <linearGradient id="pg" x1="5" y1="2" x2="19" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a78bfa"/>
            <stop offset="1" stopColor="#f472b6"/>
          </linearGradient>
        </defs>
      </svg>
      <div className="flex flex-col leading-tight text-left">
        <span className="text-white/40 text-[9px] tracking-wider uppercase">Install</span>
        <span className="text-white text-xs font-bold">Chomoktomok App</span>
      </div>
    </button>
  );
}