import { localFileService } from '@/features/files/local-file-service';
import type { CloudFile, CloudImportProvider, CloudImportResult } from './types';
import { isSupportedCloudDocument } from './filters';

export class CloudImportService {
  constructor(private readonly provider: CloudImportProvider) {}

  // fallow-ignore-next-line unused-class-member
  browseFolders(parentId?: string) {
    return this.provider.browseFolders(parentId);
  }

  // fallow-ignore-next-line unused-class-member
  async listSupportedDocuments(folderId?: string) {
    return (await this.provider.listSupportedDocuments(folderId)).filter(isSupportedCloudDocument);
  }

  // fallow-ignore-next-line unused-class-member
  async searchFiles(query: string) {
    return (await this.provider.searchFiles(query)).filter(isSupportedCloudDocument);
  }

  // fallow-ignore-next-line unused-class-member
  async importSelected(files: readonly CloudFile[]): Promise<CloudImportResult[]> {
    const results: CloudImportResult[] = [];
    for (const remoteFile of files) {
      const downloaded = await this.provider.downloadFile(remoteFile.id);
      const file = await localFileService.import({
        uri: downloaded.uri,
        name: remoteFile.name,
        mimeType: remoteFile.mimeType,
        size: remoteFile.size,
        sourceMetadata: {
          provider: this.provider.kind,
          remoteFileId: remoteFile.id,
          remoteModifiedAt: remoteFile.modifiedAt,
        },
      });
      results.push({ remoteFile, file });
    }
    return results;
  }
}
