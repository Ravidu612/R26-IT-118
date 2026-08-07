const finite = (value) => Number.isFinite(Number(value))
const numberText = (value) => {
  const number = Number(value)
  return Number.isInteger(number) ? String(number) : number.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')
}
const byTime = (left, right) => left.timeMs - right.timeMs

const valueText = (value) => Array.isArray(value) ? value.map(numberText).join(',') : numberText(value)
const makeSignalCsv = (sampleRate, values, columnCount = 1) => {
  const header = (value) => columnCount === 1 ? String(value) : Array(columnCount).fill(value).join(',')
  return [header(0), header(sampleRate), ...values.map(valueText)].join('\n') + '\n'
}

const getCommonStartTime = (groups) => Math.max(...groups.filter((group) => group.length).map((group) => group[0].timeMs))
const after = (samples, startTime) => samples.filter((sample) => sample.timeMs >= startTime)

const toRelativeIbiRows = (readings, startTime) => readings
  .filter((reading) => finite(reading.ibiMs) && Number(reading.ibiMs) > 0)
  .map((reading) => [((reading.timeMs - startTime) / 1000).toFixed(6), Number(reading.ibiMs) / 1000])

export const buildWearableSignalFiles = ({ readings = [], signals = {} }) => {
  const sortedReadings = readings.filter((reading) => finite(reading.bpm) && finite(reading.timeMs)).sort(byTime)
  const ppg = (signals.ppg || []).filter((sample) => finite(sample.ir) && finite(sample.timeMs)).sort(byTime)
  const motion = (signals.motion || []).filter((sample) => [sample.xMg, sample.yMg, sample.zMg].every(finite) && finite(sample.timeMs)).sort(byTime)
  if (sortedReadings.length < 2 || ppg.length < 2 || motion.length < 2) {
    throw new Error('The new HF model requires HR, PPG, and motion samples from the IoT window.')
  }

  const startTime = getCommonStartTime([sortedReadings, ppg, motion])
  const hr = after(sortedReadings, startTime).map((reading) => reading.bpm)
  const bvp = after(ppg, startTime).map((sample) => sample.ir)
  const acc = after(motion, startTime).map((sample) => [sample.xMg / 1000, sample.yMg / 1000, sample.zMg / 1000])
  if (hr.length < 2 || bvp.length < 2 || acc.length < 2) throw new Error('The IoT window does not contain enough aligned signal samples.')

  const files = [
    { name: 'HR.csv', mimeType: 'text/csv', content: makeSignalCsv(5, hr) },
    { name: 'BVP.csv', mimeType: 'text/csv', content: makeSignalCsv(25, bvp) },
    { name: 'ACC.csv', mimeType: 'text/csv', content: makeSignalCsv(25, acc, 3) },
  ]
  const ibiRows = toRelativeIbiRows(after(sortedReadings, startTime), startTime)
  if (ibiRows.length) files.push({ name: 'IBI.csv', mimeType: 'text/csv', content: ['0,0', ...ibiRows.map((row) => row.join(','))].join('\n') + '\n' })
  return files
}
