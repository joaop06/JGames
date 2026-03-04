import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserNameAndEmail1730020900000 implements MigrationInterface {
  name = 'AddUserNameAndEmail1730020900000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "User" ADD "name" character varying(50)`);
    await queryRunner.query(`ALTER TABLE "User" ADD "email" character varying UNIQUE`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "email"`);
    await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "name"`);
  }
}

