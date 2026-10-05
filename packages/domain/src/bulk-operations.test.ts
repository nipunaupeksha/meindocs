import { expect, test } from 'bun:test';
import { BulkDocumentService, bulkResultMessage } from './index';

test('bulk service deduplicates multi-selection and reports partial failures', async () => {
  const calls: string[] = [];
  const service = new BulkDocumentService({
    execute: async (id) => {
      calls.push(id);
      if (id === 'bad') throw new Error('Document not found');
    },
  });
  const result = await service.execute(['one', 'two', 'two', 'bad'], { type: 'archive' });
  expect(calls).toEqual(['one', 'two', 'bad']);
  expect(result.requested).toBe(3);
  expect(result.succeeded).toEqual(['one', 'two']);
  expect(result.failed).toEqual([{ documentId: 'bad', message: 'Document not found' }]);
  expect(bulkResultMessage(result)).toBe('2 succeeded\n1 failed');
});
