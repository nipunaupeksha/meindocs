import { expect, test } from 'bun:test';
import { DocumentGeneratorService } from './document-generator';
import { DocumentRelationType } from './index';

const values = {
  senderName: 'Max Mustermann',
  recipientName: 'Vermieter GmbH',
  date: '2026-09-29',
  propertyAddress: 'Hauptstraße 1',
  terminationDate: '2026-12-31',
};

test('renders a deterministic German template', () => {
  const result = new DocumentGeneratorService().render('rental-termination', 'de', values);
  expect(result.content).toContain('Kündigung des Mietverhältnisses');
  expect(result.content).toContain('Hauptstraße 1');
  expect(result.missingFields).toEqual([]);
});

test('reports missing required fields without failing rendering', () => {
  const result = new DocumentGeneratorService().render('repair-request', 'en', {
    senderName: 'Max',
  });
  expect(result.missingFields).toContain('recipientName');
  expect(result.content).toContain('[issueDescription]');
});

test('supports all required templates in both languages', () => {
  const service = new DocumentGeneratorService();
  expect(service.getTemplates()).toHaveLength(14);
  for (const template of service.getTemplates()) {
    expect(service.render(template.id, 'de', {}).template.id).toBe(template.id);
    expect(service.render(template.id, 'en', {}).template.id).toBe(template.id);
  }
});

test('generated metadata keeps source relationships explicit', () => {
  const generated = {
    id: 'generated-1',
    title: 'Letter',
    content: 'text',
    mimeType: 'text/plain' as const,
    createdAt: '2026-09-29',
    generatedFromTemplate: 'repair-request',
    sourceDocumentIds: ['document-1'],
    sourceCaseId: 'case-1',
  };
  expect(generated.generatedFromTemplate).toBe('repair-request');
  expect(generated.sourceDocumentIds).toEqual(['document-1']);
  expect(DocumentRelationType.GenerationFrom).toBe('generation_from');
});
