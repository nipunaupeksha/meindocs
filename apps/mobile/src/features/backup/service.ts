import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import {
  checksum,
  decodeJson,
  decryptBackupBytes,
  encodeJson,
  encryptBackupBytes,
  validateBackupManifest,
  AppError,
  withRetry,
  type BackupManifest,
} from '@meindocs/domain';
import type {
  BackupProvider,
  BackupProgress,
  RemoteBackup,
  BackupRepository,
  BackupArchive,
} from './types';
import { logger } from '@/lib/logger';

const deviceKeyName = 'meindocs.backup.device-id.v1';

export async function getBackupDeviceId() {
  const existing = await SecureStore.getItemAsync(deviceKeyName);
  if (existing) return existing;
  const value =
    (await Application.getAndroidId()) ??
    (await Application.getIosIdForVendorAsync()) ??
    Crypto.randomUUID();
  await SecureStore.setItemAsync(deviceKeyName, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  return value;
}

class BackupValidationError extends Error {}

export class BackupService {
  constructor(
    private readonly provider: BackupProvider,
    private readonly repository: BackupRepository,
    private readonly key: Uint8Array,
    private readonly report?: (progress: BackupProgress) => void,
  ) {}

  // fallow-ignore-next-line complexity,unused-class-member
  async createBackup(): Promise<RemoteBackup> {
    const files = await this.repository.listDocumentFiles();
    const total = files.length + 2;
    this.report?.({ phase: 'preparing', completed: 0, total });
    const encryptedFiles: BackupArchive['files'] = [];
    const manifestFiles: BackupManifest['files'] = [];
    const database = encryptBackupBytes(await this.repository.createDatabaseSnapshot(), this.key);
    encryptedFiles.push({
      path: 'database.enc',
      mimeType: 'application/octet-stream',
      bytes: database,
    });
    manifestFiles.push({
      path: 'database.enc',
      size: database.byteLength,
      sha256: checksum(database),
    });
    this.report?.({ phase: 'encrypting', completed: 1, total });

    for (const [index, file] of files.entries()) {
      const encrypted = encryptBackupBytes(
        await this.repository.readDocumentFile(file.uri),
        this.key,
      );
      const path = `documents/${file.documentId}.enc`;
      encryptedFiles.push({ path, mimeType: 'application/octet-stream', bytes: encrypted });
      manifestFiles.push({
        path,
        documentId: file.documentId,
        size: encrypted.byteLength,
        sha256: checksum(encrypted),
      });
      this.report?.({ phase: 'encrypting', completed: index + 2, total });
    }

    const manifest: BackupManifest = {
      version: 1,
      backupId: Crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      appVersion: Application.nativeApplicationVersion ?? '0.0.0',
      deviceId: await getBackupDeviceId(),
      schemaVersion: '1',
      files: manifestFiles,
    };
    encryptedFiles.push({
      path: 'manifest.enc',
      mimeType: 'application/octet-stream',
      bytes: encryptBackupBytes(encodeJson(manifest), this.key),
    });
    this.report?.({ phase: 'uploading', completed: total, total });
    let result: RemoteBackup;
    try {
      result = await withRetry(
        () => this.provider.uploadBackup({ manifest, files: encryptedFiles }),
        { attempts: 3 },
      );
    } catch (error) {
      logger.warn('backup_upload_failed', error, { backupId: manifest.backupId });
      throw new AppError('backup', undefined, { cause: error, retryable: true });
    }
    this.report?.({ phase: 'complete', completed: total, total });
    return result;
  }

  // fallow-ignore-next-line unused-class-member
  listBackups() {
    return this.provider.listBackups();
  }

  // fallow-ignore-next-line complexity,unused-class-member
  async restoreBackup(backupId: string, confirmReplacement: () => Promise<boolean>) {
    let archive: BackupArchive;
    try {
      archive = await withRetry(() => this.provider.downloadBackup(backupId), { attempts: 3 });
    } catch (error) {
      logger.warn('backup_download_failed', error, { backupId });
      throw new AppError('backup', undefined, { cause: error, retryable: true });
    }
    this.report?.({ phase: 'validating', completed: 0, total: archive.files.length });
    const manifestFile = archive.files.find((file) => file.path === 'manifest.enc');
    if (!manifestFile) throw new BackupValidationError('Backup manifest is missing.');
    let manifest: BackupManifest;
    try {
      manifest = validateBackupManifest(
        decodeJson<BackupManifest>(decryptBackupBytes(manifestFile.bytes, this.key)),
      );
    } catch (error) {
      throw new BackupValidationError(
        error instanceof Error ? error.message : 'Backup manifest is invalid.',
      );
    }
    const byPath = new Map(archive.files.map((file) => [file.path, file]));
    for (const [index, entry] of manifest.files.entries()) {
      const file = byPath.get(entry.path);
      if (!file || file.bytes.byteLength !== entry.size || checksum(file.bytes) !== entry.sha256) {
        throw new BackupValidationError(`Backup checksum failed for ${entry.path}.`);
      }
      this.report?.({ phase: 'validating', completed: index + 1, total: manifest.files.length });
    }
    if (!(await confirmReplacement())) return false;
    this.report?.({ phase: 'replacing', completed: 0, total: manifest.files.length });
    const databaseFile = byPath.get('database.enc');
    if (!databaseFile) throw new BackupValidationError('Encrypted database backup is missing.');
    const documents = manifest.files
      .filter((file) => file.path.startsWith('documents/'))
      .map((file) => ({
        documentId: file.documentId ?? file.path.split('/').pop()!.replace('.enc', ''),
        bytes: decryptBackupBytes(byPath.get(file.path)!.bytes, this.key),
      }));
    await this.repository.replaceFromBackup({
      database: decryptBackupBytes(databaseFile.bytes, this.key),
      documents,
    });
    this.report?.({
      phase: 'complete',
      completed: manifest.files.length,
      total: manifest.files.length,
    });
    return true;
  }
}
