import assert from 'node:assert/strict'
import test from 'node:test'
import { getFamilyPhotoLayers, getFamilyPhotoState } from './family-photo.ts'

test('해금된 동물은 완성 사진 조각이 아닌 독립 이미지로 구성한다', () => {
  assert.deepEqual(getFamilyPhotoLayers(3), [
    { id: 'rabbit', src: '/characters/rabbit-v2.png' },
    { id: 'dog', src: '/characters/dog-v2.png' },
  ])
})

test('누적 일수에 따라 가족사진 자리가 순서대로 채워진다', () => {
  assert.deepEqual(getFamilyPhotoState(0), {
    unlockedIds: [],
    nextName: '토끼',
    remainingDays: 1,
  })
  assert.deepEqual(getFamilyPhotoState(3), {
    unlockedIds: ['rabbit', 'dog'],
    nextName: '고양이',
    remainingDays: 2,
  })
  assert.deepEqual(getFamilyPhotoState(10), {
    unlockedIds: ['rabbit', 'dog', 'cat', 'duck', 'bear'],
    nextName: null,
    remainingDays: 0,
  })
})
