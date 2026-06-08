import OpenAI from 'openai'
import type { AiProvider } from '@/lib/admin-agent/types'

const GROQ_SYSTEM_PROMPT = `You are an AI admin assistant for a Pakistani suits e-commerce store.
Use only the provided Laravel API data.
Do not invent numbers, customers, products, orders, or sales.
If records are empty, clearly say no records found and give a useful next suggestion.
Reply in simple admin-friendly language.
Use short headings and bullet points.
Show currency as Rs. when amount exists.
If backend data says status confirmed/shipped are counted as paid revenue, explain it simply only when needed.
If multiple customers were found, list them and ask the admin to pick a customer ID.
For product search results, show product name, price, stock, status, category, and product ID.
For product sales reports, show quantity sold, total revenue, and order count.
For business intelligence reports:
- Explain business meaning, not only numbers
- Highlight useful decisions for the admin
- For city report, mention the top city
- For status summary, highlight pending/cancelled risk
- For payment method, show the dominant payment method
- For average order value, explain AOV simply
- For comparison, mention increase/decrease and percentage
- For products not selling, suggest reviewing price, images, or marketing
- For low stock high sales, recommend restocking priority
You are read-only and cannot delete, update, refund, or change any data.`

const OPENAI_SYSTEM_PROMPT = `You are a read-only AI assistant for an admin dashboard of a Pakistani women's suits e-commerce store.

Rules:
- Answer ONLY using the JSON data provided in the user message. Do not invent orders, sales, or stock figures.
- Currency is PKR (Rs). Format amounts clearly for Pakistan.
- Be concise, friendly, and professional. Use short paragraphs or bullet lists.
- You CANNOT delete, update, refund, cancel, or change any data.
- If data is empty, say so clearly and suggest next steps.
- Do not expose raw JSON unless the admin asks for technical details.`

function buildUserContent(
  adminQuestion: string,
  intentLabel: string,
  laravelData: unknown
): string {
  return `Admin question: ${adminQuestion}

Data source: ${intentLabel}

Laravel API JSON data:
${JSON.stringify(laravelData, null, 2)}`
}

function getGroqClient(): OpenAI {
  const apiKey = process.env.GROQ_API_KEY?.trim()
  if (!apiKey) {
    throw new Error(
      'GROQ_API_KEY is not configured on the server. Add it to .env.local or set USE_MOCK_AI=true.'
    )
  }
  return new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
  })
}

function getOpenAiClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is not configured on the server. Add it to .env.local or set USE_MOCK_AI=true.'  
    )
  }
  return new OpenAI({ apiKey })   
}

async function chatComplete(  
  client: OpenAI,
  model: string,
  systemPrompt: string,
  userContent: string,
  providerLabel: string
): Promise<string> {
  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.3,
      max_tokens: 900,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    })

    const reply = completion.choices[0]?.message?.content?.trim()
    if (!reply) {
      throw new Error(`${providerLabel} returned an empty response.`)
    }
    return reply
  } catch (e) {
    const msg = e instanceof Error ? e.message : `${providerLabel} request failed.`
    if (/api key|authentication|401|403/i.test(msg)) {
      throw new Error(`${providerLabel} authentication failed. Check your API key in .env.local.`)
    }
    throw new Error(`${providerLabel} error: ${msg}`)
  }
}

export async function summarizeWithAiProvider(
  provider: AiProvider,
  adminQuestion: string,
  intentLabel: string,
  laravelData: unknown
): Promise<string> {
  const userContent = buildUserContent(adminQuestion, intentLabel, laravelData)

  if (provider === 'groq') {
    const client = getGroqClient()
    const model = process.env.GROQ_MODEL?.trim() || 'llama-3.1-8b-instant'
    return chatComplete(client, model, GROQ_SYSTEM_PROMPT, userContent, 'Groq')
  }

  const client = getOpenAiClient()
  const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini'
  return chatComplete(client, model, OPENAI_SYSTEM_PROMPT, userContent, 'OpenAI')
}

export function resolveAiProvider(): AiProvider {
  const raw = process.env.AI_PROVIDER?.trim().toLowerCase()
  if (raw === 'openai') return 'openai'
  return 'groq'
}
