import { EntitySchema } from 'typeorm';

const User = new EntitySchema({
  name: 'User',
  tableName: 'User',
  columns: {
    id: {
      primary: true, // 設定為主鍵
      type: 'uuid',
      generated: 'uuid',
      nullable: false,
    },
    name: {
      type: 'varchar',
      length: 50,
      nullable: false,
      unique: true, // 唯一
    },
    email: {
      type: 'varchar',
      length: 320,
      nullable: false,
      unique: true,
    },
    role: {
      type: 'varchar',
      length: 10, // USER / COACH 很短就夠
      nullable: false,
      default: 'USER', // 註冊預設一般使用者
    },
    password: {
      type: 'varchar',
      length: 72, // bcrypt hash 約 60 字元，留一點餘裕
      nullable: false,
      select: false, // 預設查詢不回傳密碼
    },
    createdAt: {
      type: 'timestamp', // 欄位類型為時間戳記
      createDate: true, // 新增資料時自動填入當下時間
    },
    deletedAt: { type: 'timestamp', deleteDate: true, nullable: true },
  },
});

export default User;
