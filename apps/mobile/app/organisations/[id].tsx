import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/app/card';
import { SectionHeader } from '@/components/app/section-header';
import { Page } from '@/features/preview/ui';
import { usePreview } from '@/features/preview/provider';
export default function OrganisationDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { organisations, documents, cases, t } = usePreview();
  const item = organisations.find((value) => value.id === id);
  if (!item)
    return (
      <Page>
        <Text>{t('Organisation not found', 'Organisation nicht gefunden')}</Text>
      </Page>
    );
  return (
    <Page title={item.name} subtitle={item.type}>
      <Button
        variant="outline"
        onPress={() => router.push({ pathname: '/organisations/edit', params: { id: item.id } })}
      >
        <Text>{t('Edit organisation', 'Organisation bearbeiten')}</Text>
      </Button>
      <Card>
        <Text>{item.address ?? t('No address saved', 'Keine Adresse gespeichert')}</Text>
        <Text>
          {item.email ?? ''} {item.phone ?? ''}
        </Text>
        <Text>{item.website ?? ''}</Text>
        <Text>{item.customerReference ?? ''}</Text>
      </Card>
      <SectionHeader title={t('Documents', 'Dokumente')} />
      {item.documentIds.map((documentId) => (
        <Card key={documentId}>
          <Text>{documents.find((doc) => doc.id === documentId)?.title.en ?? documentId}</Text>
        </Card>
      ))}
      <SectionHeader title={t('Payments', 'Zahlungen')} />
      <Text>
        {item.paymentIds.length} {t('linked payments', 'verknüpfte Zahlungen')}
      </Text>
      <SectionHeader title={t('Open actions', 'Offene Aktionen')} />
      <Text>
        {item.actionIds.length} {t('open actions', 'offene Aktionen')}
      </Text>
      <SectionHeader title={t('Cases', 'Fälle')} />
      {item.caseIds.map((caseId) => (
        <Card key={caseId}>
          <Text>{cases.find((entry) => entry.id === caseId)?.title ?? caseId}</Text>
        </Card>
      ))}
    </Page>
  );
}
