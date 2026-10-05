import type {
  EmailAttachment,
  EmailImportProvider,
  EmailMessageSummary,
  ImportedEmailAttachment,
} from './types';

export interface EmailProviderAdapter {
  listMessages(): Promise<EmailMessageSummary[]>;
  listAttachments(messageId: string): Promise<EmailAttachment[]>;
  downloadAttachment(attachmentId: string): Promise<ImportedEmailAttachment>;
}

class AdapterEmailProvider implements EmailImportProvider {
  constructor(
    readonly kind: 'gmail' | 'outlook',
    private readonly adapter: EmailProviderAdapter,
  ) {}
  listRecentMessagesContainingAttachments() {
    return this.adapter.listMessages();
  }
  listAttachments(messageId: string) {
    return this.adapter.listAttachments(messageId);
  }
  importAttachment(attachmentId: string) {
    return this.adapter.downloadAttachment(attachmentId);
  }
}

export class GmailEmailImportProvider extends AdapterEmailProvider {
  constructor(adapter: EmailProviderAdapter) {
    super('gmail', adapter);
  }
}

export class OutlookEmailImportProvider extends AdapterEmailProvider {
  constructor(adapter: EmailProviderAdapter) {
    super('outlook', adapter);
  }
}
