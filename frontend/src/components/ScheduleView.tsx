import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import BookingModal from './BookingModal'
import OrganizationNav from './OrganizationNav'
import styles from './ScheduleView.module.css'

interface TimeSlot {
  time: string
  hour: number
}

interface Booking {
  id: number
  date: string
  roomId: number
  roomName: string
  startTime: string
  endTime: string
  duration: number
  userFirstname: string
  userLastname: string
  associationId: number
  associationName: string
}

interface RoomSchedule {
  roomId: number
  roomName: string
  bookings: Booking[]
}

// Blocked time slots per booking.md: 09:00-10:00 and 12:00-13:00
const BLOCKED_HOURS = [9, 12]

// Generate time slots from 08:00 to 22:00 (14 hours, 1-hour slots)
const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = []
  for (let hour = 8; hour < 22; hour++) {
    slots.push({
      time: `${hour.toString().padStart(2, '0')}:00`,
      hour
    })
  }
  return slots
}

function ScheduleView() {
  const { date } = useParams<{ date: string }>()
  const navigate = useNavigate()
  const { authState } = useAuth()
  const [schedules, setSchedules] = useState<RoomSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ roomId: number; roomName: string; time: string } | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  const timeSlots = generateTimeSlots()

  useEffect(() => {
    if (!date) return

    fetchSchedule()
  }, [date])

  const fetchSchedule = async () => {
    if (!date) return

    try {
      setLoading(true)
      setError(null)

      const [year, month] = date.split('-')
      const apiUrl = import.meta.env.VITE_API_URL

      const response = await fetch(
        `${apiUrl}/api/getBookings.php?year=${year}&month=${month}`,
        {
          credentials: 'include'
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }

      const data = await response.json()
      const allBookings: Booking[] = data.bookings || []

      // Filter bookings for this specific date
      const dateBookings = allBookings.filter(b => b.date === date)

      // Group by room (Wilmer 1 and Wilmer 2)
      const roomSchedules: RoomSchedule[] = [
        { roomId: 1, roomName: 'Wilmer 1', bookings: [] },
        { roomId: 2, roomName: 'Wilmer 2', bookings: [] }
      ]

      dateBookings.forEach(booking => {
        const room = roomSchedules.find(r => r.roomId === booking.roomId)
        if (room) {
          room.bookings.push(booking)
        }
      })

      setSchedules(roomSchedules)
    } catch (err) {
      console.error('Error fetching schedule:', err)
      setError('Kunde inte hämta schema')
    } finally {
      setLoading(false)
    }
  }

  const isSlotBooked = (roomId: number, time: string): Booking | null => {
    const room = schedules.find(s => s.roomId === roomId)
    if (!room) return null

    // Compare only HH:MM part (API returns HH:MM:SS)
    return room.bookings.find(b => b.startTime.substring(0, 5) === time) || null
  }

  const isSlotBlocked = (hour: number): boolean => {
    return BLOCKED_HOURS.includes(hour)
  }

  const handleSlotClick = (roomId: number, roomName: string, time: string, hour: number) => {
    // Don't allow booking blocked slots
    if (isSlotBlocked(hour)) return

    // Don't allow booking already booked slots
    if (isSlotBooked(roomId, time)) return

    setSelectedSlot({ roomId, roomName, time })
    setShowBookingModal(true)
  }

  const handleBookingSuccess = () => {
    setShowBookingModal(false)
    setSelectedSlot(null)
    fetchSchedule() // Refresh schedule
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

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Laddar schema...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>{error}</p>
        <button onClick={() => navigate('/calendar')} className={styles.backButton}>
          ← Tillbaka till kalender
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Organization Navigation Bar */}
      <OrganizationNav organizationName={authState.associationName || 'Okänd förening'} />

      <div className={styles.container}>
        <div className={styles.header}>
          <button onClick={() => navigate('/calendar')} className={styles.backButton}>
            ← Tillbaka till kalender
          </button>
          <h2>{date ? formatDate(date) : 'Schema'}</h2>
        </div>

        {/* Instruction text */}
        <div className={styles.instructionText}>
          <strong>Grön (✓)</strong> = Ledig tid, klicka för att boka | <strong>Röd (✗)</strong> = Bokad | <strong>Grå (⊘)</strong> = Stängt
        </div>

      <div className={styles.scheduleGrid}>
        {/* Header row */}
        <div className={styles.cornerCell}></div>
        {schedules.map(schedule => (
          <div key={schedule.roomId} className={styles.roomHeader}>
            {schedule.roomName}
          </div>
        ))}

        {/* Time slots */}
        {timeSlots.map(slot => (
          <div key={slot.time} className={styles.row}>
            <div className={styles.timeLabel}>{slot.time}</div>

            {schedules.map(schedule => {
              const booking = isSlotBooked(schedule.roomId, slot.time)
              const blocked = isSlotBlocked(slot.hour)

              if (blocked) {
                return (
                  <div
                    key={`${schedule.roomId}-${slot.time}`}
                    className={`${styles.slot} ${styles.blocked}`}
                    title="Ej bokningsbar tid"
                  >
                    <span className={styles.blockedIcon} aria-hidden="true">⊘</span>
                    <span>Stängt</span>
                  </div>
                )
              }

              if (booking) {
                return (
                  <div
                    key={`${schedule.roomId}-${slot.time}`}
                    className={`${styles.slot} ${styles.booked}`}
                    title={`Bokad av ${booking.userFirstname} ${booking.userLastname}, ${booking.associationName}`}
                  >
                    <span className={styles.statusIconSchedule} aria-hidden="true">✗</span>
                    <div className={styles.bookingInfo}>
                      <div className={styles.bookingName}>
                        {booking.userFirstname} {booking.userLastname}
                      </div>
                      <div className={styles.bookingAssociation}>
                        {booking.associationName}
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <button
                  key={`${schedule.roomId}-${slot.time}`}
                  className={`${styles.slot} ${styles.free}`}
                  onClick={() => handleSlotClick(schedule.roomId, schedule.roomName, slot.time, slot.hour)}
                  aria-label={`Boka ${schedule.roomName} klockan ${slot.time}`}
                >
                  <span className={styles.statusIconSchedule} aria-hidden="true">✓</span>
                  <span>Ledig</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {showBookingModal && selectedSlot && date && (
        <BookingModal
          date={date}
          roomId={selectedSlot.roomId}
          roomName={selectedSlot.roomName}
          startTime={selectedSlot.time}
          onClose={() => {
            setShowBookingModal(false)
            setSelectedSlot(null)
          }}
          onSuccess={handleBookingSuccess}
        />
      )}
      </div>
    </>
  )
}

export default ScheduleView
