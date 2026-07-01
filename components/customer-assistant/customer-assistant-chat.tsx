'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Bot, Loader2, MessageCircle, Send, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { parseCustomerAssistantResponse } from '@/lib/customer-assistant/post-message'
import type { CustomerAssistantSource } from '@/lib/customer-assistant/types'
import { cn } from '@/lib/utils'

/** Customer help only — never /api/admin-agent */
const CUSTOMER_API_URL = '/api/customer-assistant'

const SUGGESTED_QUESTIONS = [
  'How many days delivery?',
  'Can I exchange my suit?',
  'Can I return a damaged item?',
  'What size should I choose?',
  'How to wash lawn fabric?',
  'How can I contact support?',
]

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: CustomerAssistantSource[]
}

export function CustomerAssistantChat() {
  const pathname = usePathname()

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[customer-assistant] page:', pathname, '| API:', CUSTOMER_API_URL)
    }
  }, [pathname])

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Assalam-o-Alaikum! I can help with shipping, returns, exchanges, size guide, fabric care, and support. Ask a question or tap a suggestion below.',
    },
  ])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    })
  }, [])

  const sendMessage = useCallback(
    async (customMessage?: string) => {
      const finalMessage = (customMessage || message).trim()
      if (!finalMessage || loading) return

      setError(null)
      setLoading(true)
      if (!customMessage) {
        setMessage('')
      }

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: finalMessage,
      }
      setMessages((prev) => [...prev, userMsg])
      scrollToBottom()

      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('[customer-assistant] posting to /api/customer-assistant')
        }

        const res = await fetch(CUSTOMER_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: finalMessage }),
        })

        const data = await parseCustomerAssistantResponse(res)

        const assistantMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          sources: data.sources,
        }
        setMessages((prev) => [...prev, assistantMsg])
        scrollToBottom()
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : 'Network error. Please check your connection and try again.'
        setError(errMsg)
      } finally {
        setLoading(false)
      }
    },
    [loading, message, scrollToBottom]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  return (
    <div
      className="rounded-xl border bg-card shadow-sm overflow-hidden"
      data-assistant="customer"
      data-api={CUSTOMER_API_URL}
    >
      <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-sm">Customer Help Assistant</p>
            <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
              Policy &amp; FAQ
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Uses /api/customer-assistant — not admin orders</p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="h-[min(420px,55vh)] overflow-y-auto px-4 py-4 space-y-4 bg-background"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
          >
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              )}
            >
              {msg.role === 'user' ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>
            <div
              className={cn(
                'max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              )}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 ? (
                <div className="mt-3 pt-2 border-t border-border/60 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Sources:</p>
                  {msg.sources.map((source) => (
                    <p key={source.route} className="text-xs">
                      Source:{' '}
                      <Link
                        href={source.route}
                        className="text-primary hover:underline font-medium"
                      >
                        {source.title}
                      </Link>
                      <span className="text-muted-foreground"> ({source.route})</span>
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking…
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="mx-4 mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="border-t px-4 py-3 space-y-3 bg-muted/20">
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <Button
              key={q}
              type="button"
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => void sendMessage(q)}
              className="text-xs sm:text-sm"
            >
              {q}
            </Button>
          ))}
        </div>

        <div className="flex gap-2 items-end">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about delivery, returns, size, fabric care…"
            disabled={loading}
            rows={2}
            maxLength={1000}
            className="min-h-[44px] resize-none"
          />
          <Button
            type="button"
            size="icon"
            disabled={loading || !message.trim()}
            onClick={() => void sendMessage()}
            aria-label="Send message"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CustomerAssistantChat
