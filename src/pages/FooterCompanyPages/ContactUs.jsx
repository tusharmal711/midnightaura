import { useState } from "react";
import PageHeader from "../../components/PageHeader";

const contactChannels = [
  {
    label: "Email",
    value: "support@chomoktomok.com",
    href: "mailto:support@chomoktomok.com",
    color: "#34d399",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </svg>
    ),
  },
  {
    label: "Phone",
    value: "+880 1700-000000",
    href: "tel:+8801700000000",
    color: "#9333ea",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    value: "+880 1700-000000",
    href: "https://wa.me/8801700000000",
    color: "#25D366",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.85.5 3.58 1.4 5.07L2 22l5.2-1.5a9.85 9.85 0 0 0 4.84 1.27h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.78 13.97c-.24.68-1.4 1.32-1.93 1.4-.49.08-1.12.11-1.81-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.18-4.93-4.37-.14-.19-1.18-1.57-1.18-3 0-1.42.74-2.12 1-2.41.27-.29.58-.36.78-.36.2 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.81 2 .88 2.15.07.15.12.32.02.51-.1.19-.15.31-.3.48-.15.17-.32.38-.45.51-.15.15-.3.31-.13.6.17.29.78 1.28 1.67 2.07 1.15 1.03 2.12 1.35 2.41 1.5.29.15.46.13.63-.05.17-.18.71-.83.9-1.12.19-.29.38-.24.63-.14.25.1 1.6.75 1.87.89.27.14.45.21.52.33.07.12.07.7-.17 1.38z" />
      </svg>
    ),
  },
];

export default function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Hook this up to your backend / email service of choice.
    setSent(true);
  };

  return (
    <div className="bg-[#080c14] min-h-screen">
      <PageHeader
        eyebrow="Get In Touch"
        title="Questions? Drop in anytime."
        subtitle="Whether it's an order issue, a sizing question, or a custom-tee idea you want to talk through — our team usually replies within 24 hours."
      />

      <section className="max-w-screen-xl mx-auto px-6 py-14 grid md:grid-cols-2 gap-10">

        {/* ── Contact channels ── */}
        <div>
          <h2 className="text-white text-xl font-bold mb-6">Reach us directly</h2>
          <div className="flex flex-col gap-4">
            {contactChannels.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.99]"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  textDecoration: "none",
                }}
              >
                <span
                  className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
                  style={{ background: `${c.color}1a`, border: `1px solid ${c.color}55`, color: c.color }}
                >
                  {c.icon}
                </span>
                <div className="flex flex-col">
                  <span className="text-white/40 text-[11px] uppercase tracking-wider">{c.label}</span>
                  <span className="text-white text-sm font-semibold">{c.value}</span>
                </div>
              </a>
            ))}
          </div>

          {/* ── Hours + address ── */}
          <div
            className="mt-6 rounded-2xl p-5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p className="text-white/40 text-[11px] uppercase tracking-wider mb-2">Support hours</p>
            <p className="text-white/70 text-sm mb-4">Sunday – Friday, 10:00 AM – 7:00 PM (GMT+6)</p>
            <p className="text-white/40 text-[11px] uppercase tracking-wider mb-2">Studio address</p>
            <p className="text-white/70 text-sm">House 12, Road 4, Gulshan, Dhaka, Bangladesh</p>
          </div>
        </div>

        {/* ── Message form ── */}
        <div>
          <h2 className="text-white text-xl font-bold mb-6">Or send a message</h2>

          {sent ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{
                background: "linear-gradient(135deg, rgba(52,211,153,0.1), rgba(147,51,234,0.06))",
                border: "1px solid rgba(52,211,153,0.3)",
              }}
            >
              <p className="text-white font-semibold mb-1">Message sent.</p>
              <p className="text-white/40 text-sm">We'll get back to you at {form.email || "your email"} soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-white/40 text-[11px] uppercase tracking-wider block mb-1.5">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none placeholder-white/20"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>
              <div>
                <label className="text-white/40 text-[11px] uppercase tracking-wider block mb-1.5">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none placeholder-white/20"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>
              <div>
                <label className="text-white/40 text-[11px] uppercase tracking-wider block mb-1.5">Message</label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none placeholder-white/20 resize-none"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>
              <button
                type="submit"
                className="mt-2 px-6 py-3 rounded-xl text-white text-sm font-bold transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg,#9333ea,#34d399)",
                  boxShadow: "0 4px 20px rgba(147,51,234,0.25)",
                }}
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}