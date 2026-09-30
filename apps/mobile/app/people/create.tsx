import { useState } from 'react';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Field, Options, Page } from '@/features/preview/ui';
import { usePreview } from '@/features/preview/provider';
const relationships = ['self', 'spouse', 'child', 'dependent', 'other'] as const;
export default function CreatePersonScreen() {
  const { t, createPerson } = usePreview();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [relationship, setRelationship] = useState<(typeof relationships)[number]>('other');
  const [preferredName, setPreferredName] = useState('');
  const [address, setAddress] = useState('');
  return (
    <Page title={t('Add person', 'Person hinzufügen')}>
      <Field label={t('First name', 'Vorname')} value={firstName} onChangeText={setFirstName} />
      <Field label={t('Last name', 'Nachname')} value={lastName} onChangeText={setLastName} />
      <Field
        label={t('Preferred name', 'Bevorzugter Name')}
        value={preferredName}
        onChangeText={setPreferredName}
      />
      <Options
        value={relationship}
        onChange={setRelationship}
        options={relationships.map((value) => ({ value, label: value }))}
      />
      <Field label={t('Address', 'Adresse')} value={address} onChangeText={setAddress} multiline />
      <Button
        disabled={!firstName || !lastName}
        onPress={() => {
          const id = createPerson({
            firstName,
            lastName,
            preferredName: preferredName || undefined,
            relationship,
            addresses: address ? [address] : [],
          });
          router.replace({ pathname: '/people/[id]', params: { id } });
        }}
      >
        <Text>{t('Save person', 'Person speichern')}</Text>
      </Button>
    </Page>
  );
}
