import { and, desc, eq, like } from 'drizzle-orm';
import type {
  Case,
  CaseChecklistItem,
  CaseFilters,
  CaseRepository,
  CreateCaseInput,
  UpdateCaseInput,
} from '@meindocs/domain';
import { CaseStatus } from '@meindocs/domain';
import {
  caseActions,
  caseChecklistItems,
  caseDocuments,
  caseOrganisations,
  casePeople,
  caseTimeline,
  cases,
} from './schema';

type Db = ReturnType<typeof import('drizzle-orm/bun-sqlite').drizzle>;
const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();

export class SqliteCaseRepository implements CaseRepository {
  constructor(private readonly db: Db) {}

  async getById(caseId: string) {
    const [row] = await this.db.select().from(cases).where(eq(cases.id, caseId)).limit(1);
    if (!row) return null;
    return this.hydrate(row);
  }

  async list(filters: CaseFilters = {}) {
    const conditions = [];
    if (filters.status) conditions.push(eq(cases.status, filters.status));
    if (filters.type) conditions.push(eq(cases.type, filters.type));
    if (filters.search) conditions.push(like(cases.title, `%${filters.search}%`));
    const rows = await this.db
      .select()
      .from(cases)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(cases.updatedAt));
    return Promise.all(rows.map((row) => this.hydrate(row)));
  }

  async create(input: CreateCaseInput) {
    const timestamp = now();
    const caseId = id();
    const [row] = await this.db
      .insert(cases)
      .values({
        id: caseId,
        type: input.type,
        title: input.title,
        description: input.description,
        deadline: input.deadline,
        status: input.status ?? CaseStatus.Open,
        createdAt: timestamp,
        updatedAt: timestamp,
        ownerPersonId: input.owner?.id,
        organisationId: input.organisation?.id,
      })
      .returning();
    await this.db
      .insert(caseTimeline)
      .values({ id: id(), caseId, type: 'created', label: 'Case created', createdAt: timestamp });
    return this.hydrate(row);
  }

  async update(caseId: string, input: UpdateCaseInput) {
    await this.db
      .update(cases)
      .set({ ...input, updatedAt: now() })
      .where(eq(cases.id, caseId));
    if (input.status === 'completed') {
      await this.db
        .insert(caseTimeline)
        .values({ id: id(), caseId, type: 'completed', label: 'Case completed', createdAt: now() });
    }
  }

  async delete(caseId: string) {
    await this.db.delete(cases).where(eq(cases.id, caseId));
  }

  async addDocument(caseId: string, documentId: string) {
    await this.db.insert(caseDocuments).values({ caseId, documentId }).onConflictDoNothing();
    await this.touch(caseId, 'document_added', 'Document added to case');
  }
  async removeDocument(caseId: string, documentId: string) {
    await this.db
      .delete(caseDocuments)
      .where(and(eq(caseDocuments.caseId, caseId), eq(caseDocuments.documentId, documentId)));
    await this.touch(caseId, 'document_removed', 'Document removed from case');
  }
  async addAction(caseId: string, actionId: string) {
    await this.db.insert(caseActions).values({ caseId, actionId }).onConflictDoNothing();
    await this.touch(caseId, 'action_added', 'Action added to case');
  }
  async addPerson(caseId: string, personId: string) {
    await this.db.insert(casePeople).values({ caseId, personId }).onConflictDoNothing();
    await this.touch(caseId, 'person_added', 'Person added to case');
  }
  async addOrganisation(caseId: string, organisationId: string) {
    await this.db
      .insert(caseOrganisations)
      .values({ caseId, organisationId })
      .onConflictDoNothing();
    await this.touch(caseId, 'organisation_added', 'Organisation added to case');
  }

  async addChecklistItem(
    caseId: string,
    title: string,
    dueDate?: string,
  ): Promise<CaseChecklistItem> {
    const row = { id: id(), caseId, title, dueDate, createdAt: now(), completed: false };
    const [created] = await this.db.insert(caseChecklistItems).values(row).returning();
    await this.touch(caseId, 'checklist_added', title);
    return {
      ...created,
      dueDate: created.dueDate ?? undefined,
      completedAt: created.completedAt ?? undefined,
    };
  }

  async completeChecklistItem(itemId: string, completed = true) {
    const [item] = await this.db
      .select()
      .from(caseChecklistItems)
      .where(eq(caseChecklistItems.id, itemId))
      .limit(1);
    if (!item) return;
    await this.db
      .update(caseChecklistItems)
      .set({ completed, completedAt: completed ? now() : null })
      .where(eq(caseChecklistItems.id, itemId));
    await this.touch(
      item.caseId,
      completed ? 'checklist_completed' : 'checklist_reopened',
      item.title,
    );
  }

  private async touch(caseId: string, type: string, label: string) {
    await this.db.update(cases).set({ updatedAt: now() }).where(eq(cases.id, caseId));
    await this.db.insert(caseTimeline).values({ id: id(), caseId, type, label, createdAt: now() });
  }

  private async hydrate(row: typeof cases.$inferSelect): Promise<Case> {
    const [docs, actionRows, people, organisations, checklist, timeline] = await Promise.all([
      this.db
        .select({ id: caseDocuments.documentId })
        .from(caseDocuments)
        .where(eq(caseDocuments.caseId, row.id)),
      this.db
        .select({ id: caseActions.actionId })
        .from(caseActions)
        .where(eq(caseActions.caseId, row.id)),
      this.db
        .select({ id: casePeople.personId })
        .from(casePeople)
        .where(eq(casePeople.caseId, row.id)),
      this.db
        .select({ id: caseOrganisations.organisationId })
        .from(caseOrganisations)
        .where(eq(caseOrganisations.caseId, row.id)),
      this.db
        .select()
        .from(caseChecklistItems)
        .where(eq(caseChecklistItems.caseId, row.id))
        .orderBy(caseChecklistItems.createdAt),
      this.db
        .select()
        .from(caseTimeline)
        .where(eq(caseTimeline.caseId, row.id))
        .orderBy(caseTimeline.createdAt),
    ]);
    return {
      id: row.id,
      type: row.type,
      title: row.title,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      description: row.description ?? undefined,
      deadline: row.deadline ?? undefined,
      documentIds: docs.map((v) => v.id),
      actionIds: actionRows.map((v) => v.id),
      personIds: people.map((v) => v.id),
      organisationIds: organisations.map((v) => v.id),
      checklist: checklist.map((item) => ({
        ...item,
        dueDate: item.dueDate ?? undefined,
        completedAt: item.completedAt ?? undefined,
      })),
      timeline: timeline.map((event) => ({ ...event, note: event.note ?? undefined })),
    };
  }
}
