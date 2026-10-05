import type { DocumentDomain, DocumentType } from './index';

export enum CustomFieldType {
  Text = 'text',
  Number = 'number',
  Currency = 'currency',
  Date = 'date',
  Boolean = 'boolean',
  Select = 'select',
  MultiSelect = 'multi_select',
  Url = 'url',
  Email = 'email',
  Phone = 'phone',
}

export type CustomFieldScope =
  | { kind: 'global' }
  | { kind: 'domain'; domain: DocumentDomain }
  | { kind: 'type'; documentType: DocumentType };

export type CustomFieldPrimitive = string | number | boolean;
export type CustomFieldValueData = CustomFieldPrimitive | string[];

export interface CustomFieldDefinition {
  id: string;
  name: string;
  key: string;
  type: CustomFieldType;
  description?: string;
  options?: string[];
  required: boolean;
  scope: CustomFieldScope;
  createdAt: string;
  updatedAt: string;
}

export interface CustomFieldValue {
  id: string;
  documentId: string;
  definitionId: string;
  value: CustomFieldValueData;
  createdAt: string;
  updatedAt: string;
}

export const predefinedCustomFieldDefinitions: Omit<
  CustomFieldDefinition,
  'createdAt' | 'updatedAt'
>[] = [
  {
    id: 'customer-number',
    name: 'Customer number',
    key: 'customer_number',
    type: CustomFieldType.Text,
    required: false,
    scope: { kind: 'global' },
  },
  {
    id: 'contract-number',
    name: 'Contract number',
    key: 'contract_number',
    type: CustomFieldType.Text,
    required: false,
    scope: { kind: 'global' },
  },
  {
    id: 'policy-number',
    name: 'Policy number',
    key: 'policy_number',
    type: CustomFieldType.Text,
    required: false,
    scope: { kind: 'domain', domain: 'insurance' as DocumentDomain },
  },
  {
    id: 'claim-number',
    name: 'Claim number',
    key: 'claim_number',
    type: CustomFieldType.Text,
    required: false,
    scope: { kind: 'domain', domain: 'insurance' as DocumentDomain },
  },
  {
    id: 'meter-number',
    name: 'Meter number',
    key: 'meter_number',
    type: CustomFieldType.Text,
    required: false,
    scope: { kind: 'domain', domain: 'utilities' as DocumentDomain },
  },
  {
    id: 'aktenzeichen',
    name: 'Aktenzeichen',
    key: 'aktenzeichen',
    type: CustomFieldType.Text,
    required: false,
    scope: { kind: 'domain', domain: 'legal' as DocumentDomain },
  },
  {
    id: 'beitragsnummer',
    name: 'Beitragsnummer',
    key: 'beitragsnummer',
    type: CustomFieldType.Text,
    required: false,
    scope: { kind: 'domain', domain: 'insurance' as DocumentDomain },
  },
];

export function definitionAppliesToDocument(
  definition: Pick<CustomFieldDefinition, 'scope'>,
  document: { domain: DocumentDomain; type: DocumentType },
) {
  if (definition.scope.kind === 'global') return true;
  if (definition.scope.kind === 'domain') return definition.scope.domain === document.domain;
  return definition.scope.documentType === document.type;
}

export function validateCustomFieldValue(
  definition: CustomFieldDefinition,
  value: unknown,
): string | null {
  if (value === undefined || value === null || value === '')
    return definition.required ? `${definition.name} is required.` : null;
  switch (definition.type) {
    case CustomFieldType.Text:
      return typeof value === 'string' ? null : `${definition.name} must be text.`;
    case CustomFieldType.Number:
    case CustomFieldType.Currency:
      return typeof value === 'number' && Number.isFinite(value)
        ? null
        : `${definition.name} must be a number.`;
    case CustomFieldType.Boolean:
      return typeof value === 'boolean' ? null : `${definition.name} must be true or false.`;
    case CustomFieldType.Date:
      return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? null
        : `${definition.name} must use YYYY-MM-DD.`;
    case CustomFieldType.Url:
      return typeof value === 'string' && /^https?:\/\/\S+$/i.test(value)
        ? null
        : `${definition.name} must be a valid URL.`;
    case CustomFieldType.Email:
      return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ? null
        : `${definition.name} must be a valid email.`;
    case CustomFieldType.Phone:
      return typeof value === 'string' && /^[+\d][\d\s().-]{5,}$/.test(value)
        ? null
        : `${definition.name} must be a valid phone number.`;
    case CustomFieldType.Select:
      return typeof value === 'string' && (definition.options ?? []).includes(value)
        ? null
        : `${definition.name} must use one of the provided options.`;
    case CustomFieldType.MultiSelect:
      return Array.isArray(value) &&
        value.every((item) => typeof item === 'string' && (definition.options ?? []).includes(item))
        ? null
        : `${definition.name} contains an invalid option.`;
  }
}

export class CustomFieldService {
  constructor(private readonly repository: CustomFieldRepository) {}

  async validateAndSave(documentId: string, definition: CustomFieldDefinition, value: unknown) {
    const error = validateCustomFieldValue(definition, value);
    if (error) throw new Error(error);
    if (value === undefined || value === null || value === '')
      return this.repository.removeValue(documentId, definition.id);
    return this.repository.setValue({
      documentId,
      definitionId: definition.id,
      value: value as CustomFieldValueData,
    });
  }
}

export interface CustomFieldRepository {
  listDefinitions(scope?: {
    domain?: DocumentDomain;
    documentType?: DocumentType;
  }): Promise<CustomFieldDefinition[]>;
  createDefinition(
    input: Omit<CustomFieldDefinition, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
  ): Promise<CustomFieldDefinition>;
  updateDefinition(
    id: string,
    input: Partial<Omit<CustomFieldDefinition, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<void>;
  listValues(documentId: string): Promise<CustomFieldValue[]>;
  setValue(input: {
    documentId: string;
    definitionId: string;
    value: CustomFieldValueData;
  }): Promise<CustomFieldValue>;
  removeValue(documentId: string, definitionId: string): Promise<void>;
}
