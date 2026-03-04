import type {
  HangmanDifficulty,
  HangmanMode,
  HangmanCategoryMeta,
} from '../../api/client';

type Props = {
  mode: HangmanMode;
  category: HangmanCategoryMeta | null;
  difficulty: HangmanDifficulty;
  maxErrors: number;
  errorsRemaining: number;
  hintsAvailable: number;
  hintsUsed: number;
  timerSeconds: number | null;
  onRequestHint: () => void;
  hintDisabled?: boolean;
};

export default function HangmanInfoPanel({
  mode,
  category,
  difficulty,
  maxErrors,
  errorsRemaining,
  hintsAvailable,
  hintsUsed,
  timerSeconds,
  onRequestHint,
  hintDisabled,
}: Props) {
  const usedErrors = maxErrors - errorsRemaining;
  const remainingHints = Math.max(0, hintsAvailable - hintsUsed);

  const difficultyLabel =
    difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Médio' : 'Difícil';
  const modeLabel =
    mode === 'single' ? 'Single-player' : mode === 'daily' ? 'Palavra do dia' : 'Multiplayer';

  return (
    <div className="hangman-info">
      <div className="hangman-info__row">
        <span className="hangman-info__label">Modo</span>
        <span className="hangman-info__value">{modeLabel}</span>
      </div>
      <div className="hangman-info__row">
        <span className="hangman-info__label">Categoria</span>
        <span className="hangman-info__value">{category?.name ?? 'Aleatória'}</span>
      </div>
      <div className="hangman-info__row">
        <span className="hangman-info__label">Dificuldade</span>
        <span className="hangman-info__value">{difficultyLabel}</span>
      </div>
      <div className="hangman-info__row">
        <span className="hangman-info__label">Erros</span>
        <span className="hangman-info__value">
          {usedErrors} / {maxErrors}
        </span>
      </div>
      <div className="hangman-info__row">
        <span className="hangman-info__label">Dicas restantes</span>
        <span className="hangman-info__value">{remainingHints}</span>
      </div>
      {timerSeconds != null && (
        <div className="hangman-info__row">
          <span className="hangman-info__label">Timer</span>
          <span className="hangman-info__value">{timerSeconds}s</span>
        </div>
      )}

      <button
        type="button"
        className="hangman-info__hint-btn lobby-btn"
        onClick={onRequestHint}
        disabled={hintDisabled || remainingHints <= 0}
      >
        Pedir dica
      </button>
    </div>
  );
}

