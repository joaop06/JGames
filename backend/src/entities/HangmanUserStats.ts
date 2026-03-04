import { Entity, PrimaryColumn, Column, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { User } from './User.js';

@Entity('hangman_user_stats')
export class HangmanUserStats {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne('User')
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'games_played', type: 'int', default: 0 })
  gamesPlayed!: number;

  @Column({ type: 'int', default: 0 })
  wins!: number;

  @Column({ type: 'int', default: 0 })
  losses!: number;

  @Column({ name: 'current_streak', type: 'int', default: 0 })
  currentStreak!: number;

  @Column({ name: 'best_streak', type: 'int', default: 0 })
  bestStreak!: number;

  @Column({ name: 'total_score', type: 'int', default: 0 })
  totalScore!: number;

  @Column({ name: 'average_score', type: 'float', default: 0 })
  averageScore!: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

