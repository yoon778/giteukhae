import type { JournalEntry } from './praise.ts'

export function getMonthlyEntries(entries: Record<string, JournalEntry>, month: Date) {
  const prefix = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-`
  return Object.values(entries)
    .filter((entry) => entry.date.startsWith(prefix))
    .sort((left, right) => right.date.localeCompare(left.date))
}

export function getDefaultMemoryDates(entries: JournalEntry[], maximum = 3) {
  return entries.slice(0, maximum).map((entry) => entry.date)
}

export function toggleMemoryDate(selected: string[], date: string, maximum = 3) {
  if (selected.includes(date)) return selected.filter((value) => value !== date)
  if (selected.length >= maximum) return selected
  return [...selected, date]
}
