import { Directory, File, Paths } from 'expo-file-system';
import type {
  EmailAttachment,
  EmailImportProvider,
  EmailMessageSummary,
  ImportedEmailAttachment,
} from './types';

const messages: EmailMessageSummary[] = [
  {
    id: 'gmail-message-1',
    provider: 'gmail',
    sender: 'billing@example.com',
    subject: 'September invoice',
    receivedAt: '2026-09-28T08:30:00Z',
    attachmentCount: 2,
  },
  {
    id: 'outlook-message-1',
    provider: 'outlook',
    sender: 'hr@example.com',
    subject: 'Payslip September 2026',
    receivedAt: '2026-09-30T07:00:00Z',
    attachmentCount: 1,
  },
];
const attachments: Record<string, EmailAttachment[]> = {
  'gmail-message-1': [
    {
      id: 'gmail-attachment-1',
      messageId: 'gmail-message-1',
      filename: 'invoice-september.pdf',
      mimeType: 'application/pdf',
      size: 48_000,
    },
    {
      id: 'gmail-attachment-2',
      messageId: 'gmail-message-1',
      filename: 'logo.png',
      mimeType: 'image/png',
      size: 8_000,
    },
  ],
  'outlook-message-1': [
    {
      id: 'outlook-attachment-1',
      messageId: 'outlook-message-1',
      filename: 'payslip-september.pdf',
      mimeType: 'application/pdf',
      size: 64_000,
    },
  ],
};

export class MockEmailImportProvider implements EmailImportProvider {
  readonly kind = 'gmail' as const;
  async listRecentMessagesContainingAttachments() {
    return messages;
  }
  async listAttachments(messageId: string) {
    return attachments[messageId] ?? [];
  }
  async importAttachment(attachmentId: string): Promise<ImportedEmailAttachment> {
    const attachment = Object.values(attachments)
      .flat()
      .find((item) => item.id === attachmentId);
    if (!attachment) throw new Error('Email attachment not found');
    const directory = new Directory(Paths.cache, 'meindocs-email-mock');
    if (!directory.exists) directory.create({ idempotent: true, intermediates: true });
    const file = new File(directory, attachment.filename);
    if (!file.exists)
      file.write(
        attachment.mimeType === 'application/pdf' ? '%PDF-1.4\n' : new Uint8Array([0, 1, 2, 3]),
      );
    return { ...attachment, uri: file.uri };
  }
}
