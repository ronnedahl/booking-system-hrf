import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import OrganizationNav from './OrganizationNav'
import styles from './CalendarView.module.css'

interface Booking {
  id: number
  date: string
  roomId: number
  roomName: string
  startTime: string
  endTime: string
  duration: number
  userFirstname: string
  associationId: number
  associationName: string
}

export default function CalendarView() {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const calendarRef = useRef<HTMLDivElement>(null)

  // TODO: Replace with dynamic data from AuthContext after database integration
  const organizationName = 'Förening A'

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  const monthNames = [
    'januari', 'februari', 'mars', 'april', 'maj', 'juni',
    'juli', 'augusti', 'september', 'oktober', 'november', 'december'
  ]

  const weekDays = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön']

  useEffect(() => {
    fetchBookings()
  }, [year, month])

  useEffect(() => {
    if (!loading) {
      const monthName = monthNames[month - 1]
      setAnnouncement(`Visar ${monthName} ${year}`)
    }
  }, [year, month, loading])

  const fetchBookings = async () => {
    setLoading(true)
    setError('')
    setAnnouncement('Laddar bokningar...')

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const response = await fetch(
        `${apiUrl}/api/getBookings.php?year=${year}&month=${month}`,
        {
          credentials: 'include'
        }
      )

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch bookings')
      }

      setBookings(data.bookings || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings')
      setAnnouncement('Fel vid laddning av bokningar')
    } finally {
      setLoading(false)
    }
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month, 1))
  }

  const getDaysInMonth = () => {
    return new Date(year, month, 0).getDate()
  }

  const getFirstDayOfMonth = () => {
    const day = new Date(year, month - 1, 1).getDay()
    return day === 0 ? 6 : day - 1
  }

  const getBookingsForDate = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return bookings.filter(b => b.date === dateStr)
  }

  const isFullyBooked = (day: number) => {
    return getBookingsForDate(day).length >= 2
  }

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const bookingCount = getBookingsForDate(day).length
    const status = isFullyBooked(day) ? 'fullbokad' : bookingCount > 0 ? `${bookingCount} bokning${bookingCount > 1 ? 'ar' : ''}` : 'inga bokningar'
    setAnnouncement(`Öppnar schema för ${day} ${monthNames[month - 1]}, ${status}`)
    navigate(`/schedule/${dateStr}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent, day: number) => {
    const today = new Date()
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month
    const isPast = isCurrentMonth && day < today.getDate()
    if (isPast) return

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleDayClick(day)
    }
  }

  const getDayAriaLabel = (day: number) => {
    const dayBookings = getBookingsForDate(day)
    const fullyBooked = isFullyBooked(day)
    const today = new Date()
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month
    const isPast = isCurrentMonth && day < today.getDate()
    const isToday = isCurrentMonth && day === today.getDate()

    let label = `${day} ${monthNames[month - 1]} ${year}`

    if (isToday) label += ', idag'
    if (isPast) label += ', förflutet datum'

    if (fullyBooked) {
      label += ', fullbokad'
    } else if (dayBookings.length > 0) {
      label += `, ${dayBookings.length} bokning${dayBookings.length > 1 ? 'ar' : ''}`
    } else {
      label += ', inga bokningar'
    }

    if (!isPast) label += ', tryck Enter för att visa schema'

    return label
  }

  const daysInMonth = getDaysInMonth()
  const firstDayOfMonth = getFirstDayOfMonth()
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month

  return (
    <>
      {/* Organization Navigation Bar */}
      <OrganizationNav organizationName={organizationName} />

      {/* Calendar Content */}
      <div
        ref={calendarRef}
        role="region"
        aria-label="Kalender för bokning av konferenslokaler"
        className={styles.calendarContainer}
      >
        {/* Calendar Header */}
        <nav
        aria-label="Kalendermånadsnavigation"
        className={styles.calendarHeader}
      >
        <button
          onClick={goToPreviousMonth}
          disabled={loading}
          aria-label={`Föregående månad, ${month === 1 ? monthNames[11] : monthNames[month - 2]}`}
          className={styles.navButton}
        >
          <span aria-hidden="true">←</span>
        </button>

        <h2
          id="calendar-heading"
          className={styles.monthHeading}
        >
          {monthNames[month - 1]} {year}
        </h2>

        <button
          onClick={goToNextMonth}
          disabled={loading}
          aria-label={`Nästa månad, ${month === 12 ? monthNames[0] : monthNames[month]}`}
          className={styles.navButton}
        >
          <span aria-hidden="true">→</span>
        </button>
      </nav>

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            padding: '0.8rem',
            marginBottom: '1rem',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c2c7',
            borderRadius: '4px',
            color: '#DC3545'
          }}
        >
          {error}
        </div>
      )}

      {/* Calendar Grid */}
      <div
        role="grid"
        aria-labelledby="calendar-heading"
        aria-readonly="true"
        className={styles.calendarGrid}
      >
        {/* Weekday Headers */}
        <div role="row" style={{ display: 'contents' }}>
          {weekDays.map(day => (
            <div
              key={day}
              role="columnheader"
              className={styles.weekdayHeader}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar rows */}
        <div role="row" style={{ display: 'contents' }}>
          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} role="gridcell" aria-hidden="true" style={{ padding: '0.5rem 0' }} />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1
            const isPast = isCurrentMonth && day < today.getDate()
            const isToday = isCurrentMonth && day === today.getDate()
            const fullyBooked = isFullyBooked(day)
            const dayBookings = getBookingsForDate(day)

            return (
              <div
                key={day}
                role="gridcell"
                tabIndex={isPast ? -1 : 0}
                onClick={() => !isPast && handleDayClick(day)}
                onKeyDown={(e) => handleKeyDown(e, day)}
                aria-label={getDayAriaLabel(day)}
                aria-selected={selectedDay === day}
                aria-current={isToday ? 'date' : undefined}
                aria-disabled={isPast}
                className={`${styles.dayCell} ${isPast ? styles.past : ''} ${isToday ? styles.today : ''}`}
              >
                <div className={styles.dayNumber}>{day}</div>
                {fullyBooked && (
                  <div
                    aria-hidden="true"
                    className={`${styles.bookingIndicator} ${styles.full}`}
                    title="Fullbokad"
                  />
                )}
                {!fullyBooked && dayBookings.length > 0 && (
                  <div
                    aria-hidden="true"
                    className={`${styles.bookingIndicator} ${styles.partial}`}
                    title={`${dayBookings.length} bokning(ar)`}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {loading && (
        <div
          aria-live="polite"
          aria-busy={loading}
          style={{
            marginTop: '1rem',
            textAlign: 'center',
            color: '#6C757D'
          }}
        >
          Laddar bokningar...
        </div>
      )}

      {/* Screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: 0
        }}
      >
        {announcement}
      </div>
      </div>
    </>
  )
}
