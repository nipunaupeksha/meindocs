import * as Crypto from 'expo-crypto';
import { File, Directory, Paths } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { AppError, decodeJson } from '@meindocs/domain';
import { logger } from '@/lib/logger';

export type FileKind = 'pdf' | 'image';

export type LocalFileRecord = {
  id: string;
  originalName: string;
  mimeType: string;
  kind: FileKind;
  size: number;
  sha256: string;
  localUri: string;
  thumbnailUri?: string;
  importedAt: string;
  isDuplicate: boolean;
  duplicateOf?: string;
};

type LocalFileInput = {
  uri: string;
  name?: string;
  mimeType?: string;
  size?: number;
};

type StoredFileRecord = Omit<LocalFileRecord, 'isDuplicate' | 'duplicateOf'>;

const filesDirectory = new Directory(Paths.document, 'files');
const thumbnailsDirectory = new Directory(Paths.document, 'thumbnails');
const manifestFile = new File(Paths.document, 'file-manifest.json');

function fileKind(mimeType: string, name: string): FileKind {
  if (mimeType === 'application/pdf' || name.toLowerCase().endsWith('.pdf')) return 'pdf';
  return 'image';
}

function extensionFor(input: LocalFileInput, kind: FileKind) {
  const nameExtension = input.name?.match(/\.[a-z0-9]+$/i)?.[0].toLowerCase();
  if (nameExtension) return nameExtension;
  return kind === 'pdf' ? '.pdf' : '.jpg';
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function sha256(file: File) {
  const digest = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, await file.bytes());
  return bytesToHex(new Uint8Array(digest));
}

async function readManifest(): Promise<StoredFileRecord[]> {
  if (!manifestFile.exists) return [];
  try {
    const value: unknown = JSON.parse(await manifestFile.text());
    return Array.isArray(value) ? (value as StoredFileRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeManifest(records: StoredFileRecord[]) {
  manifestFile.write(JSON.stringify(records));
}

function ensureDirectory(directory: Directory) {
  if (!directory.exists) directory.create({ idempotent: true, intermediates: true });
}

function requireSource(uri: string) {
  const source = new File(uri);
  if (!source.exists) throw new AppError('filesystem');
  return source;
}

// fallow-ignore-next-line complexity
function storedRecord(
  input: LocalFileInput,
  source: File,
  hash: string,
  kind: FileKind,
  id: string,
) {
  return {
    id,
    originalName: input.name ?? source.name,
    mimeType: input.mimeType ?? source.type ?? 'application/octet-stream',
    kind,
    size: input.size ?? source.size,
    sha256: hash,
    localUri: source.uri,
    importedAt: new Date().toISOString(),
  } satisfies StoredFileRecord;
}

function withThumbnail(record: StoredFileRecord, thumbnailUri?: string): StoredFileRecord {
  return thumbnailUri ? { ...record, thumbnailUri } : record;
}

class LocalFileService {
  // fallow-ignore-next-line complexity
  async import(input: LocalFileInput): Promise<LocalFileRecord> {
    let source: File;
    try {
      source = requireSource(input.uri);
    } catch (error) {
      logger.warn('file_import_source_unavailable', error, { kind: input.mimeType ?? 'unknown' });
      throw error;
    }

    ensureDirectory(filesDirectory);
    ensureDirectory(thumbnailsDirectory);

    const name = input.name ?? source.name;
    const mimeType = input.mimeType ?? source.type ?? 'application/octet-stream';
    const kind = fileKind(mimeType, name);
    const hash = await sha256(source);
    const records = await readManifest();
    const duplicate = records.find((record) => record.sha256 === hash);
    if (duplicate) {
      return {
        ...duplicate,
        isDuplicate: true,
        duplicateOf: duplicate.id,
      };
    }

    const id = Crypto.randomUUID();
    const destination = new File(filesDirectory, `${id}${extensionFor(input, kind)}`);
    await source.copy(destination, { overwrite: false });

    const record = storedRecord(input, source, hash, kind, id);
    record.localUri = destination.uri;
    const thumbnailUri =
      kind === 'image' ? await this.createThumbnail(destination, hash) : undefined;
    const savedRecord = withThumbnail(record, thumbnailUri);
    await writeManifest([...records, savedRecord]);
    return { ...savedRecord, isDuplicate: false };
  }

  private async createThumbnail(file: File, hash: string) {
    const result = await ImageManipulator.manipulateAsync(file.uri, [{ resize: { width: 360 } }], {
      compress: 0.78,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    const thumbnail = new File(thumbnailsDirectory, `${hash}.jpg`);
    await new File(result.uri).copy(thumbnail, { overwrite: true });
    return thumbnail.uri;
  }
}

export const localFileService = new LocalFileService();

export async function listLocalFileRecords() {
  return readManifest();
}

export async function readLocalFileBytes(uri: string) {
  return new File(uri).bytes();
}

export async function clearLocalFiles() {
  if (filesDirectory.exists) filesDirectory.delete();
  if (thumbnailsDirectory.exists) thumbnailsDirectory.delete();
  if (manifestFile.exists) manifestFile.delete();
}

export async function exportLocalFileManifest() {
  const exportDirectory = new Directory(Paths.document, 'exports');
  if (!exportDirectory.exists) exportDirectory.create({ idempotent: true, intermediates: true });
  const destination = new File(exportDirectory, `meindocs-export-${Date.now()}.json`);
  destination.write(
    JSON.stringify({ exportedAt: new Date().toISOString(), documents: await readManifest() }),
  );
  return destination.uri;
}

export async function replaceLocalFiles(input: {
  database: Uint8Array;
  documents: Array<{ documentId: string; bytes: Uint8Array }>;
}) {
  const snapshot = decodeJson<{ documents: StoredFileRecord[] }>(input.database);
  ensureDirectory(filesDirectory);
  const restored = snapshot.documents.map((record) => {
    const source = input.documents.find((document) => document.documentId === record.id);
    if (!source) throw new Error(`Backup document ${record.id} is missing.`);
    const destination = new File(
      filesDirectory,
      `${record.id}${extensionFor({ name: record.originalName, uri: '' }, record.kind)}`,
    );
    destination.write(source.bytes);
    return { ...record, localUri: destination.uri };
  });
  manifestFile.write(JSON.stringify(restored));
}
