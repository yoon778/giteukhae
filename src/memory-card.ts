import { File as TossFile } from '@apps-in-toss/web-framework'
import { getAnimal } from './animals.ts'
import type { JournalEntry } from './praise.ts'

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath()
  context.moveTo(x + radius, y)
  context.arcTo(x + width, y, x + width, y + height, radius)
  context.arcTo(x + width, y + height, x, y + height, radius)
  context.arcTo(x, y + height, x, y, radius)
  context.arcTo(x, y, x + width, y, radius)
  context.closePath()
}

function createLines(context: CanvasRenderingContext2D, text: string, maxWidth: number, maximum = 2) {
  const lines: string[] = []
  let current = ''
  for (const character of [...text.replace(/\s+/g, ' ').trim()]) {
    const next = current + character
    if (context.measureText(next).width <= maxWidth || !current) {
      current = next
      continue
    }
    lines.push(current)
    current = character
    if (lines.length === maximum) break
  }
  if (lines.length < maximum && current) lines.push(current)
  const consumed = lines.join('').replace(/…$/, '')
  if (consumed.length < text.replace(/\s+/g, ' ').trim().length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].slice(0, -1)}…`
  }
  return lines
}

function drawLines(context: CanvasRenderingContext2D, lines: string[], x: number, y: number, lineHeight: number) {
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight))
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = src
  })
}

export async function saveMonthlyMemoryCard(entries: JournalEntry[], month: Date) {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1350
  const context = canvas.getContext('2d')
  if (!context) throw new Error('canvas_unavailable')

  context.fillStyle = '#fff8ec'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#c44948'
  context.font = '900 34px sans-serif'
  context.fillText('기특해 · 한 줄 칭찬 일기', 76, 90)
  context.fillStyle = '#2f2926'
  context.font = '900 60px sans-serif'
  context.fillText(`${month.getFullYear()}년 ${month.getMonth() + 1}월의`, 76, 175)
  context.fillText('기특한 순간', 76, 246)

  for (const [index, entry] of entries.slice(0, 3).entries()) {
    const top = 310 + index * 300
    context.fillStyle = '#ffffff'
    roundedRect(context, 62, top, 956, 250, 34)
    context.fill()
    context.strokeStyle = '#3a322e'
    context.lineWidth = 3
    context.stroke()

    context.fillStyle = '#a04439'
    context.font = '900 27px sans-serif'
    context.fillText(`${Number(entry.date.slice(-2))}일의 기록`, 105, top + 56)
    context.fillStyle = '#302a27'
    context.font = '800 38px sans-serif'
    drawLines(context, createLines(context, entry.text, 650, 2), 105, top + 112, 48)
    context.fillStyle = '#6f635d'
    context.font = '700 25px sans-serif'
    drawLines(context, createLines(context, entry.praise, 650, 2), 105, top + 201, 34)

    if (entry.animalId) {
      const image = await loadImage(getAnimal(entry.animalId).assets.character)
      if (image) context.drawImage(image, 800, top + 37, 170, 170)
    }
  }

  context.fillStyle = '#8b7f78'
  context.font = '700 27px sans-serif'
  context.textAlign = 'center'
  context.fillText('작은 일도 알아봐 주면, 제법 대단해져요', 540, 1270)

  const dataUrl = canvas.toDataURL('image/png')
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  const fileName = `giteukhae-${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}.png`
  try {
    if (TossFile.saveBase64.isSupported()) {
      await TossFile.saveBase64({ data: base64, fileName, mimeType: 'image/png' })
      return
    }
  } catch {
    // 샌드박스나 브라우저 미리보기에서는 일반 다운로드로 대체한다.
  }

  const link = document.createElement('a')
  link.href = dataUrl
  link.download = fileName
  link.click()
}
