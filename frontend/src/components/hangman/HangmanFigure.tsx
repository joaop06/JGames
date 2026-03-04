type Props = {
  errors: number;
};

export default function HangmanFigure({ errors }: Props) {
  const parts = Math.max(0, Math.min(6, errors));

  return (
    <svg
      viewBox="0 0 120 140"
      role="img"
      aria-label={`Boneco da forca com ${parts} partes desenhadas`}
      className="hangman-figure"
    >
      <g className="hangman-figure__gallow" stroke="var(--border)" strokeWidth="4">
        <line x1="20" y1="130" x2="100" y2="130" />
        <line x1="40" y1="130" x2="40" y2="20" />
        <line x1="40" y1="20" x2="80" y2="20" />
        <line x1="80" y1="20" x2="80" y2="32" />
      </g>

      {parts >= 1 && (
        <circle
          className="hangman-figure__part hangman-figure__head"
          cx="80"
          cy="42"
          r="8"
          stroke="var(--accent)"
          strokeWidth="3"
          fill="none"
        />
      )}
      {parts >= 2 && (
        <line
          className="hangman-figure__part hangman-figure__body"
          x1="80"
          y1="50"
          x2="80"
          y2="75"
          stroke="var(--accent)"
          strokeWidth="3"
        />
      )}
      {parts >= 3 && (
        <line
          className="hangman-figure__part hangman-figure__arm-left"
          x1="80"
          y1="56"
          x2="70"
          y2="66"
          stroke="var(--accent)"
          strokeWidth="3"
        />
      )}
      {parts >= 4 && (
        <line
          className="hangman-figure__part hangman-figure__arm-right"
          x1="80"
          y1="56"
          x2="90"
          y2="66"
          stroke="var(--accent)"
          strokeWidth="3"
        />
      )}
      {parts >= 5 && (
        <line
          className="hangman-figure__part hangman-figure__leg-left"
          x1="80"
          y1="75"
          x2="72"
          y2="90"
          stroke="var(--accent-pink)"
          strokeWidth="3"
        />
      )}
      {parts >= 6 && (
        <line
          className="hangman-figure__part hangman-figure__leg-right"
          x1="80"
          y1="75"
          x2="88"
          y2="90"
          stroke="var(--accent-pink)"
          strokeWidth="3"
        />
      )}
    </svg>
  );
}

