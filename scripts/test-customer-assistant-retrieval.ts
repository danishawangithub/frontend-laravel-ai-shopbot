import { retrievePolicyContext } from '../lib/customer-assistant/retrieve-policy-context'

const TESTS: Array<{ question: string; expected: string[] }> = [
  { question: 'How many days delivery?', expected: ['Shipping Policy'] },
  { question: 'Can I exchange my suit?', expected: ['Exchange Policy'] },
  { question: 'Can I return a damaged item?', expected: ['Return Policy'] },
  { question: 'What size should I choose?', expected: ['Size Guide'] },
  { question: 'How to wash lawn fabric?', expected: ['Fabric Care'] },
  { question: 'How can I contact support?', expected: ['Contact Us'] },
  { question: 'Do you sell my data?', expected: ['Privacy Policy'] },
  {
    question: 'Product color is different from picture?',
    expected: ['Terms and Conditions', 'FAQs'],
  },
  { question: 'Delivery kitne din mein hoti hai?', expected: ['Shipping Policy'] },
  { question: 'Exchange ho sakta hai?', expected: ['Exchange Policy'] },
]

let passed = 0
for (const test of TESTS) {
  const { matches, debug } = retrievePolicyContext(test.question, { includeDebug: true })
  const titles = matches.map((m) => m.title)
  const ok = test.expected.some((e) => titles.includes(e))
  if (ok) passed++
  console.log(ok ? 'PASS' : 'FAIL', test.question)
  console.log('  expected one of:', test.expected.join(' | '))
  console.log('  got:', titles.join(', '))
  console.log('  top scores:', debug?.scores.slice(0, 4).map((s) => `${s.id}:${s.score}`).join(', '))
  console.log('')
}

console.log(`\n${passed}/${TESTS.length} retrieval tests passed`)
process.exit(passed === TESTS.length ? 0 : 1)
