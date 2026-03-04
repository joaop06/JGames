import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('hangman_word')
export class HangmanWord {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ name: 'text_original', type: 'varchar', length: 128 })
  textOriginal!: string;

  @Column({ name: 'text_normalized', type: 'varchar', length: 128 })
  textNormalized!: string;

  @Column({ type: 'varchar', length: 64 })
  category!: string;

  @Column({ type: 'int' })
  difficulty!: number;

  @Column({ type: 'varchar', length: 16, default: 'pt-BR' })
  language!: string;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

