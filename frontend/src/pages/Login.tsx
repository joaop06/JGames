import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Card, Input } from '../components/ui'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()

  if (user) {
    navigate('/', { replace: true })
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-5)',
      }}
    >
      <Card
        glow
        style={{
          width: '100%',
          maxWidth: 360,
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            marginBottom: 'var(--space-5)',
            fontSize: 'var(--size-2xl)',
          }}
        >
          Entrar
        </h1>
        <form onSubmit={handleSubmit}>
          {error && (
            <p
              role="alert"
              style={{
                color: 'var(--danger)',
                marginBottom: 'var(--space-4)',
                fontSize: 'var(--size-sm)',
              }}
            >
              {error}
            </p>
          )}
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        <p style={{ marginTop: 'var(--space-4)', color: 'var(--text-muted)' }}>
          Não tem conta? <Link to="/register">Cadastre-se</Link>
        </p>
      </Card>
    </div>
  )
}
