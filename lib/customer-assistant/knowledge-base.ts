import { FAQ_ITEMS } from '@/lib/faq-content'
import { SITE_CONTACT } from '@/lib/site-contact'
import type { KnowledgeBaseEntry } from '@/lib/customer-assistant/types'

const FAQ_CONTENT = FAQ_ITEMS.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')

/** Static policy knowledge — edit here to update the customer AI assistant. */
export const KNOWLEDGE_BASE: KnowledgeBaseEntry[] = [
  {
    id: 'about',
    title: 'About Us',
    route: '/about-us',
    category: 'about',
    keywords: ['about', 'who', 'brand', 'store', 'company', 'pakistani', 'suits', 'lawn', 'ethnic'],
    content: `We are an online Pakistani suits store offering lawn, stitched and unstitched collections, and festive ethnic wear across Pakistan. We focus on quality fabric, careful packing, and customer support for orders and delivery questions.`,
  },
  {
    id: 'contact',
    title: 'Contact Us',
    route: '/contact-us',
    category: 'contact',
    keywords: [
      'contact',
      'phone',
      'email',
      'support',
      'help',
      'address',
      'whatsapp',
      'call',
      'reach',
      'customer service',
      'rabta',
      'number',
    ],
    content: `Contact us for orders, delivery, exchange, and product questions.
Email: ${SITE_CONTACT.email}
Phone: ${SITE_CONTACT.phone}
Address: ${SITE_CONTACT.address}
Business hours: ${SITE_CONTACT.businessHours}
Include your order number when asking about an existing order. We aim to respond within 1–2 business days.`,
  },
  {
    id: 'shipping',
    title: 'Shipping Policy',
    route: '/shipping-policy',
    category: 'shipping',
    keywords: [
      'shipping',
      'delivery',
      'courier',
      'tracking',
      'days',
      'pakistan',
      'lahore',
      'karachi',
      'islamabad',
      'deliver',
      'parcel',
      'order tracking',
      'kitne din',
      'delivery time',
      'dispatch',
      'cod',
      'cash on delivery',
      'hoti hai',
      'kab',
    ],
    content: `We deliver across Pakistan through courier partners. Remote areas may take longer.
Estimated delivery: 3–5 working days after confirmation and dispatch (estimate only).
Delays may happen due to courier, weather, holidays, Eid, sales, or wrong address.
Provide correct phone and full delivery address at checkout.
When dispatched, tracking may be shared by SMS, WhatsApp, or email. Contact us with order number for status.
Cash on delivery (COD) may be available where offered.`,
  },
  {
    id: 'return',
    title: 'Return Policy',
    route: '/return-policy',
    category: 'return',
    keywords: [
      'return',
      'refund',
      'damaged',
      'wrong item',
      'defective',
      'broken',
      'claim',
      'unused',
      'unwashed',
      'wapas',
      'return policy',
      'fault',
      'tags',
    ],
    content: `Returns may be accepted only for damaged, wrong, or defective items — not for change of mind.
Contact us within 24–48 hours of delivery with order number and photos.
Item must be unused, unwashed, with tags and original packaging where possible.
Return requires our approval before sending back — unauthorized returns may not be processed.
Not eligible: used, washed, altered items, late reports, or final sale/discounted items if marked non-returnable.`,
  },
  {
    id: 'exchange',
    title: 'Exchange Policy',
    route: '/exchange-policy',
    category: 'exchange',
    keywords: [
      'exchange',
      'size issue',
      'wrong size',
      'replace',
      'stock availability',
      'tabdeel',
      'exchange policy',
      'swap',
      'change size',
      'ho sakta',
      'sakta hai',
    ],
    content: `Exchange may be approved for wrong size (if stock available), wrong item sent, or manufacturing defect.
Contact within 24–48 hours of delivery with order number and photos. Wait for approval before returning.
Item must be unused, unwashed, with tags intact.
Exchange depends on stock — if unavailable, alternative, store credit, or refund may be offered.
Return or re-delivery charges may apply depending on the case (e.g. customer-requested size change).`,
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    route: '/privacy-policy',
    category: 'privacy',
    keywords: [
      'privacy',
      'data',
      'personal information',
      'phone number',
      'address',
      'security',
      'sell',
      'share',
      'information',
      'collect',
    ],
    content: `We collect name, phone, email (if provided), address, and order details to process orders and support.
We use data for delivery, order updates, and customer service.
We do not sell your personal information to third parties.
Data is shared only as needed with couriers for delivery.
We take reasonable steps to protect information. Contact us to update your details.`,
  },
  {
    id: 'terms',
    title: 'Terms and Conditions',
    route: '/terms-and-conditions',
    category: 'terms',
    keywords: [
      'terms',
      'conditions',
      'price',
      'stock',
      'order cancellation',
      'website use',
      'color',
      'picture',
      'photo',
      'image',
      'vary',
      'screen',
      'shade',
      'fraud',
      'cancel',
    ],
    content: `By using this website you agree to our terms.
Product images and colors may vary slightly due to screen settings, lighting, or fabric batches — minor differences are normal.
Prices are in PKR and may change. Checkout price applies when order is placed.
Orders subject to stock availability.
Provide correct contact and address details.
We may cancel fraudulent or abusive orders.
Policy pages (shipping, return, exchange, privacy) form part of your agreement with us.`,
  },
  {
    id: 'size',
    title: 'Size Guide',
    route: '/size-guide',
    category: 'size',
    keywords: [
      'size',
      'measurement',
      'chest',
      'waist',
      'hip',
      'length',
      'fitting',
      'fit',
      'small',
      'medium',
      'large',
      'xl',
      'size guide',
      'choose size',
      'measure',
    ],
    content: `Measure chest, waist, hip, and length before ordering. Sizes may vary by design.
General guide (inches, placeholder): S chest 36 waist 30; M chest 38 waist 32; L chest 40 waist 34; XL chest 42 waist 36.
Unstitched fabric allows tailoring flexibility. Stitched suits follow listed sizes — choose carefully.
If unsure, contact support with product name and your measurements before ordering.`,
  },
  {
    id: 'fabric_care',
    title: 'Fabric Care',
    route: '/fabric-care',
    category: 'fabric_care',
    keywords: [
      'wash',
      'washing',
      'care',
      'lawn',
      'fabric',
      'bleach',
      'iron',
      'dry',
      'shade',
      'color',
      'kapra',
      'dhona',
      'embroidered',
      'delicate',
    ],
    content: `Wash dark colors separately. Gentle hand wash recommended for lawn and embroidered fabrics.
Do not bleach unless care label allows. Dry in shade to reduce fading.
Iron on low or medium heat; use cloth over embroidery.
Turn embellished pieces inside out when washing. Avoid harsh scrubbing on embroidery.
First wash may release slight excess dye — wash separately first time.`,
  },
  {
    id: 'faq',
    title: 'FAQs',
    route: '/faqs',
    category: 'faq',
    keywords: [
      'order',
      'payment',
      'delivery',
      'exchange',
      'damaged',
      'track',
      'color',
      'size',
      'faq',
      'question',
      'place order',
      'how to',
    ],
    content: FAQ_CONTENT,
  },
]

export function getKnowledgeEntryById(id: string): KnowledgeBaseEntry | undefined {
  return KNOWLEDGE_BASE.find((e) => e.id === id)
}
