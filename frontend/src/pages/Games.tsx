import { Link } from 'react-router-dom'
import { Card } from '../components/ui'

export default function Games() {
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-4)' }}>
        Jogos
      </h1>
      <p style={{ marginBottom: 'var(--space-6)', color: 'var(--text-muted)' }}>
        Escolha um jogo para jogar.
      </p>
      <div className="home-games">
        <Link to="/games/tic-tac-toe" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Card
            style={{
              textAlign: 'center',
              transition: 'box-shadow var(--transition-normal)',
              height: '100%',
            }}
            onMouseOver={(e: React.MouseEvent<HTMLDivElement>) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-card), 0 0 16px var(--glow)'
            }}
            onMouseOut={(e: React.MouseEvent<HTMLDivElement>) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-card)'
            }}
          >
            <div
              style={{
                aspectRatio: '1',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-3)',
              }}
              aria-hidden
            >
              <svg
                viewBox="0 0 100 100"
                style={{ width: '100%', height: '100%', display: 'block' }}
                fill="none"
              >
                <g stroke="var(--border)" strokeWidth="2.5" opacity="0.8">
                  <line x1="33.33" y1="5" x2="33.33" y2="95" />
                  <line x1="66.66" y1="5" x2="66.66" y2="95" />
                  <line x1="5" y1="33.33" x2="95" y2="33.33" />
                  <line x1="5" y1="66.66" x2="95" y2="66.66" />
                </g>
                <g stroke="var(--accent)" strokeWidth="4" strokeLinecap="round">
                  <line x1="12" y1="12" x2="26" y2="26" />
                  <line x1="26" y1="12" x2="12" y2="26" />
                </g>
                <circle cx="50" cy="50" r="10" stroke="var(--success)" strokeWidth="3.5" />
                <g stroke="var(--accent)" strokeWidth="4" strokeLinecap="round">
                  <line x1="74" y1="74" x2="88" y2="88" />
                  <line x1="88" y1="74" x2="74" y2="88" />
                </g>
                <circle cx="50" cy="50" r="14" fill="none" stroke="var(--glow)" strokeWidth="1" opacity="0.6" />
              </svg>
            </div>
            <span style={{ fontSize: 'var(--size-sm)' }}>Jogo da Velha</span>
          </Card>
        </Link>
      </div>
    </div>
  )
}
