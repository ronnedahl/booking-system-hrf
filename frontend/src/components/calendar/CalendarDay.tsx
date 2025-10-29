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
  ariaLabel,
  onClick,
  onKeyDown
}: CalendarDayProps) {
  // Determine day status for styling
  // Available (green) = not past and not fully booked (has available time slots)
  const isAvailable = !isPast && !fullyBooked
  const isFullyBooked = !isPast && fullyBooked

  return (
    <div
      role="gridcell"
      data-day={day}
      tabIndex={isPast ? -1 : 0}
      onClick={onClick}
      onKeyDown={onKeyDown}
      aria-label={ariaLabel}
      aria-current={isToday ? 'date' : undefined}
      aria-disabled={isPast}
      className={`${styles.dayCell} ${isPast ? styles.past : ''} ${isToday ? styles.today : ''} ${isAvailable ? styles.available : ''} ${isFullyBooked ? styles.fullyBooked : ''}`}
    >
      <div className={styles.dayContent}>
        <div className={styles.dayNumber}>{day}</div>

        {/* Status icon for accessibility (color-blind friendly) */}
        {isAvailable && (
          <span className={styles.statusIcon} aria-hidden="true">✓</span>
        )}
        {isFullyBooked && (
          <span className={styles.statusIcon} aria-hidden="true">✗</span>
        )}
      </div>
    </div>
  )
}
