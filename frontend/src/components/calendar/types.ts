/**
 * Calendar component types and interfaces
 */

export interface Booking {
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

export interface CalendarDay {
  day: number
  isPast: boolean
  isToday: boolean
  isFullyBooked: boolean
  bookings: Booking[]
}

export interface CalendarHeaderProps {
  month: number
  year: number
  monthNames: string[]
  loading: boolean
  onPreviousMonth: () => void
  onNextMonth: () => void
}

export interface CalendarGridProps {
  year: number
  month: number
  weekDays: string[]
  monthNames: string[]
  daysInMonth: number
  firstDayOfMonth: number
  bookings: Booking[]
  onDayClick: (day: number) => void
}

export interface CalendarDayProps {
  day: number
  isPast: boolean
  isToday: boolean
  fullyBooked: boolean
  bookings: Booking[]
  ariaLabel: string
  onClick: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
}
