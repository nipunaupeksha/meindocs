import { expect, test } from 'bun:test';
import { DocumentSeriesFrequency, DocumentType } from '@meindocs/domain';
import { createDatabase } from './client';
import { SqliteDocumentSeriesRepository } from './document-series';

function setup() {
  const { sqlite, db } = createDatabase(':memory:');
  sqlite.exec(`
    CREATE TABLE organisations (id TEXT PRIMARY KEY);
    CREATE TABLE documents (id TEXT PRIMARY KEY);
    CREATE TABLE document_series (id TEXT PRIMARY KEY, name TEXT NOT NULL, document_type TEXT NOT NULL, issuer TEXT, organisation_id TEXT, related_person_id TEXT, default_case_id TEXT, expected_frequency TEXT NOT NULL, default_tags TEXT NOT NULL, default_tax_metadata TEXT, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL);
    CREATE TABLE document_series_members (id TEXT PRIMARY KEY, series_id TEXT NOT NULL, document_id TEXT NOT NULL, document_date TEXT NOT NULL, createdAt TEXT NOT NULL);
  `);
  sqlite.exec(
    "INSERT INTO organisations VALUES ('org-1'); INSERT INTO documents VALUES ('doc-1');",
  );
  return { sqlite, repository: new SqliteDocumentSeriesRepository(db) };
}

test('series repository persists membership and returns members in date order', async () => {
  const { repository } = setup();
  const series = await repository.create({
    id: 'series-1',
    name: 'Monthly bills',
    documentType: DocumentType.Invoice,
    issuer: 'Utility',
    organisationId: 'org-1',
    expectedFrequency: DocumentSeriesFrequency.Monthly,
    defaultTags: ['utility'],
  });
  const member = await repository.addMember({
    seriesId: series.id,
    documentId: 'doc-1',
    documentDate: '2026-01-01',
  });
  expect(member.seriesId).toBe(series.id);
  expect((await repository.listMembers(series.id))[0].documentId).toBe('doc-1');
  expect((await repository.getById(series.id))?.expectedFrequency).toBe(
    DocumentSeriesFrequency.Monthly,
  );
});
