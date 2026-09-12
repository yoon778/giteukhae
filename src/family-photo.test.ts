import assert from 'node:assert/strict'
import test from 'node:test'
import { getFamilyPhotoImage, getFamilyPhotoState } from './family-photo.ts'

test('해금 수에 맞는 완성 가족사진을 선택한다', () => {
  assert.equal(getFamilyPhotoImage(0), '/family/family-room-v1.webp')
  assert.equal(getFamilyPhotoImage(3), '/family/family-photo-stage-2.webp')
  assert.equal(getFamilyPhotoImage(10), '/family/family-photo-stage-5.webp')
  assert.equal(getFamilyPhotoImage(10, 2), '/season2/family/starlight-post-office-stage-0-v1.webp')
  assert.equal(getFamilyPhotoImage(18, 2), '/season2/family/starlight-post-office-stage-2-v1.webp')
  assert.equal(getFamilyPhotoImage(23, 2), '/season2/family/starlight-post-office-stage-3-v1.webp')
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
  assert.deepEqual(getFamilyPhotoState(10, 2), {
    unlockedIds: [],
    nextName: '카피바라',
    remainingDays: 4,
  })
  assert.deepEqual(getFamilyPhotoState(18, 2), {
    unlockedIds: ['capybara', 'hedgehog'],
    nextName: '부엉이',
    remainingDays: 5,
  })
  assert.deepEqual(getFamilyPhotoState(23, 2), {
    unlockedIds: ['capybara', 'hedgehog', 'owl'],
    nextName: null,
    remainingDays: 0,
  })
})
