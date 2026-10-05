import { expect, test } from 'bun:test';
import { CustomFieldType } from '@meindocs/domain';
import { createDatabase } from './client';
import { SqliteCustomFieldRepository } from './custom-fields';

function setup() {
  const { sqlite, db } = createDatabase(':memory:');
  sqlite.exec(`
    CREATE TABLE documents (id TEXT PRIMARY KEY);
    CREATE TABLE custom_field_definitions (id TEXT PRIMARY KEY, name TEXT NOT NULL, key TEXT NOT NULL, type TEXT NOT NULL, description TEXT, options TEXT, required INTEGER NOT NULL DEFAULT 0, scope_kind TEXT NOT NULL, scope_domain TEXT, scope_document_type TEXT, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL);
    CREATE TABLE custom_field_values (id TEXT PRIMARY KEY, document_id TEXT NOT NULL, definition_id TEXT NOT NULL, value TEXT NOT NULL, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL);
  `);
  sqlite.exec("INSERT INTO documents VALUES ('doc-1');");
  return { sqlite, repository: new SqliteCustomFieldRepository(db) };
}

test('custom field values relate to documents and can be updated/removed', async () => {
  const { sqlite, repository } = setup();
  const definition = await repository.createDefinition({
    id: 'contract',
    name: 'Contract number',
    key: 'contract_number',
    type: CustomFieldType.Text,
    required: false,
    scope: { kind: 'global' },
  });
  const first = await repository.setValue({
    documentId: 'doc-1',
    definitionId: definition.id,
    value: 'A-1',
  });
  expect((await repository.listValues('doc-1'))[0].value).toBe('A-1');
  const updated = await repository.setValue({
    documentId: 'doc-1',
    definitionId: definition.id,
    value: 'A-2',
  });
  expect(updated.id).toBe(first.id);
  await repository.removeValue('doc-1', definition.id);
  expect(await repository.listValues('doc-1')).toHaveLength(0);
  expect(sqlite.query('SELECT COUNT(*) AS count FROM custom_field_values').get()).toEqual({
    count: 0,
  });
});
