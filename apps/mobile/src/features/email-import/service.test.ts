// @ts-nocheck
import { expect, test } from 'bun:test';
import { isSupportedEmailAttachment } from './filters';

test('email import accepts supported document attachments and rejects unsupported files', () => {
  expect(isSupportedEmailAttachment('application/pdf', 'invoice.pdf')).toBe(true);
  expect(isSupportedEmailAttachment('image/heic', 'scan.heic')).toBe(true);
  expect(isSupportedEmailAttachment('application/zip', 'archive.zip')).toBe(false);
});
