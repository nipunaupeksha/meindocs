import { describe, expect, test } from 'bun:test';
import { createDatabase } from './client';
import { SqliteDocumentSearchRepository, syncDocumentSearchIndex } from './search';

function setup() {
  const { sqlite, db } = createDatabase(':memory:');
  sqlite.exec(`
    CREATE TABLE documents (id TEXT PRIMARY KEY, title TEXT NOT NULL, type TEXT NOT NULL, domain TEXT NOT NULL, status TEXT NOT NULL, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL, ocr_text TEXT, summary TEXT, reference_number TEXT, issuer_person_id TEXT, issuer_organisation_id TEXT, recipient_person_id TEXT, recipient_organisation_id TEXT, can_edit INTEGER DEFAULT 1, can_delete INTEGER DEFAULT 1, can_share INTEGER DEFAULT 1, can_download INTEGER DEFAULT 1, can_archive INTEGER DEFAULT 1, can_create_reminder INTEGER DEFAULT 1);
    CREATE TABLE people (id TEXT PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL);
    CREATE TABLE organisations (id TEXT PRIMARY KEY, name TEXT NOT NULL);
    CREATE TABLE tags (id TEXT PRIMARY KEY, name TEXT NOT NULL);
    CREATE TABLE document_tags (document_id TEXT NOT NULL, tag_id TEXT NOT NULL);
    CREATE TABLE tax_metadata (document_id TEXT PRIMARY KEY, tax_year INTEGER, tax_relevant INTEGER);
    CREATE TABLE reminders (id TEXT PRIMARY KEY, document_id TEXT, due_date TEXT, expiry_date TEXT, completed INTEGER DEFAULT 0);
    CREATE TABLE payments (id TEXT PRIMARY KEY, document_id TEXT, status TEXT);
    CREATE VIRTUAL TABLE documents_fts USING fts5(document_id UNINDEXED, title, ocr_text, summary, issuer, tags, reference_number);
  `);
  return { sqlite, db, search: new SqliteDocumentSearchRepository(db) };
}

describe('SQLite document search', () => {
  test('indexes searchable metadata and applies filters', async () => {
    const { sqlite, db, search } = setup();
    sqlite.exec(
      `INSERT INTO documents VALUES ('d1','Electricity bill','invoice','tax','needs_review','2026-01-10','2026-01-10','Meter reading and energy usage','Monthly utility bill','INV-42',NULL,'org-1',NULL,NULL,1,1,1,1,1,1);`,
    );
    sqlite.exec(
      `INSERT INTO organisations VALUES ('org-1','Stadtwerke'); INSERT INTO tags VALUES ('t1','utilities'); INSERT INTO document_tags VALUES ('d1','t1'); INSERT INTO tax_metadata VALUES ('d1',2026,1);`,
    );
    await syncDocumentSearchIndex(db, 'd1');
    const result = await search.search({
      text: 'energy',
      filters: { taxRelevant: true, taxYear: 2026, tags: ['utilities'], actionRequired: true },
    });
    expect(result.total).toBe(1);
    expect(result.results[0]?.document.referenceNumber).toBe('INV-42');
    expect(result.results[0]?.highlights[0]).toContain('<mark>');
  });

  test('supports sorting and removes deleted index rows', async () => {
    const { sqlite, db, search } = setup();
    sqlite.exec(
      `INSERT INTO documents VALUES ('old','Old','invoice','tax','inbox','2025-01-01','2025-01-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,1,1,1,1); INSERT INTO documents VALUES ('new','New','invoice','tax','inbox','2026-01-01','2026-01-01',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1,1,1,1,1);`,
    );
    await syncDocumentSearchIndex(db, 'old');
    await syncDocumentSearchIndex(db, 'new');
    const newest = await search.search({ sort: 'newest' });
    expect(newest.results[0]?.document.id).toBe('new');
    await search.remove('new');
    expect((await search.search({ text: 'New' })).total).toBe(0);
  });
});
