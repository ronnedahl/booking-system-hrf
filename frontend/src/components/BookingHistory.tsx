import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import OrganizationNav from './OrganizationNav'
import styles from './BookingHistory.module.css'

interface Booking {
  id: number
  date: string
  startTime: string
  endTime: string
  duration: number
  userFirstname: string
  userLastname: string
  roomId: number
  roomName: string
  associationId: number
  associationName: string
  createdAt: string
}

interface PaginationInfo {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

function BookingHistory() {
  const navigate = useNavigate()
  const { authState } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false
  })

  // Filter states
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchBookingHistory()
  }, [pagination.offset])

  const fetchBookingHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      const apiUrl = import.meta.env.VITE_API_URL
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString()
      })

      if (fromDate) params.append('fromDate', fromDate)
      if (toDate) params.append('toDate', toDate)

      const response = await fetch(
        `${apiUrl}/api/getBookingHistory.php?${params.toString()}`,
        {
          credentials: 'include'
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch booking history')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch booking history')
      }

      setBookings(data.bookings || [])
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        hasMore: data.pagination.hasMore
      }))

    } catch (err) {
      console.error('Error fetching booking history:', err)
      setError('Kunde inte hämta bokningshistorik')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterApply = () => {
    setPagination(prev => ({ ...prev, offset: 0 }))
    fetchBookingHistory()
  }

  const handleFilterReset = () => {
    setFromDate('')
    setToDate('')
    setSearchTerm('')
    setPagination(prev => ({ ...prev, offset: 0 }))
    fetchBookingHistory()
  }

  const handleLoadMore = () => {
    setPagination(prev => ({
      ...prev,
      offset: prev.offset + prev.limit
    }))
  }

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('sv-SE', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (time: string): string => {
    return time.substring(0, 5)
  }

  const formatCreatedAt = (datetime: string): string => {
    const d = new Date(datetime)
    return d.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filter bookings by search term
  const filteredBookings = bookings.filter(booking => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      booking.userFirstname.toLowerCase().includes(search) ||
      booking.userLastname.toLowerCase().includes(search) ||
      booking.associationName.toLowerCase().includes(search) ||
      booking.roomName.toLowerCase().includes(search)
    )
  })

  if (loading && bookings.length === 0) {
    return (
      <>
        <OrganizationNav organizationName={authState.associationName || 'Okänd förening'} />
        <div className={styles.container}>
          <p>Laddar bokningshistorik...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <OrganizationNav organizationName={authState.associationName || 'Okänd förening'} />

      <div className={styles.container}>
        <div className={styles.header}>
          <button onClick={() => navigate('/calendar')} className={styles.backButton}>
            ← Tillbaka till kalender
          </button>
          <h2>Bokningshistorik</h2>
        </div>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label htmlFor="fromDate">Från datum:</label>
              <input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className={styles.dateInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="toDate">Till datum:</label>
              <input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className={styles.dateInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="search">Sök:</label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Namn, förening, lokal..."
                className={styles.searchInput}
              />
            </div>

            <div className={styles.filterActions}>
              <button onClick={handleFilterApply} className={styles.applyButton}>
                Filtrera
              </button>
              <button onClick={handleFilterReset} className={styles.resetButton}>
                Återställ
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className={styles.stats}>
          <p>Visar {filteredBookings.length} av {pagination.total} bokningar</p>
        </div>

        {/* Bookings table */}
        {filteredBookings.length === 0 ? (
          <div className={styles.noResults}>
            <p>Inga bokningar hittades</p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Datum</th>
                    <th>Tid</th>
                    <th>Lokal</th>
                    <th>Bokad av</th>
                    <th>Förening</th>
                    <th>Varaktighet</th>
                    <th>Skapad</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(booking => (
                    <tr key={booking.id}>
                      <td>{formatDate(booking.date)}</td>
                      <td>
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </td>
                      <td>{booking.roomName}</td>
                      <td>
                        {booking.userFirstname} {booking.userLastname}
                      </td>
                      <td>{booking.associationName}</td>
                      <td>{booking.duration} min</td>
                      <td>{formatCreatedAt(booking.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Load more button */}
            {pagination.hasMore && (
              <div className={styles.loadMore}>
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className={styles.loadMoreButton}
                >
                  {loading ? 'Laddar...' : 'Ladda fler'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default BookingHistory
