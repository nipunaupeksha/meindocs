import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Field, Options, Page } from '@/features/preview/ui';
import { usePreview } from '@/features/preview/provider';
import { readRouteId } from '@/lib/route-params';
export default function EditCaseScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const { cases, t, updateCase } = usePreview();
  const item = cases.find((value) => value.id === readRouteId(id));
  const [title, setTitle] = useState(item?.title ?? '');
  const [status, setStatus] = useState(item?.status ?? 'open');
  if (!item)
    return (
      <Page>
        <Text>{t('Case not found', 'Fall nicht gefunden')}</Text>
      </Page>
    );
  return (
    <Page title={t('Edit case', 'Fall bearbeiten')}>
      <Field label={t('Title', 'Titel')} value={title} onChangeText={setTitle} />
      <Options
        value={status}
        onChange={(value) => setStatus(value as typeof status)}
        options={['open', 'action_required', 'waiting', 'completed', 'archived'].map((value) => ({
          value,
          label: value.replace('_', ' '),
        }))}
      />
      <Button
        onPress={() => {
          updateCase(item.id, { title, status });
          router.back();
        }}
      >
        <Text>{t('Save changes', 'Änderungen speichern')}</Text>
      </Button>
    </Page>
  );
}
