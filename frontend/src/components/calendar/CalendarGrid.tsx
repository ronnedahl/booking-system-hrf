/**
 * CalendarGrid - Main calendar grid with days
 *
 * Displays the full month grid with weekday headers and day cells
 */

import CalendarDay from './CalendarDay'
import type { CalendarGridProps } from './types'
import * as helpers from './calendarHelpers'
import styles from '../CalendarView.module.css'

export default function CalendarGrid({
  year,
  month,
  weekDays,
  monthNames,
  daysInMonth,
  firstDayOfMonth,
  bookings,
  onDayClick
}: CalendarGridProps) {
  const handleKeyDown = (e: React.KeyboardEvent, day: number) => {
    const isPast = helpers.isPastDate(day, month, year)
    if (isPast) return

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onDayClick(day)
    }
  }

  return (
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
          const isPast = helpers.isPastDate(day, month, year)
          const isTodayDate = helpers.isToday(day, month, year)
          const dayBookings = helpers.getBookingsForDate(bookings, year, month, day)

          // A day is fully booked when ALL time slots in BOTH rooms are booked
          // 14 hours (08:00-22:00) - 2 blocked hours (09:00-10:00, 12:00-13:00) = 12 bookable slots per room
          // 12 slots × 2 rooms = 24 total bookings needed for fully booked
          const BOOKABLE_SLOTS_PER_ROOM = 12
          const NUMBER_OF_ROOMS = 2
          const MAX_BOOKINGS_PER_DAY = BOOKABLE_SLOTS_PER_ROOM * NUMBER_OF_ROOMS // 24
          const fullyBooked = dayBookings.length >= MAX_BOOKINGS_PER_DAY

          const ariaLabel = helpers.getDayAriaLabel(
            day,
            month,
            year,
            monthNames,
            bookings,
            isPast,
            isTodayDate
          )

          return (
            <CalendarDay
              key={day}
              day={day}
              isPast={isPast}
              isToday={isTodayDate}
              fullyBooked={fullyBooked}
              bookings={dayBookings}
              ariaLabel={ariaLabel}
              onClick={() => !isPast && onDayClick(day)}
              onKeyDown={(e) => handleKeyDown(e, day)}
            />
          )
        })}
      </div>
    </div>
  )
}
