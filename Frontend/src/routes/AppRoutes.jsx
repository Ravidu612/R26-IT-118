import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/dashboard/ProtectedRoute'
import DashboardLayout from '../components/layout/DashboardLayout'
import LandingPage from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import DashboardHome from '../pages/dashboard/DashboardHome'
import PredictionHistoryPage from '../pages/dashboard/PredictionHistoryPage'
import ReportsPage from '../pages/dashboard/ReportsPage'
import SettingsPage from '../pages/dashboard/SettingsPage'
import TaskAssignmentPage from '../pages/dashboard/TaskAssignmentPage'
import TeaGradeClassificationPage from '../pages/dashboard/TeaGradeClassificationPage'
import TeaLeafDetectionPage from '../pages/dashboard/TeaLeafDetectionPage'
import WorkerHealthRiskPage from '../pages/dashboard/WorkerHealthRiskPage'
import WorkersPage from '../pages/dashboard/WorkersPage'
import WeatherDashboard from '../pages/dashboard/weather/Dashboard'
import Forecasts from '../pages/dashboard/weather/Forecasts'
import Predictions from '../pages/dashboard/weather/Predictions'
import DiseaseRisk from '../pages/dashboard/weather/DiseaseRisk'
import Alerts from '../pages/dashboard/weather/Alerts'
import WeatherReports from '../pages/dashboard/weather/Reports'
import WeatherLayout from '../pages/dashboard/weather/WeatherLayout'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="overview" element={<DashboardHome />} />
        <Route path="tea-leaf-detection" element={<TeaLeafDetectionPage />} />
        <Route path="tea-grade-classification" element={<TeaGradeClassificationPage />} />
        <Route path="worker-health-risk" element={<WorkerHealthRiskPage />} />
        <Route path="prediction-history" element={<PredictionHistoryPage />} />
        <Route path="task-assignment" element={<TaskAssignmentPage />} />
        <Route path="workers" element={<WorkersPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="weather" element={<WeatherLayout />}>
          <Route index element={<WeatherDashboard />} />
          <Route path="forecasts" element={<Forecasts />} />
          <Route path="predictions" element={<Predictions />} />
          <Route path="disease-risk" element={<DiseaseRisk />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="reports" element={<WeatherReports />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
