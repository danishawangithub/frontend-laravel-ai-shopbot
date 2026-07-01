const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000'

const TESTS: Array<{ question: string; expectedSource: string }> = [
  { question: 'How many days delivery?', expectedSource: 'Shipping Policy' },
  { question: 'Can I exchange my suit?', expectedSource: 'Exchange Policy' },
  { question: 'Can I return a damaged item?', expectedSource: 'Return Policy' },
  { question: 'What size should I choose?', expectedSource: 'Size Guide' },
  { question: 'How to wash lawn fabric?', expectedSource: 'Fabric Care' },
  { question: 'How can I contact support?', expectedSource: 'Contact Us' },
  { question: 'Do you sell my data?', expectedSource: 'Privacy Policy' },
  {
    question: 'Product color is different from picture?',
    expectedSource: 'Terms and Conditions',
  },
  { question: 'Delivery kitne din mein hoti hai?', expectedSource: 'Shipping Policy' },
  { question: 'Exchange ho sakta hai?', expectedSource: 'Exchange Policy' },
]

async function main() {
  let passed = 0
  for (const test of TESTS) {
    const res = await fetch(`${BASE}/api/customer-assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: test.question }),
    })
    const data = (await res.json()) as {
      success?: boolean
      reply?: string
      sources?: Array<{ title: string; route: string }>
      error?: string
    }
    const titles = data.sources?.map((s) => s.title) ?? []
    const ok =
      res.ok &&
      data.success &&
      (data as { assistant?: string }).assistant === 'customer' &&
      titles.includes(test.expectedSource) &&
      typeof data.reply === 'string' &&
      data.reply.length > 0
    if (ok) passed++
    console.log(ok ? 'PASS' : 'FAIL', test.question)
    if (!ok) {
      console.log('  error:', data.error)
      console.log('  sources:', titles.join(', '))
    } else {
      console.log('  source:', test.expectedSource)
      console.log('  reply preview:', data.reply!.slice(0, 120).replace(/\n/g, ' ') + '…')
    }
    console.log('')
  }
  console.log(`${passed}/${TESTS.length} API tests passed`)
  process.exit(passed === TESTS.length ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
