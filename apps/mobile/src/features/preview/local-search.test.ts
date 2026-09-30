// @ts-nocheck
import { expect, test } from 'bun:test';
import { initialDocuments } from './data';
import { highlightParts, searchLocalDocuments } from './local-search';

test('local search matches OCR and metadata and sorts by relevance', () => {
  const documents = searchLocalDocuments(
    [{ ...initialDocuments[3], extractedText: 'VAT invoice for a desk', tags: ['office'] }],
    'VAT office',
    { taxRelevant: false },
    'relevance',
  );
  expect(documents).toHaveLength(1);
  expect(highlightParts('VAT invoice', 'VAT')).toContain('VAT');
});

test('local search filters tax year and action required', () => {
  const rows = searchLocalDocuments(
    [{ ...initialDocuments[3], actionRequired: true, tax: { taxRelevant: true, taxYear: 2026 } }],
    '',
    { taxRelevant: true, taxYear: 2026, actionRequired: true },
    'newest',
  );
  expect(rows).toHaveLength(1);
});
