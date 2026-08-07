import { Bug, ShieldCheck } from 'lucide-react'
import Badge from '../ui/Badge'
import ProbabilityTable from './ProbabilityTable'

function TeaDiseaseResult({ result }) {
  const confidence = Number(result.confidence || 0)
  const label = result.predicted_disease || 'Unknown'
  const healthy = label.toLowerCase().includes('healthy')
  const threshold = Number(result.confidence_threshold || 0.7)
  const thresholdPassed = result.threshold_passed ?? confidence > threshold
  const statusLabel = !thresholdPassed ? `Below ${(threshold * 100).toFixed(0)}% threshold` : healthy ? 'Healthy' : 'Review'

  return (
    <div className="space-y-4 text-sm text-slate-200">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-color)] bg-emerald-50/60 p-3">
        <div className="flex items-center gap-3"><span className="rounded-lg bg-white p-2 text-[var(--tea-green)]"><Bug className="h-5 w-5" /></span><div><p className="text-xs uppercase tracking-[0.12em] text-slate-400">Predicted class</p><p className="mt-1 text-base font-bold capitalize text-slate-900">{label.replaceAll('_', ' ')}</p></div></div>
        <Badge tone={healthy ? 'success' : 'warning'}>{statusLabel}</Badge>
      </div>
      <div className="rounded-xl border border-[var(--border-color)] bg-white/5 p-3"><div className="flex items-center justify-between"><span className="text-slate-400">Confidence</span><span className="font-bold text-[var(--tea-green)]">{(confidence * 100).toFixed(1)}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-100"><div className="h-full rounded-full bg-[var(--tea-green)]" style={{ width: `${confidence * 100}%` }} /></div></div>
      <div className="flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-emerald-800"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /><p>{result.recommendation}</p></div>
      {result.annotatedImageUrl ? <div className="space-y-2"><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Annotated model output</p><img src={result.annotatedImageUrl} alt="Annotated tea leaf disease detection" className="max-h-72 w-full rounded-lg border border-[var(--border-color)] object-contain" /></div> : null}
      <ProbabilityTable rows={result.probability_table || []} />
    </div>
  )
}

export default TeaDiseaseResult
