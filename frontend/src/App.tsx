import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/Login'
import CalendarView from './components/CalendarView'
import ScheduleView from './components/ScheduleView'
import AdminPage from './components/AdminPage'

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

function AdminPageWrapper() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#E9ECEF' }}>
      <AdminPage />
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
          <AdminPageWrapper />
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
