import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHangmanTables1731000000000 implements MigrationInterface {
  name = 'CreateHangmanTables1731000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "hangman_word" (
        "id" uuid NOT NULL,
        "text_original" character varying(128) NOT NULL,
        "text_normalized" character varying(128) NOT NULL,
        "category" character varying(64) NOT NULL,
        "difficulty" integer NOT NULL,
        "language" character varying(16) NOT NULL DEFAULT 'pt-BR',
        "active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_hangman_word_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "hangman_game" (
        "id" uuid NOT NULL,
        "user_id" text NOT NULL,
        "word_id" uuid NOT NULL,
        "mode" character varying(16) NOT NULL,
        "category" character varying(64) NOT NULL,
        "difficulty" integer NOT NULL,
        "language" character varying(16) NOT NULL DEFAULT 'pt-BR',
        "status" character varying(16) NOT NULL,
        "errors" integer NOT NULL DEFAULT 0,
        "max_errors" integer NOT NULL DEFAULT 6,
        "hints_used" integer NOT NULL DEFAULT 0,
        "guessed_letters" character varying(64) NOT NULL DEFAULT '',
        "timer_seconds" integer,
        "host_user_id" uuid,
        "opponent_user_id" uuid,
        "score" integer NOT NULL DEFAULT 0,
        "started_at" TIMESTAMP NOT NULL DEFAULT now(),
        "finished_at" TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_hangman_game_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "hangman_user_stats" (
        "user_id" uuid NOT NULL,
        "games_played" integer NOT NULL DEFAULT 0,
        "wins" integer NOT NULL DEFAULT 0,
        "losses" integer NOT NULL DEFAULT 0,
        "current_streak" integer NOT NULL DEFAULT 0,
        "best_streak" integer NOT NULL DEFAULT 0,
        "total_score" integer NOT NULL DEFAULT 0,
        "average_score" double precision NOT NULL DEFAULT 0,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_hangman_user_stats_user_id" PRIMARY KEY ("user_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "user_achievement" (
        "id" uuid NOT NULL,
        "user_id" text NOT NULL,
        "game" character varying(32) NOT NULL,
        "code" character varying(64) NOT NULL,
        "unlocked_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_achievement_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "hangman_daily_word" (
        "date" date NOT NULL,
        "language" character varying(16) NOT NULL,
        "word_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_hangman_daily_word_date_language" PRIMARY KEY ("date", "language")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "hangman_game"
        ADD CONSTRAINT "FK_hangman_game_user"
        FOREIGN KEY ("user_id") REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "hangman_game"
        ADD CONSTRAINT "FK_hangman_game_word"
        FOREIGN KEY ("word_id") REFERENCES "hangman_word"("id")
        ON DELETE RESTRICT ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "user_achievement"
        ADD CONSTRAINT "FK_user_achievement_user"
        FOREIGN KEY ("user_id") REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "hangman_daily_word"
        ADD CONSTRAINT "FK_hangman_daily_word_word"
        FOREIGN KEY ("word_id") REFERENCES "hangman_word"("id")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_user_achievement_unique" ON "user_achievement" ("user_id", "game", "code")`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_hangman_game_user" ON "hangman_game" ("user_id", "mode", "finished_at")`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_hangman_game_word" ON "hangman_game" ("word_id")`
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_hangman_game_word"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_hangman_game_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_achievement_unique"`);

    await queryRunner.query(
      `ALTER TABLE "hangman_daily_word" DROP CONSTRAINT "FK_hangman_daily_word_word"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_achievement" DROP CONSTRAINT "FK_user_achievement_user"`
    );
    await queryRunner.query(
      `ALTER TABLE "hangman_game" DROP CONSTRAINT "FK_hangman_game_word"`
    );
    await queryRunner.query(
      `ALTER TABLE "hangman_game" DROP CONSTRAINT "FK_hangman_game_user"`
    );

    await queryRunner.query(`DROP TABLE "hangman_daily_word"`);
    await queryRunner.query(`DROP TABLE "user_achievement"`);
    await queryRunner.query(`DROP TABLE "hangman_user_stats"`);
    await queryRunner.query(`DROP TABLE "hangman_game"`);
    await queryRunner.query(`DROP TABLE "hangman_word"`);
  }
}

