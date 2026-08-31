import {
  ANIMAL_CATALOG,
  ANIMAL_UNLOCKS,
  getAnimal,
  type AnimalId,
  type PraiseTopic,
} from './animals.ts'

export interface JournalEntry {
  date: string
  text: string
  praise: string
  praiseRevision?: number
  responseKind?: PraiseResponseKind
  animalId?: AnimalId
  isDemo?: boolean
}

export const MAX_ENTRY_TEXT_LENGTH = 80
export const MAX_PRAISE_LENGTH = 120

export const PRAISE_RESPONSE_KINDS = ['praise', 'emotion', 'unclear', 'playful'] as const
export type PraiseResponseKind = typeof PRAISE_RESPONSE_KINDS[number]

const TOPIC_KEYWORDS: ReadonlyArray<{ id: Exclude<PraiseTopic, 'default'>; words: readonly string[] }> = [
  {
    id: 'movement',
    words: ['운동', '계단', '걸었', '걷기', '산책', '달리', '달렸', '러닝', '조깅', '뛰', '헬스', '스트레칭', 'km', '킬로'],
  },
  {
    id: 'chores',
    words: ['청소', '설거지', '정리', '빨래', '씻었', '샤워', '요리', '분리수거', '쓰레기'],
  },
  {
    id: 'learning',
    words: ['공부', '책을', '독서', '읽었', '과제', '업무', '메일', '출근', '연습', '복습', '강의'],
  },
  {
    id: 'kindness',
    words: ['참았', '사과', '양보', '안부', '전화', '연락', '감사', '도와', '배려', '선물'],
  },
  {
    id: 'selfCare',
    words: ['마셨', '수분', '밥', '식사', '아침', '점심', '저녁', '약을', '약 먹', '약 챙', '병원', '잠을', '잠들', '잤', '수면', '일찍', '기상', '쉬었', '휴식'],
  },
]

function hash(value: string) {
  return [...value].reduce((total, character) => total + character.charCodeAt(0), 0)
}

export function isObviouslyUnclearInput(text: string) {
  const compact = text.trim().replace(/\s/g, '').toLowerCase().normalize('NFC')
  if (!compact || !/[\p{L}\p{N}]/u.test(compact)) return true
  if (/^\d+$/.test(compact)) return true
  if (/^(?:asdf|qwer|zxcv|hjkl|sdfg|dfgh|wert)+$/i.test(compact)) return true
  const characters = [...compact]
  if (characters.length >= 4 && new Set(characters).size === 1) return true
  return false
}

export function shouldShowUnclearReaction(kind: PraiseResponseKind | undefined) {
  return kind === 'unclear'
}

export function createConfusedResponse(animalId: AnimalId, text: string, revision = 0) {
  const messages = getAnimal(animalId).confused
  return messages[(hash(text.normalize('NFC')) + revision) % messages.length]
}

export function detectPraiseTopic(text: string): PraiseTopic {
  const normalized = text.toLowerCase().normalize('NFC')
  return TOPIC_KEYWORDS.find((topic) => topic.words.some((word) => normalized.includes(word)))?.id ?? 'default'
}

export function getUnlockedAnimalIds(count: number) {
  return ANIMAL_UNLOCKS.filter((animal) => count >= animal.min).map((animal) => animal.id)
}

export function getNextAnimalUnlock(count: number) {
  const unlocked = getUnlockedAnimalIds(count)
  return ANIMAL_UNLOCKS.find((animal) => !unlocked.includes(animal.id))
}

export function pickAnimalId(seed: string, count: number): AnimalId {
  const newlyUnlocked = ANIMAL_UNLOCKS.find((animal) => animal.min === count)
  if (newlyUnlocked) return newlyUnlocked.id

  const unlocked = getUnlockedAnimalIds(count)
  const available = unlocked.length > 0 ? unlocked : [ANIMAL_UNLOCKS[0].id]
  return available[hash(seed) % available.length]
}

export function createPraise(text: string, count: number, animalId: AnimalId = 'rabbit', revision = 0) {
  const normalized = text.toLowerCase().normalize('NFC')
  const topic = detectPraiseTopic(normalized)
  const messages = getAnimal(animalId).praise[topic]
  return messages[(hash(normalized) + count + revision) % messages.length]
}

export function getNextPraiseRevision(
  previous: Pick<JournalEntry, 'text' | 'praiseRevision'> | undefined,
  text: string,
) {
  return previous?.text === text ? (previous.praiseRevision ?? 0) + 1 : 0
}

export function removeEntry(entries: Record<string, JournalEntry>, date: string) {
  const next = { ...entries }
  delete next[date]
  return next
}

export function isKnownAnimalId(value: string): value is AnimalId {
  return Object.hasOwn(ANIMAL_CATALOG, value)
}

export function isPraiseResponseKind(value: string): value is PraiseResponseKind {
  return PRAISE_RESPONSE_KINDS.some((kind) => kind === value)
}
