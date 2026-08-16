/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class AddSoftDelete1786868581454 {
    name = 'AddSoftDelete1786868581454'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "PACKAGE" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "SKILL" ADD "deletedAt" TIMESTAMP`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "SKILL" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "PACKAGE" DROP COLUMN "deletedAt"`);
    }
}
