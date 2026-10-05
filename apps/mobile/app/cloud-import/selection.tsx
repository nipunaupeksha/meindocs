import { useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/app/card';
import { Page } from '@/features/preview/ui';
import { usePreview } from '@/features/preview/provider';
import { MockGoogleDriveImportProvider } from '@/features/cloud-import/mock-provider';
import { CloudImportService } from '@/features/cloud-import/service';
import { processDocument } from '@/features/files/processing-pipeline';

export default function CloudImportSelectionScreen() {
  const { t, notify, addDocument } = usePreview();
  const params = useLocalSearchParams<{ fileIds?: string }>();
  const service = useMemo(() => new CloudImportService(new MockGoogleDriveImportProvider()), []);
  const [importing, setImporting] = useState(false);
  const files = useMemo(() => (params.fileIds ?? '').split(',').filter(Boolean), [params.fileIds]);
  const importFiles = async () => {
    setImporting(true);
    try {
      const available = await service.searchFiles('');
      const result = await service.importSelected(
        available.filter((file) => files.includes(file.id)),
      );
      for (const item of result) await addDocument(item.file, await processDocument(item.file));
      notify(`${result.length} cloud files imported`, `${result.length} Cloud-Dateien importiert`);
      router.dismissAll();
    } catch {
      notify('Cloud import failed', 'Cloud-Import fehlgeschlagen');
    } finally {
      setImporting(false);
    }
  };
  return (
    <Page
      title={t('Confirm cloud import', 'Cloud-Import bestätigen')}
      subtitle={t(
        'Files will be downloaded, hashed, deduplicated and processed locally.',
        'Dateien werden heruntergeladen, gehasht, auf Duplikate geprüft und lokal verarbeitet.',
      )}
    >
      <Card>
        <Text>
          {files.length} {t('selected files', 'ausgewählte Dateien')}
        </Text>
      </Card>
      <Button disabled={!files.length || importing} onPress={() => void importFiles()}>
        <Text>{t('Import selected files', 'Ausgewählte Dateien importieren')}</Text>
      </Button>
      <Button variant="outline" onPress={() => router.back()}>
        <Text>{t('Cancel', 'Abbrechen')}</Text>
      </Button>
    </Page>
  );
}
