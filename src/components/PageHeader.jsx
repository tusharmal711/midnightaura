// Shared hero header used across info/legal pages (About, Contact, Privacy, Terms, Returns)
// Keeps visual language consistent with the rest of the ChomokTomok site:
// near-black canvas, purple→green brand gradient accent, soft glow.

export default function PageHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="relative overflow-hidden border-b border-white/5">
      {/* Ambient glow blobs — same accent colors used in Footer's PWA/Play buttons */}
      <div
        className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #9333ea, transparent 70%)" }}
      />
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #34d399, transparent 70%)" }}
      />

      <div className="max-w-screen-xl mx-auto px-6 pt-16 pb-12 relative">
        {eyebrow && (
          <span
            className="inline-block text-[10px] font-semibold uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-4"
            style={{
              background: "rgba(147,51,234,0.12)",
              border: "1px solid rgba(147,51,234,0.3)",
              color: "#c084fc",
            }}
          >
            {eyebrow}
          </span>
        )}
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/40 text-sm md:text-base max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}