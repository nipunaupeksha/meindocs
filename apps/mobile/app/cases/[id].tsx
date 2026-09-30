import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/app/card';
import { SectionHeader } from '@/components/app/section-header';
import { StatusBadge } from '@/components/app/status-badge';
import { Page } from '@/features/preview/ui';
import { usePreview } from '@/features/preview/provider';
import { readRouteId } from '@/lib/route-params';

export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const { cases, documents, t, toggleCaseChecklist, addDocumentToCase } = usePreview();
  const item = cases.find((value) => value.id === readRouteId(id));
  if (!item)
    return (
      <Page>
        <Text>{t('Case not found', 'Fall nicht gefunden')}</Text>
      </Page>
    );
  const completed = item.checklist.filter((check) => check.completed).length;
  const linked = documents.filter((document) => item.documentIds.includes(document.id));
  return (
    <Page
      title={item.title}
      subtitle={item.deadline ? `${t('Deadline', 'Frist')}: ${item.deadline}` : undefined}
    >
      <StatusBadge
        label={item.status.replace('_', ' ')}
        tone={
          item.status === 'completed'
            ? 'success'
            : item.status === 'action_required'
              ? 'warning'
              : 'neutral'
        }
      />
      <Card>
        <Text className="font-manrope-bold text-2xl">
          {item.checklist.length
            ? `${Math.round((completed / item.checklist.length) * 100)}%`
            : '0%'}
        </Text>
        <Text className="text-sm text-muted-foreground">
          {completed}/{item.checklist.length}{' '}
          {t('checklist complete', 'Checklistenpunkte erledigt')}
        </Text>
      </Card>
      <SectionHeader title={t('Checklist', 'Checkliste')} />
      {item.checklist.map((check) => (
        <Button
          key={check.id}
          variant="outline"
          onPress={() => toggleCaseChecklist(item.id, check.id)}
        >
          <Text>
            {check.completed ? '✓ ' : '○ '}
            {check.title}
          </Text>
        </Button>
      ))}
      <SectionHeader
        title={t('Related documents', 'Zugehörige Dokumente')}
        action={{
          label: t('Add', 'Hinzufügen'),
          onPress: () => {
            const candidate = documents.find((document) => !item.documentIds.includes(document.id));
            if (candidate) addDocumentToCase(item.id, candidate.id);
          },
        }}
      />
      {linked.map((document) => (
        <Card key={document.id}>
          <Text className="font-manrope-medium">{document.title.en}</Text>
          <Text className="text-sm text-muted-foreground">{document.issuer}</Text>
        </Card>
      ))}
      <SectionHeader title={t('People and organisations', 'Personen und Organisationen')} />
      <Card>
        <Text>
          {item.people.length || item.organisations.length
            ? `${item.people.length} people · ${item.organisations.length} organisations`
            : t('None linked yet', 'Noch keine verknüpft')}
        </Text>
      </Card>
      <SectionHeader title={t('Timeline', 'Zeitachse')} />
      {item.timeline.map((event) => (
        <Text key={event.id} className="text-sm text-muted-foreground">
          {event.date} · {event.label}
        </Text>
      ))}
      <Button
        variant="outline"
        onPress={() => router.push({ pathname: '/cases/edit', params: { id: item.id } })}
      >
        <Text>{t('Edit case', 'Fall bearbeiten')}</Text>
      </Button>
    </Page>
  );
}
