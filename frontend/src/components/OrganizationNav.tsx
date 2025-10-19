import logo from '../assets/logga-funktionsratt.png'
import styles from './OrganizationNav.module.css'

interface OrganizationNavProps {
  organizationName: string
}

/**
 * OrganizationNav - Navigation bar component
 *
 * Purpose: Display the currently logged-in organization name
 *
 * Props:
 * - organizationName: Name of the organization to display
 *
 * Accessibility:
 * - role="banner" indicates main navigation
 * - aria-label provides context for screen readers
 */
export default function OrganizationNav({ organizationName }: OrganizationNavProps) {
  return (
    <nav
      role="banner"
      aria-label="Organisationsnavigation"
      className={styles.nav}
    >
      {/* Logo - hidden on mobile/tablet, shown on desktop */}
      <img
        src={logo}
        alt="Funktionsrätt logotyp"
        className={styles.logo}
      />

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
