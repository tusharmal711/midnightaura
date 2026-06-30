import PageHeader from "../../components/PageHeader";
import LegalSection from "./LegalSection";
import { Helmet } from "react-helmet-async";
const steps = [
  { label: "Delivered", detail: "Your order arrives" },
  { label: "Day 1–7", detail: "Return window open" },
  { label: "Request", detail: "Submit return online" },
  { label: "Refund", detail: "3–5 days after pickup" },
];

export default function ReturnPolicy() {
  return (
     <>
    <Helmet>
      <title>Return Policy | ChomokTomok</title>

      <meta
        name="description"
        content="Read the ChomokTomok Return Policy for information about returns, refunds, exchanges, custom T-shirts, damaged products, and eligibility."
      />

      <meta
        name="keywords"
        content="return policy, refund policy, exchange policy, custom tshirt return, oversized tshirt return, ChomokTomok returns"
      />

      <meta name="robots" content="index,follow" />

      <link
        rel="canonical"
        href="https://chomoktomok.com/return-policy"
      />

      <meta
        property="og:title"
        content="Return Policy | ChomokTomok"
      />

      <meta
        property="og:description"
        content="Learn about ChomokTomok's return, exchange and refund policy."
      />

      <meta
        property="og:image"
        content="https://chomoktomok.com/Images/chomoktomok-og.png"
      />

      <meta
        property="og:url"
        content="https://chomoktomok.com/return-policy"
      />

      <meta property="og:type" content="website" />

      <meta
        name="twitter:card"
        content="summary_large_image"
      />

      <meta
        name="twitter:title"
        content="Return Policy | ChomokTomok"
      />

      <meta
        name="twitter:description"
        content="Read the ChomokTomok Return Policy and refund process."
      />

      <meta
        name="twitter:image"
        content="https://chomoktomok.com/Images/chomoktomok-og.png"
      />

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Return Policy",
          url: "https://chomoktomok.com/return-policy",
          description:
            "Return Policy explaining refunds, exchanges, damaged products and return eligibility at ChomokTomok.",
          isPartOf: {
            "@type": "WebSite",
            name: "ChomokTomok",
            url: "https://chomoktomok.com",
          },
        })}
      </script>
    </Helmet>
    <div className="bg-[#080c14] min-h-screen">
      <PageHeader
        eyebrow="Legal"
        title="Return Policy"
        subtitle="Last updated: June 1, 2026. We want you to love what you ordered — here's how returns work if you don't."
      />

      {/* ── Visual return timeline ── */}
      <section className="max-w-screen-md mx-auto px-6 pt-10">
        <div className="flex items-center gap-2 md:gap-4">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center text-center flex-1">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold mb-2"
                  style={{ background: "linear-gradient(135deg,#9333ea,#34d399)" }}
                >
                  {i + 1}
                </div>
                <span className="text-white text-xs font-semibold">{s.label}</span>
                <span className="text-white/30 text-[10px] mt-0.5">{s.detail}</span>
              </div>
              {i !== steps.length - 1 && (
                <span className="h-px flex-1 mb-6" style={{ background: "rgba(255,255,255,0.1)" }} />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-screen-md mx-auto px-6 py-12">

        <LegalSection number="01" title="Return window">
          <p>You can request a return within 7 days of delivery for any standard item — Men's, Women's, Kids', Oversized, Hoodies, Earrings, and Necklaces. Custom-printed T-shirts are excluded; see section 4.</p>
        </LegalSection>

        <LegalSection number="02" title="Condition requirements">
          <p>Items must be unworn, unwashed, and in their original packaging with tags attached. Jewelry must be returned in its original pouch or box. Items that show signs of wear, odor, or damage won't be accepted.</p>
        </LegalSection>

        <LegalSection number="03" title="How to start a return">
          <p>Go to your account's Order History, select the item, and choose "Request Return." We'll arrange a pickup with our courier partner, or you can ship the item back to our studio address — we'll confirm which applies to your order.</p>
        </LegalSection>

        <LegalSection number="04" title="Custom T-shirts and final sale items">
          <p>Because custom designs are made specifically for you, they can only be returned if the item arrives damaged or doesn't match your submitted design. Sale items marked "Final Sale" at checkout are not eligible for return.</p>
        </LegalSection>

        <LegalSection number="05" title="Refunds">
          <p>Once we receive and inspect your return, refunds are issued to your original payment method within 3–5 business days. Shipping fees from the original order are non-refundable unless the return is due to our error.</p>
        </LegalSection>

        <LegalSection number="06" title="Exchanges">
          <p>Need a different size or color instead of a refund? Select "Exchange" when starting your return request, and we'll ship the replacement as soon as the original item is received.</p>
        </LegalSection>

        <LegalSection number="07" title="Damaged or incorrect items">
          <p>If your order arrives damaged or you received the wrong item, contact us within 48 hours of delivery with photos, and we'll arrange a free replacement or full refund — no return shipping cost to you.</p>
        </LegalSection>

        <LegalSection number="08" title="Need help?">
          <p>Email <a href="mailto:support@chomoktomok.com" className="text-[#34d399] hover:underline">support@chomoktomok.com</a> or call <a href="tel:+8801700000000" className="text-[#34d399] hover:underline">+880 1700-000000</a> and we'll sort it out quickly.</p>
        </LegalSection>

      </section>
    </div>
    </>
  );
}