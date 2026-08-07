import assert from 'node:assert/strict'
import test from 'node:test'
import { buildWearableSignalFiles } from '../src/services/iot/wearableSignalFiles.js'

test('builds HF-compatible HR, BVP, ACC, and optional IBI files', () => {
  const readings = Array.from({ length: 31 }, (_, index) => ({ timeMs: index * 1000, bpm: 80 + index % 3, ibiMs: 750 }))
  const ppg = Array.from({ length: 751 }, (_, index) => ({ timeMs: index * 40, ir: 1000 + index, red: 900 + index }))
  const motion = Array.from({ length: 751 }, (_, index) => ({ timeMs: index * 40, xMg: 0, yMg: 0, zMg: 1000 }))
  const files = buildWearableSignalFiles({ readings, signals: { ppg, motion } })
  assert.deepEqual(files.map((file) => file.name), ['HR.csv', 'BVP.csv', 'ACC.csv', 'IBI.csv'])
  assert.match(files[0].content, /^0\n5\n80\n81/)
  assert.match(files[2].content, /^0,0,0\n25,25,25\n0,0,1/)
  assert.match(files[3].content, /^0,0\n0\.000000,0\.75/)
})
