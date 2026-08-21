import { CircleCheck, FileCheck2, Leaf, ShieldAlert } from 'lucide-react'

function AnalysisSummaryCard({ records }) {
  const diseases = records.filter((record) => record.result?.detected && !isHealthy(record)).length
  const healthy = records.filter((record) => !record.result?.detected || isHealthy(record)).length
  const average = records.length ? records.reduce((sum, record) => sum + Number(record.result?.confidence || 0), 0) / records.length : 0
  const items = [
    { icon: Leaf, label: 'Total leaves analyzed', value: records.length.toLocaleString() },
    { icon: ShieldAlert, label: 'Diseases detected', value: diseases.toLocaleString() },
    { icon: CircleCheck, label: 'Healthy leaves', value: healthy.toLocaleString() },
    { icon: FileCheck2, label: 'AI confidence avg.', value: `${(average * 100).toFixed(1)}%` },
  ]

  return <section className="dashboard-card rounded-[12px] border border-[#e1e9e3] bg-white p-4 shadow-[0_4px_15px_rgba(33,61,45,.045)]"><h2 className="text-[15px] font-extrabold text-[#17231c]">Analysis Summary</h2><div className="mt-4 grid gap-3">{items.map(({ icon: Icon, label, value }) => <div key={label} className="flex items-center gap-3"><Icon className="h-4 w-4 shrink-0 text-[#16764d]" strokeWidth={1.8} /><span className="min-w-0 flex-1 text-[12px] text-[#53665a]">{label}</span><span className="text-[12px] font-bold text-[#26372c]">{value}</span></div>)}</div></section>
}

const isHealthy = (record) => String(record.result?.predicted_disease || '').toLowerCase().includes('healthy')

export default AnalysisSummaryCard
