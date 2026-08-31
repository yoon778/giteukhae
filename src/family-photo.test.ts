import assert from 'node:assert/strict'
import test from 'node:test'
import { getFamilyPhotoImage, getFamilyPhotoState } from './family-photo.ts'

test('해금 수에 맞는 완성 가족사진을 선택한다', () => {
  assert.equal(getFamilyPhotoImage(0), '/family/family-room-v1.png')
  assert.equal(getFamilyPhotoImage(3), '/family/family-photo-stage-2.png')
  assert.equal(getFamilyPhotoImage(10), '/family/family-photo-stage-5.png')
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
