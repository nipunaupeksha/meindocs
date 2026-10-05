import { expect, test } from 'bun:test';
import { createDatabase } from './client';
import { SqliteSmartViewRepository } from './smart-views';

test('smart view repository stores serialized filters and sort configuration', async () => {
  const { sqlite, db } = createDatabase(':memory:');
  sqlite.exec(
    `CREATE TABLE saved_searches (id TEXT PRIMARY KEY, name TEXT NOT NULL, icon TEXT NOT NULL, filters TEXT NOT NULL, sort TEXT NOT NULL, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL);`,
  );
  const repository = new SqliteSmartViewRepository(db);
  const created = await repository.create({
    id: 'view-1',
    name: 'Freelance Expenses 2026',
    icon: 'calculator',
    filters: { taxRelevant: true, taxYear: 2026, customFields: { business_usage: { gt: 0 } } },
    sort: 'newest',
  });
  expect((await repository.getById(created.id))?.filters).toEqual(created.filters);
  await repository.update(created.id, { filters: { unpaidBill: true }, sort: 'due' });
  expect((await repository.getById(created.id))?.sort).toBe('due');
  expect((await repository.getById(created.id))?.filters).toEqual({ unpaidBill: true });
});
