import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddOriginalVenuePrice1718150400000 implements MigrationInterface {
  name = "AddOriginalVenuePrice1718150400000";

  // we running this mmigration because when we have a discounted price we
  // losse the original price so for those reasons we are adding
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE venue ALTER COLUMN price decimal(18, 2) NOT NULL;

      IF COL_LENGTH('venue', 'original_price') IS NULL
        ALTER TABLE venue ADD original_price decimal(18, 2) NULL;

      UPDATE venue
      SET original_price = ROUND(price / 0.55, 2)
      WHERE discounted_percentage = 45
        AND original_price IS NULL;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      IF COL_LENGTH('venue', 'original_price') IS NOT NULL
        ALTER TABLE venue DROP COLUMN original_price;
    `);
  }
}
