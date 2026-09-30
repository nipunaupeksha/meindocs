import { expect, test } from 'bun:test';
import { OrganisationType } from '@meindocs/domain';
import { createDatabase } from './client';
import { SqliteOrganisationRepository, SqlitePersonRepository } from './people-organisations';

function setup() {
  const { sqlite, db } = createDatabase(':memory:');
  sqlite.exec(`
    CREATE TABLE people (id TEXT PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL, preferred_name TEXT, date_of_birth TEXT, relationship TEXT NOT NULL, addresses TEXT, nationality TEXT, identifiers_encrypted TEXT, email TEXT, phone TEXT, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL);
    CREATE TABLE organisations (id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL, address TEXT, legal_name TEXT, registration_number TEXT, tax_number TEXT, email TEXT, phone TEXT, website TEXT, customer_reference TEXT, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL);
    CREATE TABLE documents (id TEXT PRIMARY KEY, title TEXT, issuer_person_id TEXT, recipient_person_id TEXT, issuer_organisation_id TEXT, recipient_organisation_id TEXT);
    CREATE TABLE cases (id TEXT PRIMARY KEY);
    CREATE TABLE case_people (case_id TEXT, person_id TEXT);
    CREATE TABLE case_organisations (case_id TEXT, organisation_id TEXT);
    CREATE TABLE payments (id TEXT PRIMARY KEY, document_id TEXT);
    CREATE TABLE actions (id TEXT PRIMARY KEY, document_id TEXT);
  `);
  return { sqlite, db };
}

test('person repository returns associated documents and cases', async () => {
  const { sqlite, db } = setup();
  sqlite.exec(
    `INSERT INTO people VALUES ('person-1','Ada','Lovelace',NULL,NULL,'self','["Berlin"]','UK',NULL,NULL,NULL,'2026-01-01','2026-01-01'); INSERT INTO documents VALUES ('doc-1','Letter','person-1',NULL,NULL,NULL); INSERT INTO cases VALUES ('case-1'); INSERT INTO case_people VALUES ('case-1','person-1');`,
  );
  const repository = new SqlitePersonRepository(db);
  const hydrated = await repository.getById('person-1');
  expect(hydrated?.documentIds).toEqual(['doc-1']);
  expect(hydrated?.caseIds).toEqual(['case-1']);
});

test('organisation repository filters by type and returns related records', async () => {
  const { sqlite, db } = setup();
  sqlite.exec(
    `INSERT INTO organisations VALUES ('org-1','Utility Co','utility',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-01-01','2026-01-01'); INSERT INTO documents VALUES ('doc-1','Bill',NULL,NULL,'org-1',NULL); INSERT INTO cases VALUES ('case-1'); INSERT INTO case_organisations VALUES ('case-1','org-1'); INSERT INTO payments VALUES ('payment-1','doc-1'); INSERT INTO actions VALUES ('action-1','doc-1');`,
  );
  const repository = new SqliteOrganisationRepository(db);
  const filtered = await repository.list({ type: OrganisationType.Utility });
  expect(filtered).toHaveLength(1);
  const hydrated = await repository.getById('org-1');
  expect(hydrated?.documentIds).toEqual(['doc-1']);
  expect(hydrated?.caseIds).toEqual(['case-1']);
  expect(hydrated?.paymentIds).toEqual(['payment-1']);
  expect(hydrated?.actionIds).toEqual(['action-1']);
});
