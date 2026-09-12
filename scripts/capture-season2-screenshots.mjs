import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const OUTPUT = join(process.env.USERPROFILE, 'Pictures', 'Screenshots')
const APP_URL = 'http://127.0.0.1:4174/'
const DEBUG_PORT = 9334
const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
]
const SEASON_1_IDS = ['rabbit', 'dog', 'cat', 'duck', 'bear']
const SEASON_2_IDS = ['capybara', 'hedgehog', 'owl']

async function exists(path) {
  try {
    await import('node:fs/promises').then(({ access }) => access(path))
    return true
  } catch {
    return false
  }
}

async function waitFor(url, attempts = 100) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // 서버 시작 대기
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

function creditedDates(count) {
  return Array.from({ length: count }, (_, index) => `2026-08-${String(index + 1).padStart(2, '0')}`)
}

async function main() {
  const chromePath = (await Promise.all(CHROME_PATHS.map(async (path) => [path, await exists(path)])))
    .find(([, found]) => found)?.[0]
  if (!chromePath) throw new Error('Chrome 또는 Edge 실행 파일을 찾지 못함')

  await mkdir(OUTPUT, { recursive: true })
  const profile = await mkdtemp(join(tmpdir(), 'giteukhae-season2-'))
  const vite = spawn(process.execPath, [
    join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'),
    'preview', '--host', '127.0.0.1', '--port', '4174', '--strictPort',
  ], { cwd: ROOT, stdio: 'ignore' })
  const chrome = spawn(chromePath, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${profile}`,
    '--window-size=636,1048',
    'about:blank',
  ], { stdio: 'ignore', windowsHide: true })

  try {
    await Promise.all([waitFor(APP_URL), waitFor(`http://127.0.0.1:${DEBUG_PORT}/json/version`)])
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
    const setStored = (key, value) => evaluate(`localStorage.setItem(${JSON.stringify(key)}, ${JSON.stringify(envelope(value))})`)
    const capture = async (name) => {
      const result = await command('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: false,
        fromSurface: true,
      })
      const path = join(OUTPUT, name)
      await writeFile(path, Buffer.from(result.data, 'base64'))
      console.log(path)
    }
    const captureGreetingFocus = async (name) => {
      const boundsResult = await evaluate(`(() => {
        const bubble = document.querySelector('.greeting-bubble').getBoundingClientRect()
        const mascot = document.querySelector('.greeting-scene .mascot').getBoundingClientRect()
        const hint = document.querySelector('.greeting-scene small').getBoundingClientRect()
        const padding = 36
        const left = Math.max(0, Math.min(bubble.left, mascot.left, hint.left) - padding)
        const top = Math.max(0, bubble.top - padding)
        const right = Math.min(innerWidth, Math.max(bubble.right, mascot.right, hint.right) + padding)
        const bottom = Math.min(innerHeight, Math.max(bubble.bottom, mascot.bottom, hint.bottom) + padding)
        return { x: left, y: top, width: right - left, height: bottom - top }
      })()`)
      const clip = boundsResult.result.value
      const result = await command('Page.captureScreenshot', {
        format: 'png',
        captureBeyondViewport: false,
        fromSurface: true,
        clip: { ...clip, scale: 1 },
      })
      const path = join(OUTPUT, name)
      await writeFile(path, Buffer.from(result.data, 'base64'))
      console.log(path)
    }

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

    const greetings = [
      { days: 14, seen: SEASON_1_IDS, name: 'giteukhae-season2-capybara-greeting.png' },
      { days: 18, seen: [...SEASON_1_IDS, 'capybara'], name: 'giteukhae-season2-hedgehog-greeting.png' },
      { days: 23, seen: [...SEASON_1_IDS, 'capybara', 'hedgehog'], name: 'giteukhae-season2-owl-greeting.png' },
    ]

    for (const greeting of greetings) {
      await setStored('giteukhae.progress.v1', { creditedDates: creditedDates(greeting.days) })
      await setStored('giteukhae.seenAnimals.v1', greeting.seen)
      await evaluate('location.reload()')
      await pause(900)
      await evaluate("document.querySelector('.friend-invitation').click()")
      await pause(1_200)
      await capture(greeting.name)
      await captureGreetingFocus(greeting.name.replace('.png', '-focus.png'))
    }

    await setStored('giteukhae.progress.v1', { creditedDates: creditedDates(23) })
    await setStored('giteukhae.seenAnimals.v1', [...SEASON_1_IDS, ...SEASON_2_IDS])
    await evaluate('location.reload()')
    await pause(900)
    await evaluate("document.querySelector('#calendar-tab').click()")
    await pause(350)
    await evaluate("document.querySelectorAll('.family-photo-card')[1].scrollIntoView({ block: 'center' })")
    await pause(350)
    await capture('giteukhae-season2-calendar-card.png')
    await evaluate("document.querySelectorAll('.family-photo-card > button')[1].click()")
    await pause(350)
    await capture('giteukhae-season2-family-full.png')

    socket.close()
  } finally {
    vite.kill()
    chrome.kill()
    await new Promise((resolveExit) => setTimeout(resolveExit, 500))
    await rm(profile, { recursive: true, force: true })
  }
}

await main()
