import type {
  Document,
  DocumentAction,
  DocumentCapabilities,
  DocumentDomain,
  DocumentStatus,
  DocumentType,
  TaxMetadata,
} from './index';

export interface DocumentFilters {
  domain?: DocumentDomain;
  status?: DocumentStatus;
  type?: DocumentType;
  caseId?: string;
  search?: string;
}

export interface CreateDocumentInput {
  id?: string;
  title: string;
  type: DocumentType;
  domain: DocumentDomain;
  status?: DocumentStatus;
  createdAt?: string;
  updatedAt?: string;
  fileName?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  storageUri?: string;
  capabilities?: Partial<DocumentCapabilities>;
}

export interface UpdateDocumentInput {
  title?: string;
  type?: DocumentType;
  domain?: DocumentDomain;
  status?: DocumentStatus;
  updatedAt?: string;
  fileName?: string | null;
  mimeType?: string | null;
  fileSizeBytes?: number | null;
  storageUri?: string | null;
  capabilities?: Partial<DocumentCapabilities>;
}

export interface DocumentRepository {
  getById(id: string): Promise<Document | null>;
  list(filters?: DocumentFilters): Promise<Document[]>;
  create(input: CreateDocumentInput): Promise<Document>;
  update(id: string, input: UpdateDocumentInput): Promise<void>;
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
  priority: 'normal' | 'high';
  completed: boolean;
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
  priority?: 'normal' | 'high';
  notes?: string;
}

export interface UpdateReminderInput {
  title?: string;
  dueDate?: string;
  priority?: 'normal' | 'high';
  completed?: boolean;
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
