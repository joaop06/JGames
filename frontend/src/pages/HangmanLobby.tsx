import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type HangmanDifficulty, type HangmanMode } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Card, Button } from '../components/ui';

type DifficultyOption = {
  value: HangmanDifficulty;
  label: string;
  description: string;
};

const DIFFICULTIES: DifficultyOption[] = [
  { value: 'easy', label: 'Fácil', description: 'Mais chances de acertar, palavras menores.' },
  { value: 'medium', label: 'Médio', description: 'Equilíbrio entre desafio e diversão.' },
  { value: 'hard', label: 'Difícil', description: 'Palavras longas e desafiadoras.' },
];

const CATEGORIES = [
  { id: '', label: 'Aleatória' },
  { id: 'animals', label: 'Animais' },
  { id: 'countries', label: 'Países' },
  { id: 'movies', label: 'Filmes' },
  { id: 'technology', label: 'Tecnologia' },
  { id: 'sports', label: 'Esportes' },
];

export default function HangmanLobby() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categoryId, setCategoryId] = useState<string>('');
  const [difficulty, setDifficulty] = useState<HangmanDifficulty>('easy');
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
  }, [categoryId, difficulty, timerEnabled, timerSeconds]);

  const handleStart = async (selectedMode: HangmanMode) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const body: {
        categoryId?: string;
        difficulty: HangmanDifficulty;
        mode: HangmanMode;
        timerSeconds?: number;
      } = {
        categoryId: categoryId || undefined,
        difficulty,
        mode: selectedMode,
      };

      if (timerEnabled) {
        body.timerSeconds = timerSeconds;
      }

      const res = await api.startHangmanGame(body);
      navigate(`/games/hangman/play/${res.game.gameId}`, { state: { initialGame: res.game } });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Não foi possível iniciar a partida.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hangman-lobby">
      <header className="hangman-lobby__hero">
        <div className="hangman-lobby__icon" aria-hidden>
          <span>🅰</span>
        </div>
        <h1>Jogo da Forca</h1>
        <p>Descubra a palavra secreta antes que o boneco seja enforcado.</p>
      </header>

      {error && (
        <div className="hangman-lobby__error" role="alert">
          {error}
        </div>
      )}

      <div className="hangman-lobby__grid">
        <Card>
          <h2 className="hangman-lobby__section-title">Configurações da partida</h2>

          <div className="hangman-lobby__field">
            <label htmlFor="hangman-category">Categoria</label>
            <select
              id="hangman-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="hangman-lobby__field">
            <span className="hangman-lobby__label">Dificuldade</span>
            <div className="hangman-lobby__difficulty">
              {DIFFICULTIES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={[
                    'hangman-lobby__difficulty-btn',
                    difficulty === opt.value ? 'is-active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setDifficulty(opt.value)}
                  aria-pressed={difficulty === opt.value}
                >
                  <span className="hangman-lobby__difficulty-label">{opt.label}</span>
                  <span className="hangman-lobby__difficulty-desc">{opt.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="hangman-lobby__field">
            <label className="hangman-lobby__toggle">
              <input
                type="checkbox"
                checked={timerEnabled}
                onChange={(e) => setTimerEnabled(e.target.checked)}
              />
              <span>Ativar timer por partida (opcional)</span>
            </label>
            {timerEnabled && (
              <input
                type="number"
                min={30}
                max={600}
                step={30}
                value={timerSeconds}
                onChange={(e) => setTimerSeconds(Number(e.target.value) || 60)}
              />
            )}
          </div>
        </Card>

        <Card>
          <h2 className="hangman-lobby__section-title">Como jogar</h2>
          <ul className="hangman-lobby__howto">
            <li>Escolha a categoria e dificuldade.</li>
            <li>Clique nas letras ou use o teclado para tentar adivinhar.</li>
            <li>Cada erro desenha uma parte do boneco (até 6 erros).</li>
            <li>Use dicas com moderação — elas reduzem sua pontuação final.</li>
          </ul>
        </Card>
      </div>

      <div className="hangman-lobby__actions">
        <Button
          className="lobby-btn"
          disabled={loading}
          onClick={() => handleStart('single')}
        >
          {loading ? 'Iniciando...' : 'Jogar Single'}
        </Button>
        <Button
          variant="ghost"
          className="lobby-btn"
          disabled={loading}
          onClick={() => handleStart('daily')}
        >
          {loading ? 'Carregando palavra do dia...' : 'Palavra do dia'}
        </Button>
        <Button
          variant="ghost"
          className="lobby-btn"
          disabled
          aria-disabled
          title="Modo multiplayer será adicionado em breve."
        >
          Multiplayer (em breve)
        </Button>
      </div>
    </div>
  );
}

