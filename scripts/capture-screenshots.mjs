import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const OUTPUT = join(ROOT, 'assets', 'screenshots')
const APP_URL = 'http://127.0.0.1:4173/'
const DEBUG_PORT = 9333
const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
]

async function exists(path) {
  try {
    await import('node:fs/promises').then(({ access }) => access(path))
    return true
  } catch {
    return false
  }
}

async function waitFor(url, attempts = 80) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) return response
    } catch {
      // 서버 또는 브라우저 시작 대기
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 100))
  }
  throw new Error(`${url} 연결 시간 초과`)
}

function envelope(value) {
  return JSON.stringify({
    __giteukhaeStorage: 1,
    updatedAt: Date.now(),
    value: JSON.stringify(value),
  })
}

async function main() {
  const chromePath = (await Promise.all(CHROME_PATHS.map(async (path) => [path, await exists(path)])))
    .find(([, found]) => found)?.[0]
  if (!chromePath) throw new Error('Chrome 또는 Edge 실행 파일을 찾지 못함')

  await mkdir(OUTPUT, { recursive: true })
  const profile = await mkdtemp(join(tmpdir(), 'giteukhae-screenshot-'))
  const vite = spawn(process.execPath, [
    join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'),
    'preview',
    '--host', '127.0.0.1',
    '--port', '4173',
    '--strictPort',
  ], { cwd: ROOT, stdio: 'ignore' })
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${profile}`,
    '--window-size=636,1048',
    'about:blank',
  ], { stdio: 'ignore', windowsHide: true })

  try {
    await Promise.all([
      waitFor(APP_URL),
      waitFor(`http://127.0.0.1:${DEBUG_PORT}/json/version`),
    ])
    const target = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new?${encodeURIComponent(APP_URL)}`, { method: 'PUT' })
      .then((response) => response.json())
    const socket = new WebSocket(target.webSocketDebuggerUrl)
    await new Promise((resolveOpen, rejectOpen) => {
      socket.addEventListener('open', resolveOpen, { once: true })
      socket.addEventListener('error', rejectOpen, { once: true })
    })

    let nextId = 0
    const pending = new Map()
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)
      const request = pending.get(message.id)
      if (!request) return
      pending.delete(message.id)
      if (message.error) request.reject(new Error(message.error.message))
      else request.resolve(message.result)
    })
    const command = (method, params = {}) => new Promise((resolveCommand, rejectCommand) => {
      const id = ++nextId
      pending.set(id, { resolve: resolveCommand, reject: rejectCommand })
      socket.send(JSON.stringify({ id, method, params }))
    })
    const evaluate = (expression) => command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    const pause = (milliseconds) => new Promise((resolvePause) => setTimeout(resolvePause, milliseconds))
    const capture = async (name) => {
      const result = await command('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: false,
        fromSurface: true,
      })
      await writeFile(join(OUTPUT, name), Buffer.from(result.data, 'base64'))
    }
    const setStored = (key, value) => evaluate(`localStorage.setItem(${JSON.stringify(key)}, ${JSON.stringify(envelope(value))})`)

    await command('Page.enable')
    await command('Runtime.enable')
    await command('Emulation.setDeviceMetricsOverride', {
      width: 636,
      height: 1048,
      deviceScaleFactor: 1,
      mobile: true,
      screenWidth: 636,
      screenHeight: 1048,
    })
    await command('Page.navigate', { url: APP_URL })
    await pause(700)

    await setStored('giteukhae.entries.v1', {})
    await setStored('giteukhae.progress.v1', { creditedDates: [] })
    await setStored('giteukhae.seenAnimals.v1', ['rabbit'])
    await evaluate("sessionStorage.removeItem('giteukhae.devDayOffset'); location.reload()")
    await pause(900)
    await capture('01-empty.png')

    await evaluate(`(() => {
      const textarea = document.querySelector('#proud-note')
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set
      setter.call(textarea, '귀찮았지만 설거지를 바로 했다')
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
    })()`)
    await pause(200)
    await capture('02-writing.png')

    await evaluate("document.querySelector('form').requestSubmit()")
    await pause(650)
    await capture('03-stamping.png')
    await pause(1_700)
    await capture('04-praised.png')

    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const animalIds = ['rabbit', 'dog', 'cat', 'duck', 'bear']
    const entries = {}
    const creditedDates = []
    for (let day = 14; day <= Math.min(now.getDate(), 26); day += 1) {
      const date = `${year}-${month}-${String(day).padStart(2, '0')}`
      creditedDates.push(date)
      entries[date] = {
        date,
        text: ['10분 산책을 했다', '설거지를 미루지 않았다', '오늘도 잘 버텼다'][day % 3],
        praise: ['한 걸음 움직인 오늘, 정말 멋져요!', '귀찮은 일을 해낸 건 확실히 기특해요!', '오늘을 버틴 마음에도 도장 꾹!'][day % 3],
        animalId: animalIds[(day - 14) % animalIds.length],
        responseKind: 'praise',
      }
    }
    await setStored('giteukhae.entries.v1', entries)
    await setStored('giteukhae.progress.v1', { creditedDates })
    await setStored('giteukhae.seenAnimals.v1', animalIds)
    await evaluate('location.reload()')
    await pause(900)
    await evaluate("document.querySelector('#calendar-tab').click()")
    await pause(350)
    await capture('05-calendar.png')
    await evaluate("document.querySelector('.calendar-day--done').click()")
    await pause(250)
    await capture('06-detail.png')

    socket.close()
  } finally {
    vite.kill()
    chrome.kill()
    await new Promise((resolveExit) => setTimeout(resolveExit, 500))
    await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
  }
}

await main()
