import { Bell, ChevronDown, LogOut, Menu, Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'

function DashboardTopbar({ onOpenMenu, searchValue, onSearchChange, apiStatus = 'checking', userRole = 'Admin' }) {
  const navigate = useNavigate()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const isHealthy = apiStatus === 'online'
  const statusLabel = isHealthy ? 'Healthy' : apiStatus === 'error' ? 'Unavailable' : 'Checking'

  const logout = async () => {
    try {
      await authService.logout()
    } catch {
      authService.clearAccessToken()
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <header className="dashboard-topbar sticky top-0 z-30 flex min-h-[72px] items-center justify-between gap-4 border-b border-[#e6ece8] bg-white/95 px-4 py-3 shadow-[0_2px_12px_rgba(33,61,45,.035)] backdrop-blur-md md:px-7">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button type="button" onClick={onOpenMenu} className="rounded-xl border border-[#e3ebe5] p-2 text-[#718077] hover:bg-[#f0f7f2] lg:hidden" aria-label="Open navigation">
          <Menu className="h-4 w-4" />
        </button>
        <div className="relative w-full max-w-[580px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#718077]" />
          <input type="text" value={searchValue} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search tasks, workers, reports..." className="h-11 w-full rounded-[13px] border border-[#e0e8e2] bg-white py-2.5 pl-11 pr-14 text-[13px] text-[#26372c] shadow-[0_3px_12px_rgba(27,58,40,.03)] placeholder:text-[#87948b] focus:border-[#9acdad] focus:outline-none focus:ring-2 focus:ring-[#b9e1c5]" />
          <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md bg-[#f3f6f4] px-2 py-1 text-[11px] font-bold text-[#718077] sm:block">⌘ K</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden items-center gap-5 rounded-[14px] border border-[#e2eae4] px-5 py-2.5 text-[13px] font-bold md:flex">
          <span className="inline-flex items-center gap-2 text-[#26372c]"><span className="h-2.5 w-2.5 rounded-full bg-[#087d47]" />AI Status</span>
          <span className="inline-flex items-center gap-2 text-[#16764d]"><span className={`h-2.5 w-2.5 rounded-full ${isHealthy ? 'bg-[#087d47]' : 'bg-[#e3ad47]'}`} />{statusLabel}</span>
        </div>
        <button type="button" className="relative rounded-xl p-2.5 text-[#26372c] hover:bg-[#f0f7f2]" aria-label="Notifications">
          <Bell className="h-[20px] w-[20px]" strokeWidth={1.8} />
          <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#087d47] px-1 text-[10px] font-bold !text-white">3</span>
        </button>
        <div className="hidden h-9 w-px bg-[#e6ece8] xl:block" />
        <div className="relative">
        <button type="button" onClick={() => setIsProfileOpen((open) => !open)} className="inline-flex items-center gap-2 rounded-xl px-1 py-1 text-left hover:bg-[#f4f8f5]" aria-label="Open user menu" aria-expanded={isProfileOpen}>
          <img src="/assets/avatars/field-supervisor.png" alt="TeaGuard user avatar" className="h-9 w-9 rounded-full object-cover ring-2 ring-[#e2f0e5]" />
          <span className="hidden min-w-0 xl:block"><span className="block text-[13px] font-bold text-[#24372b]">TeaGuard User</span><span className="block text-[11px] text-[#8a968d]">{userRole}</span></span>
          <ChevronDown className="hidden h-4 w-4 text-[#26372c] xl:block" />
        </button>
        {isProfileOpen ? <div className="absolute right-0 top-12 z-40 w-48 rounded-xl border border-[#dce9df] bg-white p-2 shadow-[0_12px_28px_rgba(33,61,45,.16)]"><div className="border-b border-[#edf1ed] px-3 pb-2"><p className="text-xs font-bold text-[#24372b]">TeaGuard User</p><p className="mt-0.5 text-[11px] text-[#8a968d]">{userRole}</p></div><button type="button" onClick={logout} className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#c94f45] hover:bg-[#fff3f1]"><LogOut className="h-4 w-4" />Log out</button></div> : null}
        </div>
      </div>
    </header>
  )
}

export default DashboardTopbar
