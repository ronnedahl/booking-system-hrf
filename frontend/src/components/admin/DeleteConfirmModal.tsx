import { useState } from 'react'
import styles from './DeleteConfirmModal.module.css'

interface Association {
  id: number
  name: string
}

interface DeleteConfirmModalProps {
  association: Association
  onConfirm: (associationId: number) => Promise<void>
  onCancel: () => void
}

export default function DeleteConfirmModal({ association, onConfirm, onCancel }: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    try {
      setLoading(true)
      setError(null)
      await onConfirm(association.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod')
      setLoading(false)
    }
  }

  return (
    <dialog open className={styles.dialog}>
      <div className={styles.backdrop} onClick={onCancel} />

      <div className={styles.content}>
        <h2 className={styles.title}>Bekräfta borttagning</h2>

        <p className={styles.warning}>
          Är du säker på att du vill ta bort föreningen <strong>"{association.name}"</strong>?
        </p>

        <div className={styles.infoBox}>
          <strong>⚠️ Varning:</strong> Detta kommer också att radera alla bokningar för denna förening. Denna åtgärd kan inte ångras.
        </div>

        {error && (
          <div className={styles.error} role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={styles.confirmButton}
            aria-busy={loading}
          >
            {loading ? 'Raderar...' : 'Ja, radera'}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className={styles.cancelButton}
          >
            Avbryt
          </button>
        </div>
      </div>
    </dialog>
  )
}
