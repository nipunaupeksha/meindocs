import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Field, Page } from '@/features/preview/ui';
import { usePreview } from '@/features/preview/provider';
export default function EditPersonScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { people, updatePerson, t } = usePreview();
  const person = people.find((item) => item.id === id);
  const [preferredName, setPreferredName] = useState(person?.preferredName ?? '');
  const [address, setAddress] = useState(person?.addresses[0] ?? '');
  if (!person)
    return (
      <Page>
        <Text>{t('Person not found', 'Person nicht gefunden')}</Text>
      </Page>
    );
  return (
    <Page title={t('Edit person', 'Person bearbeiten')}>
      <Field
        label={t('Preferred name', 'Bevorzugter Name')}
        value={preferredName}
        onChangeText={setPreferredName}
      />
      <Field label={t('Address', 'Adresse')} value={address} onChangeText={setAddress} multiline />
      <Button
        onPress={() => {
          updatePerson(person.id, { preferredName, addresses: address ? [address] : [] });
          router.back();
        }}
      >
        <Text>{t('Save changes', 'Änderungen speichern')}</Text>
      </Button>
    </Page>
  );
}
