import { SITE_CONTACT } from '@/lib/site-contact'
import type { FaqItem } from '@/components/policy/FaqAccordion'

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How can I place an order?',
    answer:
      'Browse our shop, add items to your cart, and proceed to checkout. Enter your name, phone number, and delivery address. Confirm your order — we will contact you if any detail needs verification.',
  },
  {
    question: 'How long does delivery take?',
    answer:
      'Most orders are delivered within 3–5 working days after dispatch. Delivery times are estimates and may be longer during holidays, sales, or due to courier delays. See our Shipping Policy for details.',
  },
  {
    question: 'Do you deliver across Pakistan?',
    answer:
      'Yes, we aim to deliver across Pakistan through courier partners. Remote areas may take longer; we will inform you if there is an issue with your location.',
  },
  {
    question: 'Can I return or exchange a product?',
    answer:
      'Returns are accepted for damaged, wrong, or defective items within 24–48 hours of delivery, subject to approval. Exchanges may be available for size issues or defects when stock allows. See our Return Policy and Exchange Policy pages.',
  },
  {
    question: 'What if I receive a damaged product?',
    answer:
      'Contact us within 24–48 hours with your order number and clear photos. Do not wash or use the item. We will review your case and guide you on return or exchange steps.',
  },
  {
    question: 'How can I track my order?',
    answer:
      'When your order is dispatched, we may send a tracking reference by SMS, WhatsApp, or email. You can also message us with your order number via Contact Us for a status update.',
  },
  {
    question: 'Are product colors exactly the same as pictures?',
    answer:
      'We try to show accurate photos, but colors can vary slightly due to screen settings, lighting, and fabric batches. Minor shade differences are normal and not necessarily a defect.',
  },
  {
    question: 'How do I choose my size?',
    answer:
      'Check our Size Guide for general measurements. Compare your body measurements with the chart. If unsure, contact us before ordering with the product name and your measurements.',
  },
  {
    question: 'How can I contact support?',
    answer: `Email us at ${SITE_CONTACT.email}, call ${SITE_CONTACT.phone}, or use the Contact Us page. Include your order number for faster help with existing orders.`,
  },
]
