import { ANIMALS, ANIMAL_UNLOCKS, type AnimalId } from './animals.ts'
import { pickAnimalId } from './praise.ts'

function stableHash(value: string) {
  let result = 2166136261
  for (const character of value) {
    result ^= character.charCodeAt(0)
    result = Math.imul(result, 16777619)
  }
  return result >>> 0
}

export function getVisual(seed: string, animalId?: AnimalId) {
  const fallbackId = pickAnimalId(seed, ANIMAL_UNLOCKS.at(-1)?.min ?? 10)
  const animal = ANIMALS.find((item) => item.id === (animalId ?? fallbackId)) ?? ANIMALS[0]
  return { animal, turn: (stableHash(`${seed}-turn`) % 13) - 6 }
}
