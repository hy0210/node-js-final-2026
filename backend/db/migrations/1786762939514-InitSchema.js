/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class InitSchema1786762939514 {
    name = 'InitSchema1786762939514'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "PACKAGE" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "credit_amount" integer NOT NULL, "price" integer NOT NULL, CONSTRAINT "UQ_d443034b5004e925c52fde870be" UNIQUE ("name"), CONSTRAINT "PK_80f4650979424c22bc0b5662d43" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "SKILL" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0780a3ef1d521b8bee1c9b240de" UNIQUE ("name"), CONSTRAINT "PK_90109ddb53b4c7cf8efe1efad0d" PRIMARY KEY ("id"))`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "SKILL"`);
        await queryRunner.query(`DROP TABLE "PACKAGE"`);
    }
}
