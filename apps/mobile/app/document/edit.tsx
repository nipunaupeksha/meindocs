import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Field, Page } from '@/features/preview/ui';
import { CustomFieldsEditor } from '@/features/custom-fields/ui';
import { usePreview } from '@/features/preview/provider';
import { RouteError } from '@/components/app/route-error';
import { readRouteId } from '@/lib/route-params';

export default function EditDocumentScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const { t, documents, customFieldValues, saveCustomFieldValues, updateDocument } = usePreview();
  const [title, setTitle] = useState('');
  const id = readRouteId(params.id);
  const document = documents.find((item) => item.id === id);
  if (!document)
    return <RouteError message={t('Document not found.', 'Dokument nicht gefunden.')} />;
  return (
    <Page title={t('Edit document', 'Dokument bearbeiten')} subtitle={document.title.en}>
      <Text className="text-sm text-muted-foreground">
        {t(
          'Add or update metadata specific to this document.',
          'Füge dokumentbezogene Metadaten hinzu oder bearbeite sie.',
        )}
      </Text>
      <Field
        label={t('Document title', 'Dokumenttitel')}
        value={title || document.title.en}
        onChangeText={setTitle}
      />
      <Button
        variant="outline"
        onPress={() => {
          const nextTitle = title.trim() || document.title.en;
          void updateDocument(document.id, {
            title: { en: nextTitle, de: nextTitle },
            titleSource: 'user',
          });
        }}
      >
        <Text>{t('Save title override', 'Titel speichern')}</Text>
      </Button>
      <CustomFieldsEditor
        document={document}
        initialValues={customFieldValues[document.id] ?? {}}
        onSave={(values) => {
          saveCustomFieldValues(document.id, values);
          router.back();
        }}
      />
    </Page>
  );
}
