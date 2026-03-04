type Props = {
  guessedLetters: string[];
  disabled?: boolean;
  onLetterClick: (letter: string) => void;
};

const LAYOUT = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

export default function HangmanKeyboard({ guessedLetters, disabled, onLetterClick }: Props) {
  const guessedSet = new Set(guessedLetters.map((l) => l.toUpperCase()));

  return (
    <div className="hangman-keyboard" aria-hidden={disabled}>
      {LAYOUT.map((row) => (
        <div key={row} className="hangman-keyboard__row">
          {row.split('').map((letter) => {
            const isGuessed = guessedSet.has(letter);
            return (
              <button
                key={letter}
                type="button"
                className={[
                  'hangman-keyboard__key',
                  isGuessed ? 'hangman-keyboard__key--used' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => !disabled && !isGuessed && onLetterClick(letter)}
                disabled={disabled || isGuessed}
              >
                {letter}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

