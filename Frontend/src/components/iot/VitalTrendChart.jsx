const chartWidth = 280
const chartHeight = 62
const chartPadding = 5

const toValues = (data) => (Array.isArray(data) ? data : [])
  .map((point) => Number(point?.value))
  .filter((value) => Number.isFinite(value))

function getChartPoints(values) {
  if (values.length < 2) return { points: '', last: null }
  const minimum = Math.min(...values)
  const maximum = Math.max(...values)
  const range = maximum - minimum || 1
  const drawableWidth = chartWidth - chartPadding * 2
  const drawableHeight = chartHeight - chartPadding * 2
  const points = values.map((value, index) => {
    const x = chartPadding + (index / (values.length - 1)) * drawableWidth
    const y = chartHeight - chartPadding - ((value - minimum) / range) * drawableHeight
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const [lastX, lastY] = points.at(-1).split(',').map(Number)
  return { points: points.join(' '), last: { x: lastX, y: lastY } }
}

function VitalTrendChart({ label, value, unit, data, color = '#1f8a8f' }) {
  const values = toValues(data)
  const chart = getChartPoints(values)
  const displayValue = value === null || value === undefined ? '-' : `${value}${unit}`

  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-white/5 p-3">
      <div className="flex items-start justify-between gap-2">
        <div><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-xl font-bold tracking-[-0.03em] text-white">{displayValue}</p></div>
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-700">Live</span>
      </div>
      <div className="mt-3 h-[62px] overflow-hidden rounded-lg bg-slate-900/5">
        {chart.points ? (
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-full w-full" role="img" aria-label={`${label} trend chart`} preserveAspectRatio="none">
            <line x1="0" y1={chartHeight - 1} x2={chartWidth} y2={chartHeight - 1} stroke="currentColor" className="text-slate-200" strokeWidth="1" />
            <polyline points={chart.points} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {chart.last ? <circle cx={chart.last.x} cy={chart.last.y} r="4" fill="white" stroke={color} strokeWidth="2.5" /> : null}
          </svg>
        ) : <p className="flex h-full items-center justify-center text-[11px] text-slate-400">Waiting for trend data</p>}
      </div>
    </div>
  )
}

export default VitalTrendChart
