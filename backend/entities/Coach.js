import { EntitySchema } from 'typeorm';

const Coach = new EntitySchema({
  name: 'Coach',
  tableName: 'COACH',
  columns: {
    id: {
      primary: true, // 設定為主鍵
      type: 'uuid',
      generated: 'uuid',
      nullable: false,
    },
    description: {
      type: 'varchar',
      length: 300,
      nullable: false,
    },
    profile_image_url: {
      type: 'varchar',
      length: 300,
      nullable: true,
    },
    experience_years: {
      type: 'int',
      nullable: false,
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
    },
    updated_at: {
      type: 'timestamp',
      updateDate: true,
    },
    deleted_at: { type: 'timestamp', deleteDate: true, nullable: true },
  },
  relations: {
    user: {
      type: 'one-to-one',
      target: 'User', // 對應到 User entity
      joinColumn: { name: 'user_id' }, // 對應 user 資料表裡的 id 外鍵
    },
    skills: {
      type: 'many-to-many', // 自動建 COACH_SKILLS 中間表
      target: 'Skill',
      joinTable: {
        name: 'COACH_SKILLS',
        joinColumn: { name: 'coach_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'skill_id', referencedColumnName: 'id' },
      },
    },
  },
});

export default Coach;
