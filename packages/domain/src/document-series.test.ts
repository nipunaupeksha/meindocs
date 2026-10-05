import { describe, expect, test } from 'bun:test';
import {
  DocumentDomain,
  DocumentSeriesFrequency,
  DocumentType,
  DocumentSeriesService,
  TaxCategory,
  inheritableSeriesMetadata,
  matchDocumentToSeries,
  missingSeriesDates,
} from './index';

const series = {
  id: 'series-1',
  name: 'HanseMerkur Monthly Contribution',
  issuer: 'HanseMerkur',
  documentType: DocumentType.Invoice,
  organisationId: 'org-1',
  expectedFrequency: DocumentSeriesFrequency.Monthly,
  defaultTags: ['insurance'],
  defaultTaxMetadata: { category: TaxCategory.Insurance, taxRelevant: true, businessUsePercent: 0 },
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const document = (date: string, issuer = 'HanseMerkur') => ({
  id: `doc-${date}`,
  type: DocumentType.Invoice,
  domain: DocumentDomain.Insurance,
  organisationId: 'org-1',
  issuer,
  title: `HanseMerkur contribution ${date.slice(0, 7)}`,
  documentDate: date,
});

describe('document series matching', () => {
  test('matches a monthly document with the expected interval', () => {
    const match = matchDocumentToSeries(
      document('2026-02-01'),
      series,
      '2026-01-02',
      'HanseMerkur contribution January',
    );
    expect(match?.certain).toBe(true);
    expect(match?.reasons).toContain('expected date interval');
  });

  test('rejects an incorrect issuer', () => {
    expect(
      matchDocumentToSeries(
        document('2026-02-01', 'Other insurer'),
        series,
        '2026-01-02',
        'HanseMerkur contribution January',
      ),
    ).toBeNull();
  });

  test('inherits only safe metadata', () => {
    const inherited = inheritableSeriesMetadata(series);
    expect(inherited.tags).toEqual(['insurance']);
    expect(inherited.tax?.taxRelevant).toBe(true);
    expect(inherited).not.toHaveProperty('amount');
    expect(inherited).not.toHaveProperty('dueDate');
    expect(inherited).not.toHaveProperty('invoiceNumber');
  });

  test('reports a missing monthly document without notifying', () => {
    expect(missingSeriesDates(series, ['2026-01-01', '2026-02-01'], '2026-03-20')).toEqual([
      '2026-03-03',
    ]);
  });

  test('service returns series membership candidates', async () => {
    const repository = {
      list: async () => [series],
      getById: async () => series,
      create: async () => series,
      addMember: async (input: never) => input,
      listMembers: async () => [
        {
          id: 'member-1',
          seriesId: 'series-1',
          documentId: 'doc-1',
          documentDate: '2026-01-02',
          createdAt: '2026-01-02',
        },
      ],
    };
    const matches = await new DocumentSeriesService(repository).findCandidates(
      document('2026-02-01'),
    );
    expect(matches).toHaveLength(1);
    expect(matches[0].series.id).toBe('series-1');
  });
});
