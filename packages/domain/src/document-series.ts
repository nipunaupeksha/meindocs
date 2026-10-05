import type { DocumentDomain, DocumentType, TaxMetadata } from './index';

export enum DocumentSeriesFrequency {
  Monthly = 'monthly',
  Quarterly = 'quarterly',
  Yearly = 'yearly',
  Irregular = 'irregular',
}

export interface DocumentSeries {
  id: string;
  name: string;
  documentType: DocumentType;
  issuer?: string;
  organisationId?: string;
  relatedPersonId?: string;
  defaultCaseId?: string;
  expectedFrequency: DocumentSeriesFrequency;
  defaultTags: string[];
  defaultTaxMetadata?: Pick<
    TaxMetadata,
    'category' | 'expenseCategory' | 'taxRelevant' | 'businessUsePercent'
  >;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentSeriesMember {
  id: string;
  seriesId: string;
  documentId: string;
  documentDate: string;
  createdAt: string;
}

export interface SeriesDocumentCandidate {
  id: string;
  type: DocumentType;
  domain: DocumentDomain;
  organisationId?: string;
  issuer?: string;
  title: string;
  extractedIdentifiers?: string[];
  documentDate: string;
}

export interface SeriesMatch {
  series: DocumentSeries;
  score: number;
  certain: boolean;
  reasons: string[];
  expectedIntervalDays?: number;
}

const intervalDays: Record<
  Exclude<DocumentSeriesFrequency, DocumentSeriesFrequency.Irregular>,
  number
> = {
  monthly: 30,
  quarterly: 91,
  yearly: 365,
};

function tokens(value: string) {
  return new Set(
    value
      .toLowerCase()
      .split(/[^a-z0-9äöüß]+/i)
      .filter((item) => item.length > 2),
  );
}

function titleSimilarity(left: string, right: string) {
  const a = tokens(left);
  const b = tokens(right);
  if (!a.size || !b.size) return 0;
  const intersection = [...a].filter((token) => b.has(token)).length;
  return intersection / new Set([...a, ...b]).size;
}

function daysBetween(left: string, right: string) {
  return Math.abs(
    (Date.parse(`${right.slice(0, 10)}T00:00:00Z`) - Date.parse(`${left.slice(0, 10)}T00:00:00Z`)) /
      86_400_000,
  );
}

export function expectedIntervalDays(frequency: DocumentSeriesFrequency) {
  return frequency === DocumentSeriesFrequency.Irregular ? undefined : intervalDays[frequency];
}

export function matchDocumentToSeries(
  document: SeriesDocumentCandidate,
  series: DocumentSeries,
  previousDate?: string,
  previousTitle?: string,
  previousIdentifiers: string[] = [],
): SeriesMatch | null {
  if (document.type !== series.documentType) return null;
  let score = 0;
  const reasons: string[] = ['document type'];
  if (series.organisationId && document.organisationId === series.organisationId) {
    score += 0.4;
    reasons.push('organisation');
  } else if (series.organisationId) return null;
  if (series.issuer) {
    if (!document.issuer || titleSimilarity(document.issuer, series.issuer) < 0.5) return null;
    score += 0.3;
    reasons.push('issuer');
  }
  if (previousTitle && titleSimilarity(document.title, previousTitle) >= 0.35) {
    score += 0.25;
    reasons.push('similar title');
  }
  if (
    document.extractedIdentifiers?.length &&
    previousIdentifiers.some((id) => document.extractedIdentifiers?.includes(id))
  ) {
    score += 0.2;
    reasons.push('shared identifier');
  }
  const expected = expectedIntervalDays(series.expectedFrequency);
  if (expected && previousDate) {
    const actual = daysBetween(previousDate, document.documentDate);
    if (Math.abs(actual - expected) <= expected * 0.35) {
      score += 0.15;
      reasons.push('expected date interval');
    } else if (Math.abs(actual - expected) > expected * 0.75) return null;
  }
  if (score < 0.35) return null;
  return { series, score, certain: score >= 0.7, reasons, expectedIntervalDays: expected };
}

export function missingSeriesDates(series: DocumentSeries, memberDates: string[], asOf: string) {
  const interval = expectedIntervalDays(series.expectedFrequency);
  if (!interval || !memberDates.length) return [];
  const latest = [...memberDates].sort().at(-1);
  if (!latest) return [];
  const missing: string[] = [];
  let cursor = Date.parse(`${latest.slice(0, 10)}T00:00:00Z`);
  const end = Date.parse(`${asOf.slice(0, 10)}T00:00:00Z`);
  while (cursor + interval * 86_400_000 * 1.35 < end) {
    cursor += interval * 86_400_000;
    const expected = new Date(cursor).toISOString().slice(0, 10);
    if (!memberDates.some((date) => Math.abs(daysBetween(date, expected)) <= 12))
      missing.push(expected);
  }
  return missing;
}

export function inheritableSeriesMetadata(series: DocumentSeries) {
  return {
    tags: [...series.defaultTags],
    tax: series.defaultTaxMetadata ? { ...series.defaultTaxMetadata } : undefined,
    organisationId: series.organisationId,
    personId: series.relatedPersonId,
    caseId: series.defaultCaseId,
  };
}

export interface DocumentSeriesRepository {
  list(): Promise<DocumentSeries[]>;
  getById(id: string): Promise<DocumentSeries | null>;
  create(
    input: Omit<DocumentSeries, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
  ): Promise<DocumentSeries>;
  addMember(
    input: Omit<DocumentSeriesMember, 'id' | 'createdAt'> & { id?: string },
  ): Promise<DocumentSeriesMember>;
  listMembers(seriesId: string): Promise<DocumentSeriesMember[]>;
}

export class DocumentSeriesService {
  constructor(private readonly repository: DocumentSeriesRepository) {}

  async findCandidates(
    document: SeriesDocumentCandidate,
    context: Record<string, { previousTitle?: string; previousIdentifiers?: string[] }> = {},
  ) {
    const series = await this.repository.list();
    const matches = await Promise.all(
      series.map(async (item) => {
        const members = await this.repository.listMembers(item.id);
        const previous = [...members].sort((a, b) =>
          b.documentDate.localeCompare(a.documentDate),
        )[0];
        const history = context[item.id];
        return matchDocumentToSeries(
          document,
          item,
          previous?.documentDate,
          history?.previousTitle ?? item.name,
          history?.previousIdentifiers ?? [],
        );
      }),
    );
    return matches
      .filter((item): item is SeriesMatch => item !== null)
      .sort((a, b) => b.score - a.score);
  }

  async missingDocuments(series: DocumentSeries, asOf: string) {
    const members = await this.repository.listMembers(series.id);
    return missingSeriesDates(
      series,
      members.map((member) => member.documentDate),
      asOf,
    );
  }
}
