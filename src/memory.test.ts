import assert from 'node:assert/strict'
import test from 'node:test'
import { getDefaultMemoryDates, getMonthlyEntries, toggleMemoryDate } from './memory.ts'
import type { JournalEntry } from './praise.ts'

const entries: Record<string, JournalEntry> = {
  '2026-08-31': { date: '2026-08-31', text: '8월 기록', praise: '잘했어요' },
  '2026-09-01': { date: '2026-09-01', text: '첫 기록', praise: '잘했어요' },
  '2026-09-03': { date: '2026-09-03', text: '두 번째 기록', praise: '잘했어요' },
  '2026-09-05': { date: '2026-09-05', text: '세 번째 기록', praise: '잘했어요' },
  '2026-09-07': { date: '2026-09-07', text: '네 번째 기록', praise: '잘했어요' },
}

test('월간 추억 후보는 현재 달의 최신 기록부터 고른다', () => {
  const result = getMonthlyEntries(entries, new Date(2026, 8, 1))

  assert.deepEqual(result.map((entry) => entry.date), ['2026-09-07', '2026-09-05', '2026-09-03', '2026-09-01'])
  assert.deepEqual(getDefaultMemoryDates(result), ['2026-09-07', '2026-09-05', '2026-09-03'])
})

test('월간 추억은 최대 세 개까지 직접 고를 수 있다', () => {
  assert.deepEqual(toggleMemoryDate(['a', 'b'], 'c'), ['a', 'b', 'c'])
  assert.deepEqual(toggleMemoryDate(['a', 'b', 'c'], 'd'), ['a', 'b', 'c'])
  assert.deepEqual(toggleMemoryDate(['a', 'b'], 'a'), ['b'])
})
