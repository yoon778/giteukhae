import { ANIMAL_UNLOCKS, type AnimalId } from './animals.ts'

export interface FamilyPhotoState {
  unlockedIds: AnimalId[]
  nextName: string | null
  remainingDays: number
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

export function getFamilyPhotoImage(unlockDayCount: number): string {
  const count = getFamilyPhotoState(unlockDayCount).unlockedIds.length
  return count === 0
    ? '/family/family-room-v1.png'
    : `/family/family-photo-stage-${count}.png`
}
