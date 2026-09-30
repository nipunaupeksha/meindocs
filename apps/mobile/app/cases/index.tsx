import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/app/card';
import { StatusBadge } from '@/components/app/status-badge';
import { Page } from '@/features/preview/ui';
import { usePreview } from '@/features/preview/provider';

export default function CasesScreen() {
  const { cases, t } = usePreview();
  return (
    <Page
      title={t('Cases', 'Fälle')}
      subtitle={t(
        'Keep each administrative process on track.',
        'Behalte jeden Verwaltungsprozess im Blick.',
      )}
    >
      <Button onPress={() => router.push('/cases/create')}>
        <Text>＋ {t('Create case', 'Fall erstellen')}</Text>
      </Button>
      {cases.map((item) => (
        <Card key={item.id} className="gap-sm">
          <Text className="font-manrope-bold text-lg">{item.title}</Text>
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
          <Text className="text-sm text-muted-foreground">
            {item.checklist.filter((check) => check.completed).length}/{item.checklist.length}{' '}
            {t('checklist items complete', 'Checklistenpunkte erledigt')}
          </Text>
          <Button
            variant="outline"
            onPress={() => router.push({ pathname: '/cases/[id]', params: { id: item.id } })}
          >
            <Text>{t('Open case', 'Fall öffnen')}</Text>
          </Button>
        </Card>
      ))}
    </Page>
  );
}
