import type { LocalFileRecord } from '@/features/files/local-file-service';

export type EmailProviderKind = 'gmail' | 'outlook';
export type EmailAttachmentMimeType = 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/heic';

export interface EmailMessageSummary {
  id: string;
  provider: EmailProviderKind;
  sender: string;
  subject: string;
  receivedAt: string;
  attachmentCount: number;
}

export interface EmailAttachment {
  id: string;
  messageId: string;
  filename: string;
  mimeType: EmailAttachmentMimeType;
  size: number;
  previewUri?: string;
}

export interface ImportedEmailAttachment extends EmailAttachment {
  uri: string;
}

export interface EmailImportCandidate extends EmailAttachment {
  provider: EmailProviderKind;
  sender: string;
  subject: string;
  receivedAt: string;
}

// fallow-ignore-next-line unused-type
export interface EmailSourceMetadata {
  provider: EmailProviderKind;
  messageId: string;
  sender: string;
  receivedAt: string;
}

export interface EmailImportProvider {
  readonly kind: EmailProviderKind;
  listRecentMessagesContainingAttachments(): Promise<EmailMessageSummary[]>;
  listAttachments(messageId: string): Promise<EmailAttachment[]>;
  importAttachment(attachmentId: string): Promise<ImportedEmailAttachment>;
}

export interface EmailImportResult {
  attachment: EmailImportCandidate;
  file: LocalFileRecord;
}
