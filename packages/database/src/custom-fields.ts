import { and, eq } from 'drizzle-orm';
import {
  type CustomFieldDefinition,
  type CustomFieldRepository,
  type CustomFieldScope,
  type CustomFieldValue,
  type CustomFieldValueData,
  type DocumentDomain,
  type DocumentType,
  predefinedCustomFieldDefinitions,
} from '@meindocs/domain';
import { customFieldDefinitions, customFieldValues } from './schema';

type Db = ReturnType<typeof import('drizzle-orm/bun-sqlite').drizzle>;
const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();

function scopeFromRow(row: typeof customFieldDefinitions.$inferSelect): CustomFieldScope {
  if (row.scopeKind === 'domain' && row.scopeDomain)
    return { kind: 'domain', domain: row.scopeDomain as DocumentDomain };
  if (row.scopeKind === 'type' && row.scopeDocumentType)
    return { kind: 'type', documentType: row.scopeDocumentType as DocumentType };
  return { kind: 'global' };
}

function definitionFromRow(row: typeof customFieldDefinitions.$inferSelect): CustomFieldDefinition {
  let options: string[] | undefined;
  try {
    const parsed: unknown = row.options ? JSON.parse(row.options) : undefined;
    options = Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : undefined;
  } catch {
    options = undefined;
  }
  return {
    id: row.id,
    name: row.name,
    key: row.key,
    type: row.type,
    description: row.description ?? undefined,
    options,
    required: row.required,
    scope: scopeFromRow(row),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function valueFromRow(row: typeof customFieldValues.$inferSelect): CustomFieldValue {
  return {
    id: row.id,
    documentId: row.documentId,
    definitionId: row.definitionId,
    value: JSON.parse(row.value) as CustomFieldValueData,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class SqliteCustomFieldRepository implements CustomFieldRepository {
  constructor(private readonly db: Db) {}

  async listDefinitions(scope: { domain?: DocumentDomain; documentType?: DocumentType } = {}) {
    const rows = await this.db.select().from(customFieldDefinitions);
    return rows
      .filter(
        (row) =>
          row.scopeKind === 'global' ||
          (row.scopeKind === 'domain' && row.scopeDomain === scope.domain) ||
          (row.scopeKind === 'type' && row.scopeDocumentType === scope.documentType),
      )
      .map(definitionFromRow);
  }

  async createDefinition(
    input: Omit<CustomFieldDefinition, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
  ) {
    const timestamp = now();
    const [row] = await this.db
      .insert(customFieldDefinitions)
      .values({
        id: input.id ?? id(),
        name: input.name,
        key: input.key,
        type: input.type,
        description: input.description,
        options: input.options ? JSON.stringify(input.options) : null,
        required: input.required,
        scopeKind: input.scope.kind,
        scopeDomain: input.scope.kind === 'domain' ? input.scope.domain : null,
        scopeDocumentType: input.scope.kind === 'type' ? input.scope.documentType : null,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .returning();
    return definitionFromRow(row);
  }

  async updateDefinition(
    definitionId: string,
    input: Partial<Omit<CustomFieldDefinition, 'id' | 'createdAt' | 'updatedAt'>>,
  ) {
    await this.db
      .update(customFieldDefinitions)
      .set({
        ...(input.name === undefined ? {} : { name: input.name }),
        ...(input.key === undefined ? {} : { key: input.key }),
        ...(input.type === undefined ? {} : { type: input.type }),
        ...(input.description === undefined ? {} : { description: input.description }),
        ...(input.options === undefined ? {} : { options: JSON.stringify(input.options) }),
        ...(input.required === undefined ? {} : { required: input.required }),
        ...(input.scope === undefined
          ? {}
          : {
              scopeKind: input.scope.kind,
              scopeDomain: input.scope.kind === 'domain' ? input.scope.domain : null,
              scopeDocumentType: input.scope.kind === 'type' ? input.scope.documentType : null,
            }),
        updatedAt: now(),
      })
      .where(eq(customFieldDefinitions.id, definitionId));
  }

  async listValues(documentId: string) {
    const rows = await this.db
      .select()
      .from(customFieldValues)
      .where(eq(customFieldValues.documentId, documentId));
    return rows.map(valueFromRow);
  }

  async setValue(input: { documentId: string; definitionId: string; value: CustomFieldValueData }) {
    const timestamp = now();
    const existing = await this.db
      .select()
      .from(customFieldValues)
      .where(
        and(
          eq(customFieldValues.documentId, input.documentId),
          eq(customFieldValues.definitionId, input.definitionId),
        ),
      )
      .limit(1);
    const [row] = existing.length
      ? await this.db
          .update(customFieldValues)
          .set({ value: JSON.stringify(input.value), updatedAt: timestamp })
          .where(eq(customFieldValues.id, existing[0].id))
          .returning()
      : await this.db
          .insert(customFieldValues)
          .values({
            id: id(),
            documentId: input.documentId,
            definitionId: input.definitionId,
            value: JSON.stringify(input.value),
            createdAt: timestamp,
            updatedAt: timestamp,
          })
          .returning();
    return valueFromRow(row);
  }

  async removeValue(documentId: string, definitionId: string) {
    await this.db
      .delete(customFieldValues)
      .where(
        and(
          eq(customFieldValues.documentId, documentId),
          eq(customFieldValues.definitionId, definitionId),
        ),
      );
  }

  async seedPredefinedDefinitions() {
    for (const definition of predefinedCustomFieldDefinitions) {
      const existing = await this.db
        .select({ id: customFieldDefinitions.id })
        .from(customFieldDefinitions)
        .where(eq(customFieldDefinitions.id, definition.id))
        .limit(1);
      if (!existing.length) await this.createDefinition(definition);
    }
  }
}
