import InfoPageLayout from '@/components/policy/InfoPageLayout'
import { PolicyList, PolicySection } from '@/components/policy/policy-section'
import { policyMetadata } from '@/lib/policy-metadata'

export const metadata = policyMetadata(
  'Return Policy',
  'Understand when returns are accepted for damaged, wrong, or defective items.'
)

export default function ReturnPolicyPage() {
  return (
    <InfoPageLayout
      title="Return Policy"
      subtitle="We want you to be happy with your purchase. Please read when returns apply."
    >
      <PolicySection title="When returns are accepted">
        <p>Returns may be considered only if the item is:</p>
        <PolicyList
          items={[
            'Damaged on arrival',
            'Wrong item sent (different product or size than ordered)',
            'Defective (fault in fabric, stitching, or manufacturing)',
          ]}
        />
        <p>Returns are not accepted for change of mind or sizing preference — see our Exchange Policy instead.</p>
      </PolicySection>

      <PolicySection title="Time limit">
        <p>
          Please contact us within <strong>24–48 hours</strong> of receiving your order if you
          believe there is a valid return case. Late reports may not be accepted.
        </p>
      </PolicySection>

      <PolicySection title="Condition of item">
        <p>For a return to be approved, the item must be:</p>
        <PolicyList
          items={[
            'Unused and unwashed',
            'With original tags attached',
            'In original packaging where possible',
            'Accompanied by photos or video if requested',
          ]}
        />
      </PolicySection>

      <PolicySection title="Return approval">
        <p>
          All returns require our approval before you send the item back. Do not return parcels
          without confirmation — unauthorized returns may not be processed.
        </p>
      </PolicySection>

      <PolicySection title="Not eligible for return">
        <PolicyList
          items={[
            'Used, washed, or altered items',
            'Items without tags or damaged by the customer',
            'Items returned after the allowed time window',
            'Final sale or heavily discounted items (if marked non-returnable at purchase)',
          ]}
        />
      </PolicySection>

      <PolicySection title="How to start a return">
        <p>
          Contact us via{' '}
          <a href="/contact-us" className="text-primary hover:underline">
            Contact Us
          </a>{' '}
          with your order number, photos of the issue, and a brief description. We will guide you
          on the next steps.
        </p>
      </PolicySection>
    </InfoPageLayout>
  )
}
