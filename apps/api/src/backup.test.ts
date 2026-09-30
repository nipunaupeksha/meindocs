import { expect, test } from 'bun:test';
import {
  checksum,
  decodeEncryptedBackup,
  decodeJson,
  encodeEncryptedBackup,
  encodeJson,
  encryptBackupBytes,
  decryptBackupBytes,
  validateBackupManifest,
} from '@meindocs/domain';

const key = new Uint8Array(32).fill(7);

test('backup encryption and JSON encoding round trip', () => {
  const input = encodeJson({ secret: 'MeinDocs', documents: 2 });
  const encrypted = encryptBackupBytes(input, key);
  expect(decryptBackupBytes(encrypted, key)).toEqual(input);
  expect(
    decodeJson<{ secret: string; documents: number }>(
      decodeEncryptedBackup(encodeEncryptedBackup(input, key), key),
    ),
  ).toEqual({
    secret: 'MeinDocs',
    documents: 2,
  });
});

test('backup manifest checksum validation rejects tampering', () => {
  const bytes = encodeJson({ snapshot: true });
  const manifest = {
    version: 1 as const,
    backupId: 'backup-1',
    createdAt: '2026-09-27T12:00:00.000Z',
    appVersion: '0.0.0',
    deviceId: 'device-1',
    schemaVersion: '1',
    files: [{ path: 'database.enc', size: bytes.length, sha256: checksum(bytes) }],
  };
  expect(validateBackupManifest(manifest)).toEqual(manifest);
  expect(() =>
    validateBackupManifest({ ...manifest, files: [{ ...manifest.files[0], sha256: 'bad' }] }),
  ).toThrow();
});
