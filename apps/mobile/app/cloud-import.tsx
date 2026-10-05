import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Card } from '@/components/app/card';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Field, Page } from '@/features/preview/ui';
import { usePreview } from '@/features/preview/provider';
import { MockGoogleDriveImportProvider } from '@/features/cloud-import/mock-provider';
import { CloudImportService } from '@/features/cloud-import/service';
import type { CloudFile } from '@/features/cloud-import/types';

export default function CloudImportScreen() {
  const { t } = usePreview();
  const service = useMemo(() => new CloudImportService(new MockGoogleDriveImportProvider()), []);
  const [query, setQuery] = useState('');
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [folders, setFolders] = useState<CloudFile[]>([]);
  useEffect(() => {
    void service.browseFolders().then(setFolders);
  }, [service]);
  const browse = async () =>
    setFiles(
      query
        ? await service.searchFiles(query)
        : await service.listSupportedDocuments('drive-folder-tax'),
    );
  return (
    <Page
      title={t('Import from Google Drive', 'Aus Google Drive importieren')}
      subtitle={t(
        'Choose files from your Drive. Source files are never changed.',
        'Wähle Dateien aus deinem Drive. Quelldateien werden nie verändert.',
      )}
    >
      <Field
        label={t('Search files', 'Dateien suchen')}
        value={query}
        onChangeText={setQuery}
        placeholder="invoice"
      />
      <Button onPress={() => void browse()}>
        <Text>{t('Browse Drive', 'Drive durchsuchen')}</Text>
      </Button>
      {folders.map((folder) => (
        <Button
          key={folder.id}
          variant="ghost"
          onPress={() => void service.listSupportedDocuments(folder.id).then(setFiles)}
        >
          <Text>📁 {folder.name}</Text>
        </Button>
      ))}
      {files.map((file) => (
        <Pressable
          key={file.id}
          onPress={() =>
            setSelectedIds((current) => {
              const next = new Set(current);
              next.has(file.id) ? next.delete(file.id) : next.add(file.id);
              return next;
            })
          }
        >
          <Card className={selectedIds.has(file.id) ? 'border-primary bg-primary-soft' : undefined}>
            <View className="flex-row items-center gap-sm">
              <Text className="text-xl">{selectedIds.has(file.id) ? '✓' : '☁'}</Text>
              <View>
                <Text className="font-manrope-semibold">{file.name}</Text>
                <Text className="text-xs text-muted-foreground">
                  {Math.round(file.size / 1024)} KB ·{' '}
                  {new Date(file.modifiedAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </Card>
        </Pressable>
      ))}
      <Button
        disabled={!selectedIds.size}
        onPress={() =>
          router.push({
            pathname: '/cloud-import/selection',
            params: { fileIds: [...selectedIds].join(',') },
          })
        }
      >
        <Text>
          {t('Review selected files', 'Ausgewählte Dateien prüfen')} ({selectedIds.size})
        </Text>
      </Button>
      <Button variant="outline" onPress={() => router.back()}>
        <Text>{t('Cancel', 'Abbrechen')}</Text>
      </Button>
    </Page>
  );
}
