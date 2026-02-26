import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Toast from '../Toast'
import RealtimeToastsHandler from '../RealtimeToastsHandler'
import NotificationPanel from '../NotificationPanel'

const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  color: isActive ? 'var(--accent-hover)' : 'var(--accent)',
  fontWeight: isActive ? 700 : 400,
  textDecoration: isActive ? 'underline' : 'none',
  padding: 'var(--space-2) var(--space-3)',
  borderRadius: 'var(--radius-md)',
  transition: 'color var(--transition-fast), background var(--transition-fast)',
})

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  function closeDrawer() {
    setMenuOpen(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <RealtimeToastsHandler />
      <Toast />
      <header
        className="layout-header"
        style={{
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--accent)',
          boxShadow: 'var(--shadow-card), 0 4px 0 0 rgba(0, 212, 255, 0.15)',
        }}
      >
        <nav
          style={{
            maxWidth: 960,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-5)',
            flexWrap: 'wrap',
          }}
        >
          <NavLink
            to="/"
            style={({ isActive }) => ({
              ...navLinkStyle({ isActive }),
              display: 'flex',
              alignItems: 'center',
            })}
          >
            <img src="/logo.png" alt="JGames" className="header-logo-img" />
          </NavLink>
          <div className="desktop-nav-links" style={{ alignItems: 'center', gap: 'var(--space-4)' }}>
            <NavLink to="/" style={navLinkStyle}>
              Início
            </NavLink>
            <NavLink to="/profile" style={navLinkStyle}>
              Perfil
            </NavLink>
            <NavLink to="/friends" style={navLinkStyle}>
              Amigos
            </NavLink>
            <NavLink to="/games/tic-tac-toe" style={navLinkStyle}>
              Jogo da Velha
            </NavLink>
            {user && (
              <>
                <NotificationPanel />
                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--size-sm)' }}>
                  {user.username}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    fontSize: 'var(--size-sm)',
                    transition: 'color var(--transition-fast), border-color var(--transition-fast)',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = 'var(--text-primary)'
                    e.currentTarget.style.borderColor = 'var(--accent)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = 'var(--text-muted)'
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                >
                  Sair
                </button>
              </>
            )}
          </div>
          {user && (
            <div className="mobile-header-actions">
              <NotificationPanel />
              <button
                type="button"
                className="mobile-menu-btn"
                onClick={() => setMenuOpen(true)}
                aria-label="Abrir menu"
              >
                &#9776;
              </button>
            </div>
          )}
        </nav>
      </header>

      <div
        className={`drawer-backdrop ${menuOpen ? 'is-open' : ''}`}
        onClick={closeDrawer}
        aria-hidden
      />
      <aside className={`drawer ${menuOpen ? 'is-open' : ''}`} aria-label="Menu de navegação">
        <button type="button" className="drawer-close" onClick={closeDrawer} aria-label="Fechar menu">
          &#215;
        </button>
        <NavLink to="/" className="drawer-nav-link" onClick={closeDrawer}>
          Início
        </NavLink>
        <NavLink to="/profile" className="drawer-nav-link" onClick={closeDrawer}>
          Perfil
        </NavLink>
        <NavLink to="/friends" className="drawer-nav-link" onClick={closeDrawer}>
          Amigos
        </NavLink>
        <NavLink to="/games/tic-tac-toe" className="drawer-nav-link" onClick={closeDrawer}>
          Jogo da Velha
        </NavLink>
        {user && (
          <>
            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--size-sm)', padding: 'var(--space-3)' }}>
              {user.username}
            </span>
            <button
              type="button"
              onClick={() => {
                closeDrawer()
                handleLogout()
              }}
              style={{
                padding: 'var(--space-3)',
                minHeight: 44,
                borderRadius: 'var(--radius-md)',
                background: 'transparent',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                fontSize: 'var(--size-base)',
                marginTop: 'auto',
              }}
            >
              Sair
            </button>
          </>
        )}
      </aside>

      <main
        className="layout-main"
        style={{
          flex: 1,
          maxWidth: 960,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <Outlet />
      </main>
    </div>
  )
}
