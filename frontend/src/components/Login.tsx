import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './Login.module.css' 

export default function Login() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(code)
      // Navigation will be handled by App.tsx based on role
      navigate('/calendar')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inloggning misslyckades')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h1
          style={{
            margin: '0 0 1rem 0',
            color: '#004A87', // Mörkare blå färg från bilden
            fontSize: '2.2rem',
            fontWeight: 700,
            letterSpacing: '0.1rem',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
          }}
        >
          BOKNING KONFERANS
        </h1>

        
        <p className={styles.welcomeText}>
          Välkommen! Ange er föreningskod för att fortsätta.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <label
              htmlFor="code"
              style={{
                display: 'block',
                fontWeight: 600, // Semi-bold
                fontSize: '1.2rem',
                color: '#212529',
                marginBottom: '0.5rem'
              }}
            >
              Föreningskod
            </label>

            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                fontSize: '1rem',
                border: '1px solid #ced4da', // Tunn, ljusgrå ram
                borderRadius: '6px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: '0.8rem',
                marginBottom: '1rem',
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c2c7',
                borderRadius: '6px',
                color: '#842029',
                fontSize: '0.95rem'
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.9rem 1rem',
              fontSize: '1.1rem',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#005A9C', // Blå färg från bilden
              color: 'white',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Loggar in...' : 'Logga in'}
          </button>
        </form>
      </div>
    </div>
  )
}