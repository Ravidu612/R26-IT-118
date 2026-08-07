const roundFeature = (value) => Number(value.toFixed(4))

const mean = (values) => values.reduce((total, value) => total + value, 0) / values.length

const populationStd = (values) => {
  const average = mean(values)
  return Math.sqrt(values.reduce((total, value) => total + (value - average) ** 2, 0) / values.length)
}

const regressionSlope = (readings, key) => {
  const start = readings[0].timeMs
  const xValues = readings.map((reading) => (reading.timeMs - start) / 1000)
  const yValues = readings.map((reading) => reading[key])
  const xMean = mean(xValues)
  const yMean = mean(yValues)
  const denominator = xValues.reduce((total, value) => total + (value - xMean) ** 2, 0)
  if (denominator === 0) return 0
  const numerator = xValues.reduce((total, value, index) => total + (value - xMean) * (yValues[index] - yMean), 0)
  return numerator / denominator
}

export const calculateWorkerHealthFeatures = (inputReadings) => {
  const readings = [...inputReadings].sort((left, right) => left.timeMs - right.timeMs)
  if (readings.length === 0) throw new Error('At least one valid reading is required')
  const heartRates = readings.map((reading) => reading.bpm)
  const oxygenLevels = readings.map((reading) => reading.spo2)

  return {
    avg_hr: roundFeature(mean(heartRates)),
    max_hr: Math.max(...heartRates),
    min_hr: Math.min(...heartRates),
    std_hr: roundFeature(populationStd(heartRates)),
    avg_spo2: roundFeature(mean(oxygenLevels)),
    min_spo2: Math.min(...oxygenLevels),
    max_spo2: Math.max(...oxygenLevels),
    std_spo2: roundFeature(populationStd(oxygenLevels)),
    spo2_drop_count_95: oxygenLevels.filter((value) => value < 95).length,
    spo2_drop_count_92: oxygenLevels.filter((value) => value < 92).length,
    hr_slope: roundFeature(regressionSlope(readings, 'bpm')),
    spo2_slope: roundFeature(regressionSlope(readings, 'spo2')),
  }
}
