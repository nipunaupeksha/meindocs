import { and, eq, inArray } from 'drizzle-orm';
import type { BulkDocumentOperation, BulkDocumentRepository } from '@meindocs/domain';
import { DocumentStatus, TaxCategory } from '@meindocs/domain';
import {
  caseDocuments,
  cases,
  documentTags,
  documents,
  organisations,
  people,
  tags,
  taxMetadata,
} from './schema';
import { syncDocumentSearchIndex } from './search';

type Db = ReturnType<typeof import('drizzle-orm/bun-sqlite').drizzle>;
const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();

export class SqliteBulkDocumentRepository implements BulkDocumentRepository {
  constructor(private readonly db: Db) {}

  async execute(documentId: string, operation: BulkDocumentOperation) {
    await this.db.transaction(async (tx) => {
      const [document] = await tx
        .select({ id: documents.id })
        .from(documents)
        .where(eq(documents.id, documentId))
        .limit(1);
      if (!document) throw new Error('Document not found');
      if (operation.type === 'delete') {
        await tx.delete(documents).where(eq(documents.id, documentId));
        return;
      }
      if (operation.type === 'export') throw new Error('Bulk export must use the export service');
      if (operation.type === 'add_tags' || operation.type === 'remove_tags') {
        const names = [...new Set(operation.tags.map((tag) => tag.trim()).filter(Boolean))];
        if (operation.type === 'add_tags') {
          for (const name of names) {
            const existing = await tx
              .select({ id: tags.id })
              .from(tags)
              .where(eq(tags.name, name))
              .limit(1);
            const tagId = existing[0]?.id ?? id();
            if (!existing.length)
              await tx.insert(tags).values({ id: tagId, name, createdAt: now() });
            await tx.insert(documentTags).values({ documentId, tagId }).onConflictDoNothing();
          }
        } else if (names.length) {
          const rows = await tx.select({ id: tags.id }).from(tags).where(inArray(tags.name, names));
          if (rows.length)
            await tx.delete(documentTags).where(
              and(
                eq(documentTags.documentId, documentId),
                inArray(
                  documentTags.tagId,
                  rows.map((row) => row.id),
                ),
              ),
            );
        }
        await syncDocumentSearchIndex(tx, documentId);
        return;
      }
      if (operation.type === 'assign_person') {
        if (operation.personId) {
          const [person] = await tx
            .select({ id: people.id })
            .from(people)
            .where(eq(people.id, operation.personId))
            .limit(1);
          if (!person) throw new Error('Person not found');
        }
        await tx
          .update(documents)
          .set({ recipientPersonId: operation.personId, updatedAt: now() })
          .where(eq(documents.id, documentId));
      } else if (operation.type === 'assign_organisation') {
        if (operation.organisationId) {
          const [organisation] = await tx
            .select({ id: organisations.id })
            .from(organisations)
            .where(eq(organisations.id, operation.organisationId))
            .limit(1);
          if (!organisation) throw new Error('Organisation not found');
        }
        await tx
          .update(documents)
          .set({ recipientOrganisationId: operation.organisationId, updatedAt: now() })
          .where(eq(documents.id, documentId));
      } else if (operation.type === 'mark_tax_relevant' || operation.type === 'assign_tax_year') {
        const [tax] = await tx
          .select()
          .from(taxMetadata)
          .where(eq(taxMetadata.documentId, documentId))
          .limit(1);
        if (tax) {
          await tx
            .update(taxMetadata)
            .set({
              ...(operation.type === 'mark_tax_relevant' ? { taxRelevant: operation.value } : {}),
              ...(operation.type === 'assign_tax_year' ? { taxYear: operation.year } : {}),
            })
            .where(eq(taxMetadata.documentId, documentId));
        } else {
          await tx.insert(taxMetadata).values({
            documentId,
            category: TaxCategory.Other,
            taxRelevant: operation.type === 'mark_tax_relevant' ? operation.value : undefined,
            taxYear: operation.type === 'assign_tax_year' ? operation.year : undefined,
          });
        }
      } else if (operation.type === 'add_to_case') {
        const [caseRow] = await tx
          .select({ id: cases.id })
          .from(cases)
          .where(eq(cases.id, operation.caseId))
          .limit(1);
        if (!caseRow) throw new Error('Case not found');
        await tx
          .insert(caseDocuments)
          .values({ caseId: operation.caseId, documentId })
          .onConflictDoNothing();
      } else if (operation.type === 'archive') {
        await tx
          .update(documents)
          .set({ status: DocumentStatus.Archived, updatedAt: now() })
          .where(eq(documents.id, documentId));
      }
      await syncDocumentSearchIndex(tx, documentId);
    });
  }
}
