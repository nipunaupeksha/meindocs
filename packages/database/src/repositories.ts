import { and, desc, eq, like, sql, type InferSelectModel, type SQL } from 'drizzle-orm';
import type {
  CreateDocumentInput,
  CreateReminderInput,
  Document,
  DocumentAction,
  DocumentActionRepository,
  DocumentFilters,
  DocumentRepository,
  Reminder,
  ReminderFilters,
  ReminderRepository,
  UpdateDocumentInput,
  UpdateReminderInput,
} from '@meindocs/domain';
import { actions, caseDocuments, documents, reminders } from './schema';
import { syncDocumentSearchIndex } from './search';

type DocumentRow = InferSelectModel<typeof documents>;
type ReminderRow = InferSelectModel<typeof reminders>;

const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
const ensureId = (value?: string) => value ?? id();
const optional = <T>(value: T | null) => value ?? undefined;

function whereFor(conditions: SQL<unknown>[]) {
  return conditions.length ? and(...conditions) : undefined;
}

function addCondition<T>(
  conditions: SQL<unknown>[],
  value: T | undefined,
  create: (value: T) => SQL<unknown>,
) {
  if (value !== undefined) conditions.push(create(value));
}

function documentConditions(filters: DocumentFilters) {
  const conditions: SQL<unknown>[] = [];
  addCondition(conditions, filters.domain, (value) => eq(documents.domain, value));
  addCondition(conditions, filters.status, (value) => eq(documents.status, value));
  addCondition(conditions, filters.type, (value) => eq(documents.type, value));
  addCondition(conditions, filters.search, (value) => like(documents.title, `%${value}%`));
  return conditions;
}

function reminderConditions(filters: ReminderFilters) {
  const conditions: SQL<unknown>[] = [];
  addCondition(conditions, filters.documentId, (value) => eq(reminders.documentId, value));
  addCondition(conditions, filters.completed, (value) => eq(reminders.completed, value));
  return conditions;
}

function toDocument(row: DocumentRow): Document {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    domain: row.domain,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    fileName: optional(row.fileName),
    mimeType: optional(row.mimeType),
    fileSizeBytes: optional(row.fileSizeBytes),
    storageUri: optional(row.storageUri),
    sha256: optional(row.sha256),
    thumbnailUri: optional(row.thumbnailUri),
    pageCount: optional(row.pageCount),
    ocrText: optional(row.ocrText),
    summary: optional(row.summary),
    referenceNumber: optional(row.referenceNumber),
    generatedFromTemplate: optional(row.generatedFromTemplate),
    capabilities: {
      canEdit: row.canEdit,
      canDelete: row.canDelete,
      canShare: row.canShare,
      canDownload: row.canDownload,
      canArchive: row.canArchive,
      canCreateReminder: row.canCreateReminder,
    },
  };
}

function toReminder(row: ReminderRow): Reminder {
  return {
    id: row.id,
    documentId: optional(row.documentId),
    title: row.title,
    dueDate: row.dueDate,
    expiryDate: optional(row.expiryDate),
    priority: row.priority,
    completed: row.completed,
    completedAt: optional(row.completedAt),
    notificationId: optional(row.notificationId),
    notes: optional(row.notes),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class SqliteDocumentRepository implements DocumentRepository {
  constructor(private readonly db: ReturnType<typeof import('drizzle-orm/bun-sqlite').drizzle>) {}

  async getById(documentId: string) {
    const [row] = await this.db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);
    return row ? toDocument(row) : null;
  }

  async list(filters: DocumentFilters = {}) {
    const conditions = documentConditions(filters);
    const rows = filters.caseId
      ? await this.listByCase(filters.caseId, conditions)
      : await this.listAll(conditions);
    return rows.map(toDocument);
  }

  private async listAll(conditions: SQL<unknown>[]) {
    return this.db
      .select()
      .from(documents)
      .where(whereFor(conditions))
      .orderBy(desc(documents.updatedAt));
  }

  private async listByCase(caseId: string, conditions: SQL<unknown>[]) {
    const rows = await this.db
      .select({ document: documents })
      .from(documents)
      .innerJoin(caseDocuments, eq(caseDocuments.documentId, documents.id))
      .where(and(...conditions, eq(caseDocuments.caseId, caseId)))
      .orderBy(desc(documents.updatedAt));
    return rows.map(({ document }) => document);
  }

  async create(input: CreateDocumentInput) {
    const timestamp = now();
    const [row] = await this.db
      .insert(documents)
      .values({
        id: ensureId(input.id),
        title: input.title,
        type: input.type,
        domain: input.domain,
        status: input.status,
        createdAt: input.createdAt ?? timestamp,
        updatedAt: input.updatedAt ?? timestamp,
        fileName: input.fileName,
        mimeType: input.mimeType,
        fileSizeBytes: input.fileSizeBytes,
        storageUri: input.storageUri,
        sha256: input.sha256,
        thumbnailUri: input.thumbnailUri,
        pageCount: input.pageCount,
        ocrText: input.ocrText,
        summary: input.summary,
        referenceNumber: input.referenceNumber,
        generatedFromTemplate: input.generatedFromTemplate,
        ...input.capabilities,
      })
      .returning();
    await syncDocumentSearchIndex(this.db, row.id);
    return toDocument(row);
  }

  async update(documentId: string, input: UpdateDocumentInput) {
    const { capabilities, ...documentValues } = input;
    const values: Partial<typeof documents.$inferInsert> = {
      updatedAt: input.updatedAt ?? now(),
      ...documentValues,
      ...capabilities,
    };
    await this.db.update(documents).set(values).where(eq(documents.id, documentId));
    await syncDocumentSearchIndex(this.db, documentId);
  }

  async delete(documentId: string) {
    await this.db.delete(documents).where(eq(documents.id, documentId));
    await this.db.run(
      sql.raw(
        `DELETE FROM documents_fts WHERE document_id = '${documentId.replaceAll("'", "''")}'`,
      ),
    );
  }
}

export class SqliteReminderRepository implements ReminderRepository {
  constructor(private readonly db: ReturnType<typeof import('drizzle-orm/bun-sqlite').drizzle>) {}

  async getById(reminderId: string) {
    const [row] = await this.db
      .select()
      .from(reminders)
      .where(eq(reminders.id, reminderId))
      .limit(1);
    return row ? toReminder(row) : null;
  }

  async list(filters: ReminderFilters = {}) {
    const conditions = reminderConditions(filters);
    const rows = await this.db
      .select()
      .from(reminders)
      .where(whereFor(conditions))
      .orderBy(reminders.dueDate);
    return rows.map(toReminder);
  }

  async create(input: CreateReminderInput) {
    const timestamp = now();
    const [row] = await this.db
      .insert(reminders)
      .values({
        id: ensureId(input.id),
        documentId: input.documentId,
        title: input.title,
        dueDate: input.dueDate,
        expiryDate: input.expiryDate,
        priority: input.priority ?? 'normal',
        notes: input.notes,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .returning();
    return toReminder(row);
  }

  async update(reminderId: string, input: UpdateReminderInput) {
    const completedAt = input.completed === true ? (input.completedAt ?? now()) : input.completedAt;
    await this.db
      .update(reminders)
      .set({ ...input, completedAt, updatedAt: input.updatedAt ?? now() })
      .where(eq(reminders.id, reminderId));
  }
}

export class SqliteDocumentActionRepository implements DocumentActionRepository {
  constructor(private readonly db: ReturnType<typeof import('drizzle-orm/bun-sqlite').drizzle>) {}

  async listForDocument(documentId: string) {
    const rows = await this.db
      .select()
      .from(actions)
      .where(eq(actions.documentId, documentId))
      .orderBy(desc(actions.createdAt));
    return rows.map(
      (row): DocumentAction => ({
        id: row.id,
        documentId: row.documentId,
        type: row.type,
        createdAt: row.createdAt,
        actorId: row.actorPersonId ?? row.actorOrganisationId ?? undefined,
        note: row.note ?? undefined,
      }),
    );
  }

  async create(input: Omit<DocumentAction, 'id'> & { id?: string }) {
    const [row] = await this.db
      .insert(actions)
      .values({
        id: ensureId(input.id),
        documentId: input.documentId,
        type: input.type,
        createdAt: input.createdAt,
        note: input.note,
        actorPersonId: input.actorId,
      })
      .returning();
    return {
      id: row.id,
      documentId: row.documentId,
      type: row.type,
      createdAt: row.createdAt,
      actorId: row.actorPersonId ?? row.actorOrganisationId ?? undefined,
      note: row.note ?? undefined,
    } satisfies DocumentAction;
  }
}
