import { useState, useEffect, useRef } from 'react'
import { useRealtime } from '../context/RealtimeContext'
import { api } from '../api/client'
import { Button } from './ui'

type NotificationItem = {
  id: string
  type: string
  read: boolean
  createdAt: string
  friendInvite: {
    id: string
    status: string
    fromUser: { id: string; username: string }
  } | null
}

const BELL_STYLE: React.CSSProperties = {
  position: 'relative',
  padding: 'var(--space-2) var(--space-3)',
  background: 'transparent',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  fontSize: 'var(--size-lg)',
  lineHeight: 1,
}
const PANEL_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: 'var(--space-2)',
  minWidth: 320,
  maxWidth: 400,
  maxHeight: 400,
  overflowY: 'auto',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-card)',
  zIndex: 1000,
  padding: 'var(--space-2)',
}
const ITEM_STYLE: React.CSSProperties = {
  padding: 'var(--space-3)',
  borderBottom: '1px solid var(--border)',
  fontSize: 'var(--size-sm)',
}
const BADGE_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: 2,
  right: 2,
  minWidth: 18,
  height: 18,
  padding: '0 4px',
  borderRadius: 9,
  background: 'var(--danger)',
  color: '#fff',
  fontSize: 'var(--size-xs)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

export default function NotificationPanel() {
  const { unreadCount, setUnreadCount } = useRealtime()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await api.getNotifications()
      const seen = new Set<string>()
      const deduped = res.notifications.filter((n: NotificationItem) => {
        const key = n.friendInvite?.id ?? n.id
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      setNotifications(deduped)
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      setUnreadCount(0)
      fetchNotifications()
    }
  }, [open, setUnreadCount])

  useEffect(() => {
    api.getNotifications().then((res) => {
      const seen = new Set<string>()
      const deduped = res.notifications.filter((n: NotificationItem) => {
        const key = n.friendInvite?.id ?? n.id
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      const count = deduped.filter((n: NotificationItem) => !n.read).length
      setUnreadCount(count)
    }).catch(() => {})
  }, [setUnreadCount])

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleAccept = async (inviteId: string, notificationId: string) => {
    try {
      await api.acceptInvite(inviteId)
      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      )
    } catch {}
  }

  const handleReject = async (inviteId: string, notificationId: string) => {
    try {
      await api.rejectInvite(inviteId)
      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      )
    } catch {}
  }

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      <button
        type="button"
        aria-label="Notificações"
        style={BELL_STYLE}
        onClick={() => setOpen((o) => !o)}
      >
        🔔
        {unreadCount > 0 && (
          <span style={BADGE_STYLE}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div style={PANEL_STYLE}>
          <div style={{ padding: 'var(--space-2)', fontWeight: 700 }}>
            Notificações
          </div>
          {loading ? (
            <div style={{ ...ITEM_STYLE, color: 'var(--text-muted)' }}>
              Carregando...
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ ...ITEM_STYLE, color: 'var(--text-muted)' }}>
              Nenhuma notificação
            </div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {notifications.map((n) => {
                const inv = n.friendInvite
                return (
                  <li key={n.id} style={ITEM_STYLE}>
                    {n.type === 'friend_invite' && inv && (
                      <>
                        <span style={{ color: 'var(--text-primary)' }}>
                          {inv.fromUser.username}
                          {inv.status === 'pending'
                            ? ' enviou convite de amizade'
                            : ' — Amigos'}
                        </span>
                        {inv.status === 'pending' && (
                          <div
                            style={{
                              marginTop: 'var(--space-2)',
                              display: 'flex',
                              gap: 'var(--space-2)',
                            }}
                          >
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleAccept(inv.id, n.id)}
                            >
                              Aceitar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReject(inv.id, n.id)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
