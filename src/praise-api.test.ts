import assert from 'node:assert/strict'
import test from 'node:test'
import { parsePraiseResult, requestPraise } from './praise-api.ts'

const REQUEST = {
  text: '오늘 10km를 달렸다',
  count: 3,
  animalId: 'rabbit' as const,
  revision: 0,
}

test('AI 주소가 없으면 로컬 칭찬으로 즉시 대체한다', async () => {
  const result = await requestPraise(REQUEST, { endpoint: '' })

  assert.equal(result.kind, 'praise')
  assert.equal(result.topic, 'movement')
  assert.ok(result.comment)
})

test('의미가 불명확해도 기록 가능한 한마디를 반환한다', async () => {
  const result = await requestPraise({ ...REQUEST, text: '!!!!!!!!' }, { endpoint: '' })

  assert.equal(result.kind, 'unclear')
  assert.ok(result.comment)
})

test('정상적인 AI 구조화 응답을 사용한다', async () => {
  const fetcher: typeof fetch = async () => new Response(JSON.stringify({
    kind: 'emotion',
    topic: 'selfCare',
    comment: '오늘은 버틴 것만으로도 도장 받을 만해요',
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })

  const result = await requestPraise(REQUEST, { endpoint: 'https://example.com/api/praise', fetcher })

  assert.equal(result.kind, 'emotion')
  assert.equal(result.comment, '오늘은 버틴 것만으로도 도장 받을 만해요')
})

test('깨진 AI 응답은 노출하지 않고 로컬 칭찬으로 대체한다', async () => {
  const fetcher: typeof fetch = async () => new Response(JSON.stringify({
    kind: 'reject',
    topic: 'unknown',
    comment: '',
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })

  const result = await requestPraise(REQUEST, { endpoint: 'https://example.com/api/praise', fetcher })

  assert.equal(result.kind, 'praise')
})

test('AI 응답은 허용된 유형·주제·120자 이하 한마디만 통과한다', () => {
  assert.equal(parsePraiseResult({ kind: 'praise', topic: 'chores', comment: ' 잘했어요 ' })?.comment, '잘했어요')
  assert.equal(parsePraiseResult({ kind: 'reject', topic: 'chores', comment: '잘했어요' }), null)
  assert.equal(parsePraiseResult({ kind: 'praise', topic: 'chores', comment: '가'.repeat(121) }), null)
})
