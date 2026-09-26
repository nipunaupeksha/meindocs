export enum DocumentDomain {
  General = 'general',
  Identity = 'identity',
  Housing = 'housing',
  Insurance = 'insurance',
  Finance = 'finance',
  Tax = 'tax',
  Employment = 'employment',
  Health = 'health',
  Vehicle = 'vehicle',
  Education = 'education',
  Legal = 'legal',
  Utilities = 'utilities',
}

export enum DocumentType {
  Other = 'other',
  Contract = 'contract',
  Invoice = 'invoice',
  Receipt = 'receipt',
  Statement = 'statement',
  Certificate = 'certificate',
  Letter = 'letter',
  Form = 'form',
  Payslip = 'payslip',
  TaxNotice = 'tax_notice',
}

export enum DocumentStatus {
  Inbox = 'inbox',
  Processing = 'processing',
  NeedsReview = 'needs_review',
  Active = 'active',
  Archived = 'archived',
  Deleted = 'deleted',
}

export enum ActionType {
  Upload = 'upload',
  Scan = 'scan',
  Review = 'review',
  Classify = 'classify',
  Edit = 'edit',
  Archive = 'archive',
  Restore = 'restore',
  Share = 'share',
  Download = 'download',
  Delete = 'delete',
}

export enum PaymentStatus {
  Pending = 'pending',
  Paid = 'paid',
  Overdue = 'overdue',
  Cancelled = 'cancelled',
  Refunded = 'refunded',
}

export enum CaseType {
  General = 'general',
  Tax = 'tax',
  Insurance = 'insurance',
  Housing = 'housing',
  Employment = 'employment',
  Legal = 'legal',
  Other = 'other',
}

export enum TaxCategory {
  None = 'none',
  Income = 'income',
  BusinessExpense = 'business_expense',
  WorkExpense = 'work_expense',
  Insurance = 'insurance',
  Housing = 'housing',
  Healthcare = 'healthcare',
  Education = 'education',
  Donation = 'donation',
  Other = 'other',
}

export interface DocumentCapabilities {
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  canDownload: boolean;
  canArchive: boolean;
  canCreateReminder: boolean;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

export interface Organisation {
  id: string;
  name: string;
  legalName?: string;
  registrationNumber?: string;
  taxNumber?: string;
  email?: string;
  phone?: string;
}

export interface TaxMetadata {
  category: TaxCategory;
  taxYear?: number;
  deductible?: boolean;
  deductibleAmount?: number;
  notes?: string;
}

export interface Payment {
  id: string;
  documentId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  dueDate?: string;
  paidAt?: string;
  reference?: string;
}

export interface DocumentAction {
  id: string;
  documentId: string;
  type: ActionType;
  createdAt: string;
  actorId?: string;
  note?: string;
}

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  domain: DocumentDomain;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
  fileName?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  storageUri?: string;
  issuer?: Person | Organisation;
  recipient?: Person | Organisation;
  capabilities: DocumentCapabilities;
  actions?: DocumentAction[];
  payment?: Payment;
  tax?: TaxMetadata;
  caseId?: string;
}

export interface Case {
  id: string;
  type: CaseType;
  title: string;
  status: 'open' | 'closed' | 'archived';
  createdAt: string;
  updatedAt: string;
  documentIds: string[];
  owner?: Person;
  organisation?: Organisation;
}

export * from './repositories';
