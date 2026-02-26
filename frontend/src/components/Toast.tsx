import { useRealtime } from '../context/RealtimeContext'
import { Button } from './ui'

const TOAST_STYLE: React.CSSProperties = {
  position: 'fixed',
  top: 'var(--space-4)',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 9999,
  minWidth: 320,
  maxWidth: 'calc(100vw - var(--space-8))',
  padding: 'var(--space-4) var(--space-5)',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-card), var(--shadow-glow)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-3)',
  alignItems: 'center',
  textAlign: 'center',
}

export default function Toast() {
  const { toast, hideToast } = useRealtime()
  if (!toast) return null

  const handleAccept = () => {
    toast.onAccept?.()
    hideToast()
  }
  const handleCancel = () => {
    toast.onCancel?.()
    hideToast()
  }

  return (
    <div role="alert" style={TOAST_STYLE} aria-live="polite">
      {toast.type === 'friend_invite' && (
        <>
          <span style={{ fontSize: 'var(--size-sm)', color: 'var(--text-primary)' }}>
            <strong>{toast.username}</strong> enviou convite de amizade
          </span>
          <button
            type="button"
            onClick={hideToast}
            style={{
              padding: 'var(--space-1) var(--space-2)',
              fontSize: 'var(--size-xs)',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            Fechar
          </button>
        </>
      )}
      {toast.type === 'game_invite' && (
        <>
          <span style={{ fontSize: 'var(--size-sm)', color: 'var(--text-primary)' }}>
            <strong>{toast.username}</strong> convidou você para jogar
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button variant="primary" size="sm" onClick={handleAccept}>
              Aceitar
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              Cancelar
            </Button>
          </div>
        </>
      )}
      {toast.type === 'game_invite_opponent_busy' && (
        <>
          <span style={{ fontSize: 'var(--size-sm)', color: 'var(--text-primary)' }}>
            <strong>{toast.username}</strong> já está em outra partida
          </span>
          <button
            type="button"
            onClick={hideToast}
            style={{
              padding: 'var(--space-1) var(--space-2)',
              fontSize: 'var(--size-xs)',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            Fechar
          </button>
        </>
      )}
    </div>
  )
}
