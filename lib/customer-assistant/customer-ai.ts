import OpenAI from 'openai'
import type { KnowledgeBaseEntry } from '@/lib/customer-assistant/types'
import { buildContextText } from '@/lib/customer-assistant/retrieve-policy-context'

const SYSTEM_PROMPT = `You are a customer support assistant for a Pakistani suits e-commerce store.

Answer only using the provided policy/FAQ context.
Do not invent policies, prices, delivery dates, refund promises, or guarantees.
If the answer is not available in the context, say:
"I do not have enough policy information for that. Please contact support."
Keep answers short, clear, and customer-friendly.
Mention the relevant policy page when useful.
If the question is about return/exchange, remind that the item must be unused/unwashed and approval may be required if that is in context.
If the question is about delivery, mention estimated delivery time only if provided in context.
Use simple English. If user asks in Roman Urdu, you may answer in simple Roman Urdu/English mix.`

function getGroqClient(): OpenAI {
  const apiKey = process.env.GROQ_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured on the server.')
  }
  return new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  })
}

export async function answerCustomerQuestion(
  message: string,
  matches: KnowledgeBaseEntry[]
): Promise<string> {
  const context = buildContextText(matches)
  const userContent = `Customer question:
${message}

Relevant policy/FAQ context:
${context}

Answer with:
- Direct answer
- Important condition if any
- Source page name`

  const client = getGroqClient()
  const model = process.env.GROQ_MODEL?.trim() || 'llama-3.1-8b-instant'

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    max_tokens: 500,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ],
  })

  const reply = completion.choices[0]?.message?.content?.trim()
  if (!reply) {
    throw new Error('Groq returned an empty response.')
  }
  return reply
}
