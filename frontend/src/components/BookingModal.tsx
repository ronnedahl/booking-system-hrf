import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import styles from './BookingModal.module.css'

interface BookingModalProps {
  date: string
  roomId: number
  roomName: string
  startTime: string
  onClose: () => void
  onSuccess: () => void
}

function BookingModal({ date, roomId, roomName, startTime, onClose, onSuccess }: BookingModalProps) {
  const { authState } = useAuth()
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Open dialog and focus first input
    if (dialogRef.current) {
      dialogRef.current.showModal()
      firstInputRef.current?.focus()
    }

    // Close on ESC key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (firstname.trim().length < 2) {
      setError('Förnamn måste vara minst 2 tecken')
      return
    }

    if (lastname.trim().length < 2) {
      setError('Efternamn måste vara minst 2 tecken')
      return
    }

    if (!authState.associationId) {
      setError('Du måste vara inloggad för att boka')
      return
    }

    try {
      setLoading(true)
      const apiUrl = import.meta.env.VITE_API_URL

      const response = await fetch(`${apiUrl}/api/createBooking.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          date,
          roomId,
          startTime,
          duration: 60, // Always 1 hour per booking.md
          userFirstname: firstname.trim(),
          userLastname: lastname.trim(),
          associationId: authState.associationId
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Kunde inte skapa bokning')
      }

      // Success!
      onSuccess()
    } catch (err) {
      console.error('Booking error:', err)
      setError(err instanceof Error ? err.message : 'Ett fel uppstod')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('sv-SE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateEndTime = (start: string): string => {
    const [hours] = start.split(':')
    const endHour = parseInt(hours) + 1
    return `${endHour.toString().padStart(2, '0')}:00`
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="booking-title"
      aria-describedby="booking-description"
      aria-modal="true"
    >
      <div className={styles.content}>
        <h2 id="booking-title" className={styles.title}>
          Ny bokning
        </h2>

        <div id="booking-description" className={styles.bookingDetails}>
          <div className={styles.detailRow}>
            <span className={styles.label}>Datum:</span>
            <span className={styles.value}>{formatDate(date)}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Lokal:</span>
            <span className={styles.value}>{roomName}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Tid:</span>
            <span className={styles.value}>
              {startTime} - {calculateEndTime(startTime)} (1 timme)
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>Förening:</span>
            <span className={styles.value}>{authState.associationName}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="firstname" className={styles.formLabel}>
              Förnamn *
            </label>
            <input
              ref={firstInputRef}
              id="firstname"
              type="text"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              className={styles.input}
              placeholder="Ex: Anna"
              required
              minLength={2}
              maxLength={50}
              aria-required="true"
              aria-invalid={error && firstname.length < 2 ? 'true' : 'false'}
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lastname" className={styles.formLabel}>
              Efternamn *
            </label>
            <input
              id="lastname"
              type="text"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              className={styles.input}
              placeholder="Ex: Andersson"
              required
              minLength={2}
              maxLength={50}
              aria-required="true"
              aria-invalid={error && lastname.length < 2 ? 'true' : 'false'}
              disabled={loading}
            />
          </div>

          {error && (
            <div className={styles.error} role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              Avbryt
            </button>
            <button
              type="submit"
              className={styles.confirmButton}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? 'Bokar...' : 'Boka'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  )
}

export default BookingModal
