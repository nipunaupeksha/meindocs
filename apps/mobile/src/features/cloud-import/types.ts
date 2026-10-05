import type { LocalFileRecord } from '@/features/files/local-file-service';

export type CloudProviderKind = 'google-drive' | 'onedrive' | 'dropbox' | 'webdav';
export type CloudDocumentMimeType = 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/heic';

export interface CloudFile {
  id: string;
  name: string;
  mimeType: CloudDocumentMimeType | 'application/vnd.google-apps.folder';
  size: number;
  modifiedAt: string;
  parentId?: string;
  isFolder: boolean;
}

export interface DownloadedCloudFile extends CloudFile {
  uri: string;
}

export interface CloudImportProvider {
  readonly kind: CloudProviderKind;
  browseFolders(parentId?: string): Promise<CloudFile[]>;
  searchFiles(query: string): Promise<CloudFile[]>;
  listSupportedDocuments(folderId?: string): Promise<CloudFile[]>;
  downloadFile(fileId: string): Promise<DownloadedCloudFile>;
}

export interface CloudImportResult {
  remoteFile: CloudFile;
  file: LocalFileRecord;
}
