import { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { EmptyState } from '@/components/app/empty-state';
import { usePreview } from '@/features/preview/provider';
import { Metric, Options, Page, TaskItem } from '@/features/preview/ui';
export default function TasksScreen() {
  const { t, tasks } = usePreview();
  const [filter, setFilter] = useState('open');
  const open = tasks.filter((task) => !task.done);
  const visible = tasks.filter(
    (task) => filter === 'all' || (filter === 'done' ? task.done : !task.done),
  );
  return (
    <Page
      tab
      title={t('One less thing to remember.', 'Eine Sorge weniger.')}
      subtitle={t('TASKS & REMINDERS', 'AUFGABEN & ERINNERUNGEN')}
    >
      <View className="flex-row gap-sm">
        <Metric
          icon="time-outline"
          value={String(open.length)}
          label={t('To do', 'Zu erledigen')}
        />
        <Metric
          icon="checkmark-circle-outline"
          value={String(tasks.length - open.length)}
          label={t('Completed', 'Erledigt')}
        />
      </View>
      <Button onPress={() => router.push('/create-reminder')}>
        <Text>＋ {t('Create reminder', 'Erinnerung erstellen')}</Text>
      </Button>
      <Options
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'open', label: t('Open', 'Offen') },
          { value: 'done', label: t('Completed', 'Erledigt') },
          { value: 'all', label: t('All', 'Alle') },
        ]}
      />
      {visible.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
      {!visible.length && (
        <EmptyState
          title={t('A clear list', 'Alles im Blick')}
          description={t(
            'No tasks in this view. You are all set.',
            'In dieser Ansicht gibt es keine Aufgaben.',
          )}
        />
      )}
    </Page>
  );
}
