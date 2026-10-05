import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Card } from '@/components/app/card';
import { EmptyState } from '@/components/app/empty-state';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Page } from '@/features/preview/ui';
import { usePreview } from '@/features/preview/provider';
import { MockEmailImportProvider } from '@/features/email-import/mock-provider';
import { EmailImportService } from '@/features/email-import/service';
import type { EmailImportCandidate } from '@/features/email-import/types';
import { processDocument } from '@/features/files/processing-pipeline';

export default function EmailImportScreen() {
  const { t, notify, addDocument } = usePreview();
  const service = useMemo(() => new EmailImportService(new MockEmailImportProvider()), []);
  const [candidates, setCandidates] = useState<EmailImportCandidate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  useEffect(() => {
    void service
      .listCandidates()
      .then(setCandidates)
      .finally(() => setLoading(false));
  }, [service]);
  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const importSelected = async () => {
    setImporting(true);
    try {
      const result = await service.importSelected(
        candidates.filter((item) => selected.has(item.id)),
      );
      for (const item of result) {
        const draft = await processDocument(item.file);
        await addDocument(item.file, draft);
      }
      notify(
        `${result.length} email attachments imported`,
        `${result.length} E-Mail-Anhänge importiert`,
      );
      router.back();
    } catch (error) {
      notify(
        error instanceof Error ? error.message : 'Email import failed',
        'E-Mail-Import fehlgeschlagen',
      );
    } finally {
      setImporting(false);
    }
  };
  return (
    <Page
      title={t('Import from email', 'Aus E-Mail importieren')}
      subtitle={t(
        'Select attachments explicitly. Mail bodies stay outside MeinDocs.',
        'Wähle Anhänge ausdrücklich aus. E-Mail-Inhalte bleiben außerhalb von MeinDocs.',
      )}
    >
      {loading && <ActivityIndicator />}
      {!loading && !candidates.length && (
        <EmptyState
          title={t('No supported attachments', 'Keine unterstützten Anhänge')}
          description={t(
            'Only PDF, JPEG, PNG and HEIC attachments are shown.',
            'Es werden nur PDF-, JPEG-, PNG- und HEIC-Anhänge angezeigt.',
          )}
        />
      )}
      {candidates.map((candidate) => (
        <Pressable key={candidate.id} onPress={() => toggle(candidate.id)}>
          <Card
            className={selected.has(candidate.id) ? 'border-primary bg-primary-soft' : undefined}
          >
            <View className="flex-row items-center gap-sm">
              <Text className="text-xl">{selected.has(candidate.id) ? '✓' : '○'}</Text>
              <View className="flex-1">
                <Text className="font-manrope-semibold">{candidate.filename}</Text>
                <Text className="text-sm text-muted-foreground">
                  {candidate.sender} · {candidate.subject}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {new Date(candidate.receivedAt).toLocaleDateString()} ·{' '}
                  {Math.round(candidate.size / 1024)} KB
                </Text>
              </View>
            </View>
          </Card>
        </Pressable>
      ))}
      <Button disabled={!selected.size || importing} onPress={() => void importSelected()}>
        <Text>
          {importing
            ? t('Importing and processing…', 'Wird importiert und verarbeitet…')
            : `${t('Import selected', 'Auswahl importieren')} (${selected.size})`}
        </Text>
      </Button>
      <Button variant="outline" onPress={() => router.back()}>
        <Text>{t('Cancel', 'Abbrechen')}</Text>
      </Button>
    </Page>
  );
}
