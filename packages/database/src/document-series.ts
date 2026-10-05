import { and, desc, eq } from 'drizzle-orm';
import type {
  DocumentSeries,
  DocumentSeriesMember,
  DocumentSeriesRepository,
} from '@meindocs/domain';
import { documentSeries, documentSeriesMembers } from './schema';

type Db = ReturnType<typeof import('drizzle-orm/bun-sqlite').drizzle>;
const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();

function parseJson<T>(value: string | null) {
  if (!value) return undefined;
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

function seriesFromRow(row: typeof documentSeries.$inferSelect): DocumentSeries {
  return {
    id: row.id,
    name: row.name,
    documentType: row.documentType,
    issuer: row.issuer ?? undefined,
    organisationId: row.organisationId ?? undefined,
    relatedPersonId: row.relatedPersonId ?? undefined,
    defaultCaseId: row.defaultCaseId ?? undefined,
    expectedFrequency: row.expectedFrequency,
    defaultTags: parseJson<string[]>(row.defaultTags) ?? [],
    defaultTaxMetadata: parseJson<DocumentSeries['defaultTaxMetadata']>(row.defaultTaxMetadata),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function memberFromRow(row: typeof documentSeriesMembers.$inferSelect): DocumentSeriesMember {
  return {
    id: row.id,
    seriesId: row.seriesId,
    documentId: row.documentId,
    documentDate: row.documentDate,
    createdAt: row.createdAt,
  };
}

export class SqliteDocumentSeriesRepository implements DocumentSeriesRepository {
  constructor(private readonly db: Db) {}

  async list() {
    const rows = await this.db
      .select()
      .from(documentSeries)
      .orderBy(desc(documentSeries.updatedAt));
    return rows.map(seriesFromRow);
  }

  async getById(seriesId: string) {
    const [row] = await this.db
      .select()
      .from(documentSeries)
      .where(eq(documentSeries.id, seriesId))
      .limit(1);
    return row ? seriesFromRow(row) : null;
  }

  async create(input: Omit<DocumentSeries, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) {
    const timestamp = now();
    const [row] = await this.db
      .insert(documentSeries)
      .values({
        id: input.id ?? id(),
        name: input.name,
        documentType: input.documentType,
        issuer: input.issuer,
        organisationId: input.organisationId,
        relatedPersonId: input.relatedPersonId,
        defaultCaseId: input.defaultCaseId,
        expectedFrequency: input.expectedFrequency,
        defaultTags: JSON.stringify(input.defaultTags),
        defaultTaxMetadata: input.defaultTaxMetadata
          ? JSON.stringify(input.defaultTaxMetadata)
          : null,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .returning();
    return seriesFromRow(row);
  }

  async addMember(input: Omit<DocumentSeriesMember, 'id' | 'createdAt'> & { id?: string }) {
    const existing = await this.db
      .select()
      .from(documentSeriesMembers)
      .where(
        and(
          eq(documentSeriesMembers.documentId, input.documentId),
          eq(documentSeriesMembers.seriesId, input.seriesId),
        ),
      )
      .limit(1);
    if (existing.length) return memberFromRow(existing[0]);
    const [row] = await this.db
      .insert(documentSeriesMembers)
      .values({
        id: input.id ?? id(),
        seriesId: input.seriesId,
        documentId: input.documentId,
        documentDate: input.documentDate,
        createdAt: now(),
      })
      .returning();
    return memberFromRow(row);
  }

  async listMembers(seriesId: string) {
    const rows = await this.db
      .select()
      .from(documentSeriesMembers)
      .where(eq(documentSeriesMembers.seriesId, seriesId))
      .orderBy(documentSeriesMembers.documentDate);
    return rows.map(memberFromRow);
  }
}
