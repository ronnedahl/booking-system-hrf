import { useState } from 'react'
import styles from './DeleteBookingModal.module.css'

interface Booking {
  id: number
  date: string
  startTime: string
  duration: number
  userFirstname: string
  roomName: string
}

interface DeleteBookingModalProps {
  booking: Booking
  onConfirm: (bookingId: number, password: string) => Promise<void>
  onCancel: () => void
}

export default function DeleteBookingModal({ booking, onConfirm, onCancel }: DeleteBookingModalProps) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (password.trim().length < 6) {
      setError('Lösenordet måste vara minst 6 tecken långt')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await onConfirm(booking.id, password.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod')
      setLoading(false)
    }
  }

  const formatTime = (time: string) => {
    return time.substring(0, 5) // HH:MM
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('sv-SE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && password.trim().length >= 6 && !loading) {
      handleConfirm()
    }
  }

  return (
    <dialog open className={styles.dialog}>
      <div className={styles.backdrop} onClick={onCancel} />

      <div className={styles.content}>
        <h2 className={styles.title}>Radera bokning</h2>

        <div className={styles.bookingInfo}>
          <p><strong>Datum:</strong> {formatDate(booking.date)}</p>
          <p><strong>Tid:</strong> {formatTime(booking.startTime)} ({booking.duration} min)</p>
          <p><strong>Lokal:</strong> {booking.roomName}</p>
          <p><strong>Bokad av:</strong> {booking.userFirstname}</p>
        </div>

        <div className={styles.warningBox}>
          <strong>⚠️ Observera:</strong> Denna åtgärd kan inte ångras. Ange din föreningskod för att bekräfta borttagningen.
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>
            Föreningskod (minst 6 tecken)
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ange din föreningskod"
            className={styles.input}
            disabled={loading}
            aria-required="true"
            minLength={6}
            maxLength={50}
            autoFocus
          />
        </div>

        {error && (
          <div className={styles.error} role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button
            onClick={handleConfirm}
            disabled={loading || password.trim().length < 6}
            className={styles.confirmButton}
            aria-busy={loading}
          >
            {loading ? 'Raderar...' : 'Ja, radera'}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className={styles.cancelButton}
          >
            Avbryt
          </button>
        </div>
      </div>
    </dialog>
  )
}
