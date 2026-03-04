type Props = {
  maskedWord: string;
  status: 'playing' | 'won' | 'lost';
  revealedWord?: string;
};

export default function HangmanWordSlots({ maskedWord, status, revealedWord }: Props) {
  const letters = maskedWord.split(' ');
  const finalWord = revealedWord ?? letters.join('');

  return (
    <div className="hangman-word" aria-label="Palavra secreta">
      {letters.map((ch, idx) => {
        const isRevealed = ch !== '_' && ch !== '';
        const originalChar = finalWord[idx] ?? '';
        const isMissed =
          status === 'lost' && (ch === '_' || ch === '') && originalChar && originalChar !== '_';

        return (
          <span
            key={idx}
            className={[
              'hangman-word__slot',
              isRevealed ? 'hangman-word__slot--revealed' : '',
              isMissed ? 'hangman-word__slot--missed' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-hidden={!isRevealed && !isMissed}
          >
            {isRevealed || isMissed ? originalChar : ''}
          </span>
        );
      })}
    </div>
  );
}

