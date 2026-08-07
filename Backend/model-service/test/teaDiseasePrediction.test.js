import assert from 'node:assert/strict'
import test from 'node:test'
import { parseTeaDiseaseResult } from '../src/services/teaDiseasePredictionService.js'

test('parses the Hugging Face tea disease response contract', () => {
  const result = parseTeaDiseaseResult([
    { url: 'https://example.com/annotated.webp' },
    'Red Leaf Spot',
    '90.33%',
    { confidences: [{ label: 'Red Leaf Spot', confidence: 0.9033377 }] },
  ], { fileName: 'leaf.jpg', mimeType: 'image/jpeg' })

  assert.equal(result.detected, true)
  assert.equal(result.predicted_disease, 'Red Leaf Spot')
  assert.equal(result.confidence, 0.9033)
  assert.equal(result.annotatedImageUrl, 'https://example.com/annotated.webp')
  assert.deepEqual(result.probability_table, [{ label: 'Red Leaf Spot', probability: 0.9033 }])
})

test('marks a healthy prediction as safe for the UI recommendation', () => {
  const result = parseTeaDiseaseResult([null, 'Healthy', '0.81', { confidences: [] }], {})

  assert.equal(result.detected, false)
  assert.equal(result.confidence, 0.81)
  assert.equal(result.threshold_passed, true)
  assert.match(result.recommendation, /healthy/i)
})

test('hides disease predictions at or below the 70 percent threshold', () => {
  const result = parseTeaDiseaseResult([
    { url: 'https://example.com/low-confidence.webp' },
    'Red Leaf Spot',
    '70.00%',
    { confidences: [{ label: 'Red Leaf Spot', confidence: 0.7 }] },
  ], {})

  assert.equal(result.detected, false)
  assert.equal(result.threshold_passed, false)
  assert.equal(result.predicted_disease, 'No confident disease detected')
  assert.equal(result.annotatedImageUrl, null)
  assert.deepEqual(result.probability_table, [])
})

test('returns null for an empty model response', () => {
  assert.equal(parseTeaDiseaseResult([], {}), null)
})
