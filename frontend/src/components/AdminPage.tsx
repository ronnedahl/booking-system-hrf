import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import OrganizationNav from './OrganizationNav'
import styles from './AdminPage.module.css'

interface Association {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export default function AdminPage() {
  const { logout } = useAuth()
  const [associations, setAssociations] = useState<Association[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [updateLoading, setUpdateLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchAssociations()
  }, [])

  const fetchAssociations = async () => {
    try {
      setLoading(true)
      setError(null)

      const apiUrl = import.meta.env.VITE_API_URL
      const response = await fetch(`${apiUrl}/api/admin/getAssociations.php`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch associations')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch associations')
      }

      setAssociations(data.associations || [])
    } catch (err) {
      console.error('Error fetching associations:', err)
      setError(err instanceof Error ? err.message : 'Ett fel uppstod')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (associationId: number) => {
    setEditingId(associationId)
    setNewPassword('')
    setSuccessMessage(null)
  }

  const handleCancel = () => {
    setEditingId(null)
    setNewPassword('')
    setSuccessMessage(null)
  }

  const handleUpdate = async (associationId: number, associationName: string) => {
    if (newPassword.trim().length < 6) {
      setError('Lösenordet måste vara minst 6 tecken långt')
      return
    }

    try {
      setUpdateLoading(true)
      setError(null)

      const apiUrl = import.meta.env.VITE_API_URL
      const response = await fetch(`${apiUrl}/api/admin/updateAssociationPassword.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          associationId,
          newPassword: newPassword.trim()
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update password')
      }

      setSuccessMessage(`Lösenordet för ${associationName} har uppdaterats!`)
      setEditingId(null)
      setNewPassword('')

      // Refresh associations list
      await fetchAssociations()

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (err) {
      console.error('Error updating password:', err)
      setError(err instanceof Error ? err.message : 'Ett fel uppstod')
    } finally {
      setUpdateLoading(false)
    }
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      <OrganizationNav organizationName="Admin Panel" />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Hantera föreningar</h1>
          <button onClick={logout} className={styles.logoutButton}>
            Logga ut
          </button>
        </div>

        {successMessage && (
          <div className={styles.successMessage} role="alert" aria-live="polite">
            {successMessage}
          </div>
        )}

        {error && (
          <div className={styles.errorMessage} role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>Laddar föreningar...</div>
        ) : (
          <div className={styles.associationsGrid}>
            {associations.map((association) => (
              <div key={association.id} className={styles.associationCard}>
                <div className={styles.cardHeader}>
                  <h2>{association.name}</h2>
                  <span className={styles.associationId}>ID: {association.id}</span>
                </div>

                <div className={styles.cardDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Skapad:</span>
                    <span className={styles.value}>{formatDate(association.created_at)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Uppdaterad:</span>
                    <span className={styles.value}>{formatDate(association.updated_at)}</span>
                  </div>
                </div>

                {editingId === association.id ? (
                  <div className={styles.editForm}>
                    <label htmlFor={`password-${association.id}`} className={styles.inputLabel}>
                      Nytt lösenord (minst 6 tecken)
                    </label>
                    <input
                      id={`password-${association.id}`}
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Ange nytt lösenord"
                      className={styles.input}
                      disabled={updateLoading}
                      aria-required="true"
                      minLength={6}
                      maxLength={50}
                    />
                    <div className={styles.buttonGroup}>
                      <button
                        onClick={() => handleUpdate(association.id, association.name)}
                        disabled={updateLoading || newPassword.trim().length < 6}
                        className={styles.saveButton}
                        aria-busy={updateLoading}
                      >
                        {updateLoading ? 'Sparar...' : 'Spara'}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={updateLoading}
                        className={styles.cancelButton}
                      >
                        Avbryt
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEdit(association.id)}
                    className={styles.editButton}
                    aria-label={`Ändra lösenord för ${association.name}`}
                  >
                    Ändra lösenord
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
