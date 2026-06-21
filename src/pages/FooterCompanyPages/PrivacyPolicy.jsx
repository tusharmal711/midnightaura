import PageHeader from "../../components/PageHeader";
import LegalSection from "./LegalSection";

export default function PrivacyPolicy() {
  return (
    <div className="bg-[#080c14] min-h-screen">
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="Last updated: June 1, 2026. This explains what information ChomokTomok collects, why we collect it, and the choices you have."
      />

      <section className="max-w-screen-md mx-auto px-6 py-12">

        <LegalSection number="01" title="Information we collect">
          <p>When you create an account, place an order, or use the custom T-shirt studio, we collect details like your name, email address, phone number, shipping address, and payment confirmation (we never store full card numbers — that's handled by our payment provider).</p>
          <p>We also collect basic usage data automatically: pages visited, device type, and approximate location, so we can keep the site fast and secure.</p>
        </LegalSection>

        <LegalSection number="02" title="How we use your information">
          <p>We use your information to process orders, send shipping updates, respond to support requests, and personalize your experience — like remembering your saved sizes or custom designs.</p>
          <p>With your consent, we may also send occasional emails about new drops or restocks. You can opt out at any time from your account settings or the unsubscribe link in any email.</p>
        </LegalSection>

        <LegalSection number="03" title="Sharing your information">
          <p>We don't sell your personal data. We share only what's necessary with trusted partners who help us run the business — payment processors, shipping couriers, and analytics tools — and only for the purpose of fulfilling your order or improving the site.</p>
        </LegalSection>

        <LegalSection number="04" title="Cookies">
          <p>We use cookies to keep you logged in, remember items in your cart, and understand which pages people use most. You can disable cookies in your browser, though some features — like checkout — may not work properly without them.</p>
        </LegalSection>

        <LegalSection number="05" title="Data security">
          <p>We use industry-standard encryption for data in transit and restrict access to personal information to staff who need it to do their jobs. No system is ever 100% secure, but we treat your data the way we'd want ours treated.</p>
        </LegalSection>

        <LegalSection number="06" title="Your rights">
          <p>You can request a copy of the data we hold on you, ask us to correct it, or request deletion of your account at any time by contacting us at the email below. We'll respond within 30 days.</p>
        </LegalSection>

        <LegalSection number="07" title="Children's privacy">
          <p>Our Kids' collection is for children, but our store is not designed for children to use directly. If you're under 18, please have a parent or guardian complete any purchase on your behalf.</p>
        </LegalSection>

        <LegalSection number="08" title="Changes to this policy">
          <p>We may update this policy as our practices evolve. Material changes will be announced on this page, and the "last updated" date above will reflect the latest revision.</p>
        </LegalSection>

        <LegalSection number="09" title="Contact us">
          <p>Questions about this policy? Reach out at <a href="mailto:support@chomoktomok.com" className="text-[#34d399] hover:underline">support@chomoktomok.com</a> or call <a href="tel:+8801700000000" className="text-[#34d399] hover:underline">+880 1700-000000</a>.</p>
        </LegalSection>

      </section>
    </div>
  );
}