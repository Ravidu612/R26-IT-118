import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateWorkerHealthFeatures } from '../src/services/iot/workerHealthFeatureCalculator.js'

test('calculates health statistics, drop counts, and regression slopes', () => {
  const readings = [
    { timeMs: 0, bpm: 60, spo2: 98 },
    { timeMs: 1000, bpm: 70, spo2: 97 },
    { timeMs: 2000, bpm: 80, spo2: 96 },
  ]
  assert.deepEqual(calculateWorkerHealthFeatures(readings), {
    avg_hr: 70,
    max_hr: 80,
    min_hr: 60,
    std_hr: 8.165,
    avg_spo2: 97,
    min_spo2: 96,
    max_spo2: 98,
    std_spo2: 0.8165,
    spo2_drop_count_95: 0,
    spo2_drop_count_92: 0,
    hr_slope: 10,
    spo2_slope: -1,
  })
})

test('returns zero slope when all readings share one timestamp', () => {
  const features = calculateWorkerHealthFeatures([{ timeMs: 100, bpm: 80, spo2: 98 }, { timeMs: 100, bpm: 90, spo2: 97 }])
  assert.equal(features.hr_slope, 0)
  assert.equal(features.spo2_slope, 0)
})
