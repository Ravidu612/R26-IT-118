import { Navigate, useLocation } from 'react-router-dom'
import { authService } from '../../services/authService'

function ProtectedRoute({ children }) {
  const location = useLocation()
  const isAuthenticated = authService.hasAccessToken()
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

export default ProtectedRoute
