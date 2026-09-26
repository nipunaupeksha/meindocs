import { router } from 'expo-router';
import { View } from 'react-native';
import { Card } from '@/components/app/card';
import { SectionHeader } from '@/components/app/section-header';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { usePreview } from '@/features/preview/provider';
import { DocumentItem, Icon, Metric, Page, TaskItem } from '@/features/preview/ui';
export default function HomeScreen() {
  const { t, documents, tasks } = usePreview();
  const open = tasks.filter((task) => !task.done);
  return (
    <Page
      tab
      title={t('A little more peace of mind.', 'Ein bisschen mehr Überblick.')}
      subtitle={t(
        'YOUR MEINDOCS · TUESDAY, 22 SEPTEMBER',
        'DEINE MEINDOCS · DIENSTAG, 22. SEPTEMBER',
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
          value={String(open.length)}
          label={t('Open tasks', 'Offene Aufgaben')}
        />
      </View>
      <SectionHeader
        title={t('Coming up', 'Demnächst')}
        action={{
          label: t('All tasks', 'Alle Aufgaben'),
          onPress: () => router.navigate('/(tabs)/tasks'),
        }}
      />
      {open.slice(0, 1).map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
      {!open.length && (
        <Text className="text-muted-foreground">
          {t(
            'All caught up. Enjoy the clear headspace.',
            'Alles erledigt. Genieße den freien Kopf.',
          )}
        </Text>
      )}
      <SectionHeader
        title={t('Recently added', 'Zuletzt hinzugefügt')}
        action={{
          label: t('View all', 'Alle ansehen'),
          onPress: () => router.navigate('/(tabs)/documents'),
        }}
      />
      {documents.slice(0, 3).map((document) => (
        <DocumentItem key={document.id} document={document} />
      ))}
    </Page>
  );
}
