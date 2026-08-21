import { AlertCircle, CheckCircle2, Leaf, Wind, X } from 'lucide-react'

function FieldGuideModal({ disease, onClose }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#082d20]/55 p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#d7e8db] bg-white shadow-[0_24px_70px_rgba(10,53,34,.25)]" role="dialog" aria-modal="true" aria-labelledby="field-guide-title"><header className="flex items-start justify-between gap-4 border-b border-[#e5eee7] bg-[#f3faf4] p-5"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#d6efdc] text-[#19764d]"><Leaf className="h-5 w-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6f8878]">Automatic disease guide</p><h2 id="field-guide-title" className="mt-1 text-xl font-extrabold text-[#173023]">{disease.label}</h2></div></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-[#718077] hover:bg-white hover:text-[#173023]" aria-label="Close field guide"><X className="h-5 w-5" /></button></header><div className="grid gap-3 p-5 sm:grid-cols-2"><GuideItem icon={Leaf} label="Cause" value={disease.cause} /><GuideItem icon={AlertCircle} label="Symptoms" value={disease.symptoms} /><GuideItem icon={Wind} label="Favorable conditions" value={disease.conditions} /><GuideItem icon={AlertCircle} label="Damage" value={disease.damage} /><GuideItem icon={CheckCircle2} label="Treatment / management" value={disease.management} className="sm:col-span-2" /></div></section></div>
}

function GuideItem({ icon: Icon, label, value, className = '' }) {
  return <div className={`rounded-xl border border-[#e0ece3] bg-[#fbfefb] p-3.5 ${className}`}><div className="flex items-center gap-2 text-[#19764d]"><Icon className="h-4 w-4" /><p className="text-xs font-bold uppercase tracking-[0.12em]">{label}</p></div><p className="mt-2 text-sm leading-6 text-[#5d7164]">{value}</p></div>
}

export default FieldGuideModal
