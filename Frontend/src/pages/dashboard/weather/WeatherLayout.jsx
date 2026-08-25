import { NavLink, Outlet } from 'react-router-dom'

const weatherTabs = [
  { label: 'Dashboard', path: '/dashboard/weather' },
  { label: 'Forecasts', path: '/dashboard/weather/forecasts' },
  { label: 'Disease Risk', path: '/dashboard/weather/disease-risk' },
  { label: 'Reports', path: '/dashboard/weather/reports' },
  { label: 'Alerts', path: '/dashboard/weather/alerts' },
  { label: 'Predictions', path: '/dashboard/weather/predictions' },
]

function WeatherLayout() {
  return (
    <div>
      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-green-100" aria-label="Tea Weather navigation">
        {weatherTabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.path === '/dashboard/weather'}
            className={({ isActive }) => [
              'shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
              isActive
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-green-500 hover:border-green-200 hover:text-green-700',
            ].join(' ')}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}

export default WeatherLayout
