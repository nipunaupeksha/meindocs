import { useState } from 'react';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Field, Options, Page } from '@/features/preview/ui';
import { usePreview } from '@/features/preview/provider';
const types = [
  'government',
  'employer',
  'landlord',
  'insurance',
  'bank',
  'utility',
  'healthcare',
  'business',
  'education',
  'other',
] as const;
export default function CreateOrganisationScreen() {
  const { t, createOrganisation } = usePreview();
  const [name, setName] = useState('');
  const [type, setType] = useState<(typeof types)[number]>('other');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [reference, setReference] = useState('');
  return (
    <Page title={t('Add organisation', 'Organisation hinzufügen')}>
      <Field label={t('Name', 'Name')} value={name} onChangeText={setName} />
      <Options
        value={type}
        onChange={setType}
        options={types.map((value) => ({ value, label: value }))}
      />
      <Field label={t('Address', 'Adresse')} value={address} onChangeText={setAddress} multiline />
      <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Field label={t('Phone', 'Telefon')} value={phone} onChangeText={setPhone} />
      <Field label="Website" value={website} onChangeText={setWebsite} />
      <Field
        label={t('Customer/reference number', 'Kunden-/Referenznummer')}
        value={reference}
        onChangeText={setReference}
      />
      <Button
        disabled={!name}
        onPress={() => {
          const id = createOrganisation({
            name,
            type,
            address,
            email,
            phone,
            website,
            customerReference: reference,
          });
          router.replace({ pathname: '/organisations/[id]', params: { id } });
        }}
      >
        <Text>{t('Save organisation', 'Organisation speichern')}</Text>
      </Button>
    </Page>
  );
}
