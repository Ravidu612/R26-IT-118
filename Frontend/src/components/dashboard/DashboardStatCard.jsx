import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function DashboardStatCard({ title, value, caption, icon: Icon, href = '/dashboard', featured = false }) {
  return (
    <Link to={href} className={`group rounded-[14px] border p-4 transition hover:-translate-y-0.5 hover:shadow-lg md:p-5 ${featured ? 'border-[#15764d] bg-[#15764d] text-[#ffffff] shadow-[0_14px_30px_rgba(21,118,77,.2)]' : 'border-[#e2eae4] bg-white text-[#17231c] shadow-[0_10px_25px_rgba(33,61,45,.05)]'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-sm ${featured ? 'text-emerald-50/80' : 'text-[#718077]'}`}>{title}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight">{value}</p>
        </div>
        <span className={`grid h-9 w-9 place-items-center rounded-lg transition group-hover:rotate-12 ${featured ? 'bg-white text-[#176b48]' : 'border border-[#dce8df] bg-[#f8fbf8] text-[#176b48]'}`}>
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
      <div className={`mt-4 flex items-center gap-2 text-xs ${featured ? 'text-emerald-50/80' : 'text-[#718077]'}`}>
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        <span>{caption}</span>
      </div>
    </Link>
  )
}

export default DashboardStatCard
