import InfoPageLayout from '@/components/policy/InfoPageLayout'
import { PolicyList, PolicySection } from '@/components/policy/policy-section'
import { policyMetadata } from '@/lib/policy-metadata'

export const metadata = policyMetadata(
  'Shipping Policy',
  'Learn about delivery across Pakistan, estimated delivery times, and order tracking.'
)

export default function ShippingPolicyPage() {
  return (
    <InfoPageLayout
      title="Shipping Policy"
      subtitle="How we deliver your orders across Pakistan."
    >
      <PolicySection title="Delivery coverage">
        <p>
          We deliver orders across Pakistan through trusted courier partners. Delivery availability
          may vary for remote areas; if there is an issue with your location, we will contact you
          after you place your order.
        </p>
      </PolicySection>

      <PolicySection title="Estimated delivery time">
        <p>
          Most orders are delivered within <strong>3–5 working days</strong> after confirmation and
          dispatch. This is an estimate only — actual delivery may take longer during peak seasons,
          sales, or courier delays.
        </p>
      </PolicySection>

      <PolicySection title="Delays">
        <p>Delivery may be delayed due to:</p>
        <PolicyList
          items={[
            'Courier or logistics delays',
            'Weather or road conditions',
            'Public holidays or Eid/sale periods',
            'Incorrect or incomplete address details',
          ]}
        />
        <p>We appreciate your patience if your parcel takes longer than expected.</p>
      </PolicySection>

      <PolicySection title="Correct contact & address">
        <p>
          Please provide an accurate phone number and complete delivery address at checkout. Orders
          with wrong numbers or incomplete addresses may be delayed or returned by the courier.
        </p>
      </PolicySection>

      <PolicySection title="Order tracking">
        <p>
          When your order is dispatched, we may share a tracking reference by SMS, WhatsApp, or
          email (depending on how we contact you). You can also reach out via our{' '}
          <a href="/contact-us" className="text-primary hover:underline">
            Contact Us
          </a>{' '}
          page with your order number for a status update.
        </p>
      </PolicySection>

      <PolicySection title="Cash on delivery">
        <p>
          Where cash on delivery (COD) is offered, please keep the exact amount ready if possible.
          Refusal of delivery without a valid reason may affect future orders.
        </p>
      </PolicySection>
    </InfoPageLayout>
  )
}
