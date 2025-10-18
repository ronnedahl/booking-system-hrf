import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/Login'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authState } = useAuth()

  if (!authState.isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function CalendarPlaceholder() {
  const { authState, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900">
              Kanban Bokningssystem
            </h1>
            <div className="flex items-center gap-4">
              {authState.role === 'user' && (
                <span className="text-sm text-gray-600">
                  {authState.associationName}
                </span>
              )}
              {authState.role === 'admin' && (
                <span className="text-sm font-medium text-blue-600">
                  Admin
                </span>
              )}
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logga ut
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Välkommen!
          </h2>
          <p className="text-gray-600 mb-4">
            Du är inloggad som {authState.role === 'admin' ? 'admin' : authState.associationName}
          </p>
          <p className="text-sm text-gray-500">
            Kalendervyn kommer i Sprint 3
          </p>
        </div>
      </div>
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
          <CalendarPlaceholder />
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
