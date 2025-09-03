import { defineConfig } from '@mikro-orm/core';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { RequestHistory } from './entities/RequestHistory';

export default defineConfig({
  entities: [RequestHistory],
  dbName: './rest-client.db',
  driver: SqliteDriver,
  debug: process.env.NODE_ENV === 'development',
  migrations: {
    path: './src/lib/migrations',
    glob: '!(*.d).{js,ts}',
  },
});
