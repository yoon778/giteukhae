import { PRAISE_TOPICS, type AnimalId, type PraiseTopic } from './animals.ts'
import {
  createConfusedResponse,
  createPraise,
  detectPraiseTopic,
  isObviouslyUnclearInput,
  isPraiseResponseKind,
  MAX_PRAISE_LENGTH,
  type PraiseResponseKind,
} from './praise.ts'

export interface PraiseResult {
  kind: PraiseResponseKind
  topic: PraiseTopic
  comment: string
}

interface PraiseRequest {
  text: string
  count: number
  animalId: AnimalId
  revision: number
}

interface PraiseRequestOptions {
  endpoint?: string
  fetcher?: typeof fetch
  timeoutMs?: number
}

function createLocalResult(request: PraiseRequest): PraiseResult {
  if (isObviouslyUnclearInput(request.text)) {
    return {
      kind: 'unclear',
      topic: 'default',
      comment: createConfusedResponse(request.animalId, request.text, request.revision),
    }
  }

  return {
    kind: 'praise',
    topic: detectPraiseTopic(request.text),
    comment: createPraise(request.text, request.count, request.animalId, request.revision),
  }
}

function getConfiguredEndpoint() {
  return import.meta.env?.VITE_PRAISE_API_URL?.trim() ?? ''
}

export function isAiPraiseConfigured() {
  return Boolean(getConfiguredEndpoint())
}

export function parsePraiseResult(value: unknown): PraiseResult | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const candidate = value as Record<string, unknown>
  if (typeof candidate.kind !== 'string' || !isPraiseResponseKind(candidate.kind)) return null
  if (typeof candidate.topic !== 'string' || !PRAISE_TOPICS.some((topic) => topic === candidate.topic)) return null
  if (typeof candidate.comment !== 'string') return null

  const comment = candidate.comment.trim()
  if (!comment || [...comment].length > MAX_PRAISE_LENGTH) return null
  return { kind: candidate.kind, topic: candidate.topic as PraiseTopic, comment }
}

export async function requestPraise(
  request: PraiseRequest,
  options: PraiseRequestOptions = {},
): Promise<PraiseResult> {
  const fallback = createLocalResult(request)
  const endpoint = options.endpoint ?? getConfiguredEndpoint()
  if (!endpoint) return fallback

  const controller = new AbortController()
  const timeout = globalThis.setTimeout(() => controller.abort(), options.timeoutMs ?? 6_000)

  try {
    const response = await (options.fetcher ?? fetch)(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: request.text,
        animalId: request.animalId,
        revision: request.revision,
      }),
      signal: controller.signal,
    })
    if (!response.ok) return fallback

    const parsed = parsePraiseResult(await response.json())
    return parsed ?? fallback
  } catch {
    return fallback
  } finally {
    globalThis.clearTimeout(timeout)
  }
}
