import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from './schema';

export function createDatabase(
  fileName = process.env.MEINDOCS_DB_PATH ?? './data/meindocs.sqlite',
) {
  const sqlite = new Database(fileName);
  sqlite.exec('PRAGMA foreign_keys = ON');

  return {
    sqlite,
    db: drizzle({ client: sqlite, schema }),
  };
}
