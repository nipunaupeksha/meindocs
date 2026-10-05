import { expect, test } from 'bun:test';
import { createDatabase } from './client';
import { SqliteBulkDocumentRepository } from './bulk-operations';

function setup() {
  const { sqlite, db } = createDatabase(':memory:');
  sqlite.exec(`
    CREATE TABLE documents (id TEXT PRIMARY KEY, title TEXT NOT NULL, ocr_text TEXT, summary TEXT, reference_number TEXT, issuer_person_id TEXT, issuer_organisation_id TEXT, recipient_person_id TEXT, recipient_organisation_id TEXT, updatedAt TEXT, status TEXT);
    CREATE TABLE people (id TEXT PRIMARY KEY, first_name TEXT, last_name TEXT);
    CREATE TABLE organisations (id TEXT PRIMARY KEY, name TEXT);
    CREATE TABLE tags (id TEXT PRIMARY KEY, name TEXT NOT NULL, color TEXT, createdAt TEXT);
    CREATE TABLE document_tags (document_id TEXT NOT NULL, tag_id TEXT NOT NULL, PRIMARY KEY (document_id, tag_id));
    CREATE TABLE payments (document_id TEXT, status TEXT);
    CREATE TABLE reminders (document_id TEXT, due_date TEXT, expiry_date TEXT, completed INTEGER);
    CREATE TABLE case_documents (case_id TEXT, document_id TEXT);
    CREATE TABLE cases (id TEXT PRIMARY KEY);
    CREATE TABLE tax_metadata (document_id TEXT PRIMARY KEY, category TEXT NOT NULL, tax_relevant INTEGER, tax_year INTEGER);
    CREATE TABLE documents_fts (document_id TEXT PRIMARY KEY, title TEXT, ocr_text TEXT, summary TEXT, issuer TEXT, tags TEXT, reference_number TEXT);
  `);
  sqlite.exec(
    "INSERT INTO documents (id,title,status) VALUES ('doc-1','Bill','active'); INSERT INTO tags (id,name) VALUES ('tag-old','old'); INSERT INTO document_tags VALUES ('doc-1','tag-old');",
  );
  return { sqlite, repository: new SqliteBulkDocumentRepository(db) };
}

test('bulk tag additions merge with existing tags without duplicates', async () => {
  const { sqlite, repository } = setup();
  await repository.execute('doc-1', { type: 'add_tags', tags: ['old', 'new'] });
  const rows = sqlite
    .query(
      'SELECT t.name FROM tags t JOIN document_tags dt ON dt.tag_id = t.id WHERE dt.document_id = ? ORDER BY t.name',
    )
    .all('doc-1');
  expect(rows).toEqual([{ name: 'new' }, { name: 'old' }]);
});

test('invalid assignment rolls back without changing the document', async () => {
  const { sqlite, repository } = setup();
  await expect(
    repository.execute('doc-1', { type: 'assign_person', personId: 'missing' }),
  ).rejects.toThrow('Person not found');
  expect(
    sqlite.query('SELECT recipient_person_id AS person FROM documents WHERE id = ?').get('doc-1'),
  ).toEqual({ person: null });
});
