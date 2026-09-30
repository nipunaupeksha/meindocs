import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/app/card';
import { Page } from '@/features/preview/ui';
import { usePreview } from '@/features/preview/provider';
export default function OrganisationsScreen() {
  const { organisations, t } = usePreview();
  return (
    <Page title={t('Organisations', 'Organisationen')}>
      <Button onPress={() => router.push('/organisations/create')}>
        <Text>＋ {t('Add organisation', 'Organisation hinzufügen')}</Text>
      </Button>
      {organisations.map((item) => (
        <Card key={item.id}>
          <Text className="font-manrope-bold text-lg">{item.name}</Text>
          <Text className="text-sm text-muted-foreground">
            {item.type} · {item.documentIds.length} documents · {item.caseIds.length} cases
          </Text>
          <Button
            variant="outline"
            onPress={() =>
              router.push({ pathname: '/organisations/[id]', params: { id: item.id } })
            }
          >
            <Text>{t('Open', 'Öffnen')}</Text>
          </Button>
        </Card>
      ))}
    </Page>
  );
}
