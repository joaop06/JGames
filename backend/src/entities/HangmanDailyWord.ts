import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import type { HangmanWord } from './HangmanWord.js';

@Entity('hangman_daily_word')
export class HangmanDailyWord {
  @PrimaryColumn({ type: 'date' })
  date!: string;

  @PrimaryColumn({ type: 'varchar', length: 16 })
  language!: string;

  @Column({ name: 'word_id', type: 'uuid' })
  wordId!: string;

  @ManyToOne('HangmanWord')
  @JoinColumn({ name: 'word_id' })
  word?: HangmanWord;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

