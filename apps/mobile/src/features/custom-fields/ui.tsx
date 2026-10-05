import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  CustomFieldType,
  definitionAppliesToDocument,
  DocumentDomain,
  DocumentType,
  predefinedCustomFieldDefinitions,
  validateCustomFieldValue,
  type CustomFieldDefinition,
  type CustomFieldValueData,
} from '@meindocs/domain';
import { colors } from '@meindocs/ui';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/app/card';
import { Field, Icon, Options } from '@/features/preview/ui';
import type { MockDocument } from '@/features/preview/data';

function definitionsFor(document: MockDocument) {
  const domain =
    document.category === 'insurance'
      ? DocumentDomain.Insurance
      : document.category === 'home'
        ? DocumentDomain.Housing
        : document.category === 'work'
          ? DocumentDomain.Employment
          : document.category === 'tax'
            ? DocumentDomain.Tax
            : DocumentDomain.General;
  const type = document.category === 'tax' ? DocumentType.Receipt : DocumentType.Other;
  return predefinedCustomFieldDefinitions.filter((definition) =>
    definitionAppliesToDocument(definition, { domain, type }),
  );
}

function displayValue(value: CustomFieldValueData | undefined) {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return value === undefined ? 'Not set' : String(value);
}

export function CustomFieldsSection({
  document,
  values,
  onEdit,
}: {
  document: MockDocument;
  values: Record<string, CustomFieldValueData>;
  onEdit: () => void;
}) {
  const definitions = definitionsFor(document);
  return (
    <View className="gap-sm">
      <View className="flex-row items-center justify-between">
        <Text className="font-manrope-semibold text-lg">Custom Fields</Text>
        <Button variant="ghost" size="sm" onPress={onEdit}>
          <Text>Edit</Text>
        </Button>
      </View>
      <Card>
        {definitions.length ? (
          definitions.map((definition) => (
            <View
              key={definition.id}
              className="flex-row items-center gap-sm border-b border-border py-sm"
            >
              <Icon name="pricetag-outline" color={colors.muted} size={18} />
              <Text className="flex-1 text-sm text-muted-foreground">{definition.name}</Text>
              <Text className="max-w-[52%] text-right font-manrope-medium text-sm">
                {displayValue(values[definition.id])}
              </Text>
            </View>
          ))
        ) : (
          <Text className="text-sm text-muted-foreground">
            No custom fields apply to this document.
          </Text>
        )}
      </Card>
    </View>
  );
}

export function CustomFieldsEditor({
  document,
  initialValues,
  onSave,
}: {
  document: MockDocument;
  initialValues: Record<string, CustomFieldValueData>;
  onSave: (values: Record<string, CustomFieldValueData>) => void;
}) {
  const definitions = useMemo(() => definitionsFor(document), [document]);
  const [draft, setDraft] = useState<Record<string, string | boolean>>(() =>
    Object.fromEntries(
      definitions.map((definition) => [
        definition.id,
        (() => {
          const value = initialValues[definition.id];
          return Array.isArray(value)
            ? value.join(', ')
            : typeof value === 'number'
              ? String(value)
              : (value ?? '');
        })(),
      ]),
    ),
  );
  const [error, setError] = useState<string | null>(null);
  function save() {
    const next: Record<string, CustomFieldValueData> = {};
    for (const definition of definitions) {
      const raw = draft[definition.id];
      const value =
        definition.type === CustomFieldType.Number || definition.type === CustomFieldType.Currency
          ? raw === ''
            ? ''
            : Number(raw)
          : definition.type === CustomFieldType.Boolean
            ? Boolean(raw)
            : definition.type === CustomFieldType.MultiSelect
              ? String(raw ?? '')
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean)
              : raw;
      const validation = validateCustomFieldValue(definition as CustomFieldDefinition, value);
      if (validation) {
        setError(validation);
        return;
      }
      if (value !== '') next[definition.id] = value as CustomFieldValueData;
    }
    setError(null);
    onSave(next);
  }
  return (
    <View className="gap-md">
      {definitions.map((definition) => {
        if (definition.type === CustomFieldType.Boolean)
          return (
            <Pressable
              key={definition.id}
              onPress={() =>
                setDraft((current) => ({ ...current, [definition.id]: !current[definition.id] }))
              }
            >
              <Card className="flex-row items-center gap-sm">
                <Icon
                  name={draft[definition.id] ? 'checkbox' : 'square-outline'}
                  color={colors.primary}
                />
                <Text>{definition.name}</Text>
              </Card>
            </Pressable>
          );
        if (definition.type === CustomFieldType.Select)
          return (
            <View key={definition.id} className="gap-sm">
              <Text className="font-manrope-medium">{definition.name}</Text>
              <Options
                value={String(draft[definition.id] ?? '')}
                onChange={(value) =>
                  setDraft((current) => ({ ...current, [definition.id]: value }))
                }
                options={(definition.options ?? []).map((value) => ({ value, label: value }))}
              />
            </View>
          );
        return (
          <Field
            key={definition.id}
            label={definition.name}
            value={String(draft[definition.id] ?? '')}
            onChangeText={(value) =>
              setDraft((current) => ({ ...current, [definition.id]: value }))
            }
            keyboardType={
              definition.type === CustomFieldType.Number ||
              definition.type === CustomFieldType.Currency
                ? 'decimal-pad'
                : 'default'
            }
            autoCapitalize={definition.type === CustomFieldType.Email ? 'none' : 'sentences'}
          />
        );
      })}
      {error ? <Text className="text-sm text-danger">{error}</Text> : null}
      <Button onPress={save}>
        <Text>Save custom fields</Text>
      </Button>
    </View>
  );
}
