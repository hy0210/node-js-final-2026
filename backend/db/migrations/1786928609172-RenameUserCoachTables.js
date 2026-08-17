/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class RenameUserCoachTables1786928609172 {
    name = 'RenameUserCoachTables1786928609172'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "coach_skills" DROP CONSTRAINT "FK_7b390700c43d3db784b14555409"`);
        await queryRunner.query(`ALTER TABLE "coach_skills" DROP CONSTRAINT "FK_ae4a948889774a37fea143a4cb2"`);
        await queryRunner.query(`ALTER TABLE "Coach" DROP CONSTRAINT "FK_ad762682fb96b4c01c199499b1a"`);

        await queryRunner.query(`ALTER TABLE "User" RENAME TO "USER"`);
        await queryRunner.query(`ALTER TABLE "Coach" RENAME TO "COACH"`);
        await queryRunner.query(`ALTER TABLE "coach_skills" RENAME TO "COACH_SKILLS"`);

        await queryRunner.query(`ALTER TABLE "COACH" ADD CONSTRAINT "FK_ad762682fb96b4c01c199499b1a" FOREIGN KEY ("user_id") REFERENCES "USER"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "COACH_SKILLS" ADD CONSTRAINT "FK_ae4a948889774a37fea143a4cb2" FOREIGN KEY ("coach_id") REFERENCES "COACH"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "COACH_SKILLS" ADD CONSTRAINT "FK_7b390700c43d3db784b14555409" FOREIGN KEY ("skill_id") REFERENCES "SKILL"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "COACH_SKILLS" DROP CONSTRAINT "FK_7b390700c43d3db784b14555409"`);
        await queryRunner.query(`ALTER TABLE "COACH_SKILLS" DROP CONSTRAINT "FK_ae4a948889774a37fea143a4cb2"`);
        await queryRunner.query(`ALTER TABLE "COACH" DROP CONSTRAINT "FK_ad762682fb96b4c01c199499b1a"`);

        await queryRunner.query(`ALTER TABLE "COACH_SKILLS" RENAME TO "coach_skills"`);
        await queryRunner.query(`ALTER TABLE "COACH" RENAME TO "Coach"`);
        await queryRunner.query(`ALTER TABLE "USER" RENAME TO "User"`);

        await queryRunner.query(`ALTER TABLE "Coach" ADD CONSTRAINT "FK_ad762682fb96b4c01c199499b1a" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coach_skills" ADD CONSTRAINT "FK_ae4a948889774a37fea143a4cb2" FOREIGN KEY ("coach_id") REFERENCES "Coach"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "coach_skills" ADD CONSTRAINT "FK_7b390700c43d3db784b14555409" FOREIGN KEY ("skill_id") REFERENCES "SKILL"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }
}
