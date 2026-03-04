import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';
import { getRepository } from '../../lib/db.js';
import { requireAuth } from '../../lib/auth.js';
import { User } from '../../entities/User.js';
import { HangmanWord } from '../../entities/HangmanWord.js';
import { HangmanGame, type HangmanMode } from '../../entities/HangmanGame.js';
import { UserAchievement } from '../../entities/UserAchievement.js';
import {
  hangmanStartSchema,
  hangmanGuessSchema,
  hangmanLeaderboardQuerySchema,
} from '../../lib/validation.js';
import {
  HANGMAN_CATEGORIES,
  buildGameState,
  applyGuessToGame,
  pickRandomWord,
  getDailyWord,
  difficultyToNumber,
  difficultyFromNumber,
  selectHintLetter,
} from '../../lib/hangman.js';
import { finalizeHangmanGameAndUpdateStats, getHangmanStats } from '../../lib/hangman-stats.js';

const MAX_ERRORS = 6;

async function hangmanRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', requireAuth);

  fastify.post<{ Body: unknown }>(
    '/api/games/hangman/start',
    async (request: FastifyRequest<{ Body: unknown }>, reply: FastifyReply) => {
      if (!request.userId) return reply.status(401).send({ error: 'Unauthorized' });
      const parsed = hangmanStartSchema.safeParse(request.body ?? {});
      if (!parsed.success) {
        const flattened = parsed.error.flatten();
        const firstFieldError =
          Object.values(flattened.fieldErrors).flat().find(Boolean) ?? flattened.formErrors[0];
        const errorMessage =
          typeof firstFieldError === 'string' ? firstFieldError : 'Validation failed';
        return reply.status(400).send({ error: errorMessage, details: flattened });
      }
      const { categoryId, difficulty, mode, timerSeconds, multiplayerConfig } = parsed.data;
      const difficultyNumber = difficultyToNumber(difficulty);
      let selectedWord: HangmanWord;
      let resolvedMode: HangmanMode = mode ?? 'single';

      if (resolvedMode === 'daily') {
        selectedWord = (await getDailyWord({ date: new Date(), language: 'pt-BR' })) as HangmanWord;
      } else {
        selectedWord = (await pickRandomWord({
          categoryId: categoryId ?? undefined,
          difficulty,
          language: 'pt-BR',
        })) as HangmanWord;
      }

      const gameRepo = getRepository(HangmanGame);
      const now = new Date();
      const game = gameRepo.create({
        id: randomUUID(),
        userId: request.userId,
        wordId: selectedWord.id,
        mode: resolvedMode,
        category: categoryId ?? selectedWord.category,
        difficulty: difficultyNumber,
        language: selectedWord.language,
        status: 'playing',
        errors: 0,
        maxErrors: MAX_ERRORS,
        hintsUsed: 0,
        guessedLetters: '',
        timerSeconds: timerSeconds ?? null,
        hostUserId: resolvedMode === 'multiplayer' ? request.userId : null,
        opponentUserId: resolvedMode === 'multiplayer' ? multiplayerConfig?.opponentUserId ?? null : null,
        score: 0,
        startedAt: now,
        finishedAt: null,
        updatedAt: now,
      });
      await gameRepo.save(game);

      const state = buildGameState({
        game: game as HangmanGame,
        word: selectedWord as HangmanWord,
        difficulty,
      });

      return reply.status(201).send({
        game: state,
        categories: HANGMAN_CATEGORIES,
      });
    }
  );

  const guessRateLimit = { config: { rateLimit: { max: 30, timeWindow: '1 minute' } } };

  fastify.post<{ Params: { gameId: string }; Body: unknown }>(
    '/api/games/hangman/:gameId/guess',
    guessRateLimit,
    async (
      request: FastifyRequest<{ Params: { gameId: string }; Body: unknown }>,
      reply: FastifyReply
    ) => {
      if (!request.userId) return reply.status(401).send({ error: 'Unauthorized' });
      const parsed = hangmanGuessSchema.safeParse(request.body ?? {});
      if (!parsed.success) {
        const flattened = parsed.error.flatten();
        const firstFieldError =
          Object.values(flattened.fieldErrors).flat().find(Boolean) ?? flattened.formErrors[0];
        const errorMessage =
          typeof firstFieldError === 'string' ? firstFieldError : 'Validation failed';
        return reply.status(400).send({ error: errorMessage, details: flattened });
      }

      const gameRepo = getRepository(HangmanGame);
      const wordRepo = getRepository(HangmanWord);
      const game = await gameRepo.findOne({
        where: { id: request.params.gameId },
      });
      if (!game) return reply.status(404).send({ error: 'Partida não encontrada' });
      if (game.userId !== request.userId) {
        return reply.status(403).send({ error: 'Você não é o jogador desta partida' });
      }

      const word = await wordRepo.findOne({ where: { id: game.wordId } });
      if (!word) return reply.status(500).send({ error: 'Palavra da partida não encontrada' });

      try {
        const { updated, correct, status } = applyGuessToGame({
          game: game as HangmanGame,
          word: word as HangmanWord,
          rawLetter: parsed.data.letter,
        });

        let finalScore: number | undefined;
        let revealedWord: string | undefined;

        if (status === 'won' || status === 'lost') {
          const finalizeResult = await finalizeHangmanGameAndUpdateStats(updated);
          finalScore = finalizeResult.score;
          revealedWord = word.textOriginal;
        } else {
          await gameRepo.save(updated);
        }

        const state = buildGameState({
          game: updated as HangmanGame,
          word: word as HangmanWord,
          difficulty: difficultyFromNumber(updated.difficulty),
        });

        return reply.send({
          ...state,
          letter: parsed.data.letter,
          correct,
          ...(revealedWord ? { revealedWord } : {}),
          ...(finalScore != null ? { score: finalScore } : {}),
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Jogada inválida';
        return reply.status(400).send({ error: message });
      }
    }
  );

  fastify.post<{ Params: { gameId: string } }>(
    '/api/games/hangman/:gameId/hint',
    async (request: FastifyRequest<{ Params: { gameId: string } }>, reply: FastifyReply) => {
      if (!request.userId) return reply.status(401).send({ error: 'Unauthorized' });

      const gameRepo = getRepository(HangmanGame);
      const wordRepo = getRepository(HangmanWord);
      const game = await gameRepo.findOne({
        where: { id: request.params.gameId },
      });
      if (!game) return reply.status(404).send({ error: 'Partida não encontrada' });
      if (game.userId !== request.userId) {
        return reply.status(403).send({ error: 'Você não é o jogador desta partida' });
      }
      if (game.status !== 'playing') {
        return reply.status(400).send({ error: 'A partida já foi finalizada' });
      }

      const word = await wordRepo.findOne({ where: { id: game.wordId } });
      if (!word) return reply.status(500).send({ error: 'Palavra da partida não encontrada' });

      const difficulty = difficultyFromNumber(game.difficulty);
      const hintsAvailable = Math.max(0, 3 - (difficulty === 'easy' ? 0 : difficulty === 'medium' ? 1 : 2));
      if (game.hintsUsed >= hintsAvailable) {
        return reply.status(400).send({ error: 'Você já usou todas as dicas disponíveis' });
      }

      const guessedSet = new Set<string>(
        (game.guessedLetters ?? '')
          .split('')
          .map((c: string) => c.trim())
          .filter(Boolean)
      );

      let revealedLetter: string;
      try {
        revealedLetter = selectHintLetter(word.textNormalized, guessedSet);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Nenhuma letra disponível para dica';
        return reply.status(400).send({ error: message });
      }

      guessedSet.add(revealedLetter);
      game.guessedLetters = Array.from(guessedSet).join('');
      game.hintsUsed += 1;

      const state = buildGameState({
        game: game as HangmanGame,
        word: word as HangmanWord,
        difficulty,
      });

      await gameRepo.save(game);

      const positions: number[] = [];
      for (let i = 0; i < word.textNormalized.length; i++) {
        if (word.textNormalized[i] === revealedLetter) positions.push(i);
      }

      return reply.send({
        ...state,
        revealedLetter,
        positions,
        scorePenalty: 20,
      });
    }
  );

  fastify.get(
    '/api/games/hangman/:gameId',
    async (request: FastifyRequest<{ Params: { gameId: string } }>, reply: FastifyReply) => {
      if (!request.userId) return reply.status(401).send({ error: 'Unauthorized' });

      const gameRepo = getRepository(HangmanGame);
      const wordRepo = getRepository(HangmanWord);

      const game = await gameRepo.findOne({
        where: { id: request.params.gameId },
      });

      if (!game) {
        return reply.status(404).send({ error: 'Partida não encontrada' });
      }

      if (game.userId !== request.userId) {
        return reply.status(403).send({ error: 'Você não é o jogador desta partida' });
      }

      const word = await wordRepo.findOne({ where: { id: game.wordId } });
      if (!word) {
        return reply.status(500).send({ error: 'Palavra da partida não encontrada' });
      }

      const difficulty = difficultyFromNumber(game.difficulty);
      const state = buildGameState({
        game: game as HangmanGame,
        word: word as HangmanWord,
        difficulty,
      });

      return reply.send(state);
    }
  );

  fastify.get(
    '/api/games/hangman/stats/:userId',
    async (request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
      if (!request.userId) return reply.status(401).send({ error: 'Unauthorized' });
      const targetUserId = request.params.userId;
      const user = await getRepository(User).findOne({ where: { id: targetUserId } });
      if (!user) return reply.status(404).send({ error: 'Usuário não encontrado' });

      const stats = await getHangmanStats(targetUserId);
      return reply.send(stats);
    }
  );

  fastify.get<{ Querystring: unknown }>(
    '/api/games/hangman/leaderboard',
    async (request: FastifyRequest<{ Querystring: unknown }>, reply: FastifyReply) => {
      const parsed = hangmanLeaderboardQuerySchema.safeParse(request.query ?? {});
      if (!parsed.success) {
        const flattened = parsed.error.flatten();
        const firstFieldError =
          Object.values(flattened.fieldErrors).flat().find(Boolean) ?? flattened.formErrors[0];
        const errorMessage =
          typeof firstFieldError === 'string' ? firstFieldError : 'Validation failed';
        return reply.status(400).send({ error: errorMessage, details: flattened });
      }
      const { period, limit } = parsed.data;

      const qb = getRepository(HangmanGame)
        .createQueryBuilder('g')
        .innerJoin(User, 'u', 'u.id = g.user_id')
        .select('g.user_id', 'userId')
        .addSelect('u.username', 'username')
        .addSelect('SUM(g.score)', 'totalScore')
        .where('g.status IN (:...finished)', { finished: ['won', 'lost'] });

      const now = new Date();
      if (period === 'daily') {
        const dayStart = new Date(now);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        qb.andWhere('g.finished_at >= :from AND g.finished_at < :to', {
          from: dayStart.toISOString(),
          to: dayEnd.toISOString(),
        });
      } else if (period === 'weekly') {
        const dayOfWeek = now.getDay() || 7;
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (dayOfWeek - 1));
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        qb.andWhere('g.finished_at >= :from AND g.finished_at < :to', {
          from: weekStart.toISOString(),
          to: weekEnd.toISOString(),
        });
      }

      const rows = await qb
        .groupBy('g.user_id')
        .addGroupBy('u.username')
        .orderBy('SUM(g.score)', 'DESC')
        .limit(limit)
        .getRawMany<{ userId: string; username: string; totalScore: string }>();

      const leaderboard = rows.map((row, idx) => ({
        rank: idx + 1,
        userId: row.userId,
        username: row.username,
        avatar: null as string | null,
        score: Number(row.totalScore) || 0,
      }));

      return reply.send({ leaderboard });
    }
  );

  fastify.get(
    '/api/games/hangman/achievements/:userId',
    async (request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
      if (!request.userId) return reply.status(401).send({ error: 'Unauthorized' });
      const targetUserId = request.params.userId;
      const repo = getRepository(UserAchievement);
      const rows = await repo.find({
        where: { userId: targetUserId, game: 'hangman' },
      });
      return reply.send({
        achievements: rows.map((a) => ({
          code: a.code,
          unlockedAt: a.unlockedAt,
        })),
      });
    }
  );
}

export default hangmanRoutes;

