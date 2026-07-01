import type { Metadata } from 'next'
import InfoPageLayout from '@/components/policy/InfoPageLayout'
import { CustomerAssistantChat } from '@/components/customer-assistant/customer-assistant-chat'
import { policyMetadata } from '@/lib/policy-metadata'

export const metadata: Metadata = policyMetadata(
  'Customer Help Assistant',
  'Ask questions about shipping, returns, exchanges, size guide, fabric care, and customer support.'
)

export default function AiAssistantPage() {
  return (
    <InfoPageLayout
      title="Customer Help Assistant"
      subtitle="Ask questions about shipping, returns, exchanges, size guide, fabric care, and support."
    >
      <p className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100 px-3 py-1.5 text-sm font-medium -mt-4 mb-2">
        Customer Help Assistant — policy &amp; FAQ chat (not admin orders)
      </p>
      <CustomerAssistantChat />
    </InfoPageLayout>
  )
}
