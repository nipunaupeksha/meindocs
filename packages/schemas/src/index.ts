import { z } from 'zod';
import {
  ActionType,
  DocumentDomain,
  DocumentStatus,
  DocumentType,
  TaxCategory,
} from '@meindocs/domain';

export const healthResponseSchema = z.object({
  status: z.literal('ok'),
});

const idSchema = z.string().trim().min(1);
const isoDateSchema = z.iso.date();
const isoDateTimeSchema = z.iso.datetime({ offset: true });

export const personSchema = z.object({
  id: idSchema,
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.email().optional(),
  phone: z.string().trim().min(1).optional(),
});

export const organisationSchema = z.object({
  id: idSchema,
  name: z.string().trim().min(1),
  legalName: z.string().trim().min(1).optional(),
  registrationNumber: z.string().trim().min(1).optional(),
  taxNumber: z.string().trim().min(1).optional(),
  email: z.email().optional(),
  phone: z.string().trim().min(1).optional(),
});

export const documentCapabilitiesSchema = z.object({
  canEdit: z.boolean(),
  canDelete: z.boolean(),
  canShare: z.boolean(),
  canDownload: z.boolean(),
  canArchive: z.boolean(),
  canCreateReminder: z.boolean(),
});

/** Validates the metadata needed to index a document without validating its file contents. */
export const documentMetadataSchema = z.object({
  id: idSchema,
  title: z.string().trim().min(1).max(200),
  type: z.nativeEnum(DocumentType),
  domain: z.nativeEnum(DocumentDomain),
  status: z.nativeEnum(DocumentStatus),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
  fileName: z.string().trim().min(1).optional(),
  mimeType: z.string().trim().min(1).optional(),
  fileSizeBytes: z.number().int().nonnegative().optional(),
  storageUri: z.string().trim().min(1).optional(),
  issuer: z.union([personSchema, organisationSchema]).optional(),
  recipient: z.union([personSchema, organisationSchema]).optional(),
  capabilities: documentCapabilitiesSchema,
  caseId: idSchema.optional(),
});

export const documentActionSchema = z.object({
  id: idSchema,
  documentId: idSchema,
  type: z.nativeEnum(ActionType),
  createdAt: isoDateTimeSchema,
  actorId: idSchema.optional(),
  note: z.string().trim().max(2_000).optional(),
});

export const taxMetadataSchema = z.object({
  category: z.nativeEnum(TaxCategory),
  taxYear: z.number().int().min(1900).max(2_200).optional(),
  deductible: z.boolean().optional(),
  deductibleAmount: z.number().nonnegative().optional(),
  notes: z.string().trim().max(2_000).optional(),
});

export const aiAnalysisResponseSchema = z.object({
  documentId: idSchema,
  status: z.enum(['pending', 'completed', 'failed']),
  summary: z.string().trim().max(10_000).optional(),
  documentType: z.nativeEnum(DocumentType).optional(),
  domain: z.nativeEnum(DocumentDomain).optional(),
  confidence: z.number().min(0).max(1).optional(),
  extractedText: z.string().optional(),
  extractedFields: z.record(z.string(), z.unknown()).optional(),
  warnings: z.array(z.string().trim().min(1)).optional(),
});

export const receiptLineItemSchema = z.object({
  description: z.string().trim().min(1),
  quantity: z.number().positive().optional(),
  unitPrice: z.number().nonnegative().optional(),
  total: z.number().nonnegative(),
});

export const receiptExtractionSchema = z.object({
  documentId: idSchema,
  merchant: z.string().trim().min(1),
  transactionDate: isoDateSchema.optional(),
  total: z.number().nonnegative(),
  currency: z
    .string()
    .trim()
    .regex(/^[A-Z]{3}$/),
  taxAmount: z.number().nonnegative().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  lineItems: z.array(receiptLineItemSchema).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export const reminderCreationSchema = z.object({
  title: z.string().trim().min(1).max(200),
  dueDate: isoDateSchema,
  priority: z.enum(['normal', 'high']).default('normal'),
  documentId: idSchema.optional(),
  notes: z.string().trim().max(2_000).optional(),
});

export type DocumentMetadata = z.infer<typeof documentMetadataSchema>;
export type DocumentAction = z.infer<typeof documentActionSchema>;
export type TaxMetadata = z.infer<typeof taxMetadataSchema>;
export type AiAnalysisResponse = z.infer<typeof aiAnalysisResponseSchema>;
export type ReceiptExtraction = z.infer<typeof receiptExtractionSchema>;
export type ReminderCreation = z.infer<typeof reminderCreationSchema>;
