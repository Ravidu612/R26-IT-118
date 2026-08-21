import { Download, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

function QuickActionsCard() {
  const actions = [
    { label: 'Assign to Worker', icon: UserRound, to: '/dashboard/task-assignment' },
    { label: 'Export Report', icon: Download, to: '/dashboard/reports' },
  ]

  return <section className="dashboard-card rounded-[12px] border border-[#e1e9e3] bg-white p-4 shadow-[0_4px_15px_rgba(33,61,45,.045)]"><h2 className="text-[15px] font-extrabold text-[#17231c]">Quick Actions</h2><div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">{actions.map(({ label, icon: Icon, to }) => <Link key={label} to={to} className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#33483a] hover:text-[#16764d]"><Icon className="h-4 w-4 text-[#26372c]" strokeWidth={1.8} />{label}</Link>)}</div></section>
}

export default QuickActionsCard
