import { randomUUID } from 'crypto';
import { AppDataSource, getRepository } from './db.js';
import { HangmanGame } from '../entities/HangmanGame.js';
import { HangmanUserStats } from '../entities/HangmanUserStats.js';
import { UserAchievement } from '../entities/UserAchievement.js';
import { HANGMAN_GAME_TYPE, difficultyFromNumber, calculateScore } from './hangman.js';

export async function finalizeHangmanGameAndUpdateStats(game: HangmanGame): Promise<{
  score: number;
}> {
  if (game.status !== 'won' && game.status !== 'lost') {
    throw new Error('Partida ainda não finalizada');
  }

  const difficulty = difficultyFromNumber(game.difficulty);
  const score = calculateScore({
    won: game.status === 'won',
    maxErrors: game.maxErrors,
    errors: game.errors,
    difficulty,
    hintsUsed: game.hintsUsed,
  });

  game.score = score;

  await AppDataSource.transaction(async (manager) => {
    const statsRepo = manager.getRepository(HangmanUserStats);
    const achRepo = manager.getRepository(UserAchievement);

    let stats = await statsRepo.findOne({ where: { userId: game.userId } });
    if (!stats) {
      stats = statsRepo.create({
        userId: game.userId,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalScore: 0,
        averageScore: 0,
      });
    }

    stats.gamesPlayed += 1;
    if (game.status === 'won') {
      stats.wins += 1;
      stats.currentStreak += 1;
      if (stats.currentStreak > stats.bestStreak) {
        stats.bestStreak = stats.currentStreak;
      }
    } else {
      stats.losses += 1;
      stats.currentStreak = 0;
    }
    stats.totalScore += score;
    stats.averageScore = stats.gamesPlayed > 0 ? stats.totalScore / stats.gamesPlayed : 0;

    await statsRepo.save(stats);

    const achievementsToUnlock: string[] = [];
    if (game.status === 'won' && stats.wins === 1) {
      achievementsToUnlock.push('hangman_first_win');
    }
    if (game.status === 'won' && game.errors === 0) {
      achievementsToUnlock.push('hangman_flawless_win');
    }
    if (stats.currentStreak >= 5) {
      achievementsToUnlock.push('hangman_5_wins_streak');
    }

    if (achievementsToUnlock.length > 0) {
      const existing = await achRepo.find({
        where: { userId: game.userId, game: HANGMAN_GAME_TYPE },
      });
      const existingCodes = new Set(existing.map((a) => a.code));
      const newOnes = achievementsToUnlock.filter((code) => !existingCodes.has(code));
      if (newOnes.length > 0) {
        const now = new Date();
        const rows = newOnes.map((code) =>
          achRepo.create({
            id: randomUUID(),
            userId: game.userId,
            game: HANGMAN_GAME_TYPE,
            code,
            unlockedAt: now,
          })
        );
        await achRepo.save(rows);
      }
    }

    await manager.getRepository(HangmanGame).save(game);
  });

  return { score };
}

export async function getHangmanStats(userId: string) {
  const repo = getRepository(HangmanUserStats);
  const row = await repo.findOne({ where: { userId } });
  if (!row) {
    return {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      currentStreak: 0,
      bestStreak: 0,
      averageScore: 0,
    };
  }
  return {
    gamesPlayed: row.gamesPlayed,
    wins: row.wins,
    losses: row.losses,
    currentStreak: row.currentStreak,
    bestStreak: row.bestStreak,
    averageScore: row.averageScore,
  };
}

