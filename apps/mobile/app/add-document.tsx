import { useState } from 'react';
import { router } from 'expo-router';
import { Card } from '@/components/app/card';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { usePreview } from '@/features/preview/provider';
import { storageNames } from '@/features/preview/data';
import { ActionTile, Icon, InfoRow, Page } from '@/features/preview/ui';
import { importImage, importPdf, takePhoto } from '@/features/files/pickers';
import type { LocalFileRecord } from '@/features/files/local-file-service';
import { useFileWorkflowStore } from '@/features/files/store';

type Translator = (english: string, german: string) => string;
const pickers = { camera: takePhoto, image: importImage, pdf: importPdf };

function ImportActions({
  t,
  onSelect,
  onCloud,
}: {
  t: Translator;
  onSelect: (kind: keyof typeof pickers) => void;
  onCloud: () => void;
}) {
  return (
    <>
      <ActionTile
        icon="scan-outline"
        title={t('Scan with camera', 'Mit Kamera scannen')}
        description={t('A crisp scan, one page at a time', 'Seite für Seite sauber erfassen')}
        onPress={() => onSelect('camera')}
      />
      <ActionTile
        icon="image-outline"
        title={t('Import an image', 'Bild importieren')}
        description={t('Choose a photo from your library', 'Ein Foto aus deiner Mediathek wählen')}
        onPress={() => onSelect('image')}
      />
      <ActionTile
        icon="document-attach-outline"
        title={t('Import a PDF', 'PDF importieren')}
        description={t('Pick from files on your device', 'Aus deinen lokalen Dateien auswählen')}
        onPress={() => onSelect('pdf')}
      />
      <ActionTile
        icon="cloud-download-outline"
        title={t('From your cloud drive', 'Aus deinem Cloud-Speicher')}
        description="iCloud · Google Drive · OneDrive"
        onPress={onCloud}
      />
    </>
  );
}

function FileResult({
  t,
  source,
  pending,
  error,
}: {
  t: Translator;
  source: string | null;
  pending: LocalFileRecord | null;
  error: string | null;
}) {
  return (
    <>
      <ImportError error={error} />
      <SelectedFile t={t} source={source} pending={pending} />
    </>
  );
}

function ImportError({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <Card className="border-danger bg-surface">
      <Text accessibilityRole="alert" className="text-danger">
        {error}
      </Text>
    </Card>
  );
}

// fallow-ignore-next-line complexity
function SelectedFile({
  t,
  source,
  pending,
}: {
  t: Translator;
  source: string | null;
  pending: LocalFileRecord | null;
}) {
  if (!source || !pending) return null;
  return (
    <Card className="bg-primary-soft">
      <Text className="font-manrope-semibold">{t('Ready to add', 'Bereit zum Hinzufügen')}</Text>
      <Text>
        {source} · {pending.kind === 'pdf' ? 'PDF' : t('Image', 'Bild')} ·{' '}
        {pending.sha256.slice(0, 12)}…
      </Text>
      {pending.isDuplicate && (
        <Text className="text-sm text-warning">{t('Duplicate file', 'Doppelte Datei')}</Text>
      )}
    </Card>
  );
}

export default function AddDocumentScreen() {
  const { t, settings, folders, notify } = usePreview();
  const [source, setSource] = useState<string | null>(null);
  const { pending, isBusy, error, setBusy, setError, setPending } = useFileWorkflowStore();
  async function handleFile(kind: keyof typeof pickers) {
    const file = await pickers[kind]();
    if (!file) return;
    setPending(file);
    setSource(file.originalName);
    notify(
      file.isDuplicate ? 'Duplicate detected · using existing file' : 'File imported locally',
      file.isDuplicate
        ? 'Duplikat erkannt · vorhandene Datei wird verwendet'
        : 'Datei lokal importiert',
    );
  }
  async function selectFile(kind: keyof typeof pickers) {
    setBusy(true);
    setError(null);
    try {
      await handleFile(kind);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The file could not be imported.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page
      title={t('Make room for less paperwork.', 'Weniger Papier. Mehr Ordnung.')}
      subtitle={t(
        'Choose how to add your next document.',
        'Wie möchtest du dein Dokument hinzufügen?',
      )}
    >
      <ImportActions
        t={t}
        onSelect={(kind) => void selectFile(kind)}
        onCloud={() => notify('Cloud import is coming next', 'Cloud-Import folgt als Nächstes')}
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
      <FileResult t={t} source={source} pending={pending} error={error} />
      <Button disabled={!source || isBusy} onPress={() => router.replace('/processing')}>
        <Text>
          {isBusy
            ? t('Importing…', 'Wird importiert…')
            : t('Continue with file', 'Mit Datei fortfahren')}
        </Text>
      </Button>
      <Text className="text-sm text-muted-foreground">
        {t(
          'Files are copied into MeinDocs storage. The database stores metadata and hashes, never file bytes.',
          'Dateien werden in den MeinDocs-Speicher kopiert. Die Datenbank speichert Metadaten und Hashes, niemals Dateiinhalte.',
        )}
      </Text>
    </Page>
  );
}
