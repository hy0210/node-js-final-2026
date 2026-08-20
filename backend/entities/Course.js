import { EntitySchema } from 'typeorm';

const Course = new EntitySchema({
  name: 'Course',
  tableName: 'COURSE',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
      nullable: false,
    },
    name: {
      type: 'varchar',
      length: 50,
      nullable: false,
      unique: true,
    },
    description: {
      type: 'varchar',
      length: 300,
      nullable: false,
    },
    start_at: {
      type: 'timestamptz', // UTC ISO 8601 字串（例 2026-08-20T10:00:00Z）
      nullable: false,
    },
    end_at: {
      type: 'timestamptz',
      nullable: false,
    },
    max_participants: {
      type: 'int',
      nullable: false,
    },
    meeting_url: {
      type: 'varchar',
      length: 300,
      nullable: false,
    },
    created_at: {
      type: 'timestamptz',
      createDate: true,
    },
    updated_at: {
      type: 'timestamptz',
      updateDate: true,
    },
  },
  relations: {
    user: {
      type: 'many-to-one', // 多堂課程對應一個使用者
      target: 'User',
      joinColumn: { name: 'user_id' },
    },
    skill: {
      type: 'many-to-one', // 多堂課程對應一個技能
      target: 'Skill',
      joinColumn: { name: 'skill_id' },
    },
  },
});

export default Course;
