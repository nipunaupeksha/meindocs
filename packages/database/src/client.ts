import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { MEINDOCS_DB_FILENAME } from '@meindocs/config';
import * as schema from './schema';

export function createDatabase(fileName = process.env.MEINDOCS_DB_PATH ?? MEINDOCS_DB_FILENAME) {
  const sqlite = new Database(fileName);
  sqlite.exec('PRAGMA foreign_keys = ON');

  return {
    sqlite,
    db: drizzle({ client: sqlite, schema }),
  };
}
