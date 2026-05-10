import {
  BarChart3,
  ClipboardCheck,
  FlaskConical,
  HeartPulse,
  History,
  LayoutDashboard,
  Leaf,
  ScanSearch,
  Settings,
  Users,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { dashboardNavItems } from '../../constants/navigation'

const iconMap = { LayoutDashboard, ScanSearch, FlaskConical, HeartPulse, History, ClipboardCheck, Users, BarChart3, Settings }

function SidebarLinks({ onNavigate }) {
  return (
    <nav className="mt-5 grid gap-2">
      {dashboardNavItems.map((item) => {
        const Icon = iconMap[item.icon] || LayoutDashboard
        return (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition',
                isActive ? 'bg-emerald-300/20 text-emerald-100' : 'text-slate-300 hover:bg-white/10 hover:text-white',
              ].join(' ')
            }
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

function SidebarContent({ onClose, mobile = false }) {
  return (
    <div className="surface-card h-full rounded-2xl p-4">
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
        <div className="inline-flex items-center gap-3">
          <div className="rounded-lg bg-emerald-300/15 p-2">
            <Leaf className="h-5 w-5 text-emerald-200" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">TeaGuard AI</p>
            <p className="text-xs text-slate-400">Tea Operations Console</p>
          </div>
        </div>
        {mobile ? (
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white lg:hidden">
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <SidebarLinks onNavigate={mobile ? onClose : undefined} />
    </div>
  )
}

function DashboardSidebar({ isMobileOpen, onClose }) {
  return (
    <>
      <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-72 self-start lg:block">
        <SidebarContent />
      </aside>
      {isMobileOpen ? (
        <div className="fixed inset-0 z-40 bg-black/65 p-4 lg:hidden">
          <div className="h-full w-full max-w-sm">
            <SidebarContent onClose={onClose} mobile />
          </div>
        </div>
      ) : null}
    </>
  )
}

export default DashboardSidebar
