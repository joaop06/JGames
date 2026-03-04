import { randomUUID } from 'crypto';
import { AppDataSource, getRepository } from './db.js';
import { HangmanWord } from '../entities/HangmanWord.js';
import { HangmanGame, type HangmanMode, type HangmanStatus } from '../entities/HangmanGame.js';
import { HangmanDailyWord } from '../entities/HangmanDailyWord.js';

export type HangmanDifficulty = 'easy' | 'medium' | 'hard';

export type HangmanGameState = {
  gameId: string;
  mode: HangmanMode;
  category: { id: string; name: string } | null;
  difficulty: HangmanDifficulty;
  maskedWord: string;
  maxErrors: number;
  errorsRemaining: number;
  guessedLetters: string[];
  hintsAvailable: number;
  hintsUsed: number;
  status: HangmanStatus;
  timerSeconds: number | null;
};

export type HangmanGuessResult = HangmanGameState & {
  letter: string;
  correct: boolean;
  revealedWord?: string;
  score?: number;
};

export type HangmanHintResult = HangmanGameState & {
  revealedLetter: string;
  positions: number[];
  scorePenalty: number;
};

export const HANGMAN_GAME_TYPE = 'hangman';

export const HANGMAN_CATEGORIES: { id: string; name: string }[] = [
  { id: 'animals', name: 'Animais' },
  { id: 'countries', name: 'Países' },
  { id: 'movies', name: 'Filmes' },
  { id: 'technology', name: 'Tecnologia' },
  { id: 'sports', name: 'Esportes' },
];

export function getCategoryMeta(categoryId: string | null | undefined) {
  if (!categoryId) return null;
  const found = HANGMAN_CATEGORIES.find((c) => c.id === categoryId);
  if (!found) return null;
  return found;
}

export function normalizeLetter(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error('Letra inválida');
  const base = trimmed[0] ?? '';
  const normalized = base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
  if (!/^[A-Z]$/.test(normalized)) throw new Error('Letra deve estar entre A e Z');
  return normalized;
}

export function buildMaskedWord(wordNormalized: string, guessedLetters: Set<string>): string {
  const chars: string[] = [];
  for (const ch of wordNormalized) {
    if (!/[A-Z]/.test(ch)) {
      chars.push('_');
    } else if (guessedLetters.has(ch)) {
      chars.push(ch);
    } else {
      chars.push('_');
    }
  }
  return chars.join(' ');
}

export function isWin(wordNormalized: string, guessedLetters: Set<string>): boolean {
  for (const ch of wordNormalized) {
    if (/[A-Z]/.test(ch) && !guessedLetters.has(ch)) {
      return false;
    }
  }
  return true;
}

export function selectHintLetter(wordNormalized: string, guessedLetters: Set<string>): string {
  const remaining = new Set<string>();
  for (const ch of wordNormalized) {
    if (/[A-Z]/.test(ch) && !guessedLetters.has(ch)) {
      remaining.add(ch);
    }
  }
  const list = Array.from(remaining);
  if (list.length === 0) {
    throw new Error('Nenhuma letra disponível para dica');
  }
  const idx = Math.floor(Math.random() * list.length);
  return list[idx]!;
}

export function difficultyFromNumber(value: number): HangmanDifficulty {
  if (value <= 1) return 'easy';
  if (value === 2) return 'medium';
  return 'hard';
}

export function difficultyToNumber(d: HangmanDifficulty): number {
  if (d === 'easy') return 1;
  if (d === 'medium') return 2;
  return 3;
}

export function difficultyMultiplier(d: HangmanDifficulty): number {
  if (d === 'easy') return 1;
  if (d === 'medium') return 1.5;
  return 2;
}

export function hintsAvailableForDifficulty(d: HangmanDifficulty): number {
  if (d === 'easy') return 3;
  if (d === 'medium') return 2;
  return 1;
}

export function calculateScore(args: {
  won: boolean;
  maxErrors: number;
  errors: number;
  difficulty: HangmanDifficulty;
  hintsUsed: number;
}): number {
  const base = args.won ? 100 : 0;
  const remainingErrors = Math.max(0, args.maxErrors - args.errors);
  const bonus = remainingErrors * 15;
  const mult = difficultyMultiplier(args.difficulty);
  const penalty = args.hintsUsed * 20;
  let score = (base + bonus) * mult - penalty;
  if (!Number.isFinite(score) || score < 0) score = 0;
  return Math.round(score);
}

export function buildGameState(params: {
  game: HangmanGame;
  word: HangmanWord;
  difficulty: HangmanDifficulty;
}): HangmanGameState {
  const guessedSet = new Set(
    (params.game.guessedLetters ?? '')
      .split('')
      .map((c) => c.trim())
      .filter(Boolean)
  );
  const maskedWord = buildMaskedWord(params.word.textNormalized, guessedSet);
  const hintsAvailable = hintsAvailableForDifficulty(params.difficulty);
  const errorsRemaining = Math.max(0, params.game.maxErrors - params.game.errors);
  return {
    gameId: params.game.id,
    mode: params.game.mode,
    category: getCategoryMeta(params.game.category),
    difficulty: params.difficulty,
    maskedWord,
    maxErrors: params.game.maxErrors,
    errorsRemaining,
    guessedLetters: Array.from(guessedSet),
    hintsAvailable,
    hintsUsed: params.game.hintsUsed,
    status: params.game.status,
    timerSeconds: params.game.timerSeconds ?? null,
  };
}

export function applyGuessToGame(args: {
  game: HangmanGame;
  word: HangmanWord;
  rawLetter: string;
}): { updated: HangmanGame; correct: boolean; status: HangmanStatus } {
  if (args.game.status !== 'playing') {
    throw new Error('Partida já finalizada');
  }
  const letter = normalizeLetter(args.rawLetter);
  const guessed = (args.game.guessedLetters ?? '')
    .split('')
    .map((c) => c.trim())
    .filter(Boolean);
  const guessedSet = new Set(guessed);
  if (guessedSet.has(letter)) {
    throw new Error('Letra já utilizada');
  }
  guessedSet.add(letter);

  const wordSet = new Set(
    args.word.textNormalized
      .split('')
      .filter((ch) => /[A-Z]/.test(ch))
  );
  const correct = wordSet.has(letter);

  const updated = { ...args.game };
  updated.guessedLetters = Array.from(guessedSet).join('');
  if (!correct) {
    updated.errors = (updated.errors ?? 0) + 1;
  }

  const win = isWin(args.word.textNormalized, guessedSet);
  const maxErrors = updated.maxErrors ?? 6;
  const lost = updated.errors >= maxErrors;
  let status: HangmanStatus = updated.status;
  if (win) status = 'won';
  else if (lost) status = 'lost';
  else status = 'playing';
  updated.status = status;
  if (status === 'won' || status === 'lost') {
    updated.finishedAt = new Date();
  }

  return { updated, correct, status };
}

export async function pickRandomWord(options: {
  categoryId?: string;
  difficulty: HangmanDifficulty;
  language?: string;
}) {
  const language = options.language ?? 'pt-BR';
  const repo = getRepository(HangmanWord);

  const qb = repo
    .createQueryBuilder('w')
    .where('w.language = :language', { language })
    .andWhere('w.active = :active', { active: true })
    .andWhere('w.difficulty = :difficulty', { difficulty: difficultyToNumber(options.difficulty) });

  if (options.categoryId) {
    qb.andWhere('w.category = :category', { category: options.categoryId });
  }

  const rows = await qb.getMany();
  if (!rows.length) {
    throw new Error('Nenhuma palavra disponível para esta configuração');
  }
  const idx = Math.floor(Math.random() * rows.length);
  return rows[idx]!;
}

export async function getDailyWord(options: {
  date: Date;
  language?: string;
}) {
  const language = options.language ?? 'pt-BR';
  const day = options.date.toISOString().slice(0, 10);

  const repo = getRepository(HangmanDailyWord);
  const wordRepo = getRepository(HangmanWord);

  const existing = await repo.findOne({
    where: { date: day, language },
    relations: { word: true },
  });
  if (existing?.word && existing.word.active) {
    return existing.word;
  }

  const allWords = await wordRepo.find({
    where: { language, active: true },
    order: { id: 'ASC' },
  });
  if (!allWords.length) {
    throw new Error('Nenhuma palavra disponível para palavra do dia');
  }
  const hashBase = Number(day.replace(/-/g, ''));
  const idx = hashBase % allWords.length;
  const chosen = allWords[idx]!;

  const daily = repo.create({
    date: day,
    language,
    wordId: chosen.id,
    createdAt: new Date(),
  });
  await repo.save(daily);
  return chosen;
}

export function revealOriginalWord(word: HangmanWord): string {
  return word.textOriginal;
}

