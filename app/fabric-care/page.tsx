import InfoPageLayout from '@/components/policy/InfoPageLayout'
import { PolicyList, PolicySection } from '@/components/policy/policy-section'
import { policyMetadata } from '@/lib/policy-metadata'

export const metadata = policyMetadata(
  'Fabric Care',
  'Care instructions for lawn, embroidered, and delicate Pakistani suit fabrics.'
)

export default function FabricCarePage() {
  return (
    <InfoPageLayout
      title="Fabric Care"
      subtitle="Help your suits stay beautiful for longer with proper care."
    >
      <PolicySection title="General care">
        <PolicyList
          items={[
            'Wash dark colors separately from light colors',
            'Gentle hand wash is recommended for most lawn and embroidered fabrics',
            'Do not use bleach unless the care label specifically allows it',
            'Dry in shade — avoid direct harsh sunlight to reduce fading',
            'Iron on low or medium heat; use a cloth between iron and embroidery when needed',
          ]}
        />
      </PolicySection>

      <PolicySection title="Lawn & cotton">
        <p>
          Lawn suits are best washed in cool or lukewarm water with mild detergent. Avoid wringing
          heavily — gently squeeze out water and hang to dry. Light ironing helps restore crispness.
        </p>
      </PolicySection>

      <PolicySection title="Embroidered & delicate pieces">
        <PolicyList
          items={[
            'Turn garments inside out before washing if possible',
            'Avoid harsh scrubbing on embroidery, sequins, or thread work',
            'Store folded with tissue paper or hang on padded hangers to avoid snagging',
            'Professional dry cleaning may be suitable for heavy festive or embellished items',
          ]}
        />
      </PolicySection>

      <PolicySection title="First wash">
        <p>
          It is normal for some new fabrics to release a little excess dye on the first wash.
          Washing separately the first time helps protect other clothes.
        </p>
      </PolicySection>

      <PolicySection title="Questions">
        <p>
          If a product page includes specific care instructions, follow those first. For other
          questions, contact us via{' '}
          <a href="/contact-us" className="text-primary hover:underline">
            Contact Us
          </a>
          .
        </p>
      </PolicySection>
    </InfoPageLayout>
  )
}
