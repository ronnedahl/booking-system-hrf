import { useState } from 'react'
import styles from './BookingDetailsModal.module.css'

interface Booking {
  id: number
  date: string
  startTime: string
  duration: number
  userFirstname: string
  userLastname: string
  roomId: number
  roomName: string
  associationId: number
  associationName: string
}

interface BookingDetailsModalProps {
  booking: Booking
  canDelete: boolean
  onDelete: (bookingId: number, password: string) => Promise<void>
  onClose: () => void
}

export default function BookingDetailsModal({ booking, canDelete, onDelete, onClose }: BookingDetailsModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + duration
    const endHours = Math.floor(totalMinutes / 60)
    const endMinutes = totalMinutes % 60
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
    setError(null)
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
    setPassword('')
    setError(null)
  }

  const handleConfirmDelete = async () => {
    if (password.trim().length < 6) {
      setError('Lösenordet måste vara minst 6 tecken långt')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await onDelete(booking.id, password.trim())
      // onDelete will close the modal on success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod')
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && password.trim().length >= 6 && !loading) {
      handleConfirmDelete()
    }
  }

  return (
    <dialog open className={styles.dialog}>
      <div className={styles.backdrop} onClick={onClose} />

      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title}>Bokningsdetaljer</h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Stäng"
          >
            ✕
          </button>
        </div>

        <div className={styles.bookingInfo}>
          <div className={styles.infoRow}>
            <span className={styles.label}>Datum:</span>
            <span className={styles.value}>{formatDate(booking.date)}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>Tid:</span>
            <span className={styles.value}>
              {formatTime(booking.startTime)} - {calculateEndTime(booking.startTime, booking.duration)}
              <span className={styles.duration}> ({booking.duration} minuter)</span>
            </span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>Lokal:</span>
            <span className={styles.value}>{booking.roomName}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>Bokad av:</span>
            <span className={styles.value}>
              {booking.userFirstname} {booking.userLastname}
            </span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>Förening:</span>
            <span className={styles.value}>{booking.associationName}</span>
          </div>
        </div>

        {!showDeleteConfirm && canDelete && (
          <div className={styles.actions}>
            <button
              onClick={handleDeleteClick}
              className={styles.deleteButton}
            >
              Radera bokning
            </button>
          </div>
        )}

        {showDeleteConfirm && (
          <div className={styles.deleteConfirm}>
            <div className={styles.warningBox}>
              <strong>⚠️ Bekräfta radering</strong>
              <p>Denna åtgärd kan inte ångras. Ange din föreningskod för att bekräfta.</p>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.inputLabel}>
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
                onClick={handleConfirmDelete}
                disabled={loading || password.trim().length < 6}
                className={styles.confirmButton}
                aria-busy={loading}
              >
                {loading ? 'Raderar...' : 'Ja, radera'}
              </button>
              <button
                onClick={handleCancelDelete}
                disabled={loading}
                className={styles.cancelButton}
              >
                Avbryt
              </button>
            </div>
          </div>
        )}

        {!showDeleteConfirm && !canDelete && (
          <div className={styles.infoBox}>
            Du kan endast radera bokningar som din förening har gjort.
          </div>
        )}
      </div>
    </dialog>
  )
}
