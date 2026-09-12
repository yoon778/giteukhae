import {spawn} from 'node:child_process'
import {mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join, resolve} from 'node:path'

const root = resolve(import.meta.dirname, '..')
const appUrl = 'http://127.0.0.1:4173/'
const debugPort = 9444
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const outputDir = join(process.env.USERPROFILE, 'Pictures', 'Screenshots')

const waitFor = async (url, attempts = 100) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) return response
    } catch {
      // 시작 대기
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 100))
  }
  throw new Error(`${url} 연결 시간 초과`)
}

const envelope = (value) => JSON.stringify({
  __giteukhaeStorage: 1,
  updatedAt: Date.now(),
  value: JSON.stringify(value),
})

const main = async () => {
  await mkdir(outputDir, {recursive: true})
  const profile = await mkdtemp(join(tmpdir(), 'giteukhae-thread-'))
  const image = await readFile(join(root, 'promo-video', 'public', 'ai-drawing.webp'))
  const drawingDataUrl = `data:image/webp;base64,${image.toString('base64')}`
  const vite = spawn(process.execPath, [
    join(root, 'node_modules', 'vite', 'bin', 'vite.js'),
    'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort',
  ], {cwd: root, stdio: 'ignore', windowsHide: true})
  const chrome = spawn(chromePath, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profile}`,
    '--window-size=540,960', 'about:blank',
  ], {stdio: 'ignore', windowsHide: true})

  try {
    await Promise.all([waitFor(appUrl), waitFor(`http://127.0.0.1:${debugPort}/json/version`)])
    const target = await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent(appUrl)}`, {method: 'PUT'})
      .then((response) => response.json())
    const socket = new WebSocket(target.webSocketDebuggerUrl)
    await new Promise((resolveOpen, rejectOpen) => {
      socket.addEventListener('open', resolveOpen, {once: true})
      socket.addEventListener('error', rejectOpen, {once: true})
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
      pending.set(id, {resolve: resolveCommand, reject: rejectCommand})
      socket.send(JSON.stringify({id, method, params}))
    })
    const evaluate = (expression) => command('Runtime.evaluate', {expression, awaitPromise: true, returnByValue: true})
    const pause = (milliseconds) => new Promise((resolvePause) => setTimeout(resolvePause, milliseconds))
    const setStored = (key, value) => evaluate(`localStorage.setItem(${JSON.stringify(key)}, ${JSON.stringify(envelope(value))})`)
    const capture = async (name) => {
      const result = await command('Page.captureScreenshot', {format: 'png', fromSurface: true, captureBeyondViewport: false})
      const path = join(outputDir, name)
      await writeFile(path, Buffer.from(result.data, 'base64'))
      return path
    }

    await command('Page.enable')
    await command('Runtime.enable')
    await command('Emulation.setDeviceMetricsOverride', {
      width: 540, height: 960, deviceScaleFactor: 2, mobile: true,
      screenWidth: 540, screenHeight: 960,
    })
    await command('Page.navigate', {url: appUrl})
    await pause(600)

    const today = new Date().toLocaleDateString('en-CA', {timeZone: 'Asia/Seoul'})
    const entry = {
      date: today,
      text: '친구와 공원에서 신나게 뛰어놀았다',
      praise: '어이구, 친구와 신나게 뛰어놀았구나! 함께 웃은 오늘이 오래 기억에 남겠어',
      animalId: 'rabbit',
      responseKind: 'praise',
      drawingDataUrl,
    }
    await setStored('giteukhae.entries.v1', {[today]: entry})
    await setStored('giteukhae.progress.v1', {creditedDates: [today]})
    await setStored('giteukhae.seenAnimals.v1', ['rabbit'])
    await evaluate("sessionStorage.removeItem('giteukhae.devDayOffset'); location.reload()")
    await pause(1200)

    await evaluate("document.querySelector('.journal-card').scrollIntoView({block:'start'})")
    await pause(250)
    const full = await capture('giteukhae-ai-drawing-stamp-on-text-full.png')

    await command('Emulation.setDeviceMetricsOverride', {
      width: 540, height: 675, deviceScaleFactor: 2, mobile: true,
      screenWidth: 540, screenHeight: 675,
    })
    await evaluate("window.scrollTo(0, document.querySelector('.diary-drawing').getBoundingClientRect().top + window.scrollY - 18)")
    await pause(250)
    const focus = await capture('giteukhae-ai-drawing-stamp-on-text-focus.png')

    socket.close()
    console.log(full)
    console.log(focus)
  } finally {
    vite.kill()
    chrome.kill()
    await new Promise((resolveExit) => setTimeout(resolveExit, 400))
    await rm(profile, {recursive: true, force: true, maxRetries: 5, retryDelay: 200})
  }
}

await main()
