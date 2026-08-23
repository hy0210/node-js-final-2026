import { EntitySchema } from 'typeorm';

const Purchase = new EntitySchema({
  name: 'Purchase',
  tableName: 'PURCHASE',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
      nullable: false,
    },
    purchase_at: {
      type: 'timestamptz',
      createDate: true,
    },
  },
  relations: {
    user: {
      type: 'many-to-one', // 多個購買紀錄對應一個使用者
      target: 'User',
      joinColumn: { name: 'user_id' },
    },
    package: {
      type: 'many-to-one', // 多個購買紀錄對應一個方案
      target: 'Package',
      joinColumn: { name: 'package_id' },
    },
  },
});

export default Purchase;
