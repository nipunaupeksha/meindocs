import type { BackupArchive, BackupProvider, RemoteBackup } from './types';

const driveApi = 'https://www.googleapis.com/drive/v3';
const uploadApi = 'https://www.googleapis.com/upload/drive/v3/files';

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
};

export class GoogleDriveBackupProvider implements BackupProvider {
  private accessToken: string | null = null;
  private deviceFolderId: string | null = null;

  constructor(
    private deviceId: string,
    private readonly tokenProvider?: () => Promise<string | null>,
  ) {}

  // fallow-ignore-next-line complexity
  async connect() {
    this.accessToken = this.accessToken ?? (await this.tokenProvider?.()) ?? null;
    if (!this.accessToken) throw new Error('Google Drive is not authenticated.');
    this.deviceFolderId = await this.folder('MeinDocs', 'root');
    const backups = await this.folder('backups', this.deviceFolderId);
    this.deviceFolderId = await this.folder(this.deviceId, backups);
  }

  async disconnect() {
    this.accessToken = null;
    this.deviceFolderId = null;
  }

  isConnected() {
    return this.accessToken !== null && this.deviceFolderId !== null;
  }

  // fallow-ignore-next-line unused-class-member
  setAccessToken(token: string) {
    this.accessToken = token;
  }

  // fallow-ignore-next-line unused-class-member
  setDeviceId(deviceId: string) {
    this.deviceId = deviceId;
  }

  // fallow-ignore-next-line complexity
  async uploadBackup(archive: BackupArchive) {
    this.requireConnected();
    const backupFolder = await this.createFolder(
      archive.manifest?.backupId ?? 'backup',
      this.deviceFolderId!,
    );
    let size = 0;
    for (const file of archive.files) {
      await this.uploadFile(file.path, file.mimeType, file.bytes, backupFolder);
      size += file.bytes.byteLength;
    }
    return {
      id: backupFolder,
      backupId: archive.manifest?.backupId ?? backupFolder,
      createdAt: archive.manifest?.createdAt ?? new Date().toISOString(),
      size,
    } satisfies RemoteBackup;
  }

  async listBackups() {
    this.requireConnected();
    const files = await this.list(
      `'${this.deviceFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    );
    return files.map((file) => ({
      id: file.id,
      backupId: file.name,
      createdAt: file.createdTime ?? new Date().toISOString(),
      size: Number(file.size ?? 0),
    }));
  }

  async downloadBackup(backupId: string) {
    this.requireConnected();
    const files = await this.list(`'${backupId}' in parents and trashed = false`);
    const archiveFiles = await Promise.all(
      files.map(async (file) => ({
        path: file.name,
        mimeType: file.mimeType,
        bytes: await this.downloadFile(file.id),
      })),
    );
    return { files: archiveFiles } satisfies BackupArchive;
  }

  async deleteBackup(backupId: string) {
    this.requireConnected();
    await this.request(`/files/${encodeURIComponent(backupId)}`, { method: 'DELETE' });
  }

  private requireConnected() {
    if (!this.isConnected()) throw new Error('Connect Google Drive before using backups.');
  }

  private async folder(name: string, parent: string) {
    const existing = await this.list(
      `name = '${name.replaceAll("'", "\\'")}' and '${parent}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    );
    return existing[0]?.id ?? this.createFolder(name, parent);
  }

  private async createFolder(name: string, parent: string) {
    const result = await this.request('/files', {
      method: 'POST',
      body: JSON.stringify({
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parent],
      }),
    });
    return result.id as string;
  }

  private async list(query: string): Promise<DriveFile[]> {
    const result = await this.request(
      `/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,createdTime)`,
    );
    return result.files as DriveFile[];
  }

  private async uploadFile(name: string, mimeType: string, bytes: Uint8Array, parent: string) {
    const boundary = `meindocs-${Date.now()}`;
    const metadata = JSON.stringify({ name, mimeType, parents: [parent] });
    const BlobConstructor = Blob as unknown as new (parts: BlobPart[]) => Blob;
    const body = new BlobConstructor([
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`,
      `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
      bytes,
      `\r\n--${boundary}--`,
    ] as unknown as BlobPart[]);
    await this.request('', {
      method: 'POST',
      url: `${uploadApi}?uploadType=multipart`,
      headers: { 'content-type': `multipart/related; boundary=${boundary}` },
      body,
    });
  }

  private async downloadFile(id: string) {
    const response = await fetch(`${driveApi}/files/${encodeURIComponent(id)}?alt=media`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!response.ok) throw new Error(`Google Drive download failed (${response.status}).`);
    return new Uint8Array(await response.arrayBuffer());
  }

  // fallow-ignore-next-line complexity
  private async request(path: string, init: RequestInit & { url?: string } = {}) {
    const response = await fetch(init.url ?? `${driveApi}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        ...(init.body instanceof Blob ? {} : { 'content-type': 'application/json' }),
        ...init.headers,
      },
    });
    if (!response.ok) throw new Error(`Google Drive request failed (${response.status}).`);
    return response.status === 204 ? {} : response.json();
  }
}
