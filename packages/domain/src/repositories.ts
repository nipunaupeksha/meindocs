import type {
  Document,
  DocumentAction,
  DocumentCapabilities,
  DocumentDomain,
  DocumentStatus,
  DocumentType,
  Case,
  CaseChecklistItem,
  CaseStatus,
  CaseType,
  TaxMetadata,
  Organisation,
  OrganisationType,
  Person,
  PersonRelationship,
} from './index';

export interface DocumentFilters {
  domain?: DocumentDomain;
  status?: DocumentStatus;
  type?: DocumentType;
  caseId?: string;
  search?: string;
}

export type SearchSort = 'relevance' | 'newest' | 'oldest' | 'expiry' | 'due';

export interface DocumentSearchFilters {
  domain?: DocumentDomain;
  type?: DocumentType;
  personId?: string;
  organisationId?: string;
  dateFrom?: string;
  dateTo?: string;
  taxRelevant?: boolean;
  taxYear?: number;
  actionRequired?: boolean;
  unpaidBill?: boolean;
  expiryStatus?: 'active' | 'expired' | 'expiring';
  tags?: string[];
}

export interface DocumentSearchQuery {
  text?: string;
  filters?: DocumentSearchFilters;
  sort?: SearchSort;
  limit?: number;
  offset?: number;
}

export interface DocumentSearchResult {
  document: Document;
  score: number;
  highlights: string[];
}

export interface DocumentSearchRepository {
  search(query: DocumentSearchQuery): Promise<{ results: DocumentSearchResult[]; total: number }>;
  reindex(documentId: string): Promise<void>;
  remove(documentId: string): Promise<void>;
}

type DocumentMutableFields = Pick<
  Document,
  | 'title'
  | 'type'
  | 'domain'
  | 'status'
  | 'createdAt'
  | 'updatedAt'
  | 'fileName'
  | 'mimeType'
  | 'fileSizeBytes'
  | 'storageUri'
  | 'sha256'
  | 'thumbnailUri'
  | 'pageCount'
  | 'ocrText'
  | 'summary'
  | 'referenceNumber'
  | 'generatedFromTemplate'
>;

export type CreateDocumentInput = Pick<DocumentMutableFields, 'title' | 'type' | 'domain'> &
  Partial<Omit<DocumentMutableFields, 'title' | 'type' | 'domain'>> & {
    id?: string;
    capabilities?: Partial<DocumentCapabilities>;
  };

export type UpdateDocumentInput = Partial<DocumentMutableFields> & {
  capabilities?: Partial<DocumentCapabilities>;
};

export interface DocumentRepository {
  getById(id: string): Promise<Document | null>;
  list(filters?: DocumentFilters): Promise<Document[]>;
  create(input: CreateDocumentInput): Promise<Document>;
  update(id: string, input: UpdateDocumentInput): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface DocumentActionRepository {
  listForDocument(documentId: string): Promise<DocumentAction[]>;
  create(input: Omit<DocumentAction, 'id'> & { id?: string }): Promise<DocumentAction>;
}

export interface Reminder {
  id: string;
  documentId?: string;
  title: string;
  dueDate: string;
  expiryDate?: string;
  priority: 'normal' | 'high';
  completed: boolean;
  completedAt?: string;
  notificationId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderFilters {
  documentId?: string;
  completed?: boolean;
}

export interface CreateReminderInput {
  id?: string;
  documentId?: string;
  title: string;
  dueDate: string;
  expiryDate?: string;
  priority?: 'normal' | 'high';
  notes?: string;
}

export interface UpdateReminderInput {
  title?: string;
  dueDate?: string;
  expiryDate?: string | null;
  priority?: 'normal' | 'high';
  completed?: boolean;
  completedAt?: string | null;
  notificationId?: string | null;
  notes?: string | null;
  documentId?: string | null;
  updatedAt?: string;
}

export interface ReminderRepository {
  getById(id: string): Promise<Reminder | null>;
  list(filters?: ReminderFilters): Promise<Reminder[]>;
  create(input: CreateReminderInput): Promise<Reminder>;
  update(id: string, input: UpdateReminderInput): Promise<void>;
}

export interface TaxMetadataRepository {
  getForDocument(documentId: string): Promise<TaxMetadata | null>;
  save(documentId: string, metadata: TaxMetadata): Promise<void>;
}

export interface PersonFilters {
  search?: string;
  relationship?: PersonRelationship;
}
export type CreatePersonInput = Pick<Person, 'firstName' | 'lastName' | 'relationship'> &
  Partial<
    Omit<Person, 'id' | 'firstName' | 'lastName' | 'relationship' | 'documentIds' | 'caseIds'>
  >;
export type UpdatePersonInput = Partial<Omit<Person, 'id' | 'documentIds' | 'caseIds'>>;
export interface PersonRepository {
  getById(id: string): Promise<Person | null>;
  list(filters?: PersonFilters): Promise<Person[]>;
  create(input: CreatePersonInput): Promise<Person>;
  update(id: string, input: UpdatePersonInput): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface OrganisationFilters {
  search?: string;
  type?: OrganisationType;
}
export type CreateOrganisationInput = Pick<Organisation, 'name' | 'type'> &
  Partial<
    Omit<
      Organisation,
      'id' | 'name' | 'type' | 'documentIds' | 'caseIds' | 'paymentIds' | 'actionIds'
    >
  >;
export type UpdateOrganisationInput = Partial<
  Omit<Organisation, 'id' | 'documentIds' | 'caseIds' | 'paymentIds' | 'actionIds'>
>;
export interface OrganisationRepository {
  getById(id: string): Promise<Organisation | null>;
  list(filters?: OrganisationFilters): Promise<Organisation[]>;
  create(input: CreateOrganisationInput): Promise<Organisation>;
  update(id: string, input: UpdateOrganisationInput): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface CaseFilters {
  status?: CaseStatus;
  type?: CaseType;
  search?: string;
}

export type CreateCaseInput = Pick<Case, 'title' | 'type'> &
  Partial<Pick<Case, 'status' | 'description' | 'deadline' | 'owner' | 'organisation'>>;
export type UpdateCaseInput = Partial<
  Pick<Case, 'title' | 'type' | 'status' | 'description' | 'deadline'>
>;

export interface CaseRepository {
  getById(id: string): Promise<Case | null>;
  list(filters?: CaseFilters): Promise<Case[]>;
  create(input: CreateCaseInput): Promise<Case>;
  update(id: string, input: UpdateCaseInput): Promise<void>;
  delete(id: string): Promise<void>;
  addDocument(caseId: string, documentId: string): Promise<void>;
  removeDocument(caseId: string, documentId: string): Promise<void>;
  addAction(caseId: string, actionId: string): Promise<void>;
  addPerson(caseId: string, personId: string): Promise<void>;
  addOrganisation(caseId: string, organisationId: string): Promise<void>;
  addChecklistItem(caseId: string, title: string, dueDate?: string): Promise<CaseChecklistItem>;
  completeChecklistItem(id: string, completed?: boolean): Promise<void>;
}
