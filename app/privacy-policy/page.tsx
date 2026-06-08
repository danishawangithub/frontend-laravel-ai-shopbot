import InfoPageLayout from '@/components/policy/InfoPageLayout'
import { PolicyList, PolicySection } from '@/components/policy/policy-section'
import { policyMetadata } from '@/lib/policy-metadata'

export const metadata = policyMetadata(
  'Privacy Policy',
  'How we collect and use your information when you shop with us.'
)

export default function PrivacyPolicyPage() {
  return (
    <InfoPageLayout
      title="Privacy Policy"
      subtitle="We respect your privacy and use your information only to serve you better."
    >
      <PolicySection title="Information we collect">
        <p>When you place an order or contact us, we may collect:</p>
        <PolicyList
          items={[
            'Name',
            'Phone number',
            'Email address (if provided)',
            'Delivery address',
            'Order details (products, sizes, amounts)',
          ]}
        />
      </PolicySection>

      <PolicySection title="How we use your information">
        <PolicyList
          items={[
            'To process and deliver your orders',
            'To contact you about order status or delivery',
            'To provide customer support',
            'To improve our website and service',
          ]}
        />
      </PolicySection>

      <PolicySection title="We do not sell your data">
        <p>
          We do not sell your personal information to third parties. We share data only as needed
          with delivery partners to complete your order (e.g. courier name, phone, address).
        </p>
      </PolicySection>

      <PolicySection title="Security">
        <p>
          We take reasonable steps to protect your information. However, no online system is 100%
          secure. Please use a strong password if you create an account and avoid sharing OTP or
          payment details with anyone claiming to be from our store without verification.
        </p>
      </PolicySection>

      <PolicySection title="Updates to your information">
        <p>
          If your phone number or address changes, contact us before your order ships. You may
          request correction of your contact details via our{' '}
          <a href="/contact-us" className="text-primary hover:underline">
            Contact Us
          </a>{' '}
          page.
        </p>
      </PolicySection>

      <PolicySection title="Policy updates">
        <p>
          We may update this policy from time to time. The latest version will always be available
          on this page. Continued use of our website after changes means you accept the updated
          policy.
        </p>
      </PolicySection>
    </InfoPageLayout>
  )
}
