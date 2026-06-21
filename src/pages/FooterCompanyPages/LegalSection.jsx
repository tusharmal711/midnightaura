// Shared section block for legal/policy pages — consistent numbering,
// spacing, and typography so Privacy / Terms / Returns all feel like one family.

export default function LegalSection({ number, title, children }) {
  return (
    <div className="py-6 border-b border-white/5 last:border-0">
      <div className="flex items-baseline gap-3 mb-3">
        <span
          className="text-xs font-bold tracking-wider"
          style={{ color: "#34d399" }}
        >
          {number}
        </span>
        <h2 className="text-white text-lg font-bold">{title}</h2>
      </div>
      <div className="text-white/40 text-sm leading-relaxed space-y-3 pl-0">
        {children}
      </div>
    </div>
  );
}