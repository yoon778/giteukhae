import type { JournalEntry } from './praise.ts'
import { isDateKey } from './date.ts'

export interface PraiseProgress {
  creditedDates: string[]
}

export const EMPTY_PROGRESS: PraiseProgress = { creditedDates: [] }

export function countEntriesInMonth(entries: Record<string, JournalEntry>, month: Date) {
  const prefix = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-`
  return Object.keys(entries).filter((date) => date.startsWith(prefix)).length
}

export function createJournalSummary(
  entries: Record<string, JournalEntry>,
  progress: PraiseProgress,
  includeDemoEntries: boolean,
) {
  const values = Object.values(entries)
  const demoCount = includeDemoEntries ? values.filter((entry) => entry.isDemo).length : 0
  return {
    recordCount: values.length,
    unlockDayCount: progress.creditedDates.length + demoCount,
  }
}

export function hasResettableData(
  entryCount: number,
  progress: PraiseProgress,
  seenAnimalCount: number,
) {
  return entryCount > 0 || progress.creditedDates.length > 0 || seenAnimalCount > 0
}

export function parseProgress(value: string | null): PraiseProgress {
  if (!value) return EMPTY_PROGRESS

  try {
    const parsed = JSON.parse(value) as Partial<PraiseProgress>
    if (!Array.isArray(parsed.creditedDates)) return EMPTY_PROGRESS
    return { creditedDates: [...new Set(parsed.creditedDates.filter(isDateKey))].sort() }
  } catch {
    return EMPTY_PROGRESS
  }
}

export function creditDate(progress: PraiseProgress, date: string, isDemo: boolean): PraiseProgress {
  if (isDemo || progress.creditedDates.includes(date)) return progress
  return { creditedDates: [...progress.creditedDates, date].sort() }
}

export function mergeProgressWithEntries(
  progress: PraiseProgress,
  entries: Record<string, JournalEntry>,
): PraiseProgress {
  return Object.values(entries).reduce(
    (current, entry) => creditDate(current, entry.date, Boolean(entry.isDemo)),
    progress,
  )
}
