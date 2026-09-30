import type {
  Document,
  DocumentSearchQuery,
  DocumentSearchRepository,
  DocumentSearchResult,
} from '@meindocs/domain';
import { eq, sql } from 'drizzle-orm';
import { documentTags } from './schema';

type DrizzleDatabase = ReturnType<typeof import('drizzle-orm/bun-sqlite').drizzle>;

const quote = (value: string) => `'${value.replaceAll("'", "''")}'`;

function documentFromRow(row: Record<string, unknown>): Document {
  return {
    id: String(row.id),
    title: String(row.title),
    type: row.type as Document['type'],
    domain: row.domain as Document['domain'],
    status: row.status as Document['status'],
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
    fileName: (row.file_name as string | null) ?? undefined,
    mimeType: (row.mime_type as string | null) ?? undefined,
    fileSizeBytes: (row.file_size_bytes as number | null) ?? undefined,
    storageUri: (row.storage_uri as string | null) ?? undefined,
    sha256: (row.sha256 as string | null) ?? undefined,
    thumbnailUri: (row.thumbnail_uri as string | null) ?? undefined,
    pageCount: (row.page_count as number | null) ?? undefined,
    ocrText: (row.ocr_text as string | null) ?? undefined,
    summary: (row.summary as string | null) ?? undefined,
    referenceNumber: (row.reference_number as string | null) ?? undefined,
    generatedFromTemplate: (row.generated_from_template as string | null) ?? undefined,
    capabilities: {
      canEdit: Boolean(row.can_edit),
      canDelete: Boolean(row.can_delete),
      canShare: Boolean(row.can_share),
      canDownload: Boolean(row.can_download),
      canArchive: Boolean(row.can_archive),
      canCreateReminder: Boolean(row.can_create_reminder),
    },
  };
}

function matchQuery(text?: string) {
  const tokens = text?.trim().split(/\s+/).filter(Boolean) ?? [];
  return tokens.length ? tokens.map((token) => `"${token.replaceAll('"', '')}"`).join(' AND ') : '';
}

function whereClause(query: DocumentSearchQuery, now = new Date().toISOString()) {
  const filters = query.filters ?? {};
  const clauses = ['1 = 1'];
  const text = matchQuery(query.text);
  if (text) clauses.push(`documents_fts MATCH ${quote(text)}`);
  if (filters.domain) clauses.push(`d.domain = ${quote(filters.domain)}`);
  if (filters.type) clauses.push(`d.type = ${quote(filters.type)}`);
  if (filters.personId)
    clauses.push(
      `(d.issuer_person_id = ${quote(filters.personId)} OR d.recipient_person_id = ${quote(filters.personId)})`,
    );
  if (filters.organisationId)
    clauses.push(
      `(d.issuer_organisation_id = ${quote(filters.organisationId)} OR d.recipient_organisation_id = ${quote(filters.organisationId)})`,
    );
  if (filters.dateFrom) clauses.push(`d.createdAt >= ${quote(filters.dateFrom)}`);
  if (filters.dateTo) clauses.push(`d.createdAt <= ${quote(`${filters.dateTo}T23:59:59.999Z`)}`);
  if (filters.taxRelevant !== undefined)
    clauses.push(`COALESCE(tax.tax_relevant, 0) = ${filters.taxRelevant ? 1 : 0}`);
  if (filters.taxYear !== undefined) clauses.push(`tax.tax_year = ${filters.taxYear}`);
  if (filters.actionRequired) clauses.push(`d.status = 'needs_review'`);
  if (filters.unpaidBill)
    clauses.push(
      `EXISTS (SELECT 1 FROM payments p WHERE p.document_id = d.id AND p.status IN ('pending', 'overdue'))`,
    );
  if (filters.expiryStatus === 'expired')
    clauses.push(
      `EXISTS (SELECT 1 FROM reminders r WHERE r.document_id = d.id AND r.expiry_date < ${quote(now)} AND r.completed = 0)`,
    );
  if (filters.expiryStatus === 'expiring')
    clauses.push(
      `EXISTS (SELECT 1 FROM reminders r WHERE r.document_id = d.id AND r.expiry_date >= ${quote(now)} AND r.expiry_date <= datetime(${quote(now)}, '+30 days') AND r.completed = 0)`,
    );
  if (filters.expiryStatus === 'active')
    clauses.push(
      `NOT EXISTS (SELECT 1 FROM reminders r WHERE r.document_id = d.id AND r.expiry_date < ${quote(now)} AND r.completed = 0)`,
    );
  for (const tag of filters.tags ?? [])
    clauses.push(
      `EXISTS (SELECT 1 FROM document_tags dt JOIN tags tg ON tg.id = dt.tag_id WHERE dt.document_id = d.id AND tg.name = ${quote(tag)})`,
    );
  return clauses.join(' AND ');
}

function orderBy(sort: DocumentSearchQuery['sort']) {
  if (sort === 'oldest') return 'd.createdAt ASC';
  if (sort === 'expiry') return 'MIN(r.expiry_date) ASC NULLS LAST';
  if (sort === 'due') return 'MIN(r.due_date) ASC NULLS LAST';
  if (sort === 'relevance') return 'd.updatedAt DESC';
  return 'd.createdAt DESC';
}

export async function syncDocumentSearchIndex(db: DrizzleDatabase, documentId: string) {
  const id = quote(documentId);
  await db.run(sql.raw(`DELETE FROM documents_fts WHERE document_id = ${id}`));
  const rows = await db.all(
    sql.raw(`
    SELECT d.id, d.title, d.ocr_text, d.summary, d.reference_number,
      COALESCE(p.first_name || ' ' || p.last_name, o.name, '') AS issuer,
      COALESCE((SELECT group_concat(t.name, ' ') FROM document_tags dt JOIN tags t ON t.id = dt.tag_id WHERE dt.document_id = d.id), '') AS tags
    FROM documents d
    LEFT JOIN people p ON p.id = d.issuer_person_id
    LEFT JOIN organisations o ON o.id = d.issuer_organisation_id
    WHERE d.id = ${id}
  `),
  );
  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) return;
  await db.run(
    sql.raw(
      `INSERT INTO documents_fts (document_id, title, ocr_text, summary, issuer, tags, reference_number) VALUES (${quote(String(row.id))}, ${quote(String(row.title ?? ''))}, ${quote(String(row.ocr_text ?? ''))}, ${quote(String(row.summary ?? ''))}, ${quote(String(row.issuer ?? ''))}, ${quote(String(row.tags ?? ''))}, ${quote(String(row.reference_number ?? ''))})`,
    ),
  );
}

export class SqliteDocumentSearchRepository implements DocumentSearchRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async search(
    query: DocumentSearchQuery,
  ): Promise<{ results: DocumentSearchResult[]; total: number }> {
    const where = whereClause(query);
    const join = matchQuery(query.text)
      ? 'JOIN documents_fts ON documents_fts.document_id = d.id'
      : 'LEFT JOIN documents_fts ON documents_fts.document_id = d.id';
    const limit = Math.min(Math.max(query.limit ?? 50, 1), 100);
    const offset = Math.max(query.offset ?? 0, 0);
    const base = `FROM documents d ${join} LEFT JOIN tax_metadata tax ON tax.document_id = d.id LEFT JOIN reminders r ON r.document_id = d.id WHERE ${where}`;
    const rows = await this.db.all(
      sql.raw(
        `SELECT d.*, 0 AS score ${base} GROUP BY d.id ORDER BY ${orderBy(query.sort)} LIMIT ${limit} OFFSET ${offset}`,
      ),
    );
    const count = await this.db.all(sql.raw(`SELECT COUNT(DISTINCT d.id) AS count ${base}`));
    return {
      results: (rows as Record<string, unknown>[]).map((row) => ({
        document: documentFromRow(row),
        score: Number(row.score ?? 0),
        highlights: query.text
          ? (() => {
              const term = query.text.split(/\s+/).filter(Boolean)[0] ?? '';
              const source = [row.title, row.ocr_text, row.summary, row.reference_number].find(
                (value) =>
                  String(value ?? '')
                    .toLocaleLowerCase()
                    .includes(term.toLocaleLowerCase()),
              );
              return source
                ? [
                    String(source).replace(
                      new RegExp(`(${query.text.split(/\s+/).filter(Boolean).join('|')})`, 'ig'),
                      '<mark>$1</mark>',
                    ),
                  ]
                : [];
            })()
          : [],
      })),
      total: Number((count[0] as { count: number }).count),
    };
  }

  reindex(documentId: string) {
    return syncDocumentSearchIndex(this.db, documentId);
  }

  async remove(documentId: string) {
    await this.db.run(
      sql.raw(`DELETE FROM documents_fts WHERE document_id = ${quote(documentId)}`),
    );
  }
}

/** Keeps denormalized tag text and the FTS row in sync after tag edits. */
export class SqliteDocumentTagRepository {
  constructor(private readonly db: DrizzleDatabase) {}

  async setTags(documentId: string, tagIds: string[]) {
    await this.db.delete(documentTags).where(eq(documentTags.documentId, documentId));
    if (tagIds.length) {
      await this.db.insert(documentTags).values(tagIds.map((tagId) => ({ documentId, tagId })));
    }
    await syncDocumentSearchIndex(this.db, documentId);
  }
}
