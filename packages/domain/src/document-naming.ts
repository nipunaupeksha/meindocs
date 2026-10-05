import type { DocumentDomain, DocumentType } from './index';

export type DocumentTitleSource = 'automatic' | 'ai' | 'user';
export type NamingLanguage = 'en' | 'de';

export interface DocumentNamingInput {
  type: DocumentType;
  domain: DocumentDomain;
  issuer?: string;
  documentDate?: string;
  billingPeriod?: string;
  taxYear?: number;
  relatedPerson?: string;
  category?: string;
  originalFilename?: string;
}

export interface DocumentTitlePair {
  en: string;
  de: string;
}

function formatDate(date: string | undefined, language: NamingLanguage, includeDay: boolean) {
  if (!date) return '';
  const parsed = new Date(`${date.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return '';
  return new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : 'en-GB', {
    ...(includeDay ? { day: 'numeric' } : {}),
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}

function cleanIssuer(issuer?: string) {
  return issuer?.trim().replace(/\s+/g, ' ') || '';
}
function fallback(input: DocumentNamingInput, language: NamingLanguage) {
  const filename = input.originalFilename
    ?.replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .trim();
  return [
    cleanIssuer(input.issuer),
    filename || (language === 'de' ? 'Dokument' : 'Document'),
    formatDate(input.documentDate, language, false),
  ]
    .filter(Boolean)
    .join(' - ');
}

export class DocumentNamingService {
  generate(input: DocumentNamingInput): DocumentTitlePair {
    const issuer = cleanIssuer(input.issuer);
    const periodEn = input.billingPeriod || formatDate(input.documentDate, 'en', false);
    const periodDe = input.billingPeriod || formatDate(input.documentDate, 'de', false);
    const dateEn = formatDate(input.documentDate, 'en', true);
    const dateDe = formatDate(input.documentDate, 'de', true);
    const suffix = input.relatedPerson ? ` · ${input.relatedPerson}` : '';
    switch (input.type) {
      case 'receipt':
        return {
          en: [issuer, 'Receipt', dateEn].filter(Boolean).join(' - ') + suffix,
          de: [issuer, 'Beleg', dateDe].filter(Boolean).join(' - ') + suffix,
        };
      case 'invoice':
        if (input.domain === 'utilities')
          return {
            en: [issuer, 'Electricity Bill', periodEn].filter(Boolean).join(' - '),
            de: [issuer, 'Stromrechnung', periodDe].filter(Boolean).join(' - '),
          };
        return {
          en: [issuer, 'Invoice', periodEn].filter(Boolean).join(' - '),
          de: [issuer, 'Rechnung', periodDe].filter(Boolean).join(' - '),
        };
      case 'tax_notice':
        return {
          en: [issuer || 'Tax Office', 'Tax Assessment', input.taxYear ?? '']
            .filter(Boolean)
            .join(' - '),
          de: [issuer || 'Finanzamt', 'Steuerbescheid', input.taxYear ?? '']
            .filter(Boolean)
            .join(' - '),
        };
      case 'payslip':
        return {
          en: [issuer, 'Payslip', periodEn].filter(Boolean).join(' - '),
          de: [issuer, 'Gehaltsabrechnung', periodDe].filter(Boolean).join(' - '),
        };
      case 'statement':
        return {
          en: [issuer, input.domain === 'finance' ? 'Bank Statement' : 'Statement', periodEn]
            .filter(Boolean)
            .join(' - '),
          de: [issuer, input.domain === 'finance' ? 'Kontoauszug' : 'Abrechnung', periodDe]
            .filter(Boolean)
            .join(' - '),
        };
      default:
        if (input.domain === 'insurance')
          return {
            en: [issuer, 'Insurance Notice', periodEn].filter(Boolean).join(' - '),
            de: [issuer, 'Versicherungsschreiben', periodDe].filter(Boolean).join(' - '),
          };
        if (input.domain === 'employment')
          return {
            en: [issuer, 'Employment Document', periodEn].filter(Boolean).join(' - '),
            de: [issuer, 'Arbeitsdokument', periodDe].filter(Boolean).join(' - '),
          };
        if (input.domain === 'identity' || input.domain === 'housing')
          return {
            en: [issuer, 'Residence Document', periodEn].filter(Boolean).join(' - '),
            de: [issuer, 'Aufenthaltsdokument', periodDe].filter(Boolean).join(' - '),
          };
        return { en: fallback(input, 'en'), de: fallback(input, 'de') };
    }
  }
  shouldRegenerate(titleSource: DocumentTitleSource) {
    return titleSource === 'automatic';
  }

  regenerateIfAutomatic(input: DocumentNamingInput, titleSource: DocumentTitleSource) {
    return this.shouldRegenerate(titleSource) ? this.generate(input) : null;
  }
}
