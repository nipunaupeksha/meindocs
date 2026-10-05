import { useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/app/card';
import { Page } from '@/features/preview/ui';
import { usePreview } from '@/features/preview/provider';

export default function DocumentSeriesScreen() {
  const params = useLocalSearchParams<{ issuer?: string; category?: string }>();
  const { t, language, documents } = usePreview();
  const members = documents.filter(
    (item) => item.issuer === params.issuer && item.category === params.category,
  );
  return (
    <Page>
      <Text className="font-manrope-bold text-2xl">{t('Document series', 'Dokumentenserie')}</Text>
      <Text className="text-muted">{params.issuer}</Text>
      {members.map((document) => (
        <Card key={document.id}>
          <Text className="font-manrope-semibold">{document.title[language]}</Text>
          <Text className="text-muted">{document.date}</Text>
        </Card>
      ))}
      {!members.length && <Text>{t('No documents found.', 'Keine Dokumente gefunden.')}</Text>}
    </Page>
  );
}
