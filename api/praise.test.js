import assert from 'node:assert/strict'
import test from 'node:test'
import handler, {
  isAllowedOrigin,
  isClearlyUnclearInput,
  isEchoLikeComment,
  parseOpenAIResult,
  parsePraiseRequest,
} from './praise.js'

function createResponse() {
  return {
    headers: {},
    statusCode: 0,
    body: undefined,
    setHeader(name, value) { this.headers[name] = value },
    status(code) { this.statusCode = code; return this },
    json(value) { this.body = value; return this },
    end() { return this },
  }
}

test('토스 운영·비공개 출처만 허용한다', () => {
  assert.equal(isAllowedOrigin('https://giteukhae.apps.tossmini.com', ''), true)
  assert.equal(isAllowedOrigin('https://giteukhae.private-apps.tossmini.com', ''), true)
  assert.equal(isAllowedOrigin('https://evil.example.com', ''), false)
  assert.equal(isAllowedOrigin(undefined, ''), false)
  assert.equal(isAllowedOrigin('http://localhost:5173', '', true), true)
  assert.equal(isAllowedOrigin('http://localhost:5173', '', false), false)
})

test('칭찬 요청의 글·동물·수정 횟수를 검증한다', () => {
  assert.deepEqual(parsePraiseRequest({ text: ' 물을 잘 마셨다 ', animalId: 'bear', revision: 0 }), {
    text: '물을 잘 마셨다',
    animalId: 'bear',
    revision: 0,
  })
  assert.equal(parsePraiseRequest({ text: '', animalId: 'bear', revision: 0 }), null)
  assert.equal(parsePraiseRequest({ text: '잘했다', animalId: 'fox', revision: 0 }), null)
  assert.equal(parsePraiseRequest({ text: '잘했다', animalId: '__proto__', revision: 0 }), null)
  assert.equal(parsePraiseRequest({ text: '잘했다', animalId: 'constructor', revision: 0 }), null)
})

test('명백한 반복 입력은 AI 호출 전에 의미 없음으로 분류한다', async () => {
  assert.equal(isClearlyUnclearInput('아아아아아'), true)
  assert.equal(isClearlyUnclearInput('ㅋㅋㅋㅋㅋㅋ'), true)
  assert.equal(isClearlyUnclearInput('가나다라마바사'), false)
  assert.equal(isClearlyUnclearInput('어제 술을 마셨지만 오늘 일찍 일어남'), false)

  const originalFetch = globalThis.fetch
  const originalApiKey = process.env.OPENAI_API_KEY
  globalThis.fetch = async () => { throw new Error('OpenAI must not be called') }
  process.env.OPENAI_API_KEY = 'test-key'

  try {
    const response = createResponse()
    await handler({
      method: 'POST',
      headers: {
        origin: 'https://giteukhae.apps.tossmini.com',
        'content-type': 'application/json',
      },
      body: { text: '아아아아아', animalId: 'rabbit', revision: 0 },
      socket: { remoteAddress: 'test-unclear-input' },
    }, response)

    assert.equal(response.statusCode, 200)
    assert.equal(response.body.kind, 'unclear')
    assert.equal(response.body.topic, 'default')
  } finally {
    globalThis.fetch = originalFetch
    if (originalApiKey === undefined) delete process.env.OPENAI_API_KEY
    else process.env.OPENAI_API_KEY = originalApiKey
  }
})

test('JSON이 아니거나 너무 큰 요청은 OpenAI 호출 전에 거절한다', async () => {
  const plainResponse = createResponse()
  await handler({
    method: 'POST',
    headers: { origin: 'https://giteukhae.apps.tossmini.com', 'content-type': 'text/plain' },
    body: '{}',
  }, plainResponse)
  assert.equal(plainResponse.statusCode, 415)

  const largeResponse = createResponse()
  await handler({
    method: 'POST',
    headers: {
      origin: 'https://giteukhae.apps.tossmini.com',
      'content-type': 'application/json',
      'content-length': '4097',
    },
    body: {},
  }, largeResponse)
  assert.equal(largeResponse.statusCode, 413)
})

test('Responses API의 구조화 출력을 앱 응답으로 변환한다', () => {
  const result = parseOpenAIResult({
    output: [{
      content: [{
        type: 'output_text',
        text: JSON.stringify({ kind: 'emotion', topic: 'selfCare', comment: '오늘을 버틴 마음도 충분히 칭찬받을 만해요' }),
      }],
    }],
  })
  assert.deepEqual(result, {
    kind: 'emotion',
    topic: 'selfCare',
    comment: '오늘을 버틴 마음도 충분히 칭찬받을 만해요',
  })
})

test('원문을 거의 그대로 옮긴 코멘트는 거절한다', () => {
  const source = '학교에 가서 수업을 졸지 않고 들었다'

  assert.equal(
    isEchoLikeComment(source, '오늘 학교 수업을 졸지 않고 끝까지 들었다.'),
    true,
  )
  assert.equal(
    isEchoLikeComment(source, '어이구, 졸음도 잘 이겨냈구나. 그 집중력에 도장 꾹!'),
    false,
  )
})
