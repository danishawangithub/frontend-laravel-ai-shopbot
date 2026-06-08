import InfoPageLayout from '@/components/policy/InfoPageLayout'
import FaqAccordion from '@/components/policy/FaqAccordion'
import { PolicySection } from '@/components/policy/policy-section'
import { FAQ_ITEMS } from '@/lib/faq-content'
import { policyMetadata } from '@/lib/policy-metadata'

export const metadata = policyMetadata(
  'FAQs',
  'Frequently asked questions about orders, delivery, returns, sizing, and support.'
)

export default function FaqsPage() {
  return (
    <InfoPageLayout
      title="Frequently Asked Questions"
      subtitle="Quick answers about shopping, delivery, returns, and more."
    >
      <PolicySection title="Common questions">
        <FaqAccordion items={FAQ_ITEMS} />
      </PolicySection>

      <PolicySection title="Still need help?">
        <p>
          Visit our{' '}
          <a href="/contact-us" className="text-primary hover:underline">
            Contact Us
          </a>{' '}
          page or read our{' '}
          <a href="/shipping-policy" className="text-primary hover:underline">
            Shipping
          </a>
          ,{' '}
          <a href="/return-policy" className="text-primary hover:underline">
            Return
          </a>
          , and{' '}
          <a href="/exchange-policy" className="text-primary hover:underline">
            Exchange
          </a>{' '}
          policies for more detail.
        </p>
      </PolicySection>
    </InfoPageLayout>
  )
}
