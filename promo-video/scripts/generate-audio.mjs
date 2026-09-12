import {mkdirSync, writeFileSync} from 'node:fs'
import {dirname, resolve} from 'node:path'

const sampleRate = 44_100
const duration = 17
const samples = new Float64Array(sampleRate * duration)
let seed = 73_421

const random = () => {
  seed = (seed * 16_807) % 2_147_483_647
  return seed / 2_147_483_647
}

const midi = (note) => 440 * 2 ** ((note - 69) / 12)
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const addTone = (start, length, frequency, gain, wave = 'sine') => {
  const from = Math.floor(start * sampleRate)
  const count = Math.floor(length * sampleRate)
  for (let i = 0; i < count && from + i < samples.length; i += 1) {
    const t = i / sampleRate
    const attack = clamp(t / 0.012, 0, 1)
    const release = clamp((length - t) / Math.min(0.16, length * 0.55), 0, 1)
    const envelope = attack * release * Math.exp(-t * 2.2)
    const phase = 2 * Math.PI * frequency * t
    const value = wave === 'triangle'
      ? (2 / Math.PI) * Math.asin(Math.sin(phase))
      : Math.sin(phase)
    samples[from + i] += value * gain * envelope
  }
}

const addSweep = (start, length, fromFrequency, toFrequency, gain) => {
  const from = Math.floor(start * sampleRate)
  const count = Math.floor(length * sampleRate)
  let phase = 0
  for (let i = 0; i < count && from + i < samples.length; i += 1) {
    const progress = i / count
    const frequency = fromFrequency + (toFrequency - fromFrequency) * progress
    phase += 2 * Math.PI * frequency / sampleRate
    const envelope = Math.sin(Math.PI * progress) ** 1.4
    samples[from + i] += Math.sin(phase) * gain * envelope
  }
}

const addNoise = (start, length, gain, decay = 2) => {
  const from = Math.floor(start * sampleRate)
  const count = Math.floor(length * sampleRate)
  let smoothed = 0
  for (let i = 0; i < count && from + i < samples.length; i += 1) {
    const progress = i / count
    smoothed = smoothed * 0.72 + (random() * 2 - 1) * 0.28
    const envelope = Math.sin(Math.PI * progress) * (1 - progress) ** decay
    samples[from + i] += smoothed * gain * envelope
  }
}

// Original music-box loop: four simple chords, intentionally kept under the UI sounds
const beat = 60 / 108
const chords = [
  [60, 64, 67, 72],
  [57, 60, 64, 69],
  [53, 57, 60, 65],
  [55, 59, 62, 67],
]

for (let step = 0; step < Math.ceil(duration / (beat / 2)); step += 1) {
  const time = step * beat / 2
  const chord = chords[Math.floor(step / 8) % chords.length]
  const note = chord[step % 4]
  addTone(time, 0.24, midi(note + 12), 0.105, 'triangle')
  if (step % 2 === 0) addTone(time, 0.42, midi(chord[0] - 12), 0.045, 'sine')
}

// Scene and interaction effects
addSweep(0.12, 0.22, 270, 520, 0.22)
for (const cut of [2.0, 5.45, 8.45, 11.63, 14.3]) addNoise(cut, 0.34, 0.18, 1.2)
for (let time = 3.25; time < 4.95; time += 0.17) {
  addNoise(time, 0.035, 0.12, 3)
  addTone(time, 0.04, 760 + (Math.floor(time * 10) % 3) * 80, 0.055)
}
addTone(5.84, 0.19, 105, 0.38, 'sine')
addNoise(5.84, 0.15, 0.35, 3)
addSweep(5.92, 0.22, 310, 620, 0.16)
for (const [offset, note] of [[0, 72], [0.13, 76], [0.26, 79], [0.42, 84]]) {
  addTone(8.72 + offset, 0.55, midi(note), 0.20, 'triangle')
}
for (let time = 9.4; time < 10.6; time += 0.22) addNoise(time, 0.13, 0.07, 1)
for (const [offset, note] of [[0, 67], [0.11, 72], [0.22, 76], [0.36, 79]]) {
  addTone(14.55 + offset, 0.7, midi(note), 0.22, 'triangle')
}

let peak = 0
for (let i = 0; i < samples.length; i += 1) {
  const time = i / sampleRate
  const fadeIn = clamp(time / 0.12, 0, 1)
  const fadeOut = clamp((duration - time) / 0.7, 0, 1)
  samples[i] *= fadeIn * fadeOut
  peak = Math.max(peak, Math.abs(samples[i]))
}
const scale = peak > 0 ? 0.86 / peak : 1

const dataBytes = samples.length * 2
const wav = Buffer.alloc(44 + dataBytes)
wav.write('RIFF', 0)
wav.writeUInt32LE(36 + dataBytes, 4)
wav.write('WAVE', 8)
wav.write('fmt ', 12)
wav.writeUInt32LE(16, 16)
wav.writeUInt16LE(1, 20)
wav.writeUInt16LE(1, 22)
wav.writeUInt32LE(sampleRate, 24)
wav.writeUInt32LE(sampleRate * 2, 28)
wav.writeUInt16LE(2, 32)
wav.writeUInt16LE(16, 34)
wav.write('data', 36)
wav.writeUInt32LE(dataBytes, 40)

for (let i = 0; i < samples.length; i += 1) {
  wav.writeInt16LE(Math.round(clamp(samples[i] * scale, -1, 1) * 32_767), 44 + i * 2)
}

const output = resolve('public', 'soundtrack.wav')
mkdirSync(dirname(output), {recursive: true})
writeFileSync(output, wav)
console.log(output)
