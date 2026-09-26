import { router } from 'expo-router';
import { Card } from '@/components/app/card';
import { Text } from '@/components/ui/text';
import { usePreview } from '@/features/preview/provider';
import { ActionTile, Icon, Page } from '@/features/preview/ui';
export default function MoreScreen() {
  const { t } = usePreview();
  return (
    <Page
      tab
      title={t('A space that is yours.', 'Dein ganz persönlicher Bereich.')}
      subtitle="MEINDOCS"
    >
      <Card className="gap-md bg-primary-soft">
        <Icon name="leaf-outline" size={32} />
        <Text className="font-manrope-bold text-xl">
          {t('Less paperwork. More life.', 'Weniger Papierkram. Mehr Leben.')}
        </Text>
        <Text>
          {t(
            'A thoughtful home for your important documents.',
            'Ein durchdachter Ort für deine wichtigen Unterlagen.',
          )}
        </Text>
      </Card>
      <ActionTile
        icon="settings-outline"
        title={t('Settings', 'Einstellungen')}
        description={t('Language, notifications and storage', 'Sprache, Mitteilungen und Speicher')}
        onPress={() => router.push('/settings')}
      />
      <ActionTile
        icon="folder-open-outline"
        title={t('Your documents', 'Deine Dokumente')}
        description={t('Everything in one place', 'Alles an einem Ort')}
        onPress={() => router.navigate('/(tabs)/documents')}
      />
    </Page>
  );
}
