import { Award, CheckCircle2, Layers3 } from 'lucide-react'
import EmptyState from '../ui/EmptyState'

function GradeResultPanel({ result, isLoading }) {
  const grade = result?.predicted_grade || '-'
  const confidence = toPercent(result?.confidence)

  return (
    <section className="dashboard-card rounded-[12px] border border-[#e1e9e3] bg-white p-4 shadow-[0_4px_15px_rgba(33,61,45,.045)]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#dff3e6] text-[#087d47]"><Award className="h-4 w-4" /></span><h2 className="text-[15px] font-extrabold text-[#17231c]">Classification Result</h2></div>
        {result ? <span className="rounded-full bg-[#edf8f0] px-2.5 py-1 text-[10px] font-bold text-[#16804e]">✓ Completed</span> : null}
      </div>
      {isLoading ? <div className="grid min-h-[210px] place-items-center text-sm text-[#718077]">Analyzing tea grade...</div> : null}
      {!isLoading && !result ? <EmptyState icon={Layers3} title="No grade result yet" description="Upload a tea sample and run classification to view the result." /> : null}
      {result ? <div className="mt-4 space-y-4">
        <div className="rounded-xl border border-[#dcece0] bg-[#f5fbf6] p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#718077]">Predicted tea grade</p>
          <div className="mt-2 flex items-end justify-between gap-3"><p className="text-5xl font-extrabold tracking-[-0.06em] text-[#087d47]">{grade.replaceAll('_', ' ')}</p><Award className="mb-1 h-7 w-7 text-[#92b9a0]" /></div>
        </div>
        <div><div className="flex items-center justify-between text-[11px] font-bold text-[#53665a]"><span>Model confidence</span><span className="text-[#087d47]">{confidence.toFixed(1)}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e5eee7]"><div className="h-full rounded-full bg-[#087d47] transition-all" style={{ width: `${confidence}%` }} /></div></div>
        <div className="grid grid-cols-2 gap-2"><Metric label="Output status" value={result.statusMessage || 'Completed'} /><Metric label="Decision mode" value="Confidence based" /></div>
        <div className="flex gap-2 rounded-lg border border-[#dfece2] bg-[#f5faf6] p-3 text-[11px] leading-5 text-[#28754a]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /><span>Grade identified. Review the quality recommendation before routing this batch.</span></div>
      </div> : null}
    </section>
  )
}

function Metric({ label, value }) {
  return <div className="rounded-lg border border-[#e3ece5] bg-[#fbfefb] p-3"><p className="text-[10px] uppercase tracking-wide text-[#8a968d]">{label}</p><p className="mt-1 truncate text-[12px] font-bold text-[#33483a]">{value}</p></div>
}

function toPercent(value) {
  const confidence = Number(value) || 0
  return Math.max(0, Math.min(100, confidence <= 1 ? confidence * 100 : confidence))
}

export default GradeResultPanel
