import { describe, expect, test } from 'bun:test';
import {
  calculateExportTotals,
  createExpenseCsv,
  createExportManifest,
  groupTaxDocuments,
  selectTaxDocuments,
} from './export';

const docs = [
  {
    id: '1',
    title: 'Desk',
    date: '2026-02-01',
    vendor: 'IKEA',
    category: 'home_office',
    gross: 100,
    net: 84,
    vat: 16,
    deductibleAmount: 100,
    reviewed: true,
    taxYear: 2026,
  },
  {
    id: '2',
    title: 'Train',
    date: '2026-03-01',
    vendor: 'DB',
    category: 'travel',
    gross: 50,
    reviewed: false,
    taxYear: 2026,
  },
];

describe('tax export', () => {
  test('filters and groups by year/category/review', () => {
    const selected = selectTaxDocuments(docs, { year: 2026, reviewedOnly: true });
    expect(selected).toHaveLength(1);
    expect(groupTaxDocuments(selected)['home-office']).toHaveLength(1);
  });
  test('calculates totals and CSV fields', () => {
    expect(calculateExportTotals(docs)).toEqual({ net: 134, vat: 16, gross: 150, deductible: 150 });
    expect(createExpenseCsv(docs)).toContain('date,vendor,category,description,net,VAT,gross');
    expect(createExpenseCsv(docs)).toContain('IKEA');
  });
  test('creates versioned manifest', () => {
    expect(
      createExportManifest({ type: 'tax', createdAt: '2026-01-01T00:00:00.000Z', files: [] })
        .version,
    ).toBe(1);
  });
});
