import PageHeader from "../../components/PageHeader";

const values = [
  {
    title: "Made for the bold",
    text: "Every drop is designed for people who'd rather stand out than blend in. No filler basics — only pieces with a point of view.",
    color: "#9333ea",
  },
  {
    title: "Small batches, real quality",
    text: "We drop in limited runs instead of mass-producing. That means tighter quality control and pieces that don't show up on everyone else.",
    color: "#34d399",
  },
  {
    title: "Built to last",
    text: "Heavyweight cottons, reinforced seams, prints that don't crack after a few washes. Streetwear shouldn't fall apart in a season.",
    color: "#f472b6",
  },
];

const milestones = [
  { year: "2022", text: "ChomokTomok started as a one-product idea: an oversized tee that didn't exist yet." },
  { year: "2023", text: "Expanded into hoodies and our first jewelry line — earrings and necklaces made for everyday wear." },
  { year: "2024", text: "Opened Men's, Women's, and Kids' collections as the community kept asking for more." },
  { year: "2026", text: "Launched the custom T-shirt studio, putting design control directly in your hands." },
];

export default function AboutUs() {
  return (
    <div className="bg-[#080c14] min-h-screen">
      <PageHeader
        eyebrow="Our Story"
        title="We make clothes for people who don't want to disappear."
        subtitle="ChomokTomok is a streetwear and accessories label built around one idea: your aura shouldn't be optional. From oversized tees to fine jewelry, every piece is made to be noticed."
      />

      {/* ── Mission statement ── */}
      <section className="max-w-screen-xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-white text-2xl font-bold mb-4">What we believe</h2>
            <p className="text-white/40 text-sm leading-relaxed mb-4">
              Most fashion brands chase trends. We chase identity. ChomokTomok exists for the
              people who already know what they want to say with what they wear — we just give
              them the canvas.
            </p>
            <p className="text-white/40 text-sm leading-relaxed">
              That's why we sell across categories that don't usually sit on the same rack:
              oversized fits, hoodies, kids' wear, and jewelry. It's all one wardrobe to us —
              built for confidence, not conformity.
            </p>
          </div>

          <div
            className="rounded-2xl p-8"
            style={{
              background: "linear-gradient(135deg, rgba(147,51,234,0.08), rgba(52,211,153,0.06))",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <p className="text-white/70 text-sm uppercase tracking-widest font-semibold mb-2">
              Our promise
            </p>
            <p className="text-white text-xl font-bold leading-snug">
              "Premium streetwear for every aura. Stand out. Be bold. Be you."
            </p>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="max-w-screen-xl mx-auto px-6 py-10">
        <h2 className="text-white text-2xl font-bold mb-8">Why people stick with us</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {values.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl p-6 transition-transform duration-200 hover:-translate-y-1"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span
                className="block w-10 h-10 rounded-lg mb-4"
                style={{ background: `${v.color}22`, border: `1px solid ${v.color}55` }}
              />
              <h3 className="text-white font-semibold mb-2">{v.title}</h3>
              <p className="text-white/35 text-xs leading-relaxed">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="max-w-screen-xl mx-auto px-6 py-10 pb-20">
        <h2 className="text-white text-2xl font-bold mb-8">How we got here</h2>
        <div className="flex flex-col gap-0">
          {milestones.map((m, i) => (
            <div key={m.year} className="flex gap-6 pb-8 relative">
              {i !== milestones.length - 1 && (
                <span
                  className="absolute left-[27px] top-8 bottom-0 w-px"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                />
              )}
              <span
                className="flex items-center justify-center w-14 h-14 rounded-xl text-white text-xs font-bold shrink-0"
                style={{
                  background: "linear-gradient(135deg,#9333ea,#34d399)",
                }}
              >
                {m.year}
              </span>
              <p className="text-white/50 text-sm leading-relaxed pt-3">{m.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}