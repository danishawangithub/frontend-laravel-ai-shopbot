'use client'

import { useCallback, useRef, useState } from 'react'
import { Bot, Loader2, Send, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAdminAuth } from '@/lib/admin-auth-context'
import {
  PRODUCT_SUGGESTED_QUESTIONS,
  QUICK_SUGGESTED_QUESTIONS,
  REPORTS_SUGGESTED_QUESTIONS,
  SEARCH_SUGGESTED_QUESTIONS,
} from '@/lib/admin-agent/intent'
import type { AdminAgentApiError, AdminAgentApiSuccess } from '@/lib/admin-agent/types'
import { cn } from '@/lib/utils'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

function SuggestedButtonGroup({
  title,
  items,
  loading,
  onSelect,
}: {
  title?: string
  items: { label: string; question: string; intent: string }[]
  loading: boolean
  onSelect: (question: string) => void
}) {
  return (
    <div className="space-y-2">
      {title ? (
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Button
            key={`${item.intent}-${item.label}`}
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => onSelect(item.question)}
            className="text-xs sm:text-sm"
          >
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

export default function AiAgentChat() {
  const { getToken } = useAdminAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Assalam-o-Alaikum! Ask about orders, sales, stock, customers, order lookup (Show order 123), customer search, period reports, or analytics—or use the quick buttons below.',
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

      const token = getToken()
      if (!token) {
        setError('You are not logged in. Please sign in to the admin panel again.')
        return
      }

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
        const res = await fetch('/api/admin-agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: finalMessage }),
        })

        const data = (await res.json()) as AdminAgentApiSuccess | AdminAgentApiError

        if (!res.ok || 'error' in data) {
          const errMsg = 'error' in data ? data.error : 'Request failed'
          setError(errMsg)
          setMessages((prev) => [
            ...prev,
            {
              id: `e-${Date.now()}`,
              role: 'assistant',
              content: `Sorry, I could not complete that request: ${errMsg}`,
            },
          ])
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `a-${Date.now()}`,
              role: 'assistant',
              content: data.reply,
            },
          ])
        }
      } catch {
        const errMsg = 'Network error. Please try again.'
        setError(errMsg)
        setMessages((prev) => [
          ...prev,
          { id: `e-${Date.now()}`, role: 'assistant', content: errMsg },
        ])
      } finally {
        setLoading(false)
        scrollToBottom()
      }
    },
    [getToken, loading, message, scrollToBottom]
  )

  const handleSuggestedClick = (question: string) => {
    setMessage(question)
    void sendMessage(question)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void sendMessage()
  }

  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      <SuggestedButtonGroup
        title="Quick"
        items={QUICK_SUGGESTED_QUESTIONS}
        loading={loading}
        onSelect={handleSuggestedClick}
      />
      <SuggestedButtonGroup
        title="Search"
        items={SEARCH_SUGGESTED_QUESTIONS}
        loading={loading}
        onSelect={handleSuggestedClick}
      />
      <SuggestedButtonGroup
        title="Reports"
        items={REPORTS_SUGGESTED_QUESTIONS}
        loading={loading}
        onSelect={handleSuggestedClick}
      />
      <SuggestedButtonGroup
        title="Products"
        items={PRODUCT_SUGGESTED_QUESTIONS}
        loading={loading}
        onSelect={handleSuggestedClick}
      />

      <div
        ref={scrollRef}
        className="flex flex-col gap-4 min-h-[320px] max-h-[min(60vh,520px)] overflow-y-auto rounded-lg border border-border bg-card p-4"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex gap-3',
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
              )}
              style={msg.role === 'user' ? { backgroundColor: '#BB454E' } : undefined}
            >
              {msg.role === 'user' ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4 text-foreground" />
              )}
            </div>
            <div
              className={cn(
                'max-w-[85%] rounded-lg px-4 py-2 text-sm whitespace-pre-wrap',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground'
              )}
              style={msg.role === 'user' ? { backgroundColor: '#BB454E' } : undefined}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Fetching data and preparing answer…
          </div>
        ) : null}
      </div>

      {error ? (
        <div
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask anything: Noor how many orders, last month sales, top customer, stock khatam products, show order 123"
          rows={3}
          disabled={loading}
          className="flex-1 resize-none min-h-[80px]"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void sendMessage()
            }
          }}
        />
        <Button
          type="submit"
          disabled={loading || !message.trim()}
          className="sm:min-w-[120px] text-primary-foreground"
          style={{ backgroundColor: '#BB454E' }}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Ask
            </>
          )}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground">
        Laravel auth uses admin_token. Groq/OpenAI keys stay server-side. USE_MOCK_AI=true skips AI
        providers. Enter to send, Shift+Enter for new line.
      </p>
    </div>
  )
}
