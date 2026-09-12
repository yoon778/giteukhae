import assert from 'node:assert/strict'
import test from 'node:test'
import { requestDrawing } from './drawing-api.ts'

const REQUEST = {
  text: '친구와 그네를 탔다',
  animalIds: ['rabbit', 'dog'] as const,
}

test('정상적인 WebP 그림 응답만 사용한다', async () => {
  const fetcher: typeof fetch = async () => new Response(JSON.stringify({
    imageDataUrl: 'data:image/webp;base64,UklGRg==',
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })

  const result = await requestDrawing(
    { ...REQUEST, animalIds: [...REQUEST.animalIds] },
    { endpoint: 'https://example.com/api/drawing', fetcher },
  )

  assert.deepEqual(result, { ok: true, imageDataUrl: 'data:image/webp;base64,UklGRg==' })
})

test('차단되거나 깨진 그림 응답을 저장하지 않는다', async () => {
  const blocked = await requestDrawing(
    { ...REQUEST, animalIds: [...REQUEST.animalIds] },
    { endpoint: 'https://example.com/api/drawing', fetcher: async () => new Response('{}', { status: 422 }) },
  )
  const invalid = await requestDrawing(
    { ...REQUEST, animalIds: [...REQUEST.animalIds] },
    {
      endpoint: 'https://example.com/api/drawing',
      fetcher: async () => new Response(JSON.stringify({ imageDataUrl: 'data:image/png;base64,UklGRg==' }), { status: 200 }),
    },
  )

  assert.deepEqual(blocked, { ok: false, reason: 'unavailable' })
  assert.deepEqual(invalid, { ok: false, reason: 'error' })
})

test('하루 그림 제한 응답을 일반 오류와 구분한다', async () => {
  const result = await requestDrawing(
    { ...REQUEST, animalIds: [...REQUEST.animalIds] },
    {
      endpoint: 'https://example.com/api/drawing',
      fetcher: async () => new Response(JSON.stringify({ error: 'drawing_daily_limit' }), { status: 429 }),
    },
  )

  assert.deepEqual(result, { ok: false, reason: 'limit' })
})
