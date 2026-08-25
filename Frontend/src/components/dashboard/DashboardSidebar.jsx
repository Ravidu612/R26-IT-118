import {
  BarChart3,
  CloudSun,
  ClipboardCheck,
  FlaskConical,
  HeartPulse,
  History,
  House,
  LayoutDashboard,
  ScanSearch,
  Settings,
  Users,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { dashboardNavItems } from '../../constants/navigation'
import TeaGuardLogo from '../brand/TeaGuardLogo'

const iconMap = { House, LayoutDashboard, ScanSearch, FlaskConical, HeartPulse, History, ClipboardCheck, Users, BarChart3, Settings, CloudSun }

function SidebarLinks({ onNavigate }) {
  const sections = [
    { label: '', items: dashboardNavItems.slice(0, 1) },
    { label: 'Surveillance', items: dashboardNavItems.slice(1, 6) },
    { label: 'Management', items: dashboardNavItems.slice(6) },
  ]

  const renderItem = (item) => {
    const Icon = iconMap[item.icon] || LayoutDashboard
    return (
      <NavLink
        key={item.id}
        to={item.path}
        end={item.id === 'overview' || item.id === 'dashboard'}
        onClick={onNavigate}
        className={({ isActive }) => [
          'nav-item group relative inline-flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-[11px] border border-transparent px-3 py-2.5 text-[13px] font-semibold transition',
          isActive ? 'nav-item-active bg-[#087d47] text-white shadow-[0_6px_18px_rgba(0,0,0,.13)]' : 'text-[#d0e4d7] hover:bg-[#075a38] hover:text-white',
        ].join(' ')}
      >
        <span className="nav-item-rail" aria-hidden="true" />
        <span className="nav-item-icon grid h-7 w-7 shrink-0 place-items-center rounded-md">
          <Icon className="h-[16px] w-[16px]" strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
      </NavLink>
    )
  }

  return (
    <nav className="sidebar-nav mt-8 min-h-0 flex-1 basis-0 space-y-7 overflow-y-auto overscroll-contain pr-1">
      {sections.map((section) => (
        <div key={section.label || 'overview'}>
          {section.label ? <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9bbcac]">{section.label}</p> : null}
          <div className="grid gap-1.5">{section.items.map(renderItem)}</div>
        </div>
      ))}
    </nav>
  )
}

function SidebarContent({ onClose, mobile = false }) {
  return (
    <div className="dashboard-sidebar-card flex h-full min-h-0 min-w-0 flex-col overflow-hidden p-4 text-white">
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <div className="inline-flex items-center gap-3">
          <div className="brand-mark-shell grid h-12 w-12 shrink-0 place-items-center rounded-[13px] bg-white">
            <TeaGuardLogo className="h-9 w-9" title="TeaGuard AI logo" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[17px] font-extrabold tracking-[-0.03em] text-white">TeaGuard AI</p>
            <p className="text-[11px] text-[#b9d7c4]">AI for Tea Protection</p>
          </div>
        </div>
        {mobile ? (
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-[#b9d7c4] hover:bg-white/10 hover:text-white lg:hidden">
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <SidebarLinks onNavigate={mobile ? onClose : undefined} />
      <div className="relative mt-auto shrink-0 overflow-hidden rounded-[13px] bg-[#08643e] p-4 text-white">
        <div className="absolute inset-0 bg-cover bg-[position:68%_center] opacity-70" style={{ backgroundImage: "url('/assets/tea-field-cta.png')" }} aria-hidden="true" />
        <div className="absolute inset-0 bg-[#0b2f22]/75" aria-hidden="true" />
        <div className="relative">
          <div className="mb-5 inline-flex rounded-md border border-emerald-100/20 bg-emerald-950/30 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-100/80">Field safety</div>
          <p className="text-sm font-semibold">Keep your field safe</p>
          <p className="mt-1 text-xs leading-5 text-emerald-100/75">Monitor your worker health and act before risk escalates.</p>
          <NavLink to="/dashboard/worker-health-risk" className="mt-3 inline-flex rounded-md bg-[#1c8a58] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(0,0,0,.18)] hover:bg-[#239f68]">Open health monitor</NavLink>
        </div>
      </div>
    </div>
  )
}

function DashboardSidebar({ isMobileOpen, onClose }) {
  return (
    <>
      <aside className="dashboard-sidebar-shell sticky top-0 hidden h-screen w-[285px] shrink-0 self-start overflow-hidden lg:block"><SidebarContent /></aside>
      {isMobileOpen ? (
        <div className="dashboard-mobile-backdrop fixed inset-0 z-40 bg-black/65 p-4 lg:hidden">
          <div className="dashboard-mobile-panel h-full w-full max-w-sm overflow-hidden"><SidebarContent onClose={onClose} mobile /></div>
        </div>
      ) : null}
    </>
  )
}

export default DashboardSidebar
