import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { User } from './User.js';

@Entity('user_achievement')
export class UserAchievement {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ name: 'user_id', type: 'text' })
  userId!: string;

  @ManyToOne('User')
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'varchar', length: 32 })
  game!: string;

  @Column({ type: 'varchar', length: 64 })
  code!: string;

  @CreateDateColumn({ name: 'unlocked_at' })
  unlockedAt!: Date;
}

