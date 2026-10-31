import { useState } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import type { CustomFieldValueData } from '@meindocs/domain';
import { colors } from '@meindocs/ui';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/app/card';
import { Field, Icon } from '@/features/preview/ui';

function displayValue(value: CustomFieldValueData) {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

export function CustomFieldsSection({
  values,
  onAdd,
  onEdit,
  onDelete,
}: {
  values: Record<string, CustomFieldValueData>;
  onAdd: () => void;
  onEdit: (key: string) => void;
  onDelete: (key: string) => void;
}) {
  const { width } = useWindowDimensions();
  const entries = Object.entries(values);
  return (
    <View className="gap-sm">
      <View className="flex-row items-center justify-between">
        <Text className="font-manrope-semibold text-lg">Custom Fields</Text>
        <Button
          variant="outline"
          size="icon"
          accessibilityLabel="Add custom field"
          className="h-10 w-10 min-h-10 min-w-10 border-0 bg-transparent p-0"
          onPress={onAdd}
        >
          <Icon name="add-outline" color={colors.primary} size={14} />
        </Button>
      </View>
      <Card>
        {entries.length ? (
          entries.map(([key, value]) => (
            <ScrollView
              key={key}
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              contentContainerStyle={{ alignItems: 'center' }}
            >
              <View
                style={{ width: width - 112 }}
                className="flex-row items-center gap-sm border-b border-border py-sm"
              >
                <Icon name="pricetag-outline" color={colors.muted} size={18} />
                <Text numberOfLines={1} className="min-w-0 flex-1 text-sm text-muted-foreground">
                  {key}
                </Text>
                <Text numberOfLines={2} className="max-w-[52%] text-right font-manrope-medium text-sm">
                  {displayValue(value)}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Edit ${key}`}
                onPress={() => onEdit(key)}
                className="h-11 w-11 items-center justify-center rounded-full bg-primary-soft"
              >
                <Icon name="pencil-outline" color={colors.primary} size={18} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Delete ${key}`}
                onPress={() => onDelete(key)}
                className="h-11 w-11 items-center justify-center rounded-full bg-danger/10"
              >
                <Icon name="trash-outline" color={colors.danger} size={18} />
              </Pressable>
            </ScrollView>
          ))
        ) : (
          <Text className="text-sm text-muted-foreground">No custom fields added yet.</Text>
        )}
      </Card>
    </View>
  );
}

export function CustomFieldsEditor({
  initialValues,
  onSave,
}: {
  initialValues: Record<string, CustomFieldValueData>;
  onSave: (values: Record<string, CustomFieldValueData>) => void;
}) {
  const [draft, setDraft] = useState(() =>
    Object.entries(initialValues).map(([key, value]) => ({ key, value: displayValue(value) })),
  );

  function updateRow(index: number, patch: Partial<(typeof draft)[number]>) {
    setDraft((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
  }

  function save() {
    const next: Record<string, CustomFieldValueData> = {};
    for (const row of draft) {
      const key = row.key.trim();
      const value = row.value.trim();
      if (key && value) next[key] = value;
    }
    onSave(next);
  }

  return (
    <View className="gap-md">
      {draft.map((row, index) => (
        <Card key={`${index}-${row.key}`} className="gap-sm">
          <Field
            label="Field name"
            value={row.key}
            onChangeText={(key) => updateRow(index, { key })}
            placeholder="e.g. Policy ID"
          />
          <Field
            label="Value"
            value={row.value}
            onChangeText={(value) => updateRow(index, { value })}
          />
          <Button
            variant="ghost"
            className="self-end"
            onPress={() => setDraft((current) => current.filter((_, rowIndex) => rowIndex !== index))}
          >
            <Icon name="trash-outline" color={colors.danger} size={16} />
            <Text className="text-sm text-danger">Remove</Text>
          </Button>
        </Card>
      ))}
      <Button
        variant="outline"
        className="gap-sm rounded-full border-primary bg-transparent px-md"
        onPress={() => setDraft((current) => [...current, { key: '', value: '' }])}
      >
        <Icon name="add-outline" color={colors.primary} size={14} />
        <Text className="text-sm text-primary">Add field</Text>
      </Button>
      <Button onPress={save}>
        <Text>Save custom fields</Text>
      </Button>
    </View>
  );
}
