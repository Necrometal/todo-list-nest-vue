import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';

export async function cleanDatabase(app: INestApplication): Promise<void> {
  const dataSource = app.get(DataSource);
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
  await dataSource.query('TRUNCATE TABLE todo_history');
  await dataSource.query('TRUNCATE TABLE todos');
  await dataSource.query('TRUNCATE TABLE categories');
  await dataSource.query('TRUNCATE TABLE users');
  await dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
}
