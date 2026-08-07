import {
  BarChart3,
  ClipboardCheck,
  FlaskConical,
  HeartPulse,
  History,
  LayoutDashboard,
  ArrowUpRight,
  ScanSearch,
  Settings,
  Users,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { dashboardNavItems } from '../../constants/navigation'
import TeaGuardLogo from '../brand/TeaGuardLogo'

const iconMap = { LayoutDashboard, ScanSearch, FlaskConical, HeartPulse, History, ClipboardCheck, Users, BarChart3, Settings }

function SidebarLinks({ onNavigate }) {
  const primaryItems = dashboardNavItems.slice(0, 4)
  const secondaryItems = dashboardNavItems.slice(4)

  const renderItem = (item) => {
    const Icon = iconMap[item.icon] || LayoutDashboard
    return (
      <NavLink
        key={item.id}
        to={item.path}
        onClick={onNavigate}
        className={({ isActive }) => [
          'nav-item group relative isolate inline-flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-lg border border-transparent px-2.5 py-2 text-sm font-medium transition',
          isActive ? 'nav-item-active bg-[#e7f4ed] text-[#126c49]' : 'text-[#78877d] hover:bg-[#f0f6f1] hover:text-[#1b3225]',
        ].join(' ')}
      >
        <span className="nav-item-rail" aria-hidden="true" />
        <span className="nav-item-icon grid h-8 w-8 shrink-0 place-items-center rounded-md">
          <Icon className="h-[17px] w-[17px]" />
        </span>
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        <span className="nav-item-arrow grid h-6 w-6 shrink-0 place-items-center rounded-md" aria-hidden="true">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </NavLink>
    )
  }

  return (
    <nav className="sidebar-nav mt-7 min-h-0 flex-1 space-y-7 overflow-y-auto pr-1">
      <div>
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a1ada5]">Workspace</p>
        <div className="grid gap-1.5">{primaryItems.map(renderItem)}</div>
      </div>
      <div>
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a1ada5]">Manage</p>
        <div className="grid gap-1.5">{secondaryItems.map(renderItem)}</div>
      </div>
    </nav>
  )
}

function SidebarContent({ onClose, mobile = false }) {
  return (
    <div className="surface-card flex h-full min-w-0 flex-col rounded-[18px] p-4">
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-5">
        <div className="inline-flex items-center gap-3">
          <div className="brand-mark-shell grid h-12 w-12 shrink-0 place-items-center rounded-[13px] bg-[#e4f3e9]">
            <TeaGuardLogo className="h-9 w-9" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-extrabold tracking-[-0.02em] text-[#173023]">TeaGuard AI</p>
            <p className="text-[11px] text-[#8a968d]">Tea Operations</p>
          </div>
        </div>
        {mobile ? (
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-[#718077] hover:bg-[#f0f6f1] hover:text-[#173023] lg:hidden">
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <SidebarLinks onNavigate={mobile ? onClose : undefined} />
      <div className="relative mt-auto shrink-0 overflow-hidden rounded-[14px] bg-[#133d2b] p-4 text-[#ffffff]">
        <div className="absolute inset-0 bg-cover bg-[position:68%_center] opacity-70" style={{ backgroundImage: "url('/assets/tea-field-cta.png')" }} aria-hidden="true" />
        <div className="absolute inset-0 bg-[#0b2f22]/75" aria-hidden="true" />
        <div className="relative">
          <div className="mb-5 inline-flex rounded-md border border-emerald-100/20 bg-emerald-950/30 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-100/80">Field safety</div>
          <p className="text-sm font-semibold">Keep your field safe</p>
          <p className="mt-1 text-xs leading-5 text-emerald-100/75">Monitor live worker health and act before risk escalates.</p>
          <NavLink to="/dashboard/worker-health-risk" className="mt-3 inline-flex rounded-md bg-[#1c8a58] px-3 py-1.5 text-xs font-semibold text-[#ffffff] shadow-[0_8px_20px_rgba(0,0,0,.18)] hover:bg-[#239f68]">Open health monitor</NavLink>
        </div>
      </div>
    </div>
  )
}

function DashboardSidebar({ isMobileOpen, onClose }) {
  return (
    <>
      <aside className="dashboard-sidebar-shell sticky top-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 self-start lg:block">
        <SidebarContent />
      </aside>
      {isMobileOpen ? (
        <div className="dashboard-mobile-backdrop fixed inset-0 z-40 bg-black/65 p-4 lg:hidden">
          <div className="dashboard-mobile-panel h-full w-full max-w-sm">
            <SidebarContent onClose={onClose} mobile />
          </div>
        </div>
      ) : null}
    </>
  )
}

export default DashboardSidebar
