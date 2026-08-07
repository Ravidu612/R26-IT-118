import { Bell, CircleUserRound, Menu, Search, Wifi } from 'lucide-react'
import Badge from '../ui/Badge'

function DashboardTopbar({ onOpenMenu, searchValue, onSearchChange, apiStatus = 'checking', userRole = 'User' }) {
  const statusTone = apiStatus === 'online' ? 'success' : apiStatus === 'offline' ? 'danger' : apiStatus === 'error' ? 'warning' : 'info'

  return (
    <header className="surface-card rounded-[18px] p-3.5 md:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <button type="button" onClick={onOpenMenu} className="rounded-xl border border-[var(--border-color)] p-2 text-[#718077] hover:bg-[#f0f6f1] lg:hidden">
            <Menu className="h-4 w-4" />
          </button>
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a198]" />
            <input type="text" value={searchValue} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search tasks, workers..." className="w-full rounded-lg border border-[#edf1ed] bg-[#f7faf7] py-2.5 pl-10 pr-12 text-sm text-[#26372c] placeholder:text-[#9aa59e] focus:border-[#9acdad] focus:outline-none focus:ring-2 focus:ring-[#b9e1c5]" />
            <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-bold text-[#9aa59e] shadow-sm sm:block">⌘ F</span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <Badge tone={statusTone}>
            <span className="inline-flex items-center gap-1.5">
              <Wifi className="h-3.5 w-3.5" />
              {apiStatus === 'online' ? 'Connected' : `API ${apiStatus}`}
            </span>
          </Badge>
          <button type="button" className="rounded-lg border border-[#edf1ed] bg-white p-2.5 text-[#718077] shadow-sm hover:bg-[#f0f6f1] hover:text-[#173023]">
            <Bell className="h-4 w-4" />
          </button>
          <div className="inline-flex items-center gap-2 rounded-lg border border-[#edf1ed] bg-white py-1.5 pl-1.5 pr-3 shadow-sm">
            <img src="/assets/avatars/field-supervisor.png" alt="TeaGuard user avatar" className="h-8 w-8 rounded-full object-cover ring-2 ring-[#e2f0e5]" />
            <div className="hidden text-left sm:block">
              <p className="text-xs font-bold text-[#24372b]">TeaGuard User</p>
              <p className="text-[10px] text-[#8a968d]">{userRole}</p>
            </div>
            <CircleUserRound className="h-4 w-4 text-[#8a968d] sm:hidden" />
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardTopbar
