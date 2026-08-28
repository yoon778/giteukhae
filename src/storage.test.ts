import assert from 'node:assert/strict'
import test from 'node:test'
import { parseProgress } from './progress.ts'
import { loadStoredValue, parseEntries, saveStoredValue } from './storage.ts'

test('손상된 저장 데이터에서는 유효한 기록만 복구한다', () => {
  const parsed = parseEntries(JSON.stringify({
    broken: null,
    '2026-08-26': {
      date: '2026-08-26',
      text: '설거지를 했다',
      praise: '잘했어요',
      createdAt: '2026-08-26T00:00:00.000Z',
      praiseSource: 'ai',
    },
  }))

  assert.deepEqual(Object.keys(parsed), ['2026-08-26'])
  assert.equal(parsed['2026-08-26']?.text, '설거지를 했다')
  assert.equal(Object.hasOwn(parsed['2026-08-26'] ?? {}, 'createdAt'), false)
  assert.equal(Object.hasOwn(parsed['2026-08-26'] ?? {}, 'praiseSource'), false)
})

test('길이 제한을 넘거나 상속 속성을 동물 ID로 쓴 저장값은 복구하지 않는다', () => {
  const parsed = parseEntries(JSON.stringify({
    '2026-08-25': {
      text: '가'.repeat(81),
      praise: '잘했어요',
    },
    '2026-08-26': {
      text: '물을 마셨다',
      praise: '잘했어요',
      animalId: '__proto__',
    },
  }))

  assert.equal(parsed['2026-08-25'], undefined)
  assert.equal(parsed['2026-08-26']?.animalId, undefined)
})

test('진행도에서는 실제 달력 날짜만 복구한다', () => {
  const progress = parseProgress(JSON.stringify({
    creditedDates: ['2026-08-26', 'oops', '2026-02-30', '2026-08-26'],
  }))

  assert.deepEqual(progress.creditedDates, ['2026-08-26'])
})

test('한 저장소의 쓰기가 실패해도 다음 실행에서 최신 값을 선택한다', async () => {
  const primaryValues = new Map([['entries', '이전 값']])
  const browserValues = new Map<string, string>()
  let primaryWriteFails = true
  const primary = {
    getItem: async (key: string) => primaryValues.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      if (primaryWriteFails) throw new Error('native write failed')
      primaryValues.set(key, value)
    },
  }
  const browser = {
    getItem: (key: string) => browserValues.get(key) ?? null,
    setItem: (key: string, value: string) => browserValues.set(key, value),
  }

  await saveStoredValue('entries', '최신 값', primary, browser, 2)
  primaryWriteFails = false

  assert.equal(await loadStoredValue('entries', primary, browser), '최신 값')
})
