/** Business WhatsApp (Pakistan: 03367255898 → international 923367255898). */
export const BUSINESS_WHATSAPP_NUMBER = '923367255898'

export function buildWhatsAppProductUrl(options: {
  productTitle: string
  productUrl: string
  priceLabel?: string
  size?: string
  quantity?: number
}): string {
  const lines = [
    'Hello! I would like to inquire about this product from your store.',
    '',
    `*${options.productTitle}*`,
  ]
  if (options.priceLabel) lines.push(`Price: ${options.priceLabel}`)
  if (options.size) lines.push(`Size: ${options.size}`)
  if (options.quantity != null && options.quantity > 0) {
    lines.push(`Quantity: ${options.quantity}`)
  }
  lines.push('', options.productUrl)

  return `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`
}
