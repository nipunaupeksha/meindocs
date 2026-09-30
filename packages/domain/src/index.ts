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

export enum DocumentRelationType {
  GenerationFrom = 'generation_from',
  GeneratedFrom = 'generated_from',
}

export enum PersonRelationship {
  Self = 'self',
  Spouse = 'spouse',
  Child = 'child',
  Dependent = 'dependent',
  Other = 'other',
}

export enum OrganisationType {
  Government = 'government',
  Employer = 'employer',
  Landlord = 'landlord',
  Insurance = 'insurance',
  Bank = 'bank',
  Utility = 'utility',
  Healthcare = 'healthcare',
  Business = 'business',
  Education = 'education',
  Other = 'other',
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
  Immigration = 'immigration',
  General = 'general',
  Tax = 'tax',
  Insurance = 'insurance',
  Housing = 'housing',
  Employment = 'employment',
  Legal = 'legal',
  Family = 'family',
  Vehicle = 'vehicle',
  Custom = 'custom',
  Other = 'other',
}

export enum CaseStatus {
  Open = 'open',
  ActionRequired = 'action_required',
  Waiting = 'waiting',
  Completed = 'completed',
  Archived = 'archived',
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

export enum TaxReviewStatus {
  NeedsReview = 'needs_review',
  Reviewed = 'reviewed',
  Rejected = 'rejected',
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
  preferredName?: string;
  dateOfBirth?: string;
  relationship: PersonRelationship;
  addresses: string[];
  nationality?: string;
  identifiersEncrypted?: string;
  documentIds: string[];
  caseIds: string[];
}

export interface Organisation {
  id: string;
  name: string;
  legalName?: string;
  registrationNumber?: string;
  taxNumber?: string;
  email?: string;
  phone?: string;
  type: OrganisationType;
  address?: string;
  website?: string;
  customerReference?: string;
  documentIds: string[];
  caseIds: string[];
  paymentIds: string[];
  actionIds: string[];
}

export interface TaxMetadata {
  category: TaxCategory;
  taxRelevant?: boolean;
  expenseCategory?: TaxCategory;
  taxYear?: number;
  deductible?: boolean;
  deductibleAmount?: number;
  netAmount?: number;
  vatAmount?: number;
  grossAmount?: number;
  vatRate?: number;
  businessUsePercent?: number;
  reviewStatus?: TaxReviewStatus;
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
  sha256?: string;
  thumbnailUri?: string;
  pageCount?: number;
  ocrText?: string;
  summary?: string;
  referenceNumber?: string;
  generatedFromTemplate?: string;
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
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;
  documentIds: string[];
  owner?: Person;
  organisation?: Organisation;
  description?: string;
  deadline?: string;
  actionIds: string[];
  personIds: string[];
  organisationIds: string[];
  checklist: CaseChecklistItem[];
  timeline: CaseTimelineEvent[];
}

export interface CaseChecklistItem {
  id: string;
  caseId: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

export interface CaseTimelineEvent {
  id: string;
  caseId: string;
  type: string;
  label: string;
  createdAt: string;
  note?: string;
}

export * from './repositories';
export * from './backup';
export * from './case-service';
export * from './document-generator';
export * from './people-organisations-service';
export * from './dashboard';
export * from './export';
export * from './errors';
