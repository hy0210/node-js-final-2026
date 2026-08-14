import { EntitySchema } from "typeorm";

const Package = new EntitySchema({
  name: "CreditPackage",
  tableName: "PACKAGE",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
      nullable: false,
    },
    name: {
      type: "varchar",
      nullable: false,
      unique: true,
    },
    credit_amount: { type: "int", nullable: false },
    price: { type: "int", nullable: false },
  },
});
