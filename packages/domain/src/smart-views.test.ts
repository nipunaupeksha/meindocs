import { expect, test } from 'bun:test';
import {
  SmartViewService,
  builtInSmartViews,
  deserializeSmartViewFilters,
  serializeSmartViewFilters,
} from './index';

test('smart view filters serialize and deserialize without losing nested values', () => {
  const filters = {
    taxRelevant: true,
    taxYear: 2026,
    tags: ['freelance'],
    customFields: { business_usage: { gt: 0 } },
  };
  expect(deserializeSmartViewFilters(serializeSmartViewFilters(filters))).toEqual(filters);
});

test('built-in views include the required collections', () => {
  expect(builtInSmartViews(2026).map((view) => view.id)).toEqual([
    'needs-attention',
    'tax-current-year',
    'unreviewed-receipts',
    'unpaid-bills',
    'expiring-soon',
    'immigration',
    'housing',
    'insurance',
    'employment',
  ]);
});

test('smart view service executes the saved filter through search', async () => {
  const calls: unknown[] = [];
  const repository = {
    search: async (query: unknown) => {
      calls.push(query);
      return { results: [], total: 0 };
    },
    reindex: async () => {},
    remove: async () => {},
  };
  await new SmartViewService(repository).evaluate(builtInSmartViews(2026)[1]);
  expect(calls).toHaveLength(1);
  expect(calls[0]).toMatchObject({ filters: { taxRelevant: true, taxYear: 2026 }, sort: 'newest' });
});
