import type { MockDocument } from './data';

export type LocalSearchFilters = {
  category?: string;
  type?: string;
  personId?: string;
  organisationId?: string;
  dateFrom?: string;
  dateTo?: string;
  taxRelevant?: boolean;
  taxYear?: number;
  actionRequired?: boolean;
  unpaidBill?: boolean;
  expiryStatus?: MockDocument['expiryStatus'];
  tags?: string[];
};
export type LocalSearchSort = 'relevance' | 'newest' | 'oldest' | 'expiry' | 'due';

export function searchLocalDocuments(
  documents: MockDocument[],
  text: string,
  filters: LocalSearchFilters,
  sort: LocalSearchSort,
) {
  const terms = text.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const rows = documents
    .map((document) => {
      const haystack = [
        document.title.en,
        document.title.de,
        document.issuer,
        document.extractedText,
        document.summary,
        document.referenceNumber,
        ...(document.tags ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase();
      const score = terms.filter((term) => haystack.includes(term)).length;
      return { document, score };
    })
    .filter(({ document, score }) => {
      if (terms.length && score !== terms.length) return false;
      if (filters.category && document.category !== filters.category) return false;
      if (filters.type && document.category !== filters.type) return false;
      if (filters.personId && document.personId !== filters.personId) return false;
      if (filters.organisationId && document.organisationId !== filters.organisationId)
        return false;
      if (filters.dateFrom && document.date < filters.dateFrom) return false;
      if (filters.dateTo && document.date > filters.dateTo) return false;
      if (
        filters.taxRelevant !== undefined &&
        Boolean(document.tax?.taxRelevant) !== filters.taxRelevant
      )
        return false;
      if (filters.taxYear !== undefined && document.tax?.taxYear !== filters.taxYear) return false;
      if (
        filters.actionRequired !== undefined &&
        Boolean(document.actionRequired) !== filters.actionRequired
      )
        return false;
      if (filters.unpaidBill !== undefined && Boolean(document.unpaidBill) !== filters.unpaidBill)
        return false;
      if (filters.expiryStatus && document.expiryStatus !== filters.expiryStatus) return false;
      if (filters.tags?.some((tag) => !(document.tags ?? []).includes(tag))) return false;
      return true;
    });
  rows.sort((a, b) => {
    if (sort === 'relevance')
      return b.score - a.score || b.document.date.localeCompare(a.document.date);
    if (sort === 'oldest') return a.document.date.localeCompare(b.document.date);
    if (sort === 'expiry' || sort === 'due')
      return (a.document.expiryStatus ?? 'zz').localeCompare(b.document.expiryStatus ?? 'zz');
    return b.document.date.localeCompare(a.document.date);
  });
  return rows;
}

export function highlightParts(value: string, text: string) {
  const terms = text
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return terms.length ? value.split(new RegExp(`(${terms.join('|')})`, 'gi')) : [value];
}
