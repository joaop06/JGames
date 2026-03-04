import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  api,
  type HangmanStatsResponse,
  type HangmanLeaderboardEntry,
  type HangmanLeaderboardPeriod,
} from '../api/client';
import { Card, Button } from '../components/ui';

type Tab = HangmanLeaderboardPeriod;

export default function HangmanStatsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<HangmanStatsResponse | null>(null);
  const [leaderboard, setLeaderboard] = useState<HangmanLeaderboardEntry[]>([]);
  const [period, setPeriod] = useState<Tab>('alltime');
  const [achievements, setAchievements] = useState<{ code: string; unlockedAt: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);

    Promise.all([
      api.getHangmanStats(user.id),
      api.getHangmanLeaderboard(period, 10),
      api.getHangmanAchievements(user.id),
    ])
      .then(([statsRes, leaderboardRes, achievementsRes]) => {
        setStats(statsRes);
        setLeaderboard(leaderboardRes.leaderboard);
        setAchievements(achievementsRes.achievements);
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Não foi possível carregar estatísticas.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [user, period]);

  const handleChangeTab = (tab: Tab) => {
    setPeriod(tab);
  };

  if (!user) {
    return (
      <div className="hangman-stats">
        <p>Você precisa estar autenticado para ver estatísticas.</p>
      </div>
    );
  }

  return (
    <div className="hangman-stats">
      <header className="hangman-stats__hero">
        <h1>Estatísticas — Jogo da Forca</h1>
      </header>

      {error && (
        <div className="hangman-stats__error" role="alert">
          {error}
        </div>
      )}

      {loading && (
        <div className="hangman-stats__loading" role="status">
          Carregando estatísticas...
        </div>
      )}

      {!loading && stats && (
        <div className="hangman-stats__grid">
          <Card>
            <h2 className="hangman-stats__section-title">Resumo</h2>
            <div className="hangman-stats__summary">
              <div>
                <span className="hangman-stats__label">Partidas jogadas</span>
                <span className="hangman-stats__value">{stats.gamesPlayed}</span>
              </div>
              <div>
                <span className="hangman-stats__label">Vitórias</span>
                <span className="hangman-stats__value">{stats.wins}</span>
              </div>
              <div>
                <span className="hangman-stats__label">Derrotas</span>
                <span className="hangman-stats__value">{stats.losses}</span>
              </div>
              <div>
                <span className="hangman-stats__label">Sequência atual</span>
                <span className="hangman-stats__value">{stats.currentStreak}</span>
              </div>
              <div>
                <span className="hangman-stats__label">Melhor sequência</span>
                <span className="hangman-stats__value">{stats.bestStreak}</span>
              </div>
              <div>
                <span className="hangman-stats__label">Média de pontos</span>
                <span className="hangman-stats__value">{stats.averageScore.toFixed(1)}</span>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="hangman-stats__section-title">Conquistas</h2>
            {achievements.length === 0 ? (
              <p className="hangman-stats__muted">Nenhuma conquista desbloqueada ainda.</p>
            ) : (
              <ul className="hangman-stats__achievements">
                {achievements.map((a) => (
                  <li key={a.code}>
                    <span className="hangman-stats__achievement-code">{a.code}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      {!loading && (
        <Card>
          <div className="hangman-stats__leaderboard-header">
            <h2 className="hangman-stats__section-title">Ranking</h2>
            <div className="hangman-stats__tabs" role="tablist" aria-label="Período do ranking">
              <Button
                type="button"
                size="sm"
                variant={period === 'daily' ? 'primary' : 'ghost'}
                onClick={() => handleChangeTab('daily')}
              >
                Diário
              </Button>
              <Button
                type="button"
                size="sm"
                variant={period === 'weekly' ? 'primary' : 'ghost'}
                onClick={() => handleChangeTab('weekly')}
              >
                Semanal
              </Button>
              <Button
                type="button"
                size="sm"
                variant={period === 'alltime' ? 'primary' : 'ghost'}
                onClick={() => handleChangeTab('alltime')}
              >
                Geral
              </Button>
            </div>
          </div>

          {leaderboard.length === 0 ? (
            <p className="hangman-stats__muted">Nenhuma partida contabilizada ainda.</p>
          ) : (
            <table className="hangman-stats__table">
              <thead>
                <tr>
                  <th>Posição</th>
                  <th>Jogador</th>
                  <th>Pontos</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row) => (
                  <tr key={row.userId}>
                    <td>#{row.rank}</td>
                    <td>{row.username}</td>
                    <td>{row.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  );
}

