import assert from 'node:assert/strict'
import test from 'node:test'
import { parseWorkerHealthRemoteResult } from '../src/services/parsers/workerHealthParser.js'

test('parses the new HF activity/stress output contract', () => {
  const result = parseWorkerHealthRemoteResult([
    'STRESS',
    '87.5%',
    { headers: ['State', 'Probability (%)'], data: [['STRESS', 87.5], ['AEROBIC', 12.5]] },
    { headers: ['Predicted State'], data: [['STRESS']] },
    'Predictions generated for 1 window.',
  ])
  assert.equal(result.predicted_state, 'stress')
  assert.equal(result.model_type, 'activity_stress_session')
  assert.equal(result.risk_level, 'High')
  assert.deepEqual(result.probability_table[0], { label: 'STRESS', probability: 0.875 })
})
