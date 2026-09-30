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
        icon="folder-outline"
        title={t('Cases', 'Fälle')}
        description={t('Administrative processes and deadlines', 'Verfahren und Fristen')}
        onPress={() => router.push('/cases')}
      />
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
      <ActionTile
        icon="create-outline"
        title={t('Generate document', 'Dokument erstellen')}
        description={t('Letters and requests from templates', 'Briefe und Anträge aus Vorlagen')}
        onPress={() => router.push('/generate-document')}
      />
      <ActionTile
        icon="people-outline"
        title={t('People', 'Personen')}
        description={t('People connected to your documents', 'Personen in deinen Dokumenten')}
        onPress={() => router.push('/people')}
      />
      <ActionTile
        icon="business-outline"
        title={t('Organisations', 'Organisationen')}
        description={t('Authorities, companies and providers', 'Behörden, Firmen und Anbieter')}
        onPress={() => router.push('/organisations')}
      />
    </Page>
  );
}
