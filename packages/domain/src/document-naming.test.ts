import { expect, test } from 'bun:test';
import { DocumentDomain, DocumentNamingService, DocumentType } from './index';

const service = new DocumentNamingService();

test('names receipts with issuer and exact date', () => {
  const title = service.generate({
    type: DocumentType.Receipt,
    domain: DocumentDomain.Tax,
    issuer: 'MediaMarkt',
    documentDate: '2026-09-18',
  });
  expect(title.en).toBe('MediaMarkt - Receipt - 18 September 2026');
  expect(title.de).toBe('MediaMarkt - Beleg - 18. September 2026');
});

test('names utility bills and tax assessments deterministically', () => {
  expect(
    service.generate({
      type: DocumentType.Invoice,
      domain: DocumentDomain.Utilities,
      issuer: 'LSW',
      documentDate: '2026-09-01',
    }).en,
  ).toBe('LSW - Electricity Bill - September 2026');
  expect(
    service.generate({
      type: DocumentType.TaxNotice,
      domain: DocumentDomain.Tax,
      issuer: 'Finanzamt Wolfsburg',
      taxYear: 2025,
    }).de,
  ).toBe('Finanzamt Wolfsburg - Steuerbescheid - 2025');
});

test('does not regenerate user titles', () => {
  expect(service.shouldRegenerate('automatic')).toBe(true);
  expect(service.shouldRegenerate('ai')).toBe(false);
  expect(service.shouldRegenerate('user')).toBe(false);
  expect(
    service.regenerateIfAutomatic(
      {
        type: DocumentType.Receipt,
        domain: DocumentDomain.Tax,
        issuer: 'Shop',
        documentDate: '2026-01-01',
      },
      'user',
    ),
  ).toBeNull();
  expect(
    service.regenerateIfAutomatic(
      {
        type: DocumentType.Receipt,
        domain: DocumentDomain.Tax,
        issuer: 'Shop',
        documentDate: '2026-01-01',
      },
      'automatic',
    )?.en,
  ).toContain('Shop');
});
