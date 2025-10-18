import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import CalendarView from './components/CalendarView'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authState } = useAuth()

  if (!authState.isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function CalendarPage() {
  const { authState, logout } = useAuth()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#E9ECEF' }}>
      <nav style={{ backgroundColor: '#FFFFFF', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', height: '4rem', alignItems: 'center' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#005A9C', margin: 0 }}>
              Bokningssystem Konferens
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {authState.role === 'user' && (
                <span style={{ fontSize: '0.875rem', color: '#6C757D' }}>
                  {authState.associationName}
                </span>
              )}
              {authState.role === 'admin' && (
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#005A9C' }}>
                  Admin
                </span>
              )}
              <button
                onClick={logout}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  backgroundColor: '#6C757D',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Logga ut
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: '900px', margin: '2rem auto', backgroundColor: '#FFFFFF', padding: '2rem', borderRadius: '8px', border: '1px solid #DEE2E6', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
        <CalendarView />
      </main>
    </div>
  )
}

function SchedulePlaceholder() {
  const { authState, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#E9ECEF' }}>
      <nav style={{ backgroundColor: '#FFFFFF', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', height: '4rem', alignItems: 'center' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#005A9C', margin: 0 }}>
              Bokningssystem Konferens
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {authState.role === 'user' && (
                <span style={{ fontSize: '0.875rem', color: '#6C757D' }}>
                  {authState.associationName}
                </span>
              )}
              {authState.role === 'admin' && (
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#005A9C' }}>
                  Admin
                </span>
              )}
              <button
                onClick={logout}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  backgroundColor: '#6C757D',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Logga ut
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: '900px', margin: '2rem auto', backgroundColor: '#FFFFFF', padding: '2rem', borderRadius: '8px', border: '1px solid #DEE2E6', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ color: '#005A9C', marginBottom: '1rem' }}>Schemavy</h2>
          <p style={{ color: '#6C757D', marginBottom: '1.5rem' }}>Schemat kommer i Sprint 4</p>
          <button
            onClick={() => navigate('/calendar')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#F1F3F5',
              border: '1px solid #DEE2E6',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← Tillbaka till kalender
          </button>
        </div>
      </main>
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
          <SchedulePlaceholder />
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
