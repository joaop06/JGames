import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  api,
  type HangmanGameState,
  type HangmanGuessResponse,
} from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Card, Button } from '../components/ui';
import HangmanFigure from '../components/hangman/HangmanFigure';
import HangmanWordSlots from '../components/hangman/HangmanWordSlots';
import HangmanKeyboard from '../components/hangman/HangmanKeyboard';
import HangmanInfoPanel from '../components/hangman/HangmanInfoPanel';

type LocationState = {
  initialGame?: HangmanGameState;
};

type StatusView = 'idle' | 'loading' | 'playing' | 'won' | 'lost' | 'error';

export default function HangmanGamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [game, setGame] = useState<HangmanGameState | null>(
    (location.state as LocationState | null)?.initialGame ?? null
  );
  const [status, setStatus] = useState<StatusView>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isRequestPending, setIsRequestPending] = useState(false);
  const [revealedWord, setRevealedWord] = useState<string | undefined>();
  const [finalScore, setFinalScore] = useState<number | undefined>();
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!gameId) {
      setStatus('error');
      setError('Partida não encontrada.');
      return;
    }
    if (game) {
      setStatus(game.status === 'playing' ? 'playing' : game.status);
      if (game.timerSeconds != null) {
        setTimerRemaining(game.timerSeconds);
      }
      return;
    }

    setStatus('loading');
    api
      .getHangmanGame(gameId)
      .then((loaded) => {
        setGame(loaded);
        setStatus(loaded.status === 'playing' ? 'playing' : loaded.status);
        if (loaded.timerSeconds != null) {
          setTimerRemaining(loaded.timerSeconds);
        }
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Não foi possível carregar a partida.';
        setError(msg);
        setStatus('error');
      });
  }, [gameId, game]);

  useEffect(() => {
    if (timerRemaining == null || status !== 'playing') return;
    const id = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev == null) return null;
        if (prev <= 1) {
          clearInterval(id);
          setStatus('lost');
          setError('Tempo esgotado! A palavra permanece em segredo.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRemaining, status]);

  const handleGuessResult = (res: HangmanGuessResponse) => {
    const nextGame: HangmanGameState = {
      gameId: res.gameId,
      mode: res.mode,
      category: res.category,
      difficulty: res.difficulty,
      maskedWord: res.maskedWord,
      maxErrors: res.maxErrors,
      errorsRemaining: res.errorsRemaining,
      guessedLetters: res.guessedLetters,
      hintsAvailable: res.hintsAvailable,
      hintsUsed: res.hintsUsed,
      status: res.status,
      timerSeconds: res.timerSeconds ?? null,
    };
    setGame(nextGame);
    if (res.revealedWord) setRevealedWord(res.revealedWord);
    if (res.score != null) setFinalScore(res.score);
    if (res.status === 'won' || res.status === 'lost') {
      setStatus(res.status);
    } else {
      setStatus('playing');
    }
  };

  const handleLetterClick = useCallback(
    async (letter: string) => {
      if (!game || !gameId || status !== 'playing' || isRequestPending) return;
      setIsRequestPending(true);
      setError(null);
      try {
        const res = await api.guessHangman(gameId, letter);
        handleGuessResult(res);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Não foi possível enviar a jogada.';
        setError(msg);
      } finally {
        setIsRequestPending(false);
      }
    },
    [game, gameId, status, isRequestPending]
  );

  const handleRequestHint = async () => {
    if (!game || !gameId || status !== 'playing' || isRequestPending) return;
    setIsRequestPending(true);
    setError(null);
    try {
      const res = await api.requestHangmanHint(gameId);
      const nextGame: HangmanGameState = {
        gameId: res.gameId,
        mode: res.mode,
        category: res.category,
        difficulty: res.difficulty,
        maskedWord: res.maskedWord,
        maxErrors: res.maxErrors,
        errorsRemaining: res.errorsRemaining,
        guessedLetters: res.guessedLetters,
        hintsAvailable: res.hintsAvailable,
        hintsUsed: res.hintsUsed,
        status: res.status,
        timerSeconds: res.timerSeconds ?? null,
      };
      setGame(nextGame);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Não foi possível pedir dica.';
      setError(msg);
    } finally {
      setIsRequestPending(false);
    }
  };

  useEffect(() => {
    if (status !== 'playing') return;
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        e.preventDefault();
        handleLetterClick(key);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [status, handleLetterClick]);

  if (!gameId) {
    return (
      <div className="hangman-game">
        <Card>
          <p>Partida não encontrada.</p>
          <Button variant="ghost" onClick={() => navigate('/games/hangman')}>
            Voltar ao lobby
          </Button>
        </Card>
      </div>
    );
  }

  if (!game || status === 'loading') {
    return (
      <div className="hangman-game">
        <div className="hangman-game__loading" role="status">
          Carregando partida...
        </div>
      </div>
    );
  }

  const isFinished = status === 'won' || status === 'lost';

  return (
    <div className="hangman-game">
      <header className="hangman-game__hero">
        <h1>Jogo da Forca</h1>
        <Button
          variant="ghost"
          size="sm"
          className="hangman-game__back-btn"
          onClick={() => navigate('/games/hangman')}
        >
          ← Lobby
        </Button>
      </header>

      {error && (
        <div className="hangman-game__error" role="alert">
          {error}
        </div>
      )}

      <div className="hangman-game__layout">
        <Card className="hangman-game__figure-card">
          <HangmanFigure errors={game.maxErrors - game.errorsRemaining} />
        </Card>

        <div className="hangman-game__main">
          <Card className="hangman-game__word-card">
            <HangmanWordSlots
              maskedWord={game.maskedWord}
              status={status === 'won' || status === 'lost' ? status : 'playing'}
              revealedWord={revealedWord}
            />
          </Card>

          <HangmanKeyboard
            guessedLetters={game.guessedLetters}
            disabled={isFinished || isRequestPending}
            onLetterClick={handleLetterClick}
          />
        </div>

        <Card className="hangman-game__info-card">
          <HangmanInfoPanel
            mode={game.mode}
            category={game.category}
            difficulty={game.difficulty}
            maxErrors={game.maxErrors}
            errorsRemaining={game.errorsRemaining}
            hintsAvailable={game.hintsAvailable}
            hintsUsed={game.hintsUsed}
            timerSeconds={timerRemaining}
            onRequestHint={handleRequestHint}
            hintDisabled={isFinished || isRequestPending}
          />
        </Card>
      </div>

      {isFinished && (
        <Card className="hangman-game__result-card">
          <h2>{status === 'won' ? 'Você venceu!' : 'Game over'}</h2>
          {revealedWord && (
            <p>
              A palavra era: <strong>{revealedWord}</strong>
            </p>
          )}
          {finalScore != null && (
            <p>
              Pontuação:{' '}
              <strong>
                {finalScore} ponto{finalScore === 1 ? '' : 's'}
              </strong>
            </p>
          )}
          <div className="hangman-game__result-actions">
            <Button className="lobby-btn" onClick={() => navigate('/games/hangman')}>
              Jogar novamente
            </Button>
            {user && (
              <Button
                variant="ghost"
                className="lobby-btn"
                onClick={() => navigate('/games/hangman/stats')}
              >
                Ver estatísticas
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

