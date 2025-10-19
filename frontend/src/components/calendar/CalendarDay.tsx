/**
 * CalendarDay - Individual day cell component
 *
 * Displays a single day in the calendar with booking indicators
 */

import type { CalendarDayProps } from './types'
import styles from '../CalendarView.module.css'

export default function CalendarDay({
  day,
  isPast,
  isToday,
  fullyBooked,
  bookings,
  ariaLabel,
  onClick,
  onKeyDown
}: CalendarDayProps) {
  return (
    <div
      role="gridcell"
      tabIndex={isPast ? -1 : 0}
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-label={ariaLabel}
      aria-current={isToday ? 'date' : undefined}
      aria-disabled={isPast}
      className={`${styles.dayCell} ${isPast ? styles.past : ''} ${isToday ? styles.today : ''}`}
    >
      <div className={styles.dayNumber}>{day}</div>

      {/* Booking indicators */}
      {fullyBooked && (
        <div
          aria-hidden="true"
          className={`${styles.bookingIndicator} ${styles.full}`}
          title="Fullbokad"
        />
      )}
      {!fullyBooked && bookings.length > 0 && (
        <div
          aria-hidden="true"
          className={`${styles.bookingIndicator} ${styles.partial}`}
          title={`${bookings.length} bokning(ar)`}
        />
      )}
    </div>
  )
}
