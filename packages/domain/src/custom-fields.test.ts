import { describe, expect, test } from 'bun:test';
import {
  CustomFieldService,
  CustomFieldType,
  type CustomFieldDefinition,
  type CustomFieldValue,
  validateCustomFieldValue,
} from './custom-fields';

const definition = (type: CustomFieldType, options?: string[]): CustomFieldDefinition => ({
  id: 'field',
  name: 'Field',
  key: 'field',
  type,
  options,
  required: true,
  scope: { kind: 'global' },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

test('validates typed custom field values', () => {
  expect(validateCustomFieldValue(definition(CustomFieldType.Number), 12)).toBeNull();
  expect(validateCustomFieldValue(definition(CustomFieldType.Number), '12')).toContain('number');
  expect(
    validateCustomFieldValue(definition(CustomFieldType.Email), 'person@example.com'),
  ).toBeNull();
  expect(validateCustomFieldValue(definition(CustomFieldType.Date), '2026-10-02')).toBeNull();
});

test('validates select and multi-select options', () => {
  const select = definition(CustomFieldType.Select, ['one', 'two']);
  const multi = definition(CustomFieldType.MultiSelect, ['one', 'two']);
  expect(validateCustomFieldValue(select, 'one')).toBeNull();
  expect(validateCustomFieldValue(select, 'three')).toContain('options');
  expect(validateCustomFieldValue(multi, ['one', 'two'])).toBeNull();
  expect(validateCustomFieldValue(multi, ['three'])).toContain('invalid');
});

test('service removes optional values and rejects invalid values', async () => {
  const values: CustomFieldValue[] = [];
  const repository = {
    listDefinitions: async () => [],
    createDefinition: async () => definition(CustomFieldType.Text),
    updateDefinition: async () => {},
    listValues: async () => values,
    setValue: async (input: { documentId: string; definitionId: string; value: string }) => {
      const item = { ...input, id: 'value', createdAt: '', updatedAt: '' } as CustomFieldValue;
      values.push(item);
      return item;
    },
    removeValue: async () => {
      values.length = 0;
    },
  };
  const service = new CustomFieldService(repository);
  await service.validateAndSave('doc', definition(CustomFieldType.Text), 'abc');
  expect(values).toHaveLength(1);
  await service.validateAndSave(
    'doc',
    { ...definition(CustomFieldType.Text), required: false },
    '',
  );
  expect(values).toHaveLength(0);
  await expect(
    service.validateAndSave('doc', definition(CustomFieldType.Number), 'bad'),
  ).rejects.toThrow();
});
