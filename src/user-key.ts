import { User } from '@apps-in-toss/web-framework'
import { loadStoredValue, saveStoredValue } from './storage.ts'

const FALLBACK_KEY = 'giteukhae.installId.v1'

function createFallbackId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

async function hashValue(value: string) {
  const bytes = new TextEncoder().encode(`giteukhae:drawing:${value}`)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function getDrawingClientKey() {
  try {
    if (User.getAnonymousKey.isSupported()) {
      const response = await User.getAnonymousKey()
      if (response.type === 'HASH' && response.hash) return hashValue(response.hash)
    }
  } catch {
    // 미지원 환경에서는 앱 설치별 임의 키를 사용한다.
  }

  const stored = await loadStoredValue(FALLBACK_KEY)
  const installId = stored?.trim() || createFallbackId()
  if (!stored) await saveStoredValue(FALLBACK_KEY, installId).catch(() => undefined)
  return hashValue(installId)
}
