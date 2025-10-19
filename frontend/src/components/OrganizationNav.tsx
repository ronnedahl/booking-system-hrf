import logo from '../assets/logga-funktionsratt.png'

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
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        zIndex: 1000
      }}
    >
      {/* Logo */}
      <img
        src={logo}
        alt="Funktionsrätt logotyp"
        style={{
          height: '50px',
          width: 'auto'
        }}
      />

      {/* Organization Name */}
      <div
        style={{
          color: '#FFFFFF',
          fontSize: '1.2rem',
          fontWeight: 600,
          letterSpacing: '0.05rem'
        }}
        aria-label={`Inloggad som ${organizationName}`}
      >
        {organizationName}
      </div>
    </nav>
  )
}
