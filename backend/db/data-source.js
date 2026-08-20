import 'dotenv/config';

import { DataSource } from 'typeorm';
import Package from '../entities/Package.js';
import Skill from '../entities/Skill.js';
import User from '../entities/User.js';
import Coach from '../entities/Coach.js';
import Course from '../entities/Course.js';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME || 'student',
  password: process.env.DB_PASSWORD || 'student666',
  database: process.env.DB_DATABASE || 'fitness',

  entities: [Package, Skill, User, Coach, Course],

  migrations: ['db/migrations/*.js'],
  // 將 ORM 自動同步結構關閉
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
});

export default dataSource;
