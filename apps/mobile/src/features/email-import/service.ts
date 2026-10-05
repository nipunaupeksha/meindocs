import { localFileService, type LocalFileRecord } from '@/features/files/local-file-service';
import type {
  EmailImportCandidate,
  EmailImportProvider,
  EmailImportResult,
  EmailMessageSummary,
} from './types';
import { isSupportedEmailAttachment } from './filters';

export class EmailImportService {
  constructor(private readonly provider: EmailImportProvider) {}

  // fallow-ignore-next-line unused-class-member
  async listCandidates(): Promise<EmailImportCandidate[]> {
    const messages = await this.provider.listRecentMessagesContainingAttachments();
    const candidates: EmailImportCandidate[] = [];
    for (const message of messages) {
      const attachments = await this.provider.listAttachments(message.id);
      for (const attachment of attachments) {
        if (!isSupportedEmailAttachment(attachment.mimeType, attachment.filename)) continue;
        candidates.push({
          ...attachment,
          provider: message.provider,
          sender: message.sender,
          subject: message.subject,
          receivedAt: message.receivedAt,
        });
      }
    }
    return candidates;
  }

  // fallow-ignore-next-line unused-class-member
  async importSelected(candidates: readonly EmailImportCandidate[]): Promise<EmailImportResult[]> {
    const results: EmailImportResult[] = [];
    for (const candidate of candidates) {
      const imported = await this.provider.importAttachment(candidate.id);
      const file = await localFileService.import({
        uri: imported.uri,
        name: candidate.filename,
        mimeType: candidate.mimeType,
        size: candidate.size,
        sourceMetadata: {
          provider: candidate.provider,
          messageId: candidate.messageId,
          sender: candidate.sender,
          receivedDate: candidate.receivedAt,
        },
      });
      results.push({ attachment: candidate, file });
    }
    return results;
  }
}
