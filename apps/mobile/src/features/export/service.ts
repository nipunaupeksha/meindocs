import * as Sharing from 'expo-sharing';
import { File, Directory, Paths } from 'expo-file-system';
import { strToU8, zipSync } from 'fflate';
import {
  calculateExportTotals,
  createExpenseCsv,
  createExportManifest,
  groupTaxDocuments,
  selectTaxDocuments,
  type ExportDocument,
  type ExportManifest,
  type TaxExportOptions,
} from '@meindocs/domain';
import { listLocalFileRecords, readLocalFileBytes } from '@/features/files/local-file-service';

const root = new Directory(Paths.cache, 'meindocs-exports');

function ensureRoot() {
  if (!root.exists) root.create({ idempotent: true, intermediates: true });
}

function pdfIndex(title: string, lines: string[]) {
  const escaped = [title, ...lines].map((line) =>
    line.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)'),
  );
  const stream = `BT /F1 12 Tf 48 790 Td 16 TL ${escaped.map((line) => `(${line}) Tj T*`).join(' ')} ET`;
  return `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj\n4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n5 0 obj<</Length ${stream.length}>>stream\n${stream}\nendstream endobj\ntrailer<</Root 1 0 R>>\n%%EOF`;
}

function safeName(name: string) {
  return name.replaceAll(/[^a-zA-Z0-9._-]+/g, '_');
}

export type ExportPreview = {
  documents: ExportDocument[];
  groups: ReturnType<typeof groupTaxDocuments>;
  totals: ReturnType<typeof calculateExportTotals>;
};

export function previewTaxExport(
  documents: ExportDocument[],
  options: TaxExportOptions,
): ExportPreview {
  const selected = selectTaxDocuments(documents, options);
  return {
    documents: selected,
    groups: groupTaxDocuments(selected),
    totals: calculateExportTotals(selected),
  };
}

export async function createTaxExport(documents: ExportDocument[], options: TaxExportOptions) {
  ensureRoot();
  const preview = previewTaxExport(documents, options);
  const exportId = `tax-${options.year}-${Date.now()}`;
  const directory = new Directory(root, exportId);
  directory.create({ idempotent: true, intermediates: true });
  const files: Record<string, Uint8Array> = {};
  const fileRecords = await listLocalFileRecords();
  const manifestFiles: ExportManifest['files'] = [];
  const rootName = `Tax-${options.year}`;
  const csvPath = `${rootName}/expense-report.csv`;
  files[csvPath] = strToU8(createExpenseCsv(preview.documents));
  manifestFiles.push({ path: csvPath, size: files[csvPath].byteLength });
  const indexPath = `${rootName}/document-index.pdf`;
  files[indexPath] = strToU8(
    pdfIndex(
      `MeinDocs tax export ${options.year}`,
      preview.documents.map((doc) => `${doc.date} · ${doc.vendor} · ${doc.title}`),
    ),
  );
  manifestFiles.push({ path: indexPath, size: files[indexPath].byteLength });
  for (const document of preview.documents) {
    const category =
      Object.entries(preview.groups).find(([, values]) =>
        values.some((value) => value.id === document.id),
      )?.[0] ?? 'other';
    const record = fileRecords.find(
      (item) =>
        item.id === document.id ||
        item.originalName === document.sourceFileName ||
        item.localUri === document.sourceUri,
    );
    if (!record) continue;
    const path = `${rootName}/${category}/${safeName(document.sourceFileName ?? record.originalName)}`;
    files[path] = await readLocalFileBytes(record.localUri);
    manifestFiles.push({
      path,
      documentId: document.id,
      size: files[path].byteLength,
      checksum: record.sha256,
    });
  }
  const manifest = createExportManifest({
    type: 'tax',
    createdAt: new Date().toISOString(),
    taxYear: options.year,
    categories: options.categories,
    reviewedOnly: options.reviewedOnly,
    files: manifestFiles,
    totals: preview.totals,
  });
  const manifestPath = `${rootName}/manifest.json`;
  files[manifestPath] = strToU8(JSON.stringify(manifest, null, 2));
  const archive = zipSync(files, { level: 6 });
  const archiveFile = new File(directory, `${exportId}.zip`);
  archiveFile.write(archive);
  return { uri: archiveFile.uri, manifest, preview };
}

export async function createDocumentExport(document: ExportDocument) {
  ensureRoot();
  const exportId = `document-${document.id}-${Date.now()}`;
  const directory = new Directory(root, exportId);
  directory.create({ idempotent: true, intermediates: true });
  const record = (await listLocalFileRecords()).find(
    (item) =>
      item.id === document.id ||
      item.originalName === document.sourceFileName ||
      item.localUri === document.sourceUri,
  );
  if (!record) throw new Error('The document file is not available in the local vault.');
  const fileName = safeName(document.sourceFileName ?? record.originalName);
  const files: Record<string, Uint8Array> = {
    [fileName]: await readLocalFileBytes(record.localUri),
  };
  const manifest = createExportManifest({
    type: 'documents',
    createdAt: new Date().toISOString(),
    files: [
      { path: fileName, documentId: document.id, size: record.size, checksum: record.sha256 },
    ],
  });
  files['manifest.json'] = strToU8(JSON.stringify(manifest, null, 2));
  const archiveFile = new File(directory, `${exportId}.zip`);
  archiveFile.write(zipSync(files));
  return { uri: archiveFile.uri, manifest };
}

export async function shareExport(uri: string) {
  if (!(await Sharing.isAvailableAsync()))
    throw new Error('Native sharing is not available on this device.');
  await Sharing.shareAsync(uri, {
    mimeType: 'application/zip',
    dialogTitle: 'Share MeinDocs export',
  });
}

export function cleanupExport(uri: string) {
  const file = new File(uri);
  const parent = file.parentDirectory;
  if (file.exists) file.delete();
  if (parent.exists && parent.name !== root.name) parent.delete();
}
