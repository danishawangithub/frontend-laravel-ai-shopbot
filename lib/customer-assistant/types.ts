export type KnowledgeCategory =
  | 'about'
  | 'contact'
  | 'shipping'
  | 'return'
  | 'exchange'
  | 'privacy'
  | 'terms'
  | 'size'
  | 'fabric_care'
  | 'faq'

export type KnowledgeBaseEntry = {
  id: string
  title: string
  route: string
  category: KnowledgeCategory
  keywords: string[]
  content: string
}

export type RetrievePolicyContextResult = {
  matches: KnowledgeBaseEntry[]
  debug?: {
    query: string
    scores: Array<{ id: string; score: number }>
  }
}

export type CustomerAssistantSource = {
  title: string
  route: string
}

export type CustomerAssistantApiSuccess = {
  success: true
  assistant: 'customer'
  reply: string
  sources: CustomerAssistantSource[]
}

export type CustomerAssistantApiError = {
  error: string
}
