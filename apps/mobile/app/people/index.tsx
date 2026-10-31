import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/app/card';
import { Page } from '@/features/preview/ui';
import { usePreview } from '@/features/preview/provider';
import { Icon } from '@/features/preview/ui';
export default function PeopleScreen() {
  const { people, t } = usePreview();
  return (
    <Page title={t('People', 'Personen')}>
      <Button variant="outline" className="gap-sm rounded-full border-primary bg-transparent px-md" onPress={() => router.push('/people/create')}>
        <Icon name="add-outline" size={14} color="#174A45" />
        <Text className="text-sm text-primary">{t('Add person', 'Person hinzufügen')}</Text>
      </Button>
      {people.map((person) => (
        <Card key={person.id}>
          <Text className="font-manrope-bold text-lg">
            {person.preferredName || `${person.firstName} ${person.lastName}`}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {person.relationship} · {person.documentIds.length} documents · {person.caseIds.length}{' '}
            cases
          </Text>
          <Button
            variant="outline"
            className="gap-sm rounded-full border-primary bg-transparent px-md"
            onPress={() => router.push({ pathname: '/people/[id]', params: { id: person.id } })}
          >
            <Icon name="open-outline" size={14} color="#174A45" />
            <Text className="text-sm text-primary">{t('Open', 'Öffnen')}</Text>
          </Button>
        </Card>
      ))}
    </Page>
  );
}
