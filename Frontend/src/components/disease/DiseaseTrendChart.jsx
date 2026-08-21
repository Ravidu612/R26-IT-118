import { useMemo } from 'react'

function DiseaseTrendChart({ records }) {
  const points = useMemo(() => buildTrend(records), [records])
  const hasData = points.some((point) => point.value > 0)
  const coordinates = points.map((point, index) => `${index * 50 + 10},${92 - (point.value * 0.72)}`).join(' ')

  return (
    <div className="relative mt-4 h-[118px] pl-9">
      <div className="absolute inset-x-0 top-1 grid grid-rows-3 gap-7 text-[10px] text-[#8b9890]">
        <span>100%</span><span>50%</span><span>0%</span>
      </div>
      <div className="absolute inset-x-0 bottom-5 left-9 top-1 border-b border-[#dfe9e1] bg-[linear-gradient(to_bottom,transparent_0,transparent_32%,#e7eee9_33%,transparent_34%,transparent_65%,#e7eee9_66%,transparent_67%)]">
        {hasData ? <svg viewBox="0 0 320 100" preserveAspectRatio="none" className="h-full w-full overflow-visible"><polyline points={coordinates} fill="none" stroke="#16764d" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />{points.map((point, index) => <circle key={point.label} cx={index * 50 + 10} cy={92 - (point.value * 0.72)} r="3" fill="#16764d" stroke="white" strokeWidth="2" vectorEffect="non-scaling-stroke" />)}</svg> : <div className="grid h-full place-items-center text-xs text-[#94a198]">Run a detection to build the trend</div>}
      </div>
      <div className="absolute bottom-0 left-9 right-0 flex justify-between text-[10px] text-[#8b9890]">{points.map((point) => <span key={point.label}>{point.label}</span>)}</div>
    </div>
  )
}

function buildTrend(records) {
  const today = new Date()
  const recentStart = new Date(today)
  recentStart.setHours(0, 0, 0, 0)
  recentStart.setDate(today.getDate() - 6)
  const savedDays = groupRecordsByDay(records)
  if (!savedDays.length) return buildRecentDays([], today)
  const recentDays = savedDays.filter((day) => day.date >= recentStart && day.date <= today)
  if (recentDays.length) return buildRecentDays(recentDays, today)
  return savedDays.slice(-7).map((day) => ({ label: formatLabel(day.date), value: averageConfidence(day.records) }))
}

function buildRecentDays(savedDays, today) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setHours(0, 0, 0, 0)
    date.setDate(today.getDate() - (6 - index))
    const day = savedDays.find((item) => sameDay(item.date, date))
    return { label: formatLabel(date), value: day ? averageConfidence(day.records) : 0 }
  })
}

function groupRecordsByDay(records) {
  const groups = new Map()
  records.forEach((record) => {
    const date = new Date(record.createdAt)
    if (Number.isNaN(date.getTime())) return
    date.setHours(0, 0, 0, 0)
    const key = localDateKey(date)
    const group = groups.get(key) || { date, records: [] }
    group.records.push(record)
    groups.set(key, group)
  })
  return Array.from(groups.values()).sort((left, right) => left.date - right.date)
}

function averageConfidence(records) {
  const average = records.reduce((sum, record) => sum + Number(record.result?.confidence || 0), 0) / records.length
  return Math.round(average * 100)
}

function localDateKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function sameDay(left, right) {
  return localDateKey(left) === localDateKey(right)
}

function formatLabel(date) {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default DiseaseTrendChart
