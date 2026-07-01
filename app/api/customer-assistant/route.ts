import { NextRequest, NextResponse } from 'next/server'
import { answerCustomerQuestion } from '@/lib/customer-assistant/customer-ai'
import { retrievePolicyContext } from '@/lib/customer-assistant/retrieve-policy-context'
import type {
  CustomerAssistantApiError,
  CustomerAssistantApiSuccess,
} from '@/lib/customer-assistant/types'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  if (!process.env.GROQ_API_KEY?.trim()) {
    return NextResponse.json(
      { error: 'Customer assistant is not configured. Please try again later.' } satisfies CustomerAssistantApiError,
      { status: 500 }
    )
  }

  let body: { message?: string }
  try {
    body = (await request.json()) as { message?: string }
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body.' } satisfies CustomerAssistantApiError,
      { status: 400 }
    )
  }

  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!message) {
    return NextResponse.json(
      { error: 'Message is required.' } satisfies CustomerAssistantApiError,
      { status: 400 }
    )
  }

  if (message.length > 1000) {
    return NextResponse.json(
      { error: 'Message is too long (max 1000 characters).' } satisfies CustomerAssistantApiError,
      { status: 400 }
    )
  }

  try {
    const { matches, debug } = retrievePolicyContext(message, {
      includeDebug: process.env.NODE_ENV === 'development',
    })

    if (process.env.NODE_ENV === 'development' && debug) {
      console.log('[customer-assistant] retrieve', {
        message,
        query: debug.query,
        topScores: debug.scores.slice(0, 5),
        matchIds: matches.map((m) => m.id),
      })
    }

    const reply = await answerCustomerQuestion(message, matches)

    const sources = matches.map((m) => ({
      title: m.title,
      route: m.route,
    }))

    return NextResponse.json(
      {
        success: true,
        assistant: 'customer',
        reply,
        sources,
      } satisfies CustomerAssistantApiSuccess,
      { headers: { 'X-Assistant-Type': 'customer' } }
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Something went wrong.'
    return NextResponse.json({ error: msg } satisfies CustomerAssistantApiError, {
      status: 500,
    })
  }
}
