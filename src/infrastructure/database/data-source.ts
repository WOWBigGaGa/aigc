import 'reflect-metadata';
import 'tsconfig-paths/register.js';

import * as dotenv from 'dotenv';
import * as path from 'path';
import { DataSource } from 'typeorm';
import databaseConfig from '../config/database.config';

const envFile = path.resolve(process.cwd(), 'env/.env.development');
dotenv.config({ path: envFile });

const { mysql } = databaseConfig() as {
  mysql: {
    type: 'mysql';
    host: string;
    port: number;
    username: string;
    password?: string;
    database: string;
    timezone?: string;
    charset?: string;
    extra?: Record<string, unknown>;
    synchronize: boolean;
    logging: boolean;
  };
};

export const appDataSource = new DataSource({
  type: 'mysql',
  host: mysql.host,
  port: mysql.port,
  username: mysql.username,
  password: mysql.password,
  database: mysql.database,
  timezone: mysql.timezone,
  charset: mysql.charset,
  synchronize: false,
  logging: mysql.logging,
  extra: mysql.extra,
  entities: [
    path.join(process.cwd(), 'src/**/*.entity.ts'),
    path.join(process.cwd(), 'dist/**/*.entity.js'),
  ],
  migrations: [
    path.join(process.cwd(), 'src/infrastructure/database/migrations/*.migration.ts'),
    path.join(process.cwd(), 'dist/src/infrastructure/database/migrations/*.migration.js'),
  ],
  subscribers: [],
});
