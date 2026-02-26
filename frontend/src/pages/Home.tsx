import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Card } from '../components/ui'

export default function Home() {
  const { user } = useAuth()
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-4)' }}>
        JGames
      </h1>
      <p style={{ marginBottom: 'var(--space-6)', fontSize: 'var(--size-lg)' }}>
        Olá, <strong>{user?.username}</strong>. Em breve você poderá jogar jogos multiplayer aqui.
      </p>

      <section style={{ marginBottom: 'var(--space-6)' }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--size-lg)',
            marginBottom: 'var(--space-4)',
          }}
        >
          Atalhos
        </h2>
        <div className="home-shortcuts">
          <Link
            to="/profile"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Card
              style={{
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
              <strong>Perfil</strong>
              <p style={{ margin: 0, marginTop: 'var(--space-2)', color: 'var(--text-muted)', fontSize: 'var(--size-sm)' }}>
                Ver e editar seu perfil
              </p>
            </Card>
          </Link>
          <Link
            to="/games"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Card
              style={{
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
              <strong>Jogos</strong>
              <p style={{ margin: 0, marginTop: 'var(--space-2)', color: 'var(--text-muted)', fontSize: 'var(--size-sm)' }}>
                Ver jogos da plataforma
              </p>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  )
}
