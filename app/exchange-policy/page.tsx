import InfoPageLayout from '@/components/policy/InfoPageLayout'
import { PolicyList, PolicySection } from '@/components/policy/policy-section'
import { policyMetadata } from '@/lib/policy-metadata'

export const metadata = policyMetadata(
  'Exchange Policy',
  'Learn about exchanges for size issues, wrong items, or defects when approved.'
)

export default function ExchangePolicyPage() {
  return (
    <InfoPageLayout
      title="Exchange Policy"
      subtitle="Exchanges may be available in certain cases — subject to approval and stock."
    >
      <PolicySection title="When exchanges are allowed">
        <p>We may approve an exchange if:</p>
        <PolicyList
          items={[
            'You received the wrong size (subject to availability)',
            'The wrong item was sent',
            'There is a manufacturing defect',
          ]}
        />
        <p>Each request is reviewed individually. Exchange is not guaranteed for all cases.</p>
      </PolicySection>

      <PolicySection title="Item condition">
        <p>
          The item must be unused, unwashed, and in resalable condition with tags and packaging
          intact. Items that show wear or damage may not qualify.
        </p>
      </PolicySection>

      <PolicySection title="Stock availability">
        <p>
          Exchanges depend on stock for the requested size or design. If the replacement is not
          available, we may offer an alternative, store credit, or refund according to the case —
          as agreed with you.
        </p>
      </PolicySection>

      <PolicySection title="Delivery charges">
        <p>
          Depending on the reason for exchange, return or re-delivery charges may apply. For
          example, size exchanges requested by the customer may require you to pay courier costs.
          Defective or wrong-item cases may be handled differently at our discretion.
        </p>
      </PolicySection>

      <PolicySection title="How to request an exchange">
        <p>
          Contact us within <strong>24–48 hours</strong> of delivery via{' '}
          <a href="/contact-us" className="text-primary hover:underline">
            Contact Us
          </a>
          . Include your order number and clear photos. Wait for approval before sending any item
          back.
        </p>
      </PolicySection>
    </InfoPageLayout>
  )
}
