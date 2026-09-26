import {
  ActionType,
  CaseType,
  DocumentDomain,
  DocumentStatus,
  DocumentType,
  PaymentStatus,
  TaxCategory,
} from '@meindocs/domain';
import { sql } from 'drizzle-orm';
import { integer, primaryKey, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

const timestamp = () => text().notNull().default(sql`(datetime('now'))`);

export const people = sqliteTable('people', {
  id: text('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  phone: text('phone'),
  createdAt: timestamp(),
  updatedAt: timestamp(),
});

export const organisations = sqliteTable('organisations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  legalName: text('legal_name'),
  registrationNumber: text('registration_number'),
  taxNumber: text('tax_number'),
  email: text('email'),
  phone: text('phone'),
  createdAt: timestamp(),
  updatedAt: timestamp(),
});

export const documents = sqliteTable(
  'documents',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    type: text('type').$type<DocumentType>().notNull(),
    domain: text('domain').$type<DocumentDomain>().notNull(),
    status: text('status').$type<DocumentStatus>().notNull().default(DocumentStatus.Inbox),
    createdAt: timestamp(),
    updatedAt: timestamp(),
    fileName: text('file_name'),
    mimeType: text('mime_type'),
    fileSizeBytes: integer('file_size_bytes'),
    storageUri: text('storage_uri'),
    issuerPersonId: text('issuer_person_id').references(() => people.id),
    issuerOrganisationId: text('issuer_organisation_id').references(() => organisations.id),
    recipientPersonId: text('recipient_person_id').references(() => people.id),
    recipientOrganisationId: text('recipient_organisation_id').references(() => organisations.id),
    canEdit: integer('can_edit', { mode: 'boolean' }).notNull().default(true),
    canDelete: integer('can_delete', { mode: 'boolean' }).notNull().default(true),
    canShare: integer('can_share', { mode: 'boolean' }).notNull().default(true),
    canDownload: integer('can_download', { mode: 'boolean' }).notNull().default(true),
    canArchive: integer('can_archive', { mode: 'boolean' }).notNull().default(true),
    canCreateReminder: integer('can_create_reminder', { mode: 'boolean' }).notNull().default(true),
  },
  (table) => [uniqueIndex('documents_storage_uri_idx').on(table.storageUri)],
);

export const tags = sqliteTable(
  'tags',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    color: text('color'),
    createdAt: timestamp(),
  },
  (table) => [uniqueIndex('tags_name_idx').on(table.name)],
);

export const documentTags = sqliteTable(
  'document_tags',
  {
    documentId: text('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.documentId, table.tagId] })],
);

export const actions = sqliteTable('actions', {
  id: text('id').primaryKey(),
  documentId: text('document_id')
    .notNull()
    .references(() => documents.id, { onDelete: 'cascade' }),
  type: text('type').$type<ActionType>().notNull(),
  createdAt: timestamp(),
  actorPersonId: text('actor_person_id').references(() => people.id),
  actorOrganisationId: text('actor_organisation_id').references(() => organisations.id),
  note: text('note'),
});

export const reminders = sqliteTable('reminders', {
  id: text('id').primaryKey(),
  documentId: text('document_id').references(() => documents.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  dueDate: text('due_date').notNull(),
  priority: text('priority').$type<'normal' | 'high'>().notNull().default('normal'),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  notes: text('notes'),
  createdAt: timestamp(),
  updatedAt: timestamp(),
});

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  documentId: text('document_id')
    .notNull()
    .references(() => documents.id, { onDelete: 'cascade' }),
  status: text('status').$type<PaymentStatus>().notNull().default(PaymentStatus.Pending),
  amount: real('amount').notNull(),
  currency: text('currency').notNull(),
  dueDate: text('due_date'),
  paidAt: text('paid_at'),
  reference: text('reference'),
});

export const taxMetadata = sqliteTable('tax_metadata', {
  documentId: text('document_id')
    .primaryKey()
    .references(() => documents.id, { onDelete: 'cascade' }),
  category: text('category').$type<TaxCategory>().notNull(),
  taxYear: integer('tax_year'),
  deductible: integer('deductible', { mode: 'boolean' }),
  deductibleAmount: real('deductible_amount'),
  notes: text('notes'),
});

export const cases = sqliteTable('cases', {
  id: text('id').primaryKey(),
  type: text('type').$type<CaseType>().notNull(),
  title: text('title').notNull(),
  status: text('status').$type<'open' | 'closed' | 'archived'>().notNull().default('open'),
  createdAt: timestamp(),
  updatedAt: timestamp(),
  ownerPersonId: text('owner_person_id').references(() => people.id),
  organisationId: text('organisation_id').references(() => organisations.id),
});

export const caseDocuments = sqliteTable(
  'case_documents',
  {
    caseId: text('case_id')
      .notNull()
      .references(() => cases.id, { onDelete: 'cascade' }),
    documentId: text('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.caseId, table.documentId] })],
);

export const documentRelations = sqliteTable(
  'document_relations',
  {
    id: text('id').primaryKey(),
    sourceDocumentId: text('source_document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    targetDocumentId: text('target_document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    relationType: text('relation_type').notNull(),
    createdAt: timestamp(),
  },
  (table) => [
    uniqueIndex('document_relations_pair_idx').on(
      table.sourceDocumentId,
      table.targetDocumentId,
      table.relationType,
    ),
  ],
);
