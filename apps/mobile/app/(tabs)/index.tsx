import { router } from 'expo-router';
import { View } from 'react-native';
import { Card } from '@/components/app/card';
import { SectionHeader } from '@/components/app/section-header';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { usePreview } from '@/features/preview/provider';
import { DocumentItem, Icon, Metric, Page, TaskItem } from '@/features/preview/ui';
import { EmptyState } from '@/components/app/empty-state';
import { StatusBadge } from '@/components/app/status-badge';
export default function HomeScreen() {
  const { t, documents, dashboard, tasks } = usePreview();
  const recentDocuments = dashboard
    .getRecentDocuments()
    .map((item) => documents.find((document) => document.id === item.id))
    .filter((item): item is (typeof documents)[number] => Boolean(item));
  const attention = dashboard.getNeedsAttention();
  const upcoming = dashboard.getUpcomingDeadlines();
  const activeCases = dashboard.getActiveCases();
  return (
    <Page
      tab
      title={t('A little more peace of mind.', 'Ein bisschen mehr Überblick.')}
      subtitle={t(
        `YOUR MEINDOCS · ${new Date().toLocaleDateString('en-GB')}`,
        `DEINE MEINDOCS · ${new Date().toLocaleDateString('de-DE')}`,
      )}
    >
      <Card className="gap-md border-primary bg-primary p-lg">
        <Icon name="shield-checkmark-outline" color="#D9B77E" size={32} />
        <Text className="font-manrope-bold text-2xl text-white">
          {t(
            'Your paperwork.\nA place for everything.',
            'Deine Unterlagen.\nAlles an seinem Platz.',
          )}
        </Text>
        <Text className="text-sm text-white/80">
          {t(
            'Keep the important things close. Start with a scan or a PDF.',
            'Das Wichtige immer griffbereit. Starte mit einem Scan oder einer PDF.',
          )}
        </Text>
        <Button variant="secondary" onPress={() => router.push('/add-document')}>
          <Text>＋ {t('Add a document', 'Dokument hinzufügen')}</Text>
        </Button>
      </Card>
      <View className="flex-row gap-sm">
        <Metric
          icon="documents-outline"
          value={String(documents.length)}
          label={t('Documents', 'Dokumente')}
        />
        <Metric
          icon="checkbox-outline"
          value={String(upcoming.length)}
          label={t('Open tasks', 'Offene Aufgaben')}
        />
      </View>
      <SectionHeader
        title={t('Needs attention', 'Aufmerksamkeit nötig')}
        action={{
          label: t('All tasks', 'Alle Aufgaben'),
          onPress: () => router.navigate('/(tabs)/tasks'),
        }}
      />
      {attention.slice(0, 5).map((item) => (
        <Card key={`${item.kind}-${item.id}`} className="flex-row items-center gap-sm">
          <StatusBadge
            label={
              item.kind === 'overdue'
                ? t('Overdue', 'Überfällig')
                : item.kind === 'due_soon'
                  ? t('Due soon', 'Bald fällig')
                  : item.kind === 'expiry'
                    ? t('Expiring', 'Läuft ab')
                    : t('Review', 'Prüfen')
            }
            tone={
              item.kind === 'overdue' ? 'danger' : item.kind === 'review' ? 'warning' : 'neutral'
            }
          />
          <View className="min-w-0 flex-1">
            <Text className="font-manrope-medium">{item.title}</Text>
            {item.date ? <Text className="text-xs text-muted-foreground">{item.date}</Text> : null}
          </View>
        </Card>
      ))}
      {!attention.length && (
        <EmptyState
          title={t('Nothing needs attention', 'Nichts braucht Aufmerksamkeit')}
          description={t(
            'Your tasks, documents, and deadlines are up to date.',
            'Deine Aufgaben, Dokumente und Fristen sind aktuell.',
          )}
        />
      )}
      <SectionHeader title={t('Upcoming · next 30 days', 'Demnächst · nächste 30 Tage')} />
      {upcoming.slice(0, 3).map((task) => {
        const source = tasks.find((item) => item.id === task.id);
        return source ? <TaskItem key={task.id} task={source} /> : null;
      })}
      {!upcoming.length && (
        <Text className="text-muted-foreground">
          {t('No deadlines in the next 30 days.', 'Keine Fristen in den nächsten 30 Tagen.')}
        </Text>
      )}
      <SectionHeader
        title={t('Recently added', 'Zuletzt hinzugefügt')}
        action={{
          label: t('View all', 'Alle ansehen'),
          onPress: () => router.navigate('/(tabs)/documents'),
        }}
      />
      {recentDocuments.slice(0, 3).map((document) => (
        <DocumentItem key={document.id} document={document} />
      ))}
      {!recentDocuments.length && (
        <EmptyState
          title={t('No documents yet', 'Noch keine Dokumente')}
          description={t(
            'Import a PDF or take a photo to get started.',
            'Importiere eine PDF oder mache ein Foto zum Start.',
          )}
          action={{
            label: t('Add document', 'Dokument hinzufügen'),
            onPress: () => router.push('/add-document'),
          }}
        />
      )}
      <SectionHeader
        title={t('Tax', 'Steuern')}
        action={{
          label: t('Open tax', 'Steuern öffnen'),
          onPress: () => router.navigate('/(tabs)/tax'),
        }}
      />
      <Card>
        <Text className="font-manrope-bold text-xl">{dashboard.getTaxSummary().year}</Text>
        <Text>
          {dashboard.getTaxSummary().unreviewedReceipts}{' '}
          {t('unreviewed receipts', 'ungeprüfte Belege')}
        </Text>
        <Text className="text-sm text-muted-foreground">
          €{dashboard.getTaxSummary().trackedBusinessExpenses.toFixed(2)}{' '}
          {t('tracked business expenses', 'erfasste Betriebsausgaben')}
        </Text>
      </Card>
      <SectionHeader
        title={t('Active cases', 'Aktive Fälle')}
        action={{ label: t('View cases', 'Fälle öffnen'), onPress: () => router.push('/cases') }}
      />
      {activeCases.map((item) => (
        <Card key={item.id}>
          <View className="flex-row items-center justify-between">
            <Text className="font-manrope-medium">{item.title}</Text>
            <Text className="text-sm text-muted-foreground">{item.progress}%</Text>
          </View>
        </Card>
      ))}
      {!activeCases.length && (
        <Text className="text-muted-foreground">
          {t('No active cases.', 'Keine aktiven Fälle.')}
        </Text>
      )}
    </Page>
  );
}
