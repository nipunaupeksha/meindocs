import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Field, Options, Page } from '@/features/preview/ui';
import { usePreview } from '@/features/preview/provider';

const types = [
  'immigration',
  'tax',
  'housing',
  'insurance',
  'employment',
  'family',
  'vehicle',
  'custom',
] as const;
export default function CreateCaseScreen() {
  const { t, createCase, addDocumentToCase } = usePreview();
  const { documentId } = useLocalSearchParams<{ documentId?: string | string[] }>();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<(typeof types)[number]>('custom');
  const [deadline, setDeadline] = useState('');
  return (
    <Page title={t('Create case', 'Fall erstellen')}>
      <Field
        label={t('Title', 'Titel')}
        value={title}
        onChangeText={setTitle}
        placeholder={t('e.g. Residence permit renewal', 'z. B. Aufenthaltstitel verlängern')}
      />
      <Options
        value={type}
        onChange={setType}
        options={types.map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) }))}
      />
      <Field
        label={t('Deadline (optional)', 'Frist (optional)')}
        value={deadline}
        onChangeText={setDeadline}
        placeholder="YYYY-MM-DD"
      />
      <Button
        disabled={!title.trim()}
        onPress={() => {
          const id = createCase({ title: title.trim(), type, deadline: deadline || undefined });
          if (documentId)
            addDocumentToCase(id, Array.isArray(documentId) ? documentId[0] : documentId);
          router.replace({ pathname: '/cases/[id]', params: { id } });
        }}
      >
        <Text>{t('Create case', 'Fall erstellen')}</Text>
      </Button>
    </Page>
  );
}
