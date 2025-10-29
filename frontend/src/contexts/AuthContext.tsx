import { createContext, useContext, useState, type ReactNode } from 'react'

interface AuthState {
  isAuthenticated: boolean
  role: 'user' | 'admin' | null
  associationId?: number
  associationName?: string
}

interface AuthContextType {
  authState: AuthState
  login: (code: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
  })

  const login = async (code: string) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

    const response = await fetch(`${apiUrl}/api/login.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
      credentials: 'include', // Important for session cookies
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Login failed')
    }

    setAuthState({
      isAuthenticated: true,
      role: data.role,
      associationId: data.associationId,
      associationName: data.associationName,
    })
  }

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      role: null,
    })
  }

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
