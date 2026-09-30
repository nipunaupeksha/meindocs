import { expect, test } from 'bun:test';
import { buildApp } from './app';

test('GET /health returns the health contract', async () => {
  const app = buildApp();
  try {
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json<unknown>()).toEqual({ status: 'ok' });
  } finally {
    await app.close();
  }
});

test('POST /v1/ai/analyze-document returns structured metadata and tax suggestions', async () => {
  const app = buildApp();
  try {
    const response = await app.inject({
      method: 'POST',
      url: '/v1/ai/analyze-document',
      payload: {
        documentId: 'doc-1',
        ocrText: 'Rechnung 2026-09-27 EUR 119,00',
        locale: 'de-DE',
      },
    });
    expect(response.statusCode).toBe(200);
    expect(
      response.json<{ documentType: string; taxSuggestion: { grossAmount?: number } }>(),
    ).toMatchObject({
      documentType: 'invoice',
      taxSuggestion: { grossAmount: 119 },
    });
    const stored = await app.inject({ method: 'GET', url: '/v1/ai/analyses/doc-1' });
    expect(stored.statusCode).toBe(200);
    expect(stored.json<Record<string, unknown>>()).not.toHaveProperty('extractedText');
  } finally {
    await app.close();
  }
});

test('tax review can be updated and summarized', async () => {
  const app = buildApp();
  try {
    const update = await app.inject({
      method: 'PUT',
      url: '/v1/documents/doc-1/tax',
      payload: {
        category: 'business_expense',
        expenseCategory: 'business_expense',
        taxRelevant: true,
        taxYear: 2026,
        grossAmount: 119,
        netAmount: 100,
        vatAmount: 19,
        vatRate: 19,
        businessUsePercent: 80,
        reviewStatus: 'reviewed',
      },
    });
    expect(update.statusCode).toBe(200);
    const summary = await app.inject({ method: 'GET', url: '/v1/tax/summary?year=2026' });
    expect(summary.statusCode).toBe(200);
    expect(summary.json<{ documentCount: number; vatAmount: number }>()).toMatchObject({
      documentCount: 1,
      vatAmount: 19,
    });
  } finally {
    await app.close();
  }
});
