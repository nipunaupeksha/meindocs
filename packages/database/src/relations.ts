import { relations } from 'drizzle-orm';
import {
  actions,
  caseDocuments,
  cases,
  documentRelations,
  documentTags,
  documents,
  organisations,
  payments,
  people,
  reminders,
  tags,
  taxMetadata,
} from './schema';

export const peopleRelations = relations(people, ({ many }) => ({
  issuedDocuments: many(documents, { relationName: 'issuerPerson' }),
  receivedDocuments: many(documents, { relationName: 'recipientPerson' }),
  actions: many(actions),
  ownedCases: many(cases),
}));

export const organisationsRelations = relations(organisations, ({ many }) => ({
  issuedDocuments: many(documents, { relationName: 'issuerOrganisation' }),
  receivedDocuments: many(documents, { relationName: 'recipientOrganisation' }),
  actions: many(actions),
  cases: many(cases),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  issuerPerson: one(people, {
    fields: [documents.issuerPersonId],
    references: [people.id],
    relationName: 'issuerPerson',
  }),
  issuerOrganisation: one(organisations, {
    fields: [documents.issuerOrganisationId],
    references: [organisations.id],
    relationName: 'issuerOrganisation',
  }),
  recipientPerson: one(people, {
    fields: [documents.recipientPersonId],
    references: [people.id],
    relationName: 'recipientPerson',
  }),
  recipientOrganisation: one(organisations, {
    fields: [documents.recipientOrganisationId],
    references: [organisations.id],
    relationName: 'recipientOrganisation',
  }),
  tags: many(documentTags),
  actions: many(actions),
  reminders: many(reminders),
  payments: many(payments),
  taxMetadata: one(taxMetadata),
  caseDocuments: many(caseDocuments),
  outgoingRelations: many(documentRelations, { relationName: 'sourceDocument' }),
  incomingRelations: many(documentRelations, { relationName: 'targetDocument' }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  documents: many(documentTags),
}));

export const documentTagsRelations = relations(documentTags, ({ one }) => ({
  document: one(documents, {
    fields: [documentTags.documentId],
    references: [documents.id],
  }),
  tag: one(tags, {
    fields: [documentTags.tagId],
    references: [tags.id],
  }),
}));

export const actionsRelations = relations(actions, ({ one }) => ({
  document: one(documents, {
    fields: [actions.documentId],
    references: [documents.id],
  }),
  actorPerson: one(people, {
    fields: [actions.actorPersonId],
    references: [people.id],
  }),
  actorOrganisation: one(organisations, {
    fields: [actions.actorOrganisationId],
    references: [organisations.id],
  }),
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
  document: one(documents, {
    fields: [reminders.documentId],
    references: [documents.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  document: one(documents, {
    fields: [payments.documentId],
    references: [documents.id],
  }),
}));

export const taxMetadataRelations = relations(taxMetadata, ({ one }) => ({
  document: one(documents, {
    fields: [taxMetadata.documentId],
    references: [documents.id],
  }),
}));

export const casesRelations = relations(cases, ({ one, many }) => ({
  owner: one(people, {
    fields: [cases.ownerPersonId],
    references: [people.id],
  }),
  organisation: one(organisations, {
    fields: [cases.organisationId],
    references: [organisations.id],
  }),
  documents: many(caseDocuments),
}));

export const caseDocumentsRelations = relations(caseDocuments, ({ one }) => ({
  case: one(cases, {
    fields: [caseDocuments.caseId],
    references: [cases.id],
  }),
  document: one(documents, {
    fields: [caseDocuments.documentId],
    references: [documents.id],
  }),
}));

export const documentRelationsRelations = relations(documentRelations, ({ one }) => ({
  sourceDocument: one(documents, {
    fields: [documentRelations.sourceDocumentId],
    references: [documents.id],
    relationName: 'sourceDocument',
  }),
  targetDocument: one(documents, {
    fields: [documentRelations.targetDocumentId],
    references: [documents.id],
    relationName: 'targetDocument',
  }),
}));
