import "dotenv/config";

import { DataSource } from "typeorm";

const dataSource = new DataSource({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 8080),
  username: process.env.DB_USERNAME || "student",
  password: process.env.DB_PASSWORD || "student666",
  database: process.env.DB_DATABASE || "fitness",

  entities: [],
  // 將 ORM 自動同步結構關閉
  synchronize: false,
});
