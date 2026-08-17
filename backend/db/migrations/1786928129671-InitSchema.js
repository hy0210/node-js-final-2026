/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class InitSchema1786928129671 {
    name = 'InitSchema1786928129671'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "PACKAGE" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "credit_amount" integer NOT NULL, "price" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_d443034b5004e925c52fde870be" UNIQUE ("name"), CONSTRAINT "PK_80f4650979424c22bc0b5662d43" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "SKILL" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_0780a3ef1d521b8bee1c9b240de" UNIQUE ("name"), CONSTRAINT "PK_90109ddb53b4c7cf8efe1efad0d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "User" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "email" character varying(320) NOT NULL, "role" character varying(10) NOT NULL DEFAULT 'USER', "password" character varying(72) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_99f220333df04d5f74f6db26c07" UNIQUE ("name"), CONSTRAINT "UQ_4a257d2c9837248d70640b3e36e" UNIQUE ("email"), CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Coach" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying(300) NOT NULL, "profile_image_url" character varying(300) NOT NULL, "experience_years" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid, CONSTRAINT "REL_ad762682fb96b4c01c199499b1" UNIQUE ("user_id"), CONSTRAINT "PK_bf604e12d74b449fc85d6391b4f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "coach_skills" ("coach_id" uuid NOT NULL, "skill_id" uuid NOT NULL, CONSTRAINT "PK_2bd49bed05a41b002b443729349" PRIMARY KEY ("coach_id", "skill_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ae4a948889774a37fea143a4cb" ON "coach_skills"  ("coach_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_7b390700c43d3db784b1455540" ON "coach_skills"  ("skill_id") `);
        await queryRunner.query(`ALTER TABLE "Coach" ADD CONSTRAINT "FK_ad762682fb96b4c01c199499b1a" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coach_skills" ADD CONSTRAINT "FK_ae4a948889774a37fea143a4cb2" FOREIGN KEY ("coach_id") REFERENCES "Coach"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "coach_skills" ADD CONSTRAINT "FK_7b390700c43d3db784b14555409" FOREIGN KEY ("skill_id") REFERENCES "SKILL"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "coach_skills" DROP CONSTRAINT "FK_7b390700c43d3db784b14555409"`);
        await queryRunner.query(`ALTER TABLE "coach_skills" DROP CONSTRAINT "FK_ae4a948889774a37fea143a4cb2"`);
        await queryRunner.query(`ALTER TABLE "Coach" DROP CONSTRAINT "FK_ad762682fb96b4c01c199499b1a"`);
        await queryRunner.query(`DROP INDEX "IDX_7b390700c43d3db784b1455540"`);
        await queryRunner.query(`DROP INDEX "IDX_ae4a948889774a37fea143a4cb"`);
        await queryRunner.query(`DROP TABLE "coach_skills"`);
        await queryRunner.query(`DROP TABLE "Coach"`);
        await queryRunner.query(`DROP TABLE "User"`);
        await queryRunner.query(`DROP TABLE "SKILL"`);
        await queryRunner.query(`DROP TABLE "PACKAGE"`);
    }
}
