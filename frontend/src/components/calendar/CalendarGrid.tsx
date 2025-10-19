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
          const fullyBooked = dayBookings.length >= 2
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
