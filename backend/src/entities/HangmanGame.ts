import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { HangmanWord } from './HangmanWord.js';
import type { User } from './User.js';

export type HangmanMode = 'single' | 'multiplayer' | 'daily';
export type HangmanStatus = 'playing' | 'won' | 'lost';

@Entity('hangman_game')
export class HangmanGame {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ name: 'user_id', type: 'text' })
  userId!: string;

  @ManyToOne('User')
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'word_id', type: 'uuid' })
  wordId!: string;

  @ManyToOne('HangmanWord')
  @JoinColumn({ name: 'word_id' })
  word?: HangmanWord;

  @Column({ type: 'varchar', length: 16 })
  mode!: HangmanMode;

  @Column({ type: 'varchar', length: 64 })
  category!: string;

  @Column({ type: 'int' })
  difficulty!: number;

  @Column({ type: 'varchar', length: 16, default: 'pt-BR' })
  language!: string;

  @Column({ type: 'varchar', length: 16 })
  status!: HangmanStatus;

  @Column({ type: 'int', default: 0 })
  errors!: number;

  @Column({ name: 'max_errors', type: 'int', default: 6 })
  maxErrors!: number;

  @Column({ name: 'hints_used', type: 'int', default: 0 })
  hintsUsed!: number;

  @Column({ name: 'guessed_letters', type: 'varchar', length: 64, default: '' })
  guessedLetters!: string;

  @Column({ name: 'timer_seconds', type: 'int', nullable: true })
  timerSeconds!: number | null;

  @Column({ name: 'host_user_id', type: 'text', nullable: true })
  hostUserId!: string | null;

  @Column({ name: 'opponent_user_id', type: 'text', nullable: true })
  opponentUserId!: string | null;

  @Column({ type: 'int', default: 0 })
  score!: number;

  @CreateDateColumn({ name: 'started_at' })
  startedAt!: Date;

  @Column({ name: 'finished_at', type: 'timestamp', nullable: true })
  finishedAt!: Date | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

