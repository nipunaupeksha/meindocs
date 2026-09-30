import { gcm } from '@noble/ciphers/aes.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { randomBytes } from '@noble/ciphers/utils.js';
import { bytesToUtf8, utf8ToBytes } from '@noble/ciphers/utils.js';

export type BackupManifestFile = {
  path: string;
  documentId?: string;
  size: number;
  sha256: string;
};

export type BackupManifest = {
  version: 1;
  backupId: string;
  createdAt: string;
  appVersion: string;
  deviceId: string;
  schemaVersion: string;
  files: BackupManifestFile[];
};

export function encodeBase64(bytes: Uint8Array) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';
  for (let index = 0; index < bytes.length; index += 3) {
    const a = bytes[index];
    const b = bytes[index + 1] ?? 0;
    const c = bytes[index + 2] ?? 0;
    output += alphabet[a >> 2];
    output += alphabet[((a & 3) << 4) | (b >> 4)];
    output += index + 1 < bytes.length ? alphabet[((b & 15) << 2) | (c >> 6)] : '=';
    output += index + 2 < bytes.length ? alphabet[c & 63] : '=';
  }
  return output;
}

export function decodeBase64(value: string) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const output: number[] = [];
  for (let index = 0; index < value.length; index += 4) {
    const a = alphabet.indexOf(value[index]);
    const b = alphabet.indexOf(value[index + 1]);
    const c = value[index + 2] === '=' ? 0 : alphabet.indexOf(value[index + 2]);
    const d = value[index + 3] === '=' ? 0 : alphabet.indexOf(value[index + 3]);
    output.push((a << 2) | (b >> 4));
    if (value[index + 2] !== '=') output.push(((b & 15) << 4) | (c >> 2));
    if (value[index + 3] !== '=') output.push(((c & 3) << 6) | d);
  }
  return new Uint8Array(output);
}

export function checksum(bytes: Uint8Array) {
  return Array.from(sha256(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function encryptBackupBytes(bytes: Uint8Array, key: Uint8Array) {
  if (key.length !== 32) throw new Error('Backup encryption keys must be 32 bytes.');
  const nonce = randomBytes(12);
  const ciphertext = gcm(key, nonce).encrypt(bytes);
  const output = new Uint8Array(nonce.length + ciphertext.length);
  output.set(nonce);
  output.set(ciphertext, nonce.length);
  return output;
}

export function decryptBackupBytes(payload: Uint8Array, key: Uint8Array) {
  if (key.length !== 32) throw new Error('Backup encryption keys must be 32 bytes.');
  if (payload.length < 28) throw new Error('Encrypted backup payload is too short.');
  return gcm(key, payload.slice(0, 12)).decrypt(payload.slice(12));
}

export function encodeEncryptedBackup(bytes: Uint8Array, key: Uint8Array) {
  return encodeBase64(encryptBackupBytes(bytes, key));
}

export function decodeEncryptedBackup(value: string, key: Uint8Array) {
  return decryptBackupBytes(decodeBase64(value), key);
}

export function encodeJson(value: unknown) {
  return utf8ToBytes(JSON.stringify(value));
}

export function decodeJson<T>(bytes: Uint8Array) {
  return JSON.parse(bytesToUtf8(bytes)) as T;
}

export function validateBackupManifest(manifest: BackupManifest) {
  if (manifest.version !== 1) throw new Error('Unsupported backup manifest version.');
  if (!manifest.backupId || !manifest.deviceId || !manifest.schemaVersion) {
    throw new Error('Backup manifest is missing required identity fields.');
  }
  if (!Array.isArray(manifest.files)) throw new Error('Backup manifest files are invalid.');
  if (manifest.files.some((file) => !file.path || !/^[a-f0-9]{64}$/.test(file.sha256))) {
    throw new Error('Backup manifest contains an invalid checksum.');
  }
  return manifest;
}
