import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/app/card';
import { SectionHeader } from '@/components/app/section-header';
import { Page } from '@/features/preview/ui';
import { usePreview } from '@/features/preview/provider';
export default function PersonDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { people, documents, cases, tasks, t } = usePreview();
  const person = people.find((item) => item.id === id);
  if (!person)
    return (
      <Page>
        <Text>{t('Person not found', 'Person nicht gefunden')}</Text>
      </Page>
    );
  const personDocs = documents.filter((doc) => person.documentIds.includes(doc.id));
  const deadlines = tasks.filter(
    (task) => task.documentId && person.documentIds.includes(task.documentId) && !task.done,
  );
  return (
    <Page
      title={person.preferredName || `${person.firstName} ${person.lastName}`}
      subtitle={`${person.relationship} · ${person.nationality ?? ''}`}
    >
      <Button
        variant="outline"
        onPress={() => router.push({ pathname: '/people/edit', params: { id: person.id } })}
      >
        <Text>{t('Edit person', 'Person bearbeiten')}</Text>
      </Button>
      <Card>
        <Text>
          {person.addresses.join('\n') || t('No address saved', 'Keine Adresse gespeichert')}
        </Text>
      </Card>
      <SectionHeader title={t('Documents', 'Dokumente')} />
      {personDocs.map((doc) => (
        <Card key={doc.id}>
          <Text>{doc.title.en}</Text>
          <Text className="text-sm text-muted-foreground">{doc.issuer}</Text>
        </Card>
      ))}
      <SectionHeader title={t('Cases', 'Fälle')} />
      {person.caseIds.map((caseId) => (
        <Card key={caseId}>
          <Text>{cases.find((item) => item.id === caseId)?.title ?? caseId}</Text>
        </Card>
      ))}
      <SectionHeader title={t('Upcoming deadlines', 'Bevorstehende Fristen')} />
      {deadlines.map((task) => (
        <Text key={task.id} className="text-sm text-muted-foreground">
          {task.date} · {task.title.en}
        </Text>
      ))}
    </Page>
  );
}
