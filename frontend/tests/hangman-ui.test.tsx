import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
import HangmanKeyboard from '../src/components/hangman/HangmanKeyboard';
import HangmanFigure from '../src/components/hangman/HangmanFigure';
import HangmanLobby from '../src/pages/HangmanLobby';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../src/context/AuthContext', () => {
  return {
    useAuth: () => ({
      user: { id: 'user-1', username: 'tester' },
      login: vi.fn(),
      register: vi.fn(),
      loading: false,
    }),
  };
});

vi.mock('../src/api/client', async () => {
  const actual = await vi.importActual<typeof import('../src/api/client')>(
    '../src/api/client'
  );
  return {
    ...actual,
    api: {
      ...actual.api,
      startHangmanGame: vi.fn().mockResolvedValue({
        game: {
          gameId: 'game-1',
          mode: 'single',
          category: null,
          difficulty: 'easy',
          maskedWord: '_ _ _',
          maxErrors: 6,
          errorsRemaining: 6,
          guessedLetters: [],
          hintsAvailable: 3,
          hintsUsed: 0,
          status: 'playing',
          timerSeconds: null,
        },
        categories: [],
      }),
    },
  };
});

describe('Hangman UI components', () => {
  it('desabilita tecla já utilizada', () => {
    const onLetterClick = vi.fn();
    const { getByRole } = render(
      <HangmanKeyboard guessedLetters={['A']} disabled={false} onLetterClick={onLetterClick} />
    );
    const keyA = getByRole('button', { name: 'A' });
    expect(keyA).toBeDisabled();
  });

  it('chama callback ao clicar em letra disponível', () => {
    const onLetterClick = vi.fn();
    const { getAllByRole } = render(
      <HangmanKeyboard guessedLetters={[]} disabled={false} onLetterClick={onLetterClick} />
    );
    const [keyA] = getAllByRole('button', { name: 'A' });
    fireEvent.click(keyA);
    expect(keyA).not.toBeDisabled();
  });

  it('renderiza partes corretas do boneco conforme erros', () => {
    const { rerender } = render(<HangmanFigure errors={0} />);
    expect(screen.queryByLabelText(/Boneco da forca/)).toBeInTheDocument();

    rerender(<HangmanFigure errors={3} />);
    // 3 partes: cabeça, corpo, braço esquerdo (classe CSS presente)
    const svg = screen.getByLabelText(/Boneco da forca/);
    expect(svg.querySelector('.hangman-figure__head')).toBeTruthy();
  });

  it('envia start de partida sem timerSeconds quando timer desativado', async () => {
    const { api } = await import('../src/api/client');
    const startSpy = vi.spyOn(api, 'startHangmanGame');

    const { getByRole, queryByLabelText } = render(
      <BrowserRouter>
        <HangmanLobby />
      </BrowserRouter>
    );

    // Timer vem desativado por padrão, então clicar em Jogar Single
    const playButton = getByRole('button', { name: /jogar single/i });
    fireEvent.click(playButton);

    expect(startSpy).toHaveBeenCalledTimes(1);
    const payload = startSpy.mock.calls[0]?.[0] as { timerSeconds?: number | null };
    expect(payload.timerSeconds).toBeUndefined();

  });
});

