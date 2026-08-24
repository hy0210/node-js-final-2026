import { EntitySchema } from 'typeorm';

const Booking = new EntitySchema({
  name: 'Booking',
  tableName: 'BOOKING',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
      nullable: false,
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
    },
    cancelled_at: { type: 'timestamp', deleteDate: true, nullable: true }, // 內建軟刪除時間
  },
  relations: {
    user: {
      type: 'many-to-one', // 多個報名對應一個使用者
      target: 'User',
      joinColumn: { name: 'user_id' },
    },
    course: {
      type: 'many-to-one', // 多個報名對應一堂課
      target: 'Course',
      joinColumn: { name: 'course_id' },
    },
  },
});

export default Booking;
