export type BulkDocumentOperation =
  | { type: 'add_tags'; tags: string[] }
  | { type: 'remove_tags'; tags: string[] }
  | { type: 'assign_person'; personId: string | null }
  | { type: 'assign_organisation'; organisationId: string | null }
  | { type: 'mark_tax_relevant'; value: boolean }
  | { type: 'assign_tax_year'; year: number | null }
  | { type: 'add_to_case'; caseId: string }
  | { type: 'archive' }
  | { type: 'delete' }
  | { type: 'export' };

export interface BulkDocumentFailure {
  documentId: string;
  message: string;
}

export interface BulkDocumentResult {
  requested: number;
  succeeded: string[];
  failed: BulkDocumentFailure[];
}

export interface BulkDocumentRepository {
  execute(documentId: string, operation: BulkDocumentOperation): Promise<void>;
}

export class BulkDocumentService {
  constructor(private readonly repository: BulkDocumentRepository) {}

  async execute(
    documentIds: readonly string[],
    operation: BulkDocumentOperation,
  ): Promise<BulkDocumentResult> {
    const succeeded: string[] = [];
    const failed: BulkDocumentFailure[] = [];
    for (const documentId of [...new Set(documentIds)]) {
      try {
        await this.repository.execute(documentId, operation);
        succeeded.push(documentId);
      } catch (error) {
        failed.push({
          documentId,
          message: error instanceof Error ? error.message : 'Operation failed',
        });
      }
    }
    return { requested: new Set(documentIds).size, succeeded, failed };
  }
}

export function bulkResultMessage(result: BulkDocumentResult) {
  if (!result.failed.length) return `${result.succeeded.length} succeeded`;
  return `${result.succeeded.length} succeeded\n${result.failed.length} failed`;
}
