import { useAuth } from '../context/AuthContext'
import { Card } from '../components/ui'

export default function Profile() {
  const { user } = useAuth()
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-4)' }}>
        Perfil
      </h1>
      {user && (
        <Card glow>
          <p><strong>Usuário:</strong> {user.username}</p>
          <p><strong>E-mail:</strong> {user.email}</p>
          <p><strong>ID:</strong> {user.id}</p>
          <p style={{ marginTop: 'var(--space-4)', color: 'var(--text-muted)' }}>
            Estatísticas gerais e por jogo serão exibidas aqui no futuro.
          </p>
        </Card>
      )}
    </div>
  )
}
