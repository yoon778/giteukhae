import assert from 'node:assert/strict'
import test from 'node:test'
import { ANIMAL_CATALOG, ANIMAL_IDS, PRAISE_TOPICS } from './animals.ts'
import {
  createPraise,
  createConfusedResponse,
  detectPraiseTopic,
  getNextAnimalUnlock,
  getNextPraiseRevision,
  getUnlockedAnimalIds,
  isKnownAnimalId,
  isObviouslyUnclearInput,
  shouldShowUnclearReaction,
  pickAnimalId,
  removeEntry,
  type JournalEntry,
} from './praise.ts'
import { creditDate, mergeProgressWithEntries, type PraiseProgress } from './progress.ts'

test('동물 카탈로그는 추가에 필요한 시각·말투·칭찬 정보를 모두 가진다', () => {
  for (const animalId of ANIMAL_IDS) {
    const animal = ANIMAL_CATALOG[animalId]

    assert.ok(animal.name)
    assert.ok(animal.unlockAt >= 1)
    assert.match(animal.assets.character, /^\/characters\/.+\.png$/)
    assert.match(animal.assets.stamp, /^\/stamps\/.+\.png$/)
    assert.ok(animal.greeting)
    assert.ok(animal.visualTraits.length >= 2)
    assert.ok(animal.voice.tone)
    assert.ok(animal.voice.habits.length >= 1)
    assert.ok(animal.confused.length >= 3)
    for (const topic of PRAISE_TOPICS) assert.ok(animal.praise[topic].length >= 4)
  }
})

test('상속된 객체 속성은 동물 ID로 인정하지 않는다', () => {
  assert.equal(isKnownAnimalId('rabbit'), true)
  assert.equal(isKnownAnimalId('__proto__'), false)
  assert.equal(isKnownAnimalId('constructor'), false)
})

test('짧거나 애매한 한 줄도 앱이 임의로 거절하지 않는다', () => {
  for (const text of ['숨 쉬었다', '밥', '아아아', '그냥', '아무거나']) {
    assert.equal(isObviouslyUnclearInput(text), false, text)
  }
})

test('명백한 반복 입력만 로컬에서 의미 없음으로 판단한다', () => {
  for (const text of ['아아아아', 'ㅋㅋㅋㅋㅋㅋ', '1111', 'asdfasdf']) {
    assert.equal(isObviouslyUnclearInput(text), true, text)
  }

  for (const text of ['아아아', '오늘 일찍 일어남', '어제 술을 마셨지만 오늘 일찍 일어남']) {
    assert.equal(isObviouslyUnclearInput(text), false, text)
  }
})

test('물음표 반응은 의미를 파악하지 못한 답변에만 표시한다', () => {
  assert.equal(shouldShowUnclearReaction('unclear'), true)
  assert.equal(shouldShowUnclearReaction('praise'), false)
  assert.equal(shouldShowUnclearReaction('emotion'), false)
  assert.equal(shouldShowUnclearReaction('playful'), false)
  assert.equal(shouldShowUnclearReaction(undefined), false)
})

test('확실한 기호·숫자·키보드 오타만 로컬 불명확 입력으로 본다', () => {
  for (const text of ['!!!!!!!!', 'asdfasdf', '111111']) {
    assert.equal(isObviouslyUnclearInput(text), true, text)
  }
})

test('의미 없는 입력에도 동물마다 다른 반응을 돌려준다', () => {
  const rabbit = createConfusedResponse('rabbit', 'ㅋㅋㅋㅋ', 0)
  const cat = createConfusedResponse('cat', 'ㅋㅋㅋㅋ', 0)

  assert.notEqual(rabbit, cat)
  assert.match(cat, /뭐라고|다시|이해/)
})

test('달리기와 거리 표현을 운동으로 분류한다', () => {
  assert.equal(detectPraiseTopic('10km 달리기를 했다'), 'movement')
  assert.equal(detectPraiseTopic('퇴근 후 러닝 완료'), 'movement')
})

test('생활 돌봄 표현을 자기돌봄으로 분류한다', () => {
  assert.equal(detectPraiseTopic('물을 챙겨 마셨다'), 'selfCare')
  assert.equal(detectPraiseTopic('일찍 자고 푹 쉬었다'), 'selfCare')
  assert.equal(detectPraiseTopic('건물에 다녀왔다'), 'default')
  assert.equal(detectPraiseTopic('친구에게 선물을 건넸다'), 'kindness')
})

test('칭찬 다시 받기는 같은 동물 말투 안에서 다음 문장을 반환한다', () => {
  const first = createPraise('10km 달리기를 했다', 1, 'rabbit', 0)
  const second = createPraise('10km 달리기를 했다', 1, 'rabbit', 1)

  assert.notEqual(first, second)
  assert.equal(getNextPraiseRevision(undefined, '10km 달리기를 했다'), 0)
  assert.equal(getNextPraiseRevision({ text: '10km 달리기를 했다', praiseRevision: 2 }, '10km 달리기를 했다'), 3)
  assert.equal(getNextPraiseRevision({ text: '설거지를 했다', praiseRevision: 2 }, '10km 달리기를 했다'), 0)
})

test('해금은 누적된 실제 날짜를 기준으로 유지한다', () => {
  const progress: PraiseProgress = { creditedDates: ['2026-08-25'] }
  const credited = creditDate(progress, '2026-08-26', false)
  const duplicate = creditDate(credited, '2026-08-26', false)
  const demo = creditDate(duplicate, '2026-08-27', true)

  assert.deepEqual(credited.creditedDates, ['2026-08-25', '2026-08-26'])
  assert.deepEqual(duplicate, credited)
  assert.deepEqual(demo, credited)
})

test('기존 실제 기록은 진행도에 병합하고 데모 기록은 제외한다', () => {
  const entries: Record<string, JournalEntry> = {
    '2026-08-25': {
      date: '2026-08-25',
      text: '설거지를 했다',
      praise: '잘했어요',
    },
    '2026-08-26': {
      date: '2026-08-26',
      text: '테스트 기록',
      praise: '잘했어요',
      isDemo: true,
    },
  }

  assert.deepEqual(mergeProgressWithEntries({ creditedDates: [] }, entries).creditedDates, ['2026-08-25'])
})

test('누적 일수에 따라 동물이 순서대로 해금된다', () => {
  assert.deepEqual(getUnlockedAnimalIds(1), ['rabbit'])
  assert.deepEqual(getUnlockedAnimalIds(5), ['rabbit', 'dog', 'cat'])
  assert.equal(pickAnimalId('2026-08-25', 7), 'duck')
  assert.equal(getNextAnimalUnlock(0)?.id, 'dog')
  assert.equal(getNextAnimalUnlock(3)?.id, 'cat')
})

test('동물마다 다른 말투로 칭찬한다', () => {
  const rabbit = createPraise('산책을 했다', 8, 'rabbit')
  const duck = createPraise('산책을 했다', 8, 'duck')

  assert.notEqual(rabbit, duck)
  assert.match(duck, /꽥|물갈퀴/)
})

test('선택한 날짜만 지우고 원본은 보존한다', () => {
  const entry: JournalEntry = {
    date: '2026-08-25',
    text: '설거지를 했다',
    praise: '잘했어요',
  }
  const original = { [entry.date]: entry, '2026-08-24': { ...entry, date: '2026-08-24' } }
  const result = removeEntry(original, entry.date)

  assert.equal(result[entry.date], undefined)
  assert.equal(result['2026-08-24']?.date, '2026-08-24')
  assert.equal(original[entry.date], entry)
})
