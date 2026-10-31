import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/app/card';
import { Page } from '@/features/preview/ui';
import { usePreview } from '@/features/preview/provider';
import { Icon } from '@/features/preview/ui';
export default function OrganisationsScreen() {
  const { organisations, t } = usePreview();
  return (
    <Page title={t('Organisations', 'Organisationen')}>
      <Button variant="outline" className="gap-sm rounded-full border-primary bg-transparent px-md" onPress={() => router.push('/organisations/create')}>
        <Icon name="add-outline" size={14} color="#174A45" />
        <Text className="text-sm text-primary">{t('Add organisation', 'Organisation hinzufügen')}</Text>
      </Button>
      {organisations.map((item) => (
        <Card key={item.id}>
          <Text className="font-manrope-bold text-lg">{item.name}</Text>
          <Text className="text-sm text-muted-foreground">
            {item.type} · {item.documentIds.length} documents · {item.caseIds.length} cases
          </Text>
          <Button
            variant="outline"
            className="gap-sm rounded-full border-primary bg-transparent px-md"
            onPress={() =>
              router.push({ pathname: '/organisations/[id]', params: { id: item.id } })
            }
          >
            <Icon name="open-outline" size={14} color="#174A45" />
            <Text className="text-sm text-primary">{t('Open', 'Öffnen')}</Text>
          </Button>
        </Card>
      ))}
    </Page>
  );
}
