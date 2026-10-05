// @ts-nocheck
import { expect, test } from 'bun:test';
import { isSupportedCloudDocument } from './filters';

test('cloud import filters folders and unsupported files', () => {
  expect(
    isSupportedCloudDocument({ name: 'bill.pdf', mimeType: 'application/pdf', isFolder: false }),
  ).toBe(true);
  expect(
    isSupportedCloudDocument({ name: 'notes.txt', mimeType: 'image/png', isFolder: false }),
  ).toBe(false);
  expect(
    isSupportedCloudDocument({
      name: 'Folder',
      mimeType: 'application/vnd.google-apps.folder',
      isFolder: true,
    }),
  ).toBe(false);
});
