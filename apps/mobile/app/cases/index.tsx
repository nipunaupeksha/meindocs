import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/app/card';
import { StatusBadge } from '@/components/app/status-badge';
import { Page } from '@/features/preview/ui';
import { usePreview } from '@/features/preview/provider';
import { Icon } from '@/features/preview/ui';

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
      <Button variant="outline" className="gap-sm rounded-full border-primary bg-transparent px-md" onPress={() => router.push('/cases/create')}>
        <Icon name="add-outline" size={14} color="#174A45" />
        <Text className="text-sm text-primary">{t('Create case', 'Fall erstellen')}</Text>
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
            className="gap-sm rounded-full border-primary bg-transparent px-md"
            onPress={() => router.push({ pathname: '/cases/[id]', params: { id: item.id } })}
          >
            <Icon name="open-outline" size={14} color="#174A45" />
            <Text className="text-sm text-primary">{t('Open case', 'Fall öffnen')}</Text>
          </Button>
        </Card>
      ))}
    </Page>
  );
}
