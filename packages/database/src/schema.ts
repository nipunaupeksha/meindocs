import {
  ActionType,
  CaseType,
  CaseStatus,
  DocumentDomain,
  DocumentStatus,
  DocumentType,
  OrganisationType,
  PersonRelationship,
  PaymentStatus,
  TaxCategory,
} from '@meindocs/domain';
import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

const timestamp = () => text().notNull().default(sql`(datetime('now'))`);

export const people = sqliteTable(
  'people',
  {
    id: text('id').primaryKey(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    preferredName: text('preferred_name'),
    dateOfBirth: text('date_of_birth'),
    relationship: text('relationship')
      .$type<PersonRelationship>()
      .notNull()
      .default(PersonRelationship.Other),
    addresses: text('addresses'),
    nationality: text('nationality'),
    identifiersEncrypted: text('identifiers_encrypted'),
    email: text('email'),
    phone: text('phone'),
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  (table) => [
    index('people_name_idx').on(table.lastName, table.firstName),
    index('people_relationship_idx').on(table.relationship),
  ],
);

export const organisations = sqliteTable(
  'organisations',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    type: text('type').$type<OrganisationType>().notNull().default(OrganisationType.Other),
    address: text('address'),
    legalName: text('legal_name'),
    registrationNumber: text('registration_number'),
    taxNumber: text('tax_number'),
    email: text('email'),
    phone: text('phone'),
    website: text('website'),
    customerReference: text('customer_reference'),
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  (table) => [
    index('organisations_name_idx').on(table.name),
    index('organisations_type_idx').on(table.type),
  ],
);

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
    sha256: text('sha256'),
    thumbnailUri: text('thumbnail_uri'),
    pageCount: integer('page_count'),
    ocrText: text('ocr_text'),
    summary: text('summary'),
    referenceNumber: text('reference_number'),
    generatedFromTemplate: text('generated_from_template'),
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
  (table) => [
    uniqueIndex('documents_storage_uri_idx').on(table.storageUri),
    index('documents_created_at_idx').on(table.createdAt),
    index('documents_type_domain_idx').on(table.type, table.domain),
    index('documents_updated_at_idx').on(table.updatedAt),
    index('documents_status_idx').on(table.status),
  ],
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
  (table) => [
    primaryKey({ columns: [table.documentId, table.tagId] }),
    index('document_tags_tag_idx').on(table.tagId),
  ],
);

export const actions = sqliteTable(
  'actions',
  {
    id: text('id').primaryKey(),
    documentId: text('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),
    type: text('type').$type<ActionType>().notNull(),
    createdAt: timestamp(),
    actorPersonId: text('actor_person_id').references(() => people.id),
    actorOrganisationId: text('actor_organisation_id').references(() => organisations.id),
    note: text('note'),
  },
  (table) => [
    index('actions_document_idx').on(table.documentId),
    index('actions_created_at_idx').on(table.createdAt),
  ],
);

export const reminders = sqliteTable(
  'reminders',
  {
    id: text('id').primaryKey(),
    documentId: text('document_id').references(() => documents.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    dueDate: text('due_date').notNull(),
    expiryDate: text('expiry_date'),
    priority: text('priority').$type<'normal' | 'high'>().notNull().default('normal'),
    completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
    completedAt: text('completed_at'),
    notificationId: text('notification_id'),
    notes: text('notes'),
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  (table) => [
    index('reminders_due_date_idx').on(table.dueDate),
    index('reminders_expiry_date_idx').on(table.expiryDate),
  ],
);

export const payments = sqliteTable(
  'payments',
  {
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
  },
  (table) => [
    index('payments_due_date_idx').on(table.dueDate),
    index('payments_status_idx').on(table.status),
  ],
);

export const taxMetadata = sqliteTable(
  'tax_metadata',
  {
    documentId: text('document_id')
      .primaryKey()
      .references(() => documents.id, { onDelete: 'cascade' }),
    category: text('category').$type<TaxCategory>().notNull(),
    taxRelevant: integer('tax_relevant', { mode: 'boolean' }),
    expenseCategory: text('expense_category').$type<TaxCategory>(),
    taxYear: integer('tax_year'),
    deductible: integer('deductible', { mode: 'boolean' }),
    deductibleAmount: real('deductible_amount'),
    netAmount: real('net_amount'),
    vatAmount: real('vat_amount'),
    grossAmount: real('gross_amount'),
    vatRate: real('vat_rate'),
    businessUsePercent: real('business_use_percent'),
    reviewStatus: text('review_status'),
    notes: text('notes'),
  },
  (table) => [index('tax_metadata_year_idx').on(table.taxYear)],
);

export const cases = sqliteTable(
  'cases',
  {
    id: text('id').primaryKey(),
    type: text('type').$type<CaseType>().notNull(),
    title: text('title').notNull(),
    description: text('description'),
    deadline: text('deadline'),
    status: text('status').$type<CaseStatus>().notNull().default(CaseStatus.Open),
    createdAt: timestamp(),
    updatedAt: timestamp(),
    ownerPersonId: text('owner_person_id').references(() => people.id),
    organisationId: text('organisation_id').references(() => organisations.id),
  },
  (table) => [
    index('cases_status_idx').on(table.status),
    index('cases_updated_at_idx').on(table.updatedAt),
  ],
);

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
  (table) => [
    primaryKey({ columns: [table.caseId, table.documentId] }),
    index('case_documents_document_idx').on(table.documentId),
  ],
);

export const caseActions = sqliteTable(
  'case_actions',
  {
    caseId: text('case_id')
      .notNull()
      .references(() => cases.id, { onDelete: 'cascade' }),
    actionId: text('action_id')
      .notNull()
      .references(() => actions.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.caseId, table.actionId] }),
    index('case_actions_action_idx').on(table.actionId),
  ],
);

export const casePeople = sqliteTable(
  'case_people',
  {
    caseId: text('case_id')
      .notNull()
      .references(() => cases.id, { onDelete: 'cascade' }),
    personId: text('person_id')
      .notNull()
      .references(() => people.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.caseId, table.personId] }),
    index('case_people_person_idx').on(table.personId),
  ],
);

export const caseOrganisations = sqliteTable(
  'case_organisations',
  {
    caseId: text('case_id')
      .notNull()
      .references(() => cases.id, { onDelete: 'cascade' }),
    organisationId: text('organisation_id')
      .notNull()
      .references(() => organisations.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.caseId, table.organisationId] }),
    index('case_organisations_org_idx').on(table.organisationId),
  ],
);

export const caseChecklistItems = sqliteTable(
  'case_checklist_items',
  {
    id: text('id').primaryKey(),
    caseId: text('case_id')
      .notNull()
      .references(() => cases.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
    dueDate: text('due_date'),
    createdAt: timestamp(),
    completedAt: text('completed_at'),
  },
  (table) => [
    index('case_checklist_case_idx').on(table.caseId),
    index('case_checklist_due_idx').on(table.dueDate),
  ],
);

export const caseTimeline = sqliteTable(
  'case_timeline',
  {
    id: text('id').primaryKey(),
    caseId: text('case_id')
      .notNull()
      .references(() => cases.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    label: text('label').notNull(),
    createdAt: timestamp(),
    note: text('note'),
  },
  (table) => [index('case_timeline_case_idx').on(table.caseId, table.createdAt)],
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
    index('document_relations_target_idx').on(table.targetDocumentId),
  ],
);
