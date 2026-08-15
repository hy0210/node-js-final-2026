import { EntitySchema } from 'typeorm';

const Skill = new EntitySchema({
  name: 'Skill', // 定義表的名稱（Entity 名稱）
  tableName: 'SKILL', // 對應資料庫中的表名
  columns: {
    id: {
      primary: true, // 設定為主鍵
      type: 'uuid', // 主鍵使用 UUID 格式
      generated: 'uuid', // 自動生成 UUID
      nullable: false, // 不可為空
    },
    name: {
      type: 'varchar', // 欄位類型為 varchar
      length: 50, // 最大長度為 50
      nullable: false, // 不可為空
      unique: true, // 唯一
    },
    createdAt: {
      type: 'timestamp', // 欄位類型為時間戳記
      createDate: true, // 新增資料時自動填入當下時間
    },
  },
});

export default Skill;
