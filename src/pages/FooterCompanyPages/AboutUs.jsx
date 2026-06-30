import PageHeader from "../../components/PageHeader";
import { Helmet } from "react-helmet-async";
const products = [
  "Printed T-Shirts",
  "Ladies Tops",
  "Hoodies",
  "Kids Wear",
  "Necklaces",
  "Earrings",
  "Oversized T-Shirts",
];

const values = [
  {
    title: "Customize it your way",
    text: "Tshirt, ladies tops, hoodies, kids tshirt, oversized fits — tell us your design and we'll print it exactly how you imagined it.",
    color: "#9333ea",
  },
  {
    title: "Pure cotton, every time",
    text: "180–240 GSM pure cotton fabric on every piece. Heavier, softer, and built to hold its shape wash after wash.",
    color: "#34d399",
  },
  {
    title: "Quality at a fair price",
    text: "Premium fabric and print quality shouldn't cost a premium. We price every piece to be fair, not just affordable.",
    color: "#f472b6",
  },
];

const milestones = [
  { year: "May 2026", text: "ChomokTomok began its journey — a fresh streetwear and accessories label built on one promise: quality you can trust." },
];

const team = [
  {
    name: "Tushar Mal",
    role: "Founder",
    education: "MCA from MAKAUT University",
    profession: "Web Developer",
    email: "tusharmal711@gmail.com",
    mobile: "+91 9641539527",
    color: "#9333ea",
  },
  {
    name: "Pratick Mal",
    role: "Co-Founder & Partner",
    education: "BCA from Burdwan University",
    profession: "Web Developer",
    email: "pratickmal123@gmail.com",
    mobile: "+91 9883165299",
    color: "#34d399",
  },
  {
    name: "Puskar Mondal",
    role: "Co-Founder & Partner",
    education: "H.S. from WBCHSE",
    profession: "Cader & Emitation Jewellery Designer",
    email: "puskarmondal089980@gmail.com",
    mobile: "+91 9734496613",
    color: "#f472b6",
  },
];

export default function AboutUs() {
  return (<>
    <Helmet>
    <title>
      About ChomokTomok | Premium Custom T-Shirts, Hoodies & Fashion Brand
    </title>

    <meta
      name="description"
      content="Learn about ChomokTomok, an Indian fashion brand offering premium custom T-shirts, oversized T-shirts, hoodies, ladies tops, kids wear, earrings, necklaces, and personalized apparel made with quality cotton."
    />

    <meta
      name="keywords"
      content="about chomoktomok, custom t shirts, oversized t shirts, hoodies, ladies tops, kids wear, t shirt printing, fashion brand india, cotton tshirts"
    />

    <meta name="robots" content="index,follow" />

    <link
      rel="canonical"
      href="https://chomoktomok.com/about"
    />

    <meta
      property="og:title"
      content="About ChomokTomok | Premium Custom T-Shirts & Fashion Brand"
    />

    <meta
      property="og:description"
      content="Discover the story behind ChomokTomok and our mission to deliver premium custom fashion, oversized T-shirts, hoodies, accessories, and personalized apparel."
    />

    <meta
      property="og:image"
      content="https://chomoktomok.com/Images/chomoktomok-og.png"
    />

    <meta
      property="og:url"
      content="https://chomoktomok.com/about"
    />

    <meta property="og:type" content="website" />

    <meta
      name="twitter:card"
      content="summary_large_image"
    />

    <meta
      name="twitter:title"
      content="About ChomokTomok"
    />

    <meta
      name="twitter:description"
      content="Learn more about ChomokTomok and our premium fashion products."
    />

    <meta
      name="twitter:image"
      content="https://chomoktomok.com/Images/chomoktomok-og.png"
    />

    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: "About ChomokTomok",
        url: "https://chomoktomok.com/about",
        description:
          "About ChomokTomok, an Indian fashion brand specializing in premium custom T-shirts, hoodies, oversized T-shirts, ladies tops, kids wear and accessories.",
        publisher: {
          "@type": "Organization",
          name: "ChomokTomok",
          url: "https://chomoktomok.com",
          logo: {
            "@type": "ImageObject",
            url: "https://chomoktomok.com/Images/chomoktomok-app.png",
          },
        },
      })}
    </script>
  </Helmet>
 
    <div className="bg-[#080c14] min-h-screen">

      <PageHeader
        eyebrow="Our Story"
        title="We sell quality and buy trust."
        subtitle="ChomokTomok is a streetwear and accessories label making printed tshirt, ladies tops, hoodies, kids wear, oversized tshirt, necklaces, and earrings — plus fully customized prints on demand. Pure cotton. Fair prices. Real trust."
      />

      {/* ── What we make ── */}
      <section className="max-w-screen-xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-white text-2xl font-bold mb-4">What we make</h2>
            <p className="text-white/40 text-sm leading-relaxed mb-4">
              We make printed t-shirts, ladies tops, hoodies, kids' wear, oversized t-shirts,
              necklaces, and earrings — built for people who want their wardrobe to say
              something.
            </p>
            <p className="text-white/40 text-sm leading-relaxed">
              Want something that doesn't exist yet? We also do custom prints on t-shirts,
              ladies tops, hoodies, kids' t-shirts, and oversized t-shirts — designed exactly to
              your demand, from your idea to the final piece.
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
            <p className="text-white text-xl font-bold leading-snug mb-6">
              "We sell quality and buy trust."
            </p>
            <div className="flex flex-wrap gap-2">
              {products.map((p) => (
                <span
                  key={p}
                  className="text-white/60 text-xs px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {p}
                </span>
              ))}
            </div>
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
      <section className="max-w-screen-xl mx-auto px-6 py-10">
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
                className="flex items-center justify-center w-14 h-14 rounded-xl text-white text-xs font-bold shrink-0 text-center px-1"
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

      {/* ── Team ── */}
      <section className="max-w-screen-xl mx-auto px-6 py-10 pb-20">
        <h2 className="text-white text-2xl font-bold mb-2">Meet the team</h2>
        <p className="text-white/40 text-sm mb-8">
          This is a new startup, built by hand by three people who care about getting it right.
          Your support helps us go further — and earn the trust we're asking for, one quality
          piece at a time.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {team.map((member) => (
            <div
              key={member.name}
              className="rounded-2xl p-6 flex flex-col items-center text-center transition-transform duration-200 hover:-translate-y-1"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {/* Placeholder avatar — swap for real photo */}
              <div
                className="w-24 h-24 rounded-full mb-4 flex items-center justify-center text-white text-2xl font-bold shrink-0"
                style={{
                  background: `${member.color}22`,
                  border: `2px solid ${member.color}55`,
                }}
              >
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>

              <h3 className="text-white font-semibold text-lg">{member.name}</h3>
              <p
                className="text-xs font-semibold uppercase tracking-wide mt-1 mb-3"
                style={{ color: member.color }}
              >
                {member.role}
              </p>

              <div className="w-full text-left text-white/50 text-xs leading-relaxed space-y-1 mb-4">
                <p>
                  <span className="text-white/30">Education: </span>
                  {member.education}
                </p>
                <p>
                  <span className="text-white/30">Profession: </span>
                  {member.profession}
                </p>
              </div>

              <div
                className="w-full rounded-xl p-3 text-left space-y-1.5"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <p className="text-white/60 text-xs break-all">
                  <span className="text-white/30">Email: </span>
                  {member.email}
                </p>
                <p className="text-white/60 text-xs">
                  <span className="text-white/30">Mobile: </span>
                  {member.mobile}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Support CTA ── */}
      <section className="max-w-screen-xl mx-auto px-6 pb-24">
        <div
          className="rounded-2xl p-8 md:p-10 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(147,51,234,0.1), rgba(52,211,153,0.08))",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h2 className="text-white text-xl md:text-2xl font-bold mb-3">
            A new t-shirt printing startup, built on trust
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-2xl mx-auto">
            We're just getting started, and every order helps us go further. Support us as we
            grow, and we'll keep our end of the deal — pure cotton, honest pricing, and quality
            you can count on, every single time.
          </p>
        </div>
      </section>
    </div>
     </>
  );
}