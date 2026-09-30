import type { BackupManifest } from '@meindocs/domain';

export type BackupArchiveFile = {
  path: string;
  bytes: Uint8Array;
  mimeType: string;
};

export type BackupArchive = {
  manifest?: BackupManifest;
  files: BackupArchiveFile[];
};

export type RemoteBackup = {
  id: string;
  backupId: string;
  createdAt: string;
  size: number;
};

export interface BackupProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  uploadBackup(archive: BackupArchive): Promise<RemoteBackup>;
  listBackups(): Promise<RemoteBackup[]>;
  downloadBackup(backupId: string): Promise<BackupArchive>;
  deleteBackup(backupId: string): Promise<void>;
}

export interface BackupRepository {
  createDatabaseSnapshot(): Promise<Uint8Array>;
  listDocumentFiles(): Promise<Array<{ documentId: string; uri: string }>>;
  readDocumentFile(uri: string): Promise<Uint8Array>;
  replaceFromBackup(input: {
    database: Uint8Array;
    documents: Array<{ documentId: string; bytes: Uint8Array }>;
  }): Promise<void>;
}

export type BackupProgress = {
  phase:
    | 'preparing'
    | 'encrypting'
    | 'uploading'
    | 'downloading'
    | 'validating'
    | 'replacing'
    | 'complete';
  completed: number;
  total: number;
};
