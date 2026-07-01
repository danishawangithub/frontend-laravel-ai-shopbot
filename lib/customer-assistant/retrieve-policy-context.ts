import { KNOWLEDGE_BASE } from '@/lib/customer-assistant/knowledge-base'
import type {
  KnowledgeBaseEntry,
  KnowledgeCategory,
  RetrievePolicyContextResult,
} from '@/lib/customer-assistant/types'

const CATEGORY_SIGNALS: Record<KnowledgeCategory, string[]> = {
  about: ['about', 'brand', 'who', 'company'],
  contact: ['contact', 'support', 'help', 'phone', 'email', 'whatsapp'],
  shipping: ['shipping', 'delivery', 'courier', 'tracking', 'dispatch', 'parcel'],
  return: ['return', 'refund', 'damaged', 'defective', 'wapas'],
  exchange: ['exchange', 'replace', 'tabdeel', 'size issue'],
  privacy: ['privacy', 'data', 'personal', 'sell', 'security'],
  terms: ['terms', 'conditions', 'color', 'picture', 'price', 'stock'],
  size: ['size', 'measurement', 'fitting', 'chest', 'waist'],
  fabric_care: ['wash', 'care', 'lawn', 'fabric', 'iron', 'bleach', 'dhona'],
  faq: ['faq', 'question', 'how to', 'order'],
}

const FALLBACK_IDS = ['faq', 'contact'] as const
const MIN_TOP_SCORE = 2

export function normalizeQuestion(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(text: string): Set<string> {
  return new Set(
    normalizeQuestion(text)
      .split(' ')
      .filter((w) => w.length > 1)
  )
}

function scoreEntry(query: string, words: Set<string>, entry: KnowledgeBaseEntry): number {
  let score = 0
  const normalizedQuery = normalizeQuestion(query)

  for (const keyword of entry.keywords) {
    const phrase = normalizeQuestion(keyword)
    if (phrase.length >= 2 && normalizedQuery.includes(phrase)) {
      score += 3
    }
  }

  for (const signal of CATEGORY_SIGNALS[entry.category]) {
    if (normalizedQuery.includes(normalizeQuestion(signal))) {
      score += 2
      break
    }
  }

  const entryWords = tokenize(`${entry.title} ${entry.content} ${entry.keywords.join(' ')}`)
  for (const word of words) {
    if (entryWords.has(word)) {
      score += 1
    }
  }

  return score
}

export function retrievePolicyContext(
  question: string,
  options?: { includeDebug?: boolean }
): RetrievePolicyContextResult {
  const query = normalizeQuestion(question)
  const words = tokenize(question)

  const scored = KNOWLEDGE_BASE.map((entry) => ({
    entry,
    score: scoreEntry(question, words, entry),
  })).sort((a, b) => b.score - a.score)

  const topScore = scored[0]?.score ?? 0
  let matches: KnowledgeBaseEntry[]

  if (topScore < MIN_TOP_SCORE) {
    matches = FALLBACK_IDS.map((id) => KNOWLEDGE_BASE.find((e) => e.id === id)).filter(
      (e): e is KnowledgeBaseEntry => Boolean(e)
    )
  } else {
    matches = scored
      .filter((s) => s.score > 0)
      .slice(0, 3)
      .map((s) => s.entry)
  }

  const result: RetrievePolicyContextResult = { matches }

  if (options?.includeDebug) {
    result.debug = {
      query,
      scores: scored.map((s) => ({ id: s.entry.id, score: s.score })),
    }
  }

  return result
}

export function buildContextText(matches: KnowledgeBaseEntry[]): string {
  return matches
    .map(
      (entry, index) =>
        `[Source ${index + 1}: ${entry.title} (${entry.route})]\n${entry.content.trim()}`
    )
    .join('\n\n---\n\n')
}
