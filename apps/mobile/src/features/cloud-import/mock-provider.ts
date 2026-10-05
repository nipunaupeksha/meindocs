import { Directory, File, Paths } from 'expo-file-system';
import type { CloudFile, CloudImportProvider, DownloadedCloudFile } from './types';

const files: CloudFile[] = [
  {
    id: 'drive-folder-tax',
    name: 'Tax 2026',
    mimeType: 'application/vnd.google-apps.folder',
    size: 0,
    modifiedAt: '2026-09-01T00:00:00Z',
    isFolder: true,
  },
  {
    id: 'drive-invoice-1',
    name: 'invoice-september.pdf',
    mimeType: 'application/pdf',
    size: 52_000,
    modifiedAt: '2026-09-28T08:30:00Z',
    parentId: 'drive-folder-tax',
    isFolder: false,
  },
  {
    id: 'drive-receipt-1',
    name: 'receipt.png',
    mimeType: 'image/png',
    size: 23_000,
    modifiedAt: '2026-09-27T12:00:00Z',
    parentId: 'drive-folder-tax',
    isFolder: false,
  },
];

export class MockGoogleDriveImportProvider implements CloudImportProvider {
  readonly kind = 'google-drive' as const;
  async browseFolders(parentId?: string) {
    return files.filter((file) => file.isFolder && file.parentId === parentId);
  }
  async searchFiles(query: string) {
    return files.filter((file) => file.name.toLowerCase().includes(query.toLowerCase()));
  }
  async listSupportedDocuments(folderId?: string) {
    return files.filter((file) => !file.isFolder && file.parentId === folderId);
  }
  async downloadFile(fileId: string): Promise<DownloadedCloudFile> {
    const source = files.find((file) => file.id === fileId);
    if (!source || source.isFolder) throw new Error('Cloud file not found');
    const directory = new Directory(Paths.cache, 'meindocs-cloud-mock');
    if (!directory.exists) directory.create({ idempotent: true, intermediates: true });
    const file = new File(directory, source.name);
    if (!file.exists)
      file.write(
        source.mimeType === 'application/pdf' ? '%PDF-1.4\n' : new Uint8Array([0, 1, 2, 3]),
      );
    return { ...source, uri: file.uri };
  }
}
