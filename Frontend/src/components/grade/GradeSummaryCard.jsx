import { Award, BarChart3, CircleCheck, Layers3 } from 'lucide-react'

function GradeSummaryCard({ records }) {
  const average = records.length ? records.reduce((sum, record) => sum + toPercent(record.result?.confidence), 0) / records.length : 0
  const topGrade = getTopGrade(records)
  const highConfidence = records.filter((record) => toPercent(record.result?.confidence) >= 80).length
  const items = [
    { icon: Layers3, label: 'Samples classified', value: records.length.toLocaleString() },
    { icon: Award, label: 'Most common grade', value: topGrade },
    { icon: CircleCheck, label: 'High-confidence results', value: highConfidence.toLocaleString() },
    { icon: BarChart3, label: 'AI confidence average', value: `${average.toFixed(1)}%` },
  ]

  return <section className="dashboard-card rounded-[12px] border border-[#e1e9e3] bg-white p-4 shadow-[0_4px_15px_rgba(33,61,45,.045)]"><h2 className="text-[15px] font-extrabold text-[#17231c]">Classification Summary</h2><div className="mt-4 grid gap-3">{items.map(({ icon: Icon, label, value }) => <div key={label} className="flex items-center gap-3"><Icon className="h-4 w-4 shrink-0 text-[#16764d]" strokeWidth={1.8} /><span className="min-w-0 flex-1 text-[12px] text-[#53665a]">{label}</span><span className="max-w-[130px] truncate text-right text-[12px] font-bold capitalize text-[#26372c]">{value.replaceAll('_', ' ')}</span></div>)}</div></section>
}

function getTopGrade(records) {
  const counts = records.reduce((result, record) => {
    const grade = record.result?.predicted_grade
    if (grade) result[grade] = (result[grade] || 0) + 1
    return result
  }, {})
  return Object.entries(counts).sort((left, right) => right[1] - left[1])[0]?.[0] || '—'
}

function toPercent(value) {
  const confidence = Number(value) || 0
  return confidence <= 1 ? confidence * 100 : confidence
}

export default GradeSummaryCard
