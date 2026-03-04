import assert from 'node:assert/strict';
import {
  normalizeLetter,
  buildMaskedWord,
  isWin,
  selectHintLetter,
  calculateScore,
} from '../src/lib/hangman.js';
import { hangmanStartSchema } from '../src/lib/validation.js';

function test(name: string, fn: () => void) {
  try {
    fn();
    // eslint-disable-next-line no-console
    console.log(`✓ ${name}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`✗ ${name}`);
    throw err;
  }
}

test('normalizeLetter normaliza acentos e caixa', () => {
  assert.equal(normalizeLetter('á'), 'A');
  assert.equal(normalizeLetter('b'), 'B');
  assert.equal(normalizeLetter('Ç'), 'C');
});

test('buildMaskedWord mascara letras não descobertas', () => {
  const word = 'COMPUTADOR';
  const guessed = new Set<string>(['C', 'O', 'R']);
  const masked = buildMaskedWord(word, guessed);
  assert.equal(masked, 'C O _ _ _ _ _ _ O R');
});

test('isWin detecta vitória quando todas letras foram descobertas', () => {
  const word = 'GATO';
  const guessed = new Set<string>(['G', 'A', 'T', 'O']);
  assert.ok(isWin(word, guessed));
});

test('isWin não acusa vitória quando falta letra', () => {
  const word = 'GATO';
  const guessed = new Set<string>(['G', 'A', 'T']);
  assert.ok(!isWin(word, guessed));
});

test('selectHintLetter escolhe letra restante da palavra', () => {
  const word = 'BANANA';
  const guessed = new Set<string>(['B']);
  const hint = selectHintLetter(word, guessed);
  assert.ok(['A', 'N'].includes(hint));
});

test('selectHintLetter lança erro quando não há letras restantes', () => {
  const word = 'AAA';
  const guessed = new Set<string>(['A']);
  assert.throws(
    () => {
      selectHintLetter(word, guessed);
    },
    /Nenhuma letra disponível/
  );
});

test('calculateScore calcula pontuação básica de vitória', () => {
  const score = calculateScore({
    won: true,
    maxErrors: 6,
    errors: 2,
    difficulty: 'easy',
    hintsUsed: 0,
  });
  // base 100 + bonus (4 * 15) = 160
  assert.equal(score, 160);
});

test('calculateScore aplica multiplicador de dificuldade e penalidade de dicas', () => {
  const score = calculateScore({
    won: true,
    maxErrors: 6,
    errors: 1,
    difficulty: 'hard',
    hintsUsed: 2,
  });
  // base 100 + bonus (5 * 15) = 175
  // multiplier hard = 2 => 350
  // penalty = 40 => 310
  assert.equal(score, 310);
});

test('calculateScore nunca retorna valor negativo', () => {
  const score = calculateScore({
    won: false,
    maxErrors: 6,
    errors: 6,
    difficulty: 'hard',
    hintsUsed: 10,
  });
  assert.equal(score, 0);
});

test('hangmanStartSchema aceita ausência de timerSeconds', () => {
  const result = hangmanStartSchema.safeParse({
    difficulty: 'easy',
    mode: 'single',
  });
  assert.equal(result.success, true);
});

test('hangmanStartSchema aceita timerSeconds numérico válido', () => {
  const result = hangmanStartSchema.safeParse({
    difficulty: 'medium',
    mode: 'single',
    timerSeconds: 120,
  });
  assert.equal(result.success, true);
});

test('hangmanStartSchema rejeita timerSeconds abaixo do mínimo', () => {
  const result = hangmanStartSchema.safeParse({
    difficulty: 'easy',
    mode: 'single',
    timerSeconds: 5,
  });
  assert.equal(result.success, false);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    assert.ok(
      (fieldErrors.timerSeconds ?? []).some((msg) =>
        String(msg).includes('Timer deve ter pelo menos 10 segundos')
      )
    );
  }
});

