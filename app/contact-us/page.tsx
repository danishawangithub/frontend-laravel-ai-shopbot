import InfoPageLayout from '@/components/policy/InfoPageLayout'
import { PolicySection } from '@/components/policy/policy-section'
import { policyMetadata } from '@/lib/policy-metadata'
import { SITE_CONTACT } from '@/lib/site-contact'
import { Mail, MapPin, Phone, Clock } from 'lucide-react'

export const metadata = policyMetadata(
  'Contact Us',
  'Get in touch for order help, delivery questions, exchanges, and product inquiries.'
)

export default function ContactUsPage() {
  return (
    <InfoPageLayout
      title="Contact Us"
      subtitle="We are happy to help with orders, delivery, exchanges, and product questions."
    >
      <PolicySection title="How to reach us">
        <p>
          For order updates, delivery issues, exchange requests, or product details, contact us
          using the details below. Please include your order number when asking about an existing
          order.
        </p>
      </PolicySection>

      <div className="grid gap-4 sm:grid-cols-2 not-prose">
        <div className="rounded-lg border border-border bg-card p-5 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Mail className="w-5 h-5 text-primary" />
            Email
          </div>
          <a
            href={`mailto:${SITE_CONTACT.email}`}
            className="text-primary hover:underline break-all"
          >
            {SITE_CONTACT.email}
          </a>
          <p className="text-sm text-muted-foreground">(Placeholder — replace with your support email)</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Phone className="w-5 h-5 text-primary" />
            Phone / WhatsApp
          </div>
          <a href={`tel:${SITE_CONTACT.phoneTel}`} className="text-primary hover:underline">
            {SITE_CONTACT.phone}
          </a>
          <p className="text-sm text-muted-foreground">(Placeholder — replace with your number)</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <MapPin className="w-5 h-5 text-primary" />
            Address
          </div>
          <p>{SITE_CONTACT.address}</p>
          <p className="text-sm text-muted-foreground">(Placeholder — add your city/address)</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-5 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Clock className="w-5 h-5 text-primary" />
            Business hours
          </div>
          <p>{SITE_CONTACT.businessHours}</p>
          <p className="text-sm text-muted-foreground">(Placeholder — update your hours)</p>
        </div>
      </div>

      <PolicySection title="What we can help with">
        <ul className="list-disc pl-5 space-y-2">
          <li>Order placement and confirmation</li>
          <li>Delivery status and address changes (before dispatch when possible)</li>
          <li>Exchange, return, or damaged-item reports</li>
          <li>Product sizing, fabric, and availability questions</li>
        </ul>
        <p className="text-sm text-muted-foreground mt-4">
          We aim to respond within 1–2 business days. Messages received on holidays may be
          answered on the next working day.
        </p>
      </PolicySection>
    </InfoPageLayout>
  )
}
