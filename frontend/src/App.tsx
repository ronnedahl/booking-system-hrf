import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import CalendarView from './components/CalendarView'
import ScheduleView from './components/ScheduleView'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authState } = useAuth()

  if (!authState.isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function CalendarPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#E9ECEF' }}>
      <CalendarView />
    </div>
  )
}

function SchedulePage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#E9ECEF' }}>
      <ScheduleView />
    </div>
  )
}

function AdminPlaceholder() {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">
              Admin Panel
            </h1>
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logga ut
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Admin Panel
          </h2>
          <p className="text-sm text-gray-500">
            Adminpanel kommer i Sprint 5
          </p>
        </div>
      </div>
    </div>
  )
}

function AppRoutes() {
  const { authState } = useAuth()

  return (
    <Routes>
      <Route path="/" element={
        authState.isAuthenticated ? (
          <Navigate to={authState.role === 'admin' ? '/admin' : '/calendar'} replace />
        ) : (
          <Login />
        )
      } />

      <Route path="/calendar" element={
        <ProtectedRoute>
          <CalendarPage />
        </ProtectedRoute>
      } />

      <Route path="/schedule/:date" element={
        <ProtectedRoute>
          <SchedulePage />
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminPlaceholder />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
