import { Outlet } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import DashboardSidebar from '../dashboard/DashboardSidebar'
import DashboardTopbar from '../dashboard/DashboardTopbar'
import DashboardBackground from './DashboardBackground'
import { authService } from '../../services/authService'
import { modelService } from '../../services/modelService'

const normalizeStatus = (statusData) => {
  if (!statusData) return 'checking'
  const items = [statusData.teaLeaf, statusData.teaGrade, statusData.workerHealth]
  if (items.some((item) => item?.error)) return 'error'
  if (items.every((item) => String(item?.runtime || '').toLowerCase().includes('running'))) return 'online'
  return 'checking'
}

function DashboardLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [userRole, setUserRole] = useState('Tea Operator')
  const [apiStatus, setApiStatus] = useState('checking')

  useEffect(() => {
    authService
      .me()
      .then((user) => setUserRole(user.role || 'Tea Operator'))
      .catch(() => {})
  }, [])

  useEffect(() => {
    modelService
      .getModelStatus()
      .then((status) => setApiStatus(normalizeStatus(status)))
      .catch(() => setApiStatus('error'))
  }, [])

  const outletContext = useMemo(
    () => ({
      searchText,
      apiStatus,
      userRole,
      openSidebar: () => setIsMobileOpen(true),
    }),
    [searchText, apiStatus, userRole],
  )

  return (
    <div className="dashboard-shell relative min-h-screen px-3 py-3 md:px-5 lg:px-7">
      <DashboardBackground />
      <div className="relative z-10 mx-auto flex max-w-[1600px] gap-5">
        <DashboardSidebar isMobileOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
        <section className="w-full min-w-0 space-y-4">
          <DashboardTopbar
            onOpenMenu={() => setIsMobileOpen(true)}
            searchValue={searchText}
            onSearchChange={setSearchText}
            apiStatus={apiStatus}
            userRole={userRole}
          />
          <Outlet context={outletContext} />
        </section>
      </div>
    </div>
  )
}

export default DashboardLayout
