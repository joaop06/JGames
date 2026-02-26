import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Card, Input } from '../components/ui'

export default function Register() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { register, user, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div
        className="auth-page"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ color: 'var(--text-muted)' }}>Verificando sessão...</p>
      </div>
    )
  }

  if (user) {
    navigate('/', { replace: true })
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register(
        email.trim().toLowerCase(),
        username.trim().toLowerCase(),
        password.trim()
      )
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="auth-page"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
          Cadastro
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
            label="Nome de usuário"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.trim().toLowerCase())}
            required
            minLength={2}
            maxLength={32}
            autoComplete="username"
          />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={submitting}
            className="auth-submit"
            style={{ width: '100%' }}
          >
            {submitting ? 'Cadastrando...' : 'Cadastrar'}
          </Button>
        </form>
        <p style={{ marginTop: 'var(--space-4)', color: 'var(--text-muted)' }}>
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </Card>
    </div>
  )
}
