const features = [
  {
    icon: (
      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    title: "Premium Quality",
    subtitle: "100% Cotton Fabric",
    borderColor: "border-purple-500/20",
    glowColor: "shadow-purple-500/10",
  },
  {
    icon: (
      <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12h12L19 8" />
      </svg>
    ),
    title: "Free Shipping",
    subtitle: "On All Orders",
    borderColor: "border-pink-500/20",
    glowColor: "shadow-pink-500/10",
  },
  {
    icon: (
      <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: "Easy Returns",
    subtitle: "7 Days Return Policy",
    borderColor: "border-orange-500/20",
    glowColor: "shadow-orange-500/10",
  },
  {
    icon: (
      <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: "Secure Payment",
    subtitle: "100% Protected",
    borderColor: "border-yellow-500/20",
    glowColor: "shadow-yellow-500/10",
  },
];

export default function Features() {
  return (
    <div className="px-4 py-3 max-w-screen-xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {features.map((f, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 bg-white/[0.04] border ${f.borderColor} rounded-xl px-4 py-3 shadow-lg ${f.glowColor}`}
          >
            <div className="shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
              {f.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">{f.title}</p>
              <p className="text-[11px] text-white/40">{f.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}