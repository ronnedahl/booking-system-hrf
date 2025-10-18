import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

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

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1 // JavaScript months are 0-indexed

  useEffect(() => {
    fetchBookings()
  }, [year, month])

  const fetchBookings = async () => {
    setLoading(true)
    setError('')

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
    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const day = new Date(year, month - 1, 1).getDay()
    // Convert to Monday = 0, Sunday = 6
    return day === 0 ? 6 : day - 1
  }

  const getBookingsForDate = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return bookings.filter(b => b.date === dateStr)
  }

  const isFullyBooked = (day: number) => {
    // Simple logic: if there are 2+ bookings on a day, consider it fully booked
    // In production, this would check actual room availability
    return getBookingsForDate(day).length >= 2
  }

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    navigate(`/schedule/${dateStr}`)
  }

  const monthNames = [
    'januari', 'februari', 'mars', 'april', 'maj', 'juni',
    'juli', 'augusti', 'september', 'oktober', 'november', 'december'
  ]

  const weekDays = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön']

  const daysInMonth = getDaysInMonth()
  const firstDayOfMonth = getFirstDayOfMonth()
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month

  return (
    <div style={{ fontFamily: 'var(--font-family)' }}>
      {/* Calendar Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}
      >
        <button
          onClick={goToPreviousMonth}
          disabled={loading}
          style={{
            background: 'none',
            border: '1px solid #DEE2E6',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.2rem'
          }}
        >
          ←
        </button>

        <h2
          style={{
            margin: 0,
            fontSize: '1.5rem',
            textTransform: 'capitalize',
            color: '#005A9C'
          }}
        >
          {monthNames[month - 1]} {year}
        </h2>

        <button
          onClick={goToNextMonth}
          disabled={loading}
          style={{
            background: 'none',
            border: '1px solid #DEE2E6',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.2rem'
          }}
        >
          →
        </button>
      </div>

      {error && (
        <div
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
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '0.5rem',
          textAlign: 'center'
        }}
      >
        {/* Weekday Headers */}
        {weekDays.map(day => (
          <div
            key={day}
            style={{
              fontWeight: 'bold',
              color: '#6C757D',
              fontSize: '0.9rem',
              padding: '0.5rem 0'
            }}
          >
            {day}
          </div>
        ))}

        {/* Empty cells before first day */}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} style={{ padding: '0.5rem 0' }} />
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
              onClick={() => !isPast && handleDayClick(day)}
              style={{
                padding: '0.5rem 0',
                border: '1px solid transparent',
                borderRadius: '4px',
                cursor: isPast ? 'default' : 'pointer',
                position: 'relative',
                backgroundColor: isToday ? '#E6F0F6' : 'transparent',
                opacity: isPast ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isPast) {
                  e.currentTarget.style.backgroundColor = '#E6F0F6'
                  e.currentTarget.style.borderColor = '#005A9C'
                }
              }}
              onMouseLeave={(e) => {
                if (!isPast && !isToday) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.borderColor = 'transparent'
                }
              }}
            >
              <div style={{ fontSize: '1.1rem' }}>{day}</div>
              {fullyBooked && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '5px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#DC3545',
                    borderRadius: '50%'
                  }}
                  title="Fullbokad"
                />
              )}
              {!fullyBooked && dayBookings.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '5px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#198754',
                    borderRadius: '50%'
                  }}
                  title={`${dayBookings.length} bokning(ar)`}
                />
              )}
            </div>
          )
        })}
      </div>

      {loading && (
        <div
          style={{
            marginTop: '1rem',
            textAlign: 'center',
            color: '#6C757D'
          }}
        >
          Laddar bokningar...
        </div>
      )}
    </div>
  )
}
