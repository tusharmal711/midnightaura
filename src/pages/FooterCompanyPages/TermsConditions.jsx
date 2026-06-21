
import LegalSection from "./LegalSection";
import PageHeader from "../../components/PageHeader";

export default function TermsAndConditions() {
  return (
    <div className="bg-[#080c14] min-h-screen">
      <PageHeader
        eyebrow="Legal"
        title="Terms & Conditions"
        subtitle="Last updated: June 1, 2026. By using ChomokTomok and placing an order, you agree to the terms below."
      />

      <section className="max-w-screen-md mx-auto px-6 py-12">

        <LegalSection number="01" title="Using our site">
          <p>You must be at least 18 years old, or have a parent/guardian's permission, to create an account and place orders. You agree to provide accurate information and to keep your login credentials secure.</p>
        </LegalSection>

        <LegalSection number="02" title="Products and pricing">
          <p>We do our best to display colors and sizing accurately, but slight variations can occur due to screen settings or production batches. Prices are listed in the currency shown at checkout and may change without prior notice, though confirmed orders keep the price you paid.</p>
        </LegalSection>

        <LegalSection number="03" title="Custom T-shirt orders">
          <p>Designs submitted through the custom T-shirt studio must be your own work or properly licensed. We reserve the right to decline printing any design that infringes copyright, contains hate speech, or violates our content guidelines. Custom orders are made-to-order and are non-refundable except for manufacturing defects.</p>
        </LegalSection>

        <LegalSection number="04" title="Orders and payment">
          <p>Placing an order is an offer to purchase, which we confirm by email once payment is verified. We reserve the right to cancel any order due to stock issues, pricing errors, or suspected fraud — in which case you'll be refunded in full.</p>
        </LegalSection>

        <LegalSection number="05" title="Shipping">
          <p>Delivery timelines shown at checkout are estimates, not guarantees. Delays caused by couriers, customs, or events outside our control are not our liability, though we'll always help track down a missing order.</p>
        </LegalSection>

        <LegalSection number="06" title="Returns and refunds">
          <p>Standard (non-custom) items can be returned under the conditions outlined in our <a href="/return-policy" className="text-[#34d399] hover:underline">Return Policy</a>. Custom and made-to-order pieces are final sale unless defective.</p>
        </LegalSection>

        <LegalSection number="07" title="Intellectual property">
          <p>All designs, logos, and site content belong to ChomokTomok unless otherwise stated. You may not reproduce, resell, or repurpose our designs without written permission.</p>
        </LegalSection>

        <LegalSection number="08" title="Limitation of liability">
          <p>We're not liable for indirect or incidental damages arising from use of our site or products, to the extent permitted by law. Our total liability for any claim is limited to the amount you paid for the relevant order.</p>
        </LegalSection>

        <LegalSection number="09" title="Changes to these terms">
          <p>We may revise these terms from time to time. Continuing to use the site after changes are posted means you accept the updated terms.</p>
        </LegalSection>

        <LegalSection number="10" title="Contact us">
          <p>For questions about these terms, email <a href="mailto:support@chomoktomok.com" className="text-[#34d399] hover:underline">support@chomoktomok.com</a> or call <a href="tel:+8801700000000" className="text-[#34d399] hover:underline">+880 1700-000000</a>.</p>
        </LegalSection>

      </section>
    </div>
  );
}