import InfoPageLayout from '@/components/policy/InfoPageLayout'
import { PolicySection } from '@/components/policy/policy-section'
import { policyMetadata } from '@/lib/policy-metadata'

export const metadata = policyMetadata(
  'Size Guide',
  'General size measurements to help you choose the right fit for Pakistani suits.'
)

const SIZE_ROWS = [
  { size: 'S', chest: '36"', waist: '30"', hip: '38"', length: '38"' },
  { size: 'M', chest: '38"', waist: '32"', hip: '40"', length: '40"' },
  { size: 'L', chest: '40"', waist: '34"', hip: '42"', length: '42"' },
  { size: 'XL', chest: '42"', waist: '36"', hip: '44"', length: '44"' },
] as const

export default function SizeGuidePage() {
  return (
    <InfoPageLayout
      title="Size Guide"
      subtitle="Use this guide as a general reference. Measurements may vary by design."
    >
      <PolicySection title="Before you order">
        <p>
          Pakistani suits and lawn sets can fit differently depending on cut, brand style, and
          whether the piece is stitched or unstitched. We recommend measuring yourself and comparing
          with the chart below before ordering.
        </p>
        <p>
          If you are between sizes or unsure, contact us via{' '}
          <a href="/contact-us" className="text-primary hover:underline">
            Contact Us
          </a>{' '}
          with the product name — we will try to help.
        </p>
      </PolicySection>

      <PolicySection title="How to measure">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Chest:</strong> Around the fullest part of the bust, keeping the tape level.
          </li>
          <li>
            <strong>Waist:</strong> Around the natural waistline.
          </li>
          <li>
            <strong>Hip:</strong> Around the fullest part of the hips.
          </li>
          <li>
            <strong>Length:</strong> From shoulder to desired hem (varies by style).
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="General size chart">
        <p className="text-sm text-muted-foreground mb-3">
          Placeholder measurements in inches — update to match your actual product sizing.
        </p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-semibold">Size</th>
                <th className="px-4 py-3 text-left font-semibold">Chest</th>
                <th className="px-4 py-3 text-left font-semibold">Waist</th>
                <th className="px-4 py-3 text-left font-semibold">Hip</th>
                <th className="px-4 py-3 text-left font-semibold">Length</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_ROWS.map((row) => (
                <tr key={row.size} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{row.size}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.chest}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.waist}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.hip}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PolicySection>

      <PolicySection title="Note on fit">
        <p>
          Sizes may vary slightly between designs. Unstitched fabric gives more flexibility for
          tailoring. Stitched suits are made to listed sizes — please choose carefully.
        </p>
      </PolicySection>
    </InfoPageLayout>
  )
}
