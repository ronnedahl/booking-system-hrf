import { useNavigate, useLocation } from 'react-router-dom'
import logo from '../assets/logga-funktionsratt.png'
import styles from './OrganizationNav.module.css'

interface OrganizationNavProps {
  organizationName: string
}

/**
 * OrganizationNav - Navigation bar component
 *
 * Purpose: Display the currently logged-in organization name and navigation
 *
 * Props:
 * - organizationName: Name of the organization to display
 *
 * Accessibility:
 * - role="banner" indicates main navigation
 * - aria-label provides context for screen readers
 */
export default function OrganizationNav({ organizationName }: OrganizationNavProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const isHistoryPage = location.pathname === '/history'
  const isCalendarPage = location.pathname === '/calendar'
  const showLogo = !isHistoryPage && !isCalendarPage

  return (
    <nav
      role="banner"
      aria-label="Organisationsnavigation"
      className={styles.nav}
    >
      {/* Logo - hidden on mobile/tablet, calendar and history page */}
      {showLogo && (
        <img
          src={logo}
          alt="Funktionsrätt logotyp"
          className={styles.logo}
        />
      )}

      {/* Navigation buttons */}
      <div className={styles.navButtons}>
        {!isCalendarPage && (
          <button
            onClick={() => navigate('/calendar')}
            className={styles.navButton}
            aria-label="Gå till kalender"
          >
            📅 Kalender
          </button>
        )}
        {!isHistoryPage && (
          <button
            onClick={() => navigate('/history')}
            className={styles.navButton}
            aria-label="Visa bokningshistorik"
          >
            📋 Historik
          </button>
        )}
      </div>

      {/* Organization Name - centered */}
      <div
        className={styles.organizationName}
        aria-label={`Inloggad som ${organizationName}`}
      >
        Inloggad som: {organizationName}
      </div>
    </nav>
  )
}
