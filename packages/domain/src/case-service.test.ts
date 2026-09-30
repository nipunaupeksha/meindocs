import { expect, test } from 'bun:test';
import { CaseService, caseProgress, type Case, type CaseRepository } from './index';

function repository(): CaseRepository & { item: Case } {
  const item: Case = {
    id: 'case-1',
    type: 'tax',
    title: 'Tax filing',
    status: 'open',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    documentIds: [],
    actionIds: [],
    personIds: [],
    organisationIds: [],
    checklist: [
      {
        id: 'check-1',
        caseId: 'case-1',
        title: 'Review',
        completed: false,
        createdAt: '2026-01-01',
      },
    ],
    timeline: [],
  };
  return {
    item,
    getById: async () => item,
    list: async () => [item],
    create: async () => item,
    update: async (_id, input) => {
      Object.assign(item, input);
    },
    delete: async () => undefined,
    addDocument: async (_caseId, documentId) => {
      item.documentIds.push(documentId);
    },
    removeDocument: async () => undefined,
    addAction: async () => undefined,
    addPerson: async () => undefined,
    addOrganisation: async () => undefined,
    addChecklistItem: async () => item.checklist[0],
    completeChecklistItem: async () => undefined,
  };
}

test('case progress reflects completed checklist items', () => {
  const repo = repository();
  expect(caseProgress(repo.item)).toBe(0);
  repo.item.checklist[0].completed = true;
  expect(caseProgress(repo.item)).toBe(100);
});

test('case service links documents and completes a case', async () => {
  const repo = repository();
  const service = new CaseService(repo);
  await service.addDocument('case-1', 'document-1');
  expect(repo.item.documentIds).toContain('document-1');
  await service.complete('case-1');
  expect(repo.item.status).toBe('completed');
});

test('case service creates a case through the repository', async () => {
  const repo = repository();
  const service = new CaseService(repo);
  const created = await service.create({ title: 'Residence permit renewal', type: 'immigration' });
  expect(created.title).toBe('Tax filing');
});
