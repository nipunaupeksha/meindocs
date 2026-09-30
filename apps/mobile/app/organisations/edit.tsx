import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Field, Page } from '@/features/preview/ui';
import { usePreview } from '@/features/preview/provider';
export default function EditOrganisationScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { organisations, updateOrganisation, t } = usePreview();
  const item = organisations.find((value) => value.id === id);
  const [name, setName] = useState(item?.name ?? '');
  const [address, setAddress] = useState(item?.address ?? '');
  const [website, setWebsite] = useState(item?.website ?? '');
  if (!item)
    return (
      <Page>
        <Text>{t('Organisation not found', 'Organisation nicht gefunden')}</Text>
      </Page>
    );
  return (
    <Page title={t('Edit organisation', 'Organisation bearbeiten')}>
      <Field label={t('Name', 'Name')} value={name} onChangeText={setName} />
      <Field label={t('Address', 'Adresse')} value={address} onChangeText={setAddress} multiline />
      <Field label="Website" value={website} onChangeText={setWebsite} />
      <Button
        onPress={() => {
          updateOrganisation(item.id, { name, address, website });
          router.back();
        }}
      >
        <Text>{t('Save changes', 'Änderungen speichern')}</Text>
      </Button>
    </Page>
  );
}
