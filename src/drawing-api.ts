import { ANIMAL_IDS, type AnimalId } from './animals.ts'
import { isDrawingDataUrl } from './praise.ts'

export type DrawingResult =
  | { ok: true; imageDataUrl: string }
  | { ok: false; reason: 'unavailable' | 'limit' | 'error' }

interface DrawingRequest {
  text: string
  animalIds: AnimalId[]
  clientKey?: string
}

interface DrawingRequestOptions {
  endpoint?: string
  fetcher?: typeof fetch
  timeoutMs?: number
}

function getConfiguredEndpoint() {
  const explicit = import.meta.env?.VITE_DRAWING_API_URL?.trim()
  if (explicit) return explicit

  const praiseEndpoint = import.meta.env?.VITE_PRAISE_API_URL?.trim()
  if (!praiseEndpoint) return ''
  try {
    const endpoint = new URL(praiseEndpoint)
    const drawingPath = endpoint.pathname.replace(/\/praise\/?$/, '/drawing')
    if (drawingPath === endpoint.pathname) return ''
    endpoint.pathname = drawingPath
    return endpoint.toString()
  } catch {
    return ''
  }
}

export function isAiDrawingConfigured() {
  return Boolean(getConfiguredEndpoint())
}

export async function requestDrawing(
  request: DrawingRequest,
  options: DrawingRequestOptions = {},
): Promise<DrawingResult> {
  const endpoint = options.endpoint ?? getConfiguredEndpoint()
  const animalIds = [...new Set(request.animalIds)].filter((id) => ANIMAL_IDS.includes(id))
  if (!endpoint || animalIds.length === 0) return { ok: false, reason: 'error' }

  const controller = new AbortController()
  const timeout = globalThis.setTimeout(() => controller.abort(), options.timeoutMs ?? 55_000)

  try {
    const response = await (options.fetcher ?? fetch)(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: request.text, animalIds, clientKey: request.clientKey }),
      signal: controller.signal,
    })
    if (response.status === 422) return { ok: false, reason: 'unavailable' }
    if (response.status === 429) {
      const value = await response.json().catch(() => null) as { error?: unknown } | null
      return { ok: false, reason: value?.error === 'drawing_daily_limit' ? 'limit' : 'error' }
    }
    if (!response.ok) return { ok: false, reason: 'error' }

    const value = await response.json() as { imageDataUrl?: unknown }
    return isDrawingDataUrl(value.imageDataUrl)
      ? { ok: true, imageDataUrl: value.imageDataUrl }
      : { ok: false, reason: 'error' }
  } catch {
    return { ok: false, reason: 'error' }
  } finally {
    globalThis.clearTimeout(timeout)
  }
}
