/**
 * CalendarHeader - Navigation and month display
 *
 * Displays current month/year with previous/next navigation buttons
 */

import type { CalendarHeaderProps } from './types'
import styles from '../CalendarView.module.css'

export default function CalendarHeader({
  month,
  year,
  monthNames,
  loading,
  onPreviousMonth,
  onNextMonth
}: CalendarHeaderProps) {
  return (
    <nav
      aria-label="Kalendermånadsnavigation"
      className={styles.calendarHeader}
    >
      <button
        onClick={onPreviousMonth}
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
        onClick={onNextMonth}
        disabled={loading}
        aria-label={`Nästa månad, ${month === 12 ? monthNames[0] : monthNames[month]}`}
        className={styles.navButton}
      >
        <span aria-hidden="true">→</span>
      </button>
    </nav>
  )
}
