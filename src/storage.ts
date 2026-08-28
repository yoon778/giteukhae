import { Storage } from '@apps-in-toss/web-framework'
import {
  isKnownAnimalId,
  isPraiseResponseKind,
  MAX_ENTRY_TEXT_LENGTH,
  MAX_PRAISE_LENGTH,
  type JournalEntry,
} from './praise.ts'
import type { AnimalId } from './animals.ts'
import { EMPTY_PROGRESS, parseProgress, type PraiseProgress } from './progress.ts'
import { isDateKey } from './date.ts'

const ENTRIES_KEY = 'giteukhae.entries.v1'
const SEEN_ANIMALS_KEY = 'giteukhae.seenAnimals.v1'
const PROGRESS_KEY = 'giteukhae.progress.v1'

type PrimaryStorage = Pick<typeof Storage, 'getItem' | 'setItem'>
type BrowserStorage = Pick<Storage, 'getItem' | 'setItem'>

interface StorageEnvelope {
  __giteukhaeStorage: 1
  updatedAt: number
  value: string
}

function decodeStoredValue(raw: string | null) {
  if (raw === null) return null
  try {
    const parsed = JSON.parse(raw) as Partial<StorageEnvelope>
    if (parsed.__giteukhaeStorage === 1 && Number.isFinite(parsed.updatedAt) && typeof parsed.value === 'string') {
      return { value: parsed.value, updatedAt: Number(parsed.updatedAt) }
    }
  } catch {
    // 기존 v1 원문 값
  }
  return { value: raw, updatedAt: 0 }
}

export async function loadStoredValue(
  key: string,
  primary: PrimaryStorage = Storage,
  browser: BrowserStorage = localStorage,
) {
  let primaryRaw: string | null = null
  let browserRaw: string | null = null
  try {
    primaryRaw = await primary.getItem(key)
  } catch {
    // 브라우저 저장소 값 사용
  }
  try {
    browserRaw = browser.getItem(key)
  } catch {
    // 앱 저장소 값 사용
  }

  const primaryValue = decodeStoredValue(primaryRaw)
  const browserValue = decodeStoredValue(browserRaw)
  if (!primaryValue) return browserValue?.value ?? null
  if (!browserValue) return primaryValue.value
  return browserValue.updatedAt > primaryValue.updatedAt ? browserValue.value : primaryValue.value
}

export async function saveStoredValue(
  key: string,
  value: string,
  primary: PrimaryStorage = Storage,
  browser: BrowserStorage = localStorage,
  updatedAt = Date.now(),
) {
  const envelope: StorageEnvelope = { __giteukhaeStorage: 1, updatedAt, value }
  const encoded = JSON.stringify(envelope)
  let saved = false
  try {
    await primary.setItem(key, encoded)
    saved = true
  } catch {
    // 브라우저 저장소로 계속 저장
  }
  try {
    browser.setItem(key, encoded)
    saved = true
  } catch {
    // 앱 저장소 저장 결과 사용
  }
  if (!saved) throw new Error('저장 가능한 공간이 없음')
}

export function parseEntries(value: string | null): Record<string, JournalEntry> {
  if (!value) return {}

  try {
    const parsed = JSON.parse(value) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}

    return Object.fromEntries(Object.entries(parsed).flatMap(([date, candidate]) => {
      if (!isDateKey(date) || !candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return []
      const entry = candidate as Record<string, unknown>
      if (typeof entry.text !== 'string' || typeof entry.praise !== 'string') return []
      if (!entry.text.trim() || [...entry.text].length > MAX_ENTRY_TEXT_LENGTH) return []
      if (!entry.praise.trim() || [...entry.praise].length > MAX_PRAISE_LENGTH) return []

      const restored: JournalEntry = {
        date,
        text: entry.text,
        praise: entry.praise,
      }
      if (typeof entry.animalId === 'string' && isKnownAnimalId(entry.animalId)) restored.animalId = entry.animalId
      if (Number.isInteger(entry.praiseRevision) && Number(entry.praiseRevision) >= 0 && Number(entry.praiseRevision) <= 100) {
        restored.praiseRevision = Number(entry.praiseRevision)
      }
      if (typeof entry.responseKind === 'string' && isPraiseResponseKind(entry.responseKind)) restored.responseKind = entry.responseKind
      if (entry.isDemo === true) restored.isDemo = true
      return [[date, restored]]
    }))
  } catch {
    return {}
  }
}

export async function loadEntries() {
  return parseEntries(await loadStoredValue(ENTRIES_KEY))
}

export async function saveEntries(entries: Record<string, JournalEntry>) {
  await saveStoredValue(ENTRIES_KEY, JSON.stringify(entries))
}

export async function loadSeenAnimals(): Promise<AnimalId[]> {
  try {
    const parsed = JSON.parse(await loadStoredValue(SEEN_ANIMALS_KEY) ?? '[]') as unknown
    return Array.isArray(parsed)
      ? [...new Set(parsed.filter((value): value is AnimalId => typeof value === 'string' && isKnownAnimalId(value)))]
      : []
  } catch {
    return []
  }
}

export async function saveSeenAnimals(animalIds: AnimalId[]) {
  await saveStoredValue(SEEN_ANIMALS_KEY, JSON.stringify(animalIds))
}

export async function loadProgress() {
  return parseProgress(await loadStoredValue(PROGRESS_KEY))
}

export async function saveProgress(progress: PraiseProgress) {
  await saveStoredValue(PROGRESS_KEY, JSON.stringify(progress))
}

interface AppDataWriters {
  saveEntries: typeof saveEntries
  saveProgress: typeof saveProgress
  saveSeenAnimals: typeof saveSeenAnimals
}

export async function resetAppData(
  writers: AppDataWriters = { saveEntries, saveProgress, saveSeenAnimals },
) {
  await Promise.all([
    writers.saveEntries({}),
    writers.saveProgress(EMPTY_PROGRESS),
    writers.saveSeenAnimals([]),
  ])
}
