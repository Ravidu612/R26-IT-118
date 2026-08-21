import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function DashboardStatCard({ title, value, caption, icon: Icon, href = '/dashboard', featured = false }) {
  return <Link to={href} className={`group rounded-[12px] border p-3.5 transition hover:-translate-y-0.5 hover:shadow-lg md:p-4 ${featured ? 'border-[#087d47] bg-gradient-to-br from-[#07824a] to-[#005d36] text-[#ffffff] shadow-[0_14px_30px_rgba(21,118,77,.2)]' : 'border-[#e2eae4] bg-white text-[#17231c] shadow-[0_6px_18px_rgba(33,61,45,.05)]'}`}><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${featured ? 'bg-white/15 text-[#ffffff]' : 'bg-[#edf7ef] text-[#176b48]'}`}>{Icon ? <Icon className="h-4 w-4" /> : null}</span><p className={`truncate text-[11px] font-bold ${featured ? 'text-emerald-50/90' : 'text-[#53665a]'}`}>{title}</p></div><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition group-hover:rotate-12 ${featured ? 'bg-white text-[#176b48]' : 'border border-[#dce8df] bg-[#f8fbf8] text-[#176b48]'}`}><ArrowUpRight className="h-4 w-4" /></span></div><p className="mt-3 text-3xl font-extrabold tracking-tight">{value}</p><p className={`mt-2 text-[11px] ${featured ? 'text-emerald-50/80' : 'text-[#718077]'}`}>{caption}</p></Link>
}

export default DashboardStatCard
