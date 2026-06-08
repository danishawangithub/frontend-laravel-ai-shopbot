import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { detectIntent } from './detect-intent'

const TOP_SPENDING = {
  intent: 'top_spending_customers' as const,
  endpoint: '/agent/customers/top-spending',
}

const CASES = [
  'Show top spending customers',
  'Show top spending customer',
  'Which customer spent the most?',
  'Who spent most money?',
  'Show highest spending customer',
  'Show biggest buyer',
  'Show best customer',
  'Show VIP customers',
  'top customer',
  'custmer spent most',
  'cusmtomer spent most',
  'higest spender',
  'bigest buyer',
  'customer with highest total spend',
]

describe('top_spending_customers intent', () => {
  for (const question of CASES) {
    it(`detects: ${question}`, () => {
      const result = detectIntent(question)
      assert.ok(result && !('hint' in result), `expected intent for: ${question}`)
      assert.deepEqual(
        {
          intent: result.intent,
          endpoint: 'endpoint' in result ? result.endpoint : undefined,
        },
        TOP_SPENDING,
        `wrong intent for: ${question} → ${JSON.stringify(result)}`
      )
    })
  }

  it('does not treat "top customer" as customer_search', () => {
    const result = detectIntent('top customer')
    assert.equal(result?.intent, 'top_spending_customers')
  })

  it('does not treat "customer spent most" as customer_order_lookup', () => {
    const result = detectIntent('customer spent most')
    assert.equal(result?.intent, 'top_spending_customers')
  })
})
