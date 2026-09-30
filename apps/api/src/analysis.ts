import {
  aiAnalysisResponseSchema,
  analyzeDocumentRequestSchema,
  DocumentDomain,
  DocumentType,
  TaxCategory,
  TaxReviewStatus,
  taxMetadataSchema,
  type AiAnalysisResponse,
  type AnalyzeDocumentRequest,
} from '@meindocs/schemas';

const datePattern = /\b(20\d{2}-\d{2}-\d{2})\b/g;
const amountPattern =
  /(?:€|EUR)\s?([0-9]{1,3}(?:[.\s][0-9]{3})*(?:,[0-9]{2})?|[0-9]+(?:\.[0-9]{2})?)/i;

function classify(text: string) {
  const value = text.toLowerCase();
  if (/rechnung|invoice|rechnung/.test(value))
    return { type: DocumentType.Invoice, domain: DocumentDomain.Finance };
  if (/quittung|receipt|kassenbon/.test(value))
    return { type: DocumentType.Receipt, domain: DocumentDomain.Tax };
  if (/gehaltsabrechnung|payslip|salary/.test(value))
    return { type: DocumentType.Payslip, domain: DocumentDomain.Employment };
  if (/vertrag|contract/.test(value))
    return { type: DocumentType.Contract, domain: DocumentDomain.Legal };
  return { type: DocumentType.Other, domain: DocumentDomain.General };
}

function datesFrom(text: string) {
  return [...text.matchAll(datePattern)].map((match, index) => ({
    label: index === 0 ? 'document date' : 'additional date',
    value: match[1],
  }));
}

function amountFrom(text: string) {
  const match = text.match(amountPattern);
  if (!match) return undefined;
  const normalized = match[1].replace(/\./g, '').replace(',', '.').replace(/\s/g, '');
  const value = Number(normalized);
  return Number.isFinite(value) ? value : undefined;
}

function taxSuggestion(type: DocumentType, amount: number | undefined, year?: number) {
  const relevant = type === DocumentType.Invoice || type === DocumentType.Receipt;
  return taxMetadataSchema.parse({
    category: relevant ? TaxCategory.BusinessExpense : TaxCategory.None,
    expenseCategory: relevant ? TaxCategory.BusinessExpense : TaxCategory.None,
    taxRelevant: relevant,
    grossAmount: amount,
    taxYear: year,
    deductible: relevant,
    reviewStatus: TaxReviewStatus.NeedsReview,
  });
}

export function analyzeDocument(input: AnalyzeDocumentRequest): AiAnalysisResponse {
  const request = analyzeDocumentRequestSchema.parse(input);
  const classification = classify(request.ocrText);
  const dates = datesFrom(request.ocrText);
  const amount = amountFrom(request.ocrText);
  const taxYear = dates[0] ? Number(dates[0].value.slice(0, 4)) : new Date().getFullYear();
  const tags = [classification.domain, classification.type].filter(Boolean);
  const summary =
    request.ocrText.replace(/\s+/g, ' ').trim().slice(0, 280) || 'No OCR text was extracted.';
  const actions = dates.length
    ? [
        {
          type: 'review' as const,
          title: 'Review extracted document metadata',
          dueDate: dates[0].value,
        },
      ]
    : [{ type: 'review' as const, title: 'Review extracted document metadata' }];

  return aiAnalysisResponseSchema.parse({
    documentId: request.documentId,
    status: 'completed',
    summary,
    documentType: classification.type,
    domain: classification.domain,
    confidence: request.ocrText.trim() ? 0.72 : 0.1,
    extractedText: request.ocrText,
    extractedFields: { amount, locale: request.locale },
    warnings: request.ocrText.trim() ? [] : ['OCR text was empty.'],
    tags,
    actions,
    dates,
    taxSuggestion: taxSuggestion(classification.type, amount, taxYear),
  });
}

export function taxMetadataUpdate(input: unknown) {
  return taxMetadataSchema.parse(input);
}
