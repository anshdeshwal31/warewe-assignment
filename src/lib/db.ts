import { MikroORM } from '@mikro-orm/core';
import config from './mikro-orm.config';

let orm: MikroORM;

export async function getORM() {
  if (!orm) {
    orm = await MikroORM.init(config);
    
    // Run migrations on first connection
    const migrator = orm.getMigrator();
    await migrator.up();
  }
  return orm;
}

export async function closeORM() {
  if (orm) {
    await orm.close();
  }
}
