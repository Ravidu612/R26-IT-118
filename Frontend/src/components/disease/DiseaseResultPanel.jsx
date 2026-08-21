import { ExternalLink, Leaf, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { getTeaDiseaseKey, teaDiseaseDetails } from '../../constants/teaDiseases'
import FieldGuideModal from './FieldGuideModal'

function DiseaseResultPanel({ result }) {
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const label = result?.predicted_disease || 'No analysis yet'
  const confidence = Number(result?.confidence || 0)
  const healthy = label.toLowerCase().includes('healthy') || result?.detected === false
  const severity = result?.severity_level || (healthy ? 'None' : confidence >= 0.9 ? 'High' : confidence >= 0.8 ? 'Moderate' : 'Low')
  const status = result ? (healthy ? 'Reviewed' : 'Review required') : 'Waiting for image'
  const disease = teaDiseaseDetails[getTeaDiseaseKey(label)]

  return <><section className="dashboard-card rounded-[12px] border border-[#e1e9e3] bg-white p-4 shadow-[0_4px_15px_rgba(33,61,45,.045)]"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#dff3e6] text-[#087d47]"><ShieldAlert className="h-4 w-4" /></span><h2 className="text-[15px] font-extrabold text-[#17231c]">Disease Detection Result</h2></div><span className={`rounded-full px-3 py-1 text-[10px] font-bold ${result ? 'bg-[#edf8f0] text-[#16764d]' : 'bg-[#f4f7f4] text-[#8a968d]'}`}>{result ? '✓ Completed' : 'Not started'}</span></div><p className="mt-4 text-[11px] font-semibold text-[#718077]">Predicted Class</p><div className="mt-1 flex items-center gap-3 rounded-[10px] border border-[#d9ebdd] bg-[#f3faf4] px-3 py-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#dff3e6] text-[#16764d]"><Leaf className="h-4 w-4" /></span><span className="min-w-0 flex-1 truncate text-[16px] font-extrabold capitalize text-[#16764d]">{label.replaceAll('_', ' ')}</span><span className={`rounded-full border px-3 py-1 text-[10px] font-bold ${healthy ? 'border-[#bfe2c9] text-[#16764d]' : 'border-[#f0b278] text-[#e77717]'}`}>{healthy ? 'Healthy' : 'Review'}</span></div><div className="mt-3 grid grid-cols-3 gap-2"><Metric label="Confidence Score" value={`${(confidence * 100).toFixed(1)}%`} bar={confidence} /><Metric label="Severity Level" value={severity} dot={!healthy} /><Metric label="Review Status" value={status} accent={!healthy} /></div><div className="mt-3 flex gap-2 rounded-[10px] border border-[#dfece2] bg-[#f5faf6] p-3 text-[11px] leading-4 text-[#28754a]"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" /><span>{result?.recommendation || 'Upload a tea leaf image to receive disease signs and field guidance.'}</span></div><div className="mt-3 border-t border-[#edf1ed] pt-3"><p className="text-[11px] font-bold text-[#26372c]">AI Recommendation</p><p className="mt-1 text-[11px] leading-4 text-[#718077]">{result ? 'The model detected this condition with the confidence shown above. Please follow the field guidance before taking action.' : 'Your result and recommendation will be stored in prediction history after analysis.'}</p><button type="button" onClick={() => setIsGuideOpen(true)} disabled={!disease} className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[#d8e8dc] bg-white px-3 py-1.5 text-[11px] font-bold text-[#16764d] hover:bg-[#f2faf4] disabled:cursor-not-allowed disabled:opacity-45">View Field Guide <ExternalLink className="h-3.5 w-3.5" /></button></div></section>{isGuideOpen && disease ? <FieldGuideModal disease={disease} onClose={() => setIsGuideOpen(false)} /> : null}</>
}

function Metric({ label, value, bar, dot, accent }) {
  return <div className="min-h-[68px] rounded-[9px] border border-[#e3ebe5] bg-white p-2.5"><p className="text-[10px] text-[#718077]">{label}</p><p className={`mt-1 text-[13px] font-extrabold ${accent ? 'text-[#e77717]' : 'text-[#26372c]'}`}>{dot ? <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#f08322]" /> : null}{value}</p>{bar !== undefined ? <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#e4ece6]"><div className="h-full rounded-full bg-[#16764d]" style={{ width: `${bar * 100}%` }} /></div> : null}</div>
}

export default DiseaseResultPanel
