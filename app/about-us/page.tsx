import InfoPageLayout from '@/components/policy/InfoPageLayout'
import { PolicySection } from '@/components/policy/policy-section'
import { policyMetadata } from '@/lib/policy-metadata'

export const metadata = policyMetadata(
  'About Us',
  'Learn about our Pakistani suits and ethnic wear store, our collections, and our commitment to quality and customer service.'
)

export default function AboutUsPage() {
  return (
    <InfoPageLayout
      title="About Us"
      subtitle="Your trusted online destination for Pakistani ethnic wear — lawn, stitched suits, and timeless designs."
    >
      <PolicySection title="Who we are">
        <p>
          We are an online Pakistani suits store focused on bringing quality ethnic wear to
          customers across Pakistan. Our goal is to make it easy to shop lawn collections,
          stitched outfits, and elegant designs from the comfort of your home.
        </p>
      </PolicySection>

      <PolicySection title="What we sell">
        <p>
          We offer a curated range of Pakistani women&apos;s fashion including lawn suits,
          unstitched and stitched collections, festive wear, and everyday ethnic styles. New
          arrivals are added regularly so you can find fresh designs for every season.
        </p>
      </PolicySection>

      <PolicySection title="Quality & customer service">
        <p>
          We care about fabric quality, stitching, and accurate product descriptions. Our team
          works to pack orders carefully and support you with order updates, delivery questions,
          and after-sales help when you need it.
        </p>
      </PolicySection>

      <PolicySection title="Pakistani ethnic wear">
        <p>
          From breathable lawn for summer to richer festive pieces, our collections reflect
          Pakistani taste and occasion wear. Whether you prefer ready-to-wear stitched suits or
          unstitched fabric to tailor at home, we aim to offer options that suit different
          preferences and budgets.
        </p>
      </PolicySection>

      <PolicySection title="Our promise">
        <p>
          We want every customer to shop with confidence. If you have questions about sizing,
          fabric, or your order, please reach out through our{' '}
          <a href="/contact-us" className="text-primary hover:underline">
            Contact Us
          </a>{' '}
          page — we are here to help.
        </p>
      </PolicySection>
    </InfoPageLayout>
  )
}
