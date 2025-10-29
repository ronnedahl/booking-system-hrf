/**
 * useCalendar - Custom hook for calendar state and logic
 *
 * Manages calendar state, booking fetching, and navigation
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Booking } from './types'
import * as helpers from './calendarHelpers'

const MONTH_NAMES = [
  'januari', 'februari', 'mars', 'april', 'maj', 'juni',
  'juli', 'augusti', 'september', 'oktober', 'november', 'december'
]

export function useCalendar() {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [announcement, setAnnouncement] = useState('')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  // Fetch bookings when month/year changes
  useEffect(() => {
    fetchBookings()
  }, [year, month])

  // Update announcement when month changes
  useEffect(() => {
    if (!loading) {
      const monthName = MONTH_NAMES[month - 1]
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

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const dayBookings = helpers.getBookingsForDate(bookings, year, month, day)
    const fullyBooked = dayBookings.length >= 2
    const status = fullyBooked ? 'fullbokad' : dayBookings.length > 0 ? `${dayBookings.length} bokning${dayBookings.length > 1 ? 'ar' : ''}` : 'inga bokningar'

    setAnnouncement(`Öppnar schema för ${day} ${MONTH_NAMES[month - 1]}, ${status}`)
    navigate(`/schedule/${dateStr}`)
  }

  return {
    // State
    year,
    month,
    bookings,
    loading,
    error,
    announcement,

    // Constants
    monthNames: MONTH_NAMES,
    daysInMonth: helpers.getDaysInMonth(year, month),
    firstDayOfMonth: helpers.getFirstDayOfMonth(year, month),

    // Actions
    goToPreviousMonth,
    goToNextMonth,
    handleDayClick
  }
}
