const TYPO_MAP: Record<string, string> = {
  custmer: 'customer',
  custmers: 'customers',
  custmr: 'customer',
  custmrs: 'customers',
  cusmtomer: 'customer',
  cusmtomers: 'customers',
  costomer: 'customer',
  costomers: 'customers',
  cstomer: 'customer',
  cstomers: 'customers',
  customr: 'customer',
  customrs: 'customers',
  higest: 'highest',
  bigest: 'biggest',
  expencive: 'expensive',
  purches: 'purchase',
  purchese: 'purchase',
  spended: 'spent',
  spendng: 'spending',
  meny: 'many',
  oder: 'order',
  oders: 'orders',
  ordres: 'orders',
  salse: 'sales',
  seles: 'sales',
  sal: 'sale',
  revnue: 'revenue',
  prodct: 'product',
  prodcts: 'products',
  stok: 'stock',
  stcok: 'stock',
  inventry: 'inventory',
  buyr: 'buyer',
  clint: 'client',
  emial: 'email',
  emal: 'email',
}

/** Lowercase, trim, fix typos, collapse spaces; keep @ + . for emails. */
export function normalizeText(text: string): string {
  let s = text.toLowerCase().trim()
  s = s.replace(/[^\w\s@.+]/g, ' ')
  s = s.replace(/\s+/g, ' ').trim()

  const words = s.split(' ')
  const fixed = words.map((w) => {
    if (w.includes('@')) return w
    return TYPO_MAP[w] ?? w
  })
  return fixed.join(' ').replace(/\s+/g, ' ').trim()
}
