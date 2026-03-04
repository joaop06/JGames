import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Alert, Button, Card, Input } from '../components/ui';
import { normalizeUsername } from '../utils/username';
import FriendsSection from '../components/FriendsSection';
import GameStatsPills from '../components/GameStatsPills';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [tttStats, setTttStats] = useState<{ wins: number; losses: number; draws: number } | null>(
    null
  );
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    api
      .getTicTacToeStats()
      .then((res) => setTttStats(res.stats))
      .catch(() => setTttStats(null));
  }, []);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setName(user.name ?? '');
      setEmail(user.email ?? '');
      setIsEditing(false);
    }
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      await api.patchMe({
        username: username,
        name: name.trim(),
        email: email.trim() || undefined,
      });
      await refreshUser();
      setSuccess('Perfil atualizado com sucesso.');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  }

  function handleStartEditing() {
    if (!user) return;
    setError(null);
    setSuccess(null);
    setUsername(user.username);
    setName(user.name ?? '');
    setEmail(user.email ?? '');
    setIsEditing(true);
  }

  function handleCancelEditing() {
    if (!user) return;
    setError(null);
    setSuccess(null);
    setUsername(user.username);
    setName(user.name ?? '');
    setEmail(user.email ?? '');
    setIsEditing(false);
  }

  return (
    <div>
      <h1 className="page-title">Perfil</h1>
      {user && (
        <div className="profile-layout">
          <section className="profile-main">
            <Card glow>
              {error && (
                <Alert variant="error" style={{ marginBottom: 'var(--space-3)' }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert variant="info" style={{ marginBottom: 'var(--space-3)' }}>
                  {success}
                </Alert>
              )}
              {isEditing ? (
                <form onSubmit={handleSave}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <Input
                      label="Nome"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      maxLength={50}
                      autoComplete="name"
                    />
                    <Input
                      label="Nome de usuário"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(normalizeUsername(e.target.value))}
                      required
                      minLength={2}
                      maxLength={32}
                      autoComplete="username"
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: 'var(--space-3)',
                      marginTop: 'var(--space-4)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Button type="submit" variant="primary" size="md" loading={saving}>
                      {saving ? 'Salvando...' : 'Salvar perfil'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="md"
                      onClick={handleCancelEditing}
                      disabled={saving}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)',
                  }}
                >
                  <p>
                    <strong>Nome:</strong> {user.name || '—'}
                  </p>
                  <p>
                    <strong>Nome de usuário:</strong> {user.username}
                  </p>
                  {user.email && (
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    style={{ marginTop: 'var(--space-3)', alignSelf: 'flex-start' }}
                    onClick={handleStartEditing}
                  >
                    Editar perfil
                  </Button>
                </div>
              )}
            </Card>
          </section>

          <section className="profile-friends">
            <FriendsSection />
          </section>

          <section className="profile-stats">
            <Card>
              <h2 className="section-title">Jogo da Velha</h2>
              {tttStats != null ? (
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <GameStatsPills
                    wins={tttStats.wins}
                    losses={tttStats.losses}
                    draws={tttStats.draws}
                  />
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>Carregando estatísticas...</p>
              )}
              <Link
                to="/games/tic-tac-toe"
                style={{ color: 'var(--accent)', fontSize: 'var(--size-sm)' }}
              >
                Ir para o Jogo da Velha →
              </Link>
            </Card>
          </section>
        </div>
      )}
    </div>
  );
}
