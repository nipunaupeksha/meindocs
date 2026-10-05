import type { DocumentDomain, DocumentType } from './index';
import type { DocumentSearchFilters, DocumentSearchRepository, SearchSort } from './repositories';

export type SmartViewFilter = DocumentSearchFilters & {
  needsAttention?: boolean;
  expiryFrom?: string;
  expiryTo?: string;
  caseId?: string;
  customFields?: Record<
    string,
    { equals?: string | number | boolean; contains?: string; gt?: number; lt?: number }
  >;
};

export interface SavedSearch {
  id: string;
  name: string;
  icon: string;
  filters: SmartViewFilter;
  sort: SearchSort;
  createdAt: string;
  updatedAt: string;
}

export type SmartView = SavedSearch;

export const BUILT_IN_SMART_VIEW_IDS = [
  'needs-attention',
  'tax-current-year',
  'unreviewed-receipts',
  'unpaid-bills',
  'expiring-soon',
  'immigration',
  'housing',
  'insurance',
  'employment',
] as const;

export function builtInSmartViews(year = new Date().getUTCFullYear()): SavedSearch[] {
  const timestamp = new Date(0).toISOString();
  const nextMonth = new Date(Date.UTC(year, new Date().getUTCMonth() + 1, 1))
    .toISOString()
    .slice(0, 10);
  return [
    {
      id: 'needs-attention',
      name: 'Needs Attention',
      icon: 'alert-circle',
      filters: { needsAttention: true },
      sort: 'due',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'tax-current-year',
      name: `Tax ${year}`,
      icon: 'calculator',
      filters: { taxRelevant: true, taxYear: year },
      sort: 'newest',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'unreviewed-receipts',
      name: 'Unreviewed Receipts',
      icon: 'receipt',
      filters: { type: 'receipt' as DocumentType, actionRequired: true },
      sort: 'newest',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'unpaid-bills',
      name: 'Unpaid Bills',
      icon: 'wallet',
      filters: { unpaidBill: true },
      sort: 'due',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'expiring-soon',
      name: 'Expiring Soon',
      icon: 'time',
      filters: { expiryStatus: 'expiring', expiryTo: nextMonth },
      sort: 'expiry',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'immigration',
      name: 'Immigration',
      icon: 'globe',
      filters: { domain: 'identity' as DocumentDomain },
      sort: 'newest',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'housing',
      name: 'Housing',
      icon: 'home',
      filters: { domain: 'housing' as DocumentDomain },
      sort: 'newest',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'insurance',
      name: 'Insurance',
      icon: 'shield-checkmark',
      filters: { domain: 'insurance' as DocumentDomain },
      sort: 'newest',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: 'employment',
      name: 'Employment',
      icon: 'briefcase',
      filters: { domain: 'employment' as DocumentDomain },
      sort: 'newest',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

export function serializeSmartViewFilters(filters: SmartViewFilter) {
  return JSON.stringify(filters);
}

export function deserializeSmartViewFilters(value: string): SmartViewFilter {
  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
    throw new Error('Invalid smart view filters');
  return parsed as SmartViewFilter;
}

export class SmartViewService {
  constructor(private readonly repository: DocumentSearchRepository) {}

  evaluate(view: SavedSearch, limit = 100) {
    return this.repository.search({ filters: view.filters, sort: view.sort, limit });
  }
}
