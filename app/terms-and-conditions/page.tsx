import InfoPageLayout from '@/components/policy/InfoPageLayout'
import { PolicyList, PolicySection } from '@/components/policy/policy-section'
import { policyMetadata } from '@/lib/policy-metadata'

export const metadata = policyMetadata(
  'Terms and Conditions',
  'Terms for using our website and placing orders.'
)

export default function TermsAndConditionsPage() {
  return (
    <InfoPageLayout
      title="Terms and Conditions"
      subtitle="Please read these terms before using our website or placing an order."
    >
      <PolicySection title="Website use">
        <p>
          By using this website, you agree to these terms. If you do not agree, please do not use
          the site. You must be able to form a binding contract under applicable law to place
          orders.
        </p>
      </PolicySection>

      <PolicySection title="Products & images">
        <p>
          We try to show accurate product photos and descriptions. Colors may vary slightly due
          to screen settings, lighting, or fabric batch differences. Minor variations in embroidery
          or shade are normal for ethnic wear and do not necessarily mean a defect.
        </p>
      </PolicySection>

      <PolicySection title="Prices">
        <p>
          Prices are shown in Pakistani Rupees (PKR) unless stated otherwise. We may change prices,
          offers, or discounts at any time without notice. The price charged is the price shown at
          checkout when you complete your order.
        </p>
      </PolicySection>

      <PolicySection title="Stock & orders">
        <p>
          Orders are subject to stock availability. If an item becomes unavailable after you order,
          we will contact you to offer a replacement, wait list, or refund as appropriate.
        </p>
      </PolicySection>

      <PolicySection title="Your responsibility">
        <PolicyList
          items={[
            'Provide correct name, phone, and delivery address',
            'Be available to receive the parcel or arrange a reliable receiver',
            'Inspect your parcel on delivery and report issues promptly',
          ]}
        />
      </PolicySection>

      <PolicySection title="Cancellations & fraud">
        <p>
          We may cancel orders that appear fraudulent, abusive, or placed with incorrect information
          repeatedly. We reserve the right to refuse service in such cases.
        </p>
      </PolicySection>

      <PolicySection title="Related policies">
        <p>
          Shipping, returns, exchanges, and privacy are covered in separate policies linked in our
          website footer. Those policies form part of your shopping agreement with us.
        </p>
      </PolicySection>

      <PolicySection title="Changes to terms">
        <p>
          We may update these terms at any time. Updated terms apply from the date they are posted
          on this page.
        </p>
      </PolicySection>
    </InfoPageLayout>
  )
}
