import { ANIMAL_UNLOCKS, type AnimalId } from './animals.ts'

export type FamilySeason = 1 | 2

const FAMILY_SEASON_IDS = {
  1: ['rabbit', 'dog', 'cat', 'duck', 'bear'],
  2: ['capybara', 'hedgehog', 'owl'],
} as const satisfies Record<FamilySeason, readonly AnimalId[]>

export interface FamilyPhotoState {
  unlockedIds: AnimalId[]
  nextName: string | null
  remainingDays: number
}

export function getFamilyPhotoState(unlockDayCount: number, season: FamilySeason = 1): FamilyPhotoState {
  const seasonIds: readonly AnimalId[] = FAMILY_SEASON_IDS[season]
  const unlockedIds = ANIMAL_UNLOCKS
    .filter((animal) => seasonIds.includes(animal.id) && unlockDayCount >= animal.min)
    .map((animal) => animal.id)
  const next = ANIMAL_UNLOCKS.find((animal) => seasonIds.includes(animal.id) && unlockDayCount < animal.min)

  return {
    unlockedIds,
    nextName: next?.name ?? null,
    remainingDays: next ? next.min - unlockDayCount : 0,
  }
}

export function getFamilyPhotoImage(unlockDayCount: number, season: FamilySeason = 1): string {
  const count = getFamilyPhotoState(unlockDayCount, season).unlockedIds.length
  if (season === 2) return `/season2/family/starlight-post-office-stage-${count}-v1.webp`
  return count === 0 ? '/family/family-room-v1.webp' : `/family/family-photo-stage-${count}.webp`
}
