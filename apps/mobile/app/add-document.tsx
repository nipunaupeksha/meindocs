import { useState } from 'react';
import { router } from 'expo-router';
import { Card } from '@/components/app/card';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { usePreview } from '@/features/preview/provider';
import { storageNames } from '@/features/preview/data';
import { ActionTile, Icon, InfoRow, Page } from '@/features/preview/ui';
export default function AddDocumentScreen() {
  const { t, settings, folders, notify } = usePreview();
  const [source, setSource] = useState<string | null>(null);
  const select = (value: string) => {
    setSource(value);
    notify('Sample document selected', 'Beispieldokument ausgewählt');
  };
  return (
    <Page
      title={t('Make room for less paperwork.', 'Weniger Papier. Mehr Ordnung.')}
      subtitle={t(
        'Choose how to add your next document.',
        'Wie möchtest du dein Dokument hinzufügen?',
      )}
    >
      <ActionTile
        icon="scan-outline"
        title={t('Scan with camera', 'Mit Kamera scannen')}
        description={t('A crisp scan, one page at a time', 'Seite für Seite sauber erfassen')}
        onPress={() => select(t('Camera scan', 'Kamera-Scan'))}
      />
      <ActionTile
        icon="document-attach-outline"
        title={t('Import a PDF', 'PDF importieren')}
        description={t('Pick from files on your device', 'Aus deinen lokalen Dateien auswählen')}
        onPress={() => select(t('PDF file', 'PDF-Datei'))}
      />
      <ActionTile
        icon="cloud-download-outline"
        title={t('From your cloud drive', 'Aus deinem Cloud-Speicher')}
        description="iCloud · Google Drive · OneDrive"
        onPress={() => select(t('Cloud file', 'Cloud-Datei'))}
      />
      <Card>
        <Icon name="folder-open-outline" />
        <InfoRow
          label={t('Destination', 'Speicherort')}
          value={
            settings.storage === 'local'
              ? t('On this device', 'Auf diesem Gerät')
              : storageNames[settings.storage]
          }
        />
        <Text className="text-sm text-muted-foreground">{folders[settings.storage]}</Text>
        <Button variant="ghost" onPress={() => router.push('/settings')}>
          <Text>{t('Change storage settings', 'Speichereinstellungen ändern')}</Text>
        </Button>
      </Card>
      {source && (
        <Card className="bg-primary-soft">
          <Text className="font-manrope-semibold">
            {t('Ready to add', 'Bereit zum Hinzufügen')}
          </Text>
          <Text>
            {source} · sample-document.pdf · 2 {t('pages', 'Seiten')}
          </Text>
        </Card>
      )}
      <Button disabled={!source} onPress={() => router.replace('/processing')}>
        <Text>{t('Continue with sample', 'Mit Beispiel fortfahren')}</Text>
      </Button>
      <Text className="text-sm text-muted-foreground">
        {t(
          'Preview only. Camera, file and cloud pickers are simulated; no files are accessed.',
          'Nur Vorschau. Kamera, Datei- und Cloud-Auswahl sind simuliert; es werden keine Dateien geöffnet.',
        )}
      </Text>
    </Page>
  );
}
