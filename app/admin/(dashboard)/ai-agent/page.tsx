'use client'

import AiAgentChat from '@/components/admin/ai-agent-chat'
import { Sparkles } from 'lucide-react'

export default function AdminAiAgentPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg text-primary-foreground"
            style={{ backgroundColor: '#BB454E' }}
          >
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">AI Admin Agent</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Ask about orders, sales, stock, customers, order lookup, period reports, and customer
          analytics. Powered by Groq or mock mode. Read-only—no changes to store data.
        </p>
      </div>

      <AiAgentChat />
    </div>
  )
}
