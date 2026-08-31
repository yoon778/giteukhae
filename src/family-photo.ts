import { ANIMAL_UNLOCKS, type AnimalId } from './animals.ts'

export interface FamilyPhotoState {
  unlockedIds: AnimalId[]
  nextName: string | null
  remainingDays: number
}

export interface FamilyPhotoLayer {
  id: AnimalId
  src: string
}

const FAMILY_PHOTO_ASSETS: Record<AnimalId, string> = {
  rabbit: '/characters/rabbit-v2.png',
  dog: '/characters/dog-v2.png',
  cat: '/characters/cat-v2.png',
  duck: '/characters/duck-v2.png',
  bear: '/characters/bear-v2.png',
}

export function getFamilyPhotoState(unlockDayCount: number): FamilyPhotoState {
  const unlockedIds = ANIMAL_UNLOCKS
    .filter((animal) => unlockDayCount >= animal.min)
    .map((animal) => animal.id)
  const next = ANIMAL_UNLOCKS.find((animal) => unlockDayCount < animal.min)

  return {
    unlockedIds,
    nextName: next?.name ?? null,
    remainingDays: next ? next.min - unlockDayCount : 0,
  }
}

export function getFamilyPhotoLayers(unlockDayCount: number): FamilyPhotoLayer[] {
  return getFamilyPhotoState(unlockDayCount).unlockedIds.map((id) => ({
    id,
    src: FAMILY_PHOTO_ASSETS[id],
  }))
}
