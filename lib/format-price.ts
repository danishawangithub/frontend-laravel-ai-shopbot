/** Display product price in PKR (Rs) by default. */
export function formatProductPrice(amount: number, currency?: string | null): string {
  const value = amount.toLocaleString('en-PK', { maximumFractionDigits: 0 })
  const code = (currency ?? 'PKR').toUpperCase()
  if (code === 'PKR' || code === 'RS') return `Rs ${value}`
  return `${code} ${value}`
}
