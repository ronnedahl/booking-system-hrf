/**
 * CalendarView - Main calendar component (Refactored)
 *
 * Displays a monthly calendar with bookings for conference rooms.
 * Refactored into smaller, modular components for better maintainability.
 *
 * Module structure:
 * - calendar/types.ts: TypeScript interfaces
 * - calendar/calendarHelpers.ts: Pure utility functions
 * - calendar/useCalendar.ts: Custom hook for state management
 * - calendar/CalendarHeader.tsx: Month navigation
 * - calendar/CalendarGrid.tsx: Day grid container
 * - calendar/CalendarDay.tsx: Individual day cells
 */

import { useRef } from 'react'
import OrganizationNav from './OrganizationNav'
import CalendarHeader from './calendar/CalendarHeader'
import CalendarGrid from './calendar/CalendarGrid'
import { useCalendar } from './calendar/useCalendar'
import styles from './CalendarView.module.css'

const WEEK_DAYS = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön']

export default function CalendarView() {
  const calendarRef = useRef<HTMLDivElement>(null)

  // TODO: Replace with dynamic data from AuthContext after database integration
  const organizationName = 'Förening A'

  // Use custom hook for calendar logic
  const {
    year,
    month,
    bookings,
    loading,
    error,
    announcement,
    monthNames,
    daysInMonth,
    firstDayOfMonth,
    goToPreviousMonth,
    goToNextMonth,
    handleDayClick
  } = useCalendar()

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
        {/* Calendar Header - Month navigation */}
        <CalendarHeader
          month={month}
          year={year}
          monthNames={monthNames}
          loading={loading}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
        />

        {/* Instruction text */}
        <div className={styles.instructionText}>
          <strong>Grön bakgrund (✓)</strong> = Lediga tider finns | <strong>Röd bakgrund (✗)</strong> = Fullbokat
          <br />
          Klicka på en grön dag för att se vilka tider som är lediga i Wilmer 1 och Wilmer 2.
        </div>

        {/* Error message */}
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

        {/* Calendar Grid - Days of the month */}
        <CalendarGrid
          year={year}
          month={month}
          weekDays={WEEK_DAYS}
          monthNames={monthNames}
          daysInMonth={daysInMonth}
          firstDayOfMonth={firstDayOfMonth}
          bookings={bookings}
          onDayClick={handleDayClick}
        />

        {/* Loading indicator */}
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
