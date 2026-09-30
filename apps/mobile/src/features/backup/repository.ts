import { encodeJson } from '@meindocs/domain';
import {
  listLocalFileRecords,
  readLocalFileBytes,
  replaceLocalFiles,
} from '@/features/files/local-file-service';
import type { BackupRepository } from './types';

export function createLocalBackupRepository(): BackupRepository {
  return {
    async createDatabaseSnapshot() {
      const documents = await listLocalFileRecords();
      return encodeJson({ format: 'meindocs-local-metadata-v1', documents });
    },
    async listDocumentFiles() {
      const documents = await listLocalFileRecords();
      return documents.map((document) => ({ documentId: document.id, uri: document.localUri }));
    },
    readDocumentFile: readLocalFileBytes,
    replaceFromBackup: replaceLocalFiles,
  };
}
