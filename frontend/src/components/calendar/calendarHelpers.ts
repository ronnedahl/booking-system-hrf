/**
 * Calendar helper functions
 *
 * Pure utility functions for calendar calculations
 */

import type { Booking } from './types'

/**
 * Calculate number of days in a given month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * Get the first day of month (0 = Sunday, 6 = Saturday)
 * Adjusted to return Monday as 0
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month - 1, 1).getDay()
  return day === 0 ? 6 : day - 1
}

/**
 * Filter bookings for a specific date
 */
export function getBookingsForDate(
  bookings: Booking[],
  year: number,
  month: number,
  day: number
): Booking[] {
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return bookings.filter(b => b.date === dateStr)
}

/**
 * Check if a day is fully booked (2 or more bookings)
 */
export function isFullyBooked(
  bookings: Booking[],
  year: number,
  month: number,
  day: number
): boolean {
  return getBookingsForDate(bookings, year, month, day).length >= 2
}

/**
 * Generate aria-label for a calendar day
 */
export function getDayAriaLabel(
  day: number,
  month: number,
  year: number,
  monthNames: string[],
  bookings: Booking[],
  isPast: boolean,
  isToday: boolean
): string {
  const dayBookings = getBookingsForDate(bookings, year, month, day)
  const fullyBooked = dayBookings.length >= 2

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

/**
 * Check if a date is in the past
 */
export function isPastDate(
  day: number,
  currentMonth: number,
  currentYear: number
): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time to start of day

  const checkDate = new Date(currentYear, currentMonth - 1, day)
  checkDate.setHours(0, 0, 0, 0) // Reset time to start of day

  return checkDate < today
}

/**
 * Check if a date is today
 */
export function isToday(
  day: number,
  currentMonth: number,
  currentYear: number
): boolean {
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() + 1 === currentMonth
  return isCurrentMonth && day === today.getDate()
}
