import type { MockDocument } from '@/features/preview/data';
import { RouteError } from '@/components/app/route-error';
import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Card } from '@/components/app/card';
import { SectionHeader } from '@/components/app/section-header';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { StatusBadge } from '@/components/app/status-badge';
import { usePreview } from '@/features/preview/provider';
import { categories, formatDate, type Category } from '@/features/preview/data';
import { PdfPreview } from '@/features/preview/pdf-preview';
import { InfoRow, Options, Page } from '@/features/preview/ui';
import { readRouteId } from '@/lib/route-params';
export default function DocumentDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const { t, documents } = usePreview();
  const document = documents.find((item) => item.id === readRouteId(params.id));
  if (!document)
    return (
      <RouteError
        message={t(
          'Document not found in this preview.',
          'Dokument in dieser Vorschau nicht gefunden.',
        )}
      />
    );
  return <DetailContent document={document} />;
}
function DetailContent({ document }: { document: MockDocument }) {
  const { t, language, updateDocument } = usePreview();
  return (
    <Page>
      <View className="gap-sm">
        <Text className="font-manrope-bold text-2xl">{document.title[language]}</Text>
        <StatusBadge
          label={
            document.reviewed ? t('Reviewed', 'Geprüft') : t('Needs review', 'Prüfung ausstehend')
          }
          tone={document.reviewed ? 'success' : 'warning'}
        />
      </View>
      <PdfPreview
        title={document.title[language]}
        issuer={document.issuer}
        thumbnailUri={document.thumbnailUri}
        localUri={document.localUri}
      />
      <SectionHeader title={t('At a glance', 'Auf einen Blick')} />
      <Card>
        <InfoRow label={t('Sender', 'Absender')} value={document.issuer} />
        <InfoRow label={t('Added', 'Hinzugefügt')} value={formatDate(document.date, language)} />
        <InfoRow
          label={t('File', 'Datei')}
          value={`PDF · ${document.pages} ${t('pages', 'Seiten')} · ${document.size}`}
        />
      </Card>
      <SectionHeader title={t('Category', 'Kategorie')} />
      <Options
        value={document.category}
        options={Object.entries(categories).map(([value, label]) => ({
          value: value as Category,
          label: label[language],
        }))}
        onChange={(category) => updateDocument(document.id, { category })}
      />
      <Button onPress={() => updateDocument(document.id, { reviewed: !document.reviewed })}>
        <Text>
          {document.reviewed
            ? t('Mark as needing review', 'Als ungeprüft markieren')
            : t('Mark as reviewed', 'Als geprüft markieren')}
        </Text>
      </Button>
      <FavoriteButton document={document} />
      <Button
        variant="secondary"
        onPress={() =>
          router.push({ pathname: '/create-reminder', params: { documentId: document.id } })
        }
      >
        <Text>{t('Create a reminder', 'Erinnerung erstellen')}</Text>
      </Button>
      <Button
        variant="outline"
        onPress={() =>
          router.push({ pathname: '/generate-document', params: { documentId: document.id } })
        }
      >
        <Text>{t('Generate a formal document', 'Formelles Dokument erstellen')}</Text>
      </Button>
      <Button
        variant="outline"
        onPress={() => router.push({ pathname: '/export', params: { documentId: document.id } })}
      >
        <Text>{t('Export and share', 'Exportieren und teilen')}</Text>
      </Button>
    </Page>
  );
}

function FavoriteButton({ document }: { document: MockDocument }) {
  const { t, updateDocument } = usePreview();
  return (
    <Button
      variant="outline"
      onPress={() => updateDocument(document.id, { favorite: !document.favorite })}
    >
      <Text>
        {document.favorite
          ? t('Remove from favorites', 'Aus Favoriten entfernen')
          : t('Add to favorites', 'Zu Favoriten hinzufügen')}
      </Text>
    </Button>
  );
}
