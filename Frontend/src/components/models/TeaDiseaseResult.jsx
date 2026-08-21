import { AlertCircle, Bug, CheckCircle2, Leaf, ShieldCheck, Wind } from 'lucide-react'
import Badge from '../ui/Badge'
import ProbabilityTable from './ProbabilityTable'
import { getTeaDiseaseKey, teaDiseaseDetails } from '../../constants/teaDiseases'

function TeaDiseaseResult({ result }) {
  const confidence = Number(result.confidence || 0)
  const label = result.predicted_disease || 'Unknown'
  const healthy = label.toLowerCase().includes('healthy')
  const threshold = Number(result.confidence_threshold || 0.7)
  const thresholdPassed = result.threshold_passed ?? confidence > threshold
  const statusLabel = !thresholdPassed ? `Below ${(threshold * 100).toFixed(0)}% threshold` : healthy ? 'Healthy' : 'Review'
  const disease = teaDiseaseDetails[getTeaDiseaseKey(label)]

  return (
    <div className="space-y-4 text-sm text-slate-200">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-color)] bg-emerald-50/60 p-3">
        <div className="flex items-center gap-3"><span className="rounded-lg bg-white p-2 text-[var(--tea-green)]"><Bug className="h-5 w-5" /></span><div><p className="text-xs uppercase tracking-[0.12em] text-slate-400">Predicted class</p><p className="mt-1 text-base font-bold capitalize text-slate-900">{label.replaceAll('_', ' ')}</p></div></div>
        <Badge tone={healthy ? 'success' : 'warning'}>{statusLabel}</Badge>
      </div>
      <div className="rounded-xl border border-[var(--border-color)] bg-white/5 p-3"><div className="flex items-center justify-between"><span className="text-slate-400">Confidence</span><span className="font-bold text-[var(--tea-green)]">{(confidence * 100).toFixed(1)}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-100"><div className="h-full rounded-full bg-[var(--tea-green)]" style={{ width: `${confidence * 100}%` }} /></div></div>
      <div className="flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-emerald-800"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /><p>{result.recommendation}</p></div>
      {thresholdPassed && !healthy && disease ? <DiseaseGuide disease={disease} /> : null}
      {result.annotatedImageUrl ? <div className="space-y-2"><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Annotated model output</p><img src={result.annotatedImageUrl} alt="Annotated tea leaf disease detection" className="max-h-72 w-full rounded-lg border border-[var(--border-color)] object-contain" /></div> : null}
      <ProbabilityTable rows={result.probability_table || []} />
    </div>
  )
}

function DiseaseGuide({ disease }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#d7e8db] bg-white text-[#203128] shadow-[0_10px_25px_rgba(33,61,45,.06)]">
      <div className="bg-gradient-to-r from-[#eaf7ee] via-white to-[#eaf9f7] p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#d6efdc] text-[#19764d]"><Leaf className="h-5 w-5" /></span>
            <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6f8878]">Automatic disease guide</p><h4 className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-[#173023]">{disease.label}</h4></div>
          </div>
          <Badge tone="warning">Review required</Badge>
        </div>
        <p className="mt-4 text-sm leading-6 text-[#5d7164]">The model detected this condition with the confidence shown above. Review the field guidance below before taking action.</p>
      </div>
      <div className="grid gap-3 p-4 md:grid-cols-2 md:p-5">
        {disease.type ? <GuideItem icon={Bug} label="Type" value={disease.type} /> : null}
        <GuideItem icon={Leaf} label="Cause" value={disease.cause} />
        <GuideItem icon={AlertCircle} label="Symptoms" value={disease.symptoms} />
        <GuideItem icon={Wind} label="Favorable conditions" value={disease.conditions} />
        <GuideItem icon={AlertCircle} label="Damage" value={disease.damage} />
        <GuideItem icon={CheckCircle2} label="Treatment / management" value={disease.management} />
      </div>
    </div>
  )
}

function GuideItem({ icon: Icon, label, value }) {
  return <div className="rounded-xl border border-[#e0ece3] bg-[#fbfefb] p-3.5"><div className="flex items-center gap-2 text-[#19764d]"><Icon className="h-4 w-4" /><p className="text-xs font-bold uppercase tracking-[0.12em]">{label}</p></div><p className="mt-2 text-sm leading-6 text-[#5d7164]">{value}</p></div>
}

export default TeaDiseaseResult
