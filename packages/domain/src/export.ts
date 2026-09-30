export const TAX_EXPORT_CATEGORIES = [
  'income',
  'business-expenses',
  'insurance',
  'travel',
  'equipment',
  'home-office',
  'healthcare',
  'childcare',
  'other',
] as const;

export type TaxExportCategory = (typeof TAX_EXPORT_CATEGORIES)[number];

export interface ExportDocument {
  id: string;
  title: string;
  date: string;
  vendor: string;
  category?: string;
  description?: string;
  net?: number;
  vat?: number;
  gross?: number;
  businessUsagePercent?: number;
  deductibleAmount?: number;
  sourceFileName?: string;
  sourceUri?: string;
  taxYear?: number;
  reviewed?: boolean;
  taxRelevant?: boolean;
}

export interface TaxExportOptions {
  year: number;
  categories?: TaxExportCategory[];
  reviewedOnly?: boolean;
}

export interface ExportManifestFile {
  path: string;
  documentId?: string;
  size?: number;
  checksum?: string;
}

export interface ExportManifest {
  version: 1;
  type: 'documents' | 'tax';
  createdAt: string;
  taxYear?: number;
  categories?: TaxExportCategory[];
  reviewedOnly?: boolean;
  files: ExportManifestFile[];
  totals?: { net: number; vat: number; gross: number; deductible: number };
}

export function normalizeTaxCategory(category?: string): TaxExportCategory {
  const value = category?.toLowerCase().replaceAll('_', '-');
  if (value === 'income') return 'income';
  if (value === 'business-expenses' || value === 'business-expense' || value === 'work-expense')
    return 'business-expenses';
  if (value === 'insurance') return 'insurance';
  if (value === 'travel') return 'travel';
  if (value === 'equipment') return 'equipment';
  if (value === 'home-office' || value === 'home') return 'home-office';
  if (value === 'healthcare' || value === 'health') return 'healthcare';
  if (value === 'childcare' || value === 'child-care') return 'childcare';
  return 'other';
}

export function selectTaxDocuments(documents: ExportDocument[], options: TaxExportOptions) {
  const allowed = new Set(options.categories ?? TAX_EXPORT_CATEGORIES);
  return documents.filter((document) => {
    const year = document.taxYear ?? Number(document.date.slice(0, 4));
    const category = normalizeTaxCategory(document.category);
    return (
      document.taxRelevant !== false &&
      year === options.year &&
      allowed.has(category) &&
      (!options.reviewedOnly || document.reviewed === true)
    );
  });
}

export function groupTaxDocuments(documents: ExportDocument[]) {
  const initial = {} as Record<TaxExportCategory, ExportDocument[]>;
  for (const category of TAX_EXPORT_CATEGORIES) initial[category] = [];
  return documents.reduce<Record<TaxExportCategory, ExportDocument[]>>((groups, document) => {
    const category = normalizeTaxCategory(document.category);
    groups[category].push(document);
    return groups;
  }, initial);
}

export function calculateExportTotals(documents: ExportDocument[]) {
  return documents.reduce(
    (totals, document) => ({
      net: totals.net + (document.net ?? document.gross ?? 0),
      vat: totals.vat + (document.vat ?? 0),
      gross: totals.gross + (document.gross ?? 0),
      deductible: totals.deductible + (document.deductibleAmount ?? document.gross ?? 0),
    }),
    { net: 0, vat: 0, gross: 0, deductible: 0 },
  );
}

function csvCell(value: string | number | undefined) {
  const text = value === undefined ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function createExpenseCsv(documents: ExportDocument[]) {
  const header = [
    'date',
    'vendor',
    'category',
    'description',
    'net',
    'VAT',
    'gross',
    'business usage %',
    'deductible amount',
    'source document filename',
  ];
  const rows = documents.map((document) => [
    document.date,
    document.vendor,
    normalizeTaxCategory(document.category),
    document.description ?? document.title,
    document.net ?? '',
    document.vat ?? '',
    document.gross ?? '',
    document.businessUsagePercent ?? '',
    document.deductibleAmount ?? '',
    document.sourceFileName ?? '',
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n') + '\n';
}

export function createExportManifest(input: Omit<ExportManifest, 'version'>): ExportManifest {
  return { version: 1, ...input };
}
