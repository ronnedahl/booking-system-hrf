import { useState } from 'react'
import styles from './AddAssociationForm.module.css'

interface AddAssociationFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function AddAssociationForm({ onSuccess, onCancel }: AddAssociationFormProps) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (name.trim().length < 2) {
      setError('Föreningsnamnet måste vara minst 2 tecken långt')
      return
    }

    if (password.trim().length < 6) {
      setError('Lösenordet måste vara minst 6 tecken långt')
      return
    }

    try {
      setLoading(true)

      const apiUrl = import.meta.env.VITE_API_URL
      const response = await fetch(`${apiUrl}/api/admin/createAssociation.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          password: password.trim()
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Kunde inte skapa förening')
      }

      // Reset form
      setName('')
      setPassword('')

      // Call success callback
      onSuccess()

    } catch (err) {
      console.error('Error creating association:', err)
      setError(err instanceof Error ? err.message : 'Ett fel uppstod')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.formCard}>
      <h2 className={styles.title}>Lägg till ny förening</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="association-name" className={styles.label}>
            Föreningsnamn
          </label>
          <input
            id="association-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="T.ex. Förening A"
            className={styles.input}
            disabled={loading}
            required
            minLength={2}
            maxLength={100}
            aria-required="true"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="association-password" className={styles.label}>
            Lösenord (minst 6 tecken)
          </label>
          <input
            id="association-password"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ange inloggningskod"
            className={styles.input}
            disabled={loading}
            required
            minLength={6}
            maxLength={50}
            aria-required="true"
          />
        </div>

        {error && (
          <div className={styles.error} role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button
            type="submit"
            disabled={loading || name.trim().length < 2 || password.trim().length < 6}
            className={styles.submitButton}
            aria-busy={loading}
          >
            {loading ? 'Skapar...' : 'Skapa förening'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={styles.cancelButton}
          >
            Avbryt
          </button>
        </div>
      </form>
    </div>
  )
}
