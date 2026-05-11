import { Bell, CircleUserRound, Menu, Search, Wifi } from 'lucide-react'
import Badge from '../ui/Badge'

function DashboardTopbar({ onOpenMenu, searchValue, onSearchChange, apiStatus = 'checking', userRole = 'User' }) {
  const statusTone = apiStatus === 'online' ? 'success' : apiStatus === 'offline' ? 'danger' : apiStatus === 'error' ? 'warning' : 'info'

  return (
    <header className="surface-card rounded-2xl p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onOpenMenu} className="rounded-lg border border-[var(--border-color)] p-2 text-slate-300 hover:bg-white/10 lg:hidden">
            <Menu className="h-4 w-4" />
          </button>
          <div>
            <p className="text-sm text-slate-400">TeaGuard AI Administration</p>
            <h2 className="text-xl font-semibold text-white">Operational Dashboard</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={statusTone}>
            <span className="inline-flex items-center gap-1">
              <Wifi className="h-3.5 w-3.5" />
              API {apiStatus}
            </span>
          </Badge>
          <button type="button" className="rounded-lg border border-[var(--border-color)] p-2 text-slate-300 hover:bg-white/10 hover:text-white">
            <Bell className="h-4 w-4" />
          </button>
          <div className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm text-slate-200">
            <CircleUserRound className="h-4 w-4" />
            <span>{userRole}</span>
          </div>
        </div>
      </div>
      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search modules, workers, predictions..."
          className="w-full rounded-xl border border-[var(--border-color)] bg-slate-900/80 py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-400 focus:border-[var(--tea-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--tea-teal)]/35"
        />
      </div>
    </header>
  )
}

export default DashboardTopbar
