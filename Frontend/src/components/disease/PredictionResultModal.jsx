import { Award, CheckCircle2, FileImage, Leaf, ShieldAlert, X } from 'lucide-react'
import { getStoredImageUrl } from '../../utils/storedImage'

function PredictionResultModal({ record, onClose }) {
  if (!record) return null
  const result = record.result || {}
  const isLeaf = record.moduleType === 'tea_leaf_detection'
  const isGrade = record.moduleType === 'tea_grade_classification'
  const confidence = Number(result.confidence || 0)
  const label = isGrade ? result.predicted_grade || 'Unknown grade' : isLeaf ? result.detectedClass || (result.detected ? 'Tea leaf detected' : 'Not a tea leaf') : result.predicted_disease || 'Unknown disease'
  const severity = result.severity_level || (result.detected ? confidence >= 0.9 ? 'High' : confidence >= 0.8 ? 'Moderate' : 'Low' : 'Low')
  const Icon = isGrade ? Award : Leaf
  const statusLabel = isGrade ? result.statusMessage || 'Completed' : isLeaf ? result.detected ? 'Tea leaf detected' : 'Not a tea leaf' : result.review_status || (result.detected ? 'Review required' : 'Reviewed')
  const modelLabel = isGrade ? 'Tea grade classifier' : isLeaf ? 'Tea leaf detector' : 'Disease detector'
  const secondaryLabel = isGrade ? confidence >= 0.8 ? 'High confidence' : 'Needs review' : severity

  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#082d20]/55 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#d7e8db] bg-white shadow-[0_24px_70px_rgba(10,53,34,.25)]" role="dialog" aria-modal="true" aria-labelledby="prediction-result-title"><header className="flex items-start justify-between gap-4 border-b border-[#e5eee7] bg-[#f3faf4] p-5"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#d6efdc] text-[#19764d]"><Icon className="h-5 w-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6f8878]">Saved checking result</p><h2 id="prediction-result-title" className="mt-1 text-xl font-extrabold capitalize text-[#173023]">{label.replaceAll('_', ' ')}</h2></div></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-[#718077] hover:bg-white hover:text-[#173023]" aria-label="Close result details"><X className="h-5 w-5" /></button></header><div className="grid gap-4 p-5 md:grid-cols-[170px_1fr]"><img src={getStoredImageUrl(record)} alt="Saved checking sample" className="h-40 w-full rounded-xl border border-[#e0ece3] object-cover" /><div className="grid grid-cols-2 gap-2"><Detail label="Date & Time" value={new Date(record.createdAt).toLocaleString()} /><Detail label="Confidence" value={`${(confidence * 100).toFixed(1)}%`} /><Detail label={isGrade ? 'Classification Status' : isLeaf ? 'Detection Status' : 'Review Status'} value={statusLabel} /><Detail label={isGrade ? 'Quality band' : 'Severity'} value={secondaryLabel} /><Detail label="File" value={record.imageMeta?.fileName || 'Uploaded image'} /><Detail label="Model" value={modelLabel} /></div></div><div className="space-y-3 px-5 pb-5"><div className="flex gap-2 rounded-xl border border-[#dfece2] bg-[#f5faf6] p-3 text-sm leading-6 text-[#28754a]"><ShieldAlert className="mt-1 h-4 w-4 shrink-0" /><span>{result.recommendation || result.grade_description || result.statusMessage || 'No recommendation was returned for this checking.'}</span></div><div className="grid gap-2 sm:grid-cols-2"><Detail icon={CheckCircle2} label="Threshold" value={result.confidence_threshold ? `${Number(result.confidence_threshold * 100).toFixed(0)}% minimum confidence` : 'Model threshold applied'} /><Detail icon={FileImage} label="Stored image" value={record.imageMeta?.base64 ? 'Base64 image saved in database' : 'Image metadata saved'} /></div></div></section></div>
}

function Detail({ icon: Icon, label, value }) {
  return <div className="rounded-xl border border-[#e0ece3] bg-[#fbfefb] p-3"><div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#6f8878]">{Icon ? <Icon className="h-3.5 w-3.5 text-[#19764d]" /> : null}{label}</div><p className="mt-1 text-[12px] font-semibold capitalize text-[#33483a]">{value}</p></div>
}

export default PredictionResultModal
