import { Card } from '@/components/app/card';
import { SectionHeader } from '@/components/app/section-header';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { MockDocument } from '@/features/preview/data';
import { usePreview } from '@/features/preview/provider';
import { router } from 'expo-router';

export function DocumentSeriesSection({ document }: { document: MockDocument }) {
  const { t, documents } = usePreview();
  const related = documents.filter(
    (item) =>
      item.id !== document.id &&
      item.category === document.category &&
      item.issuer === document.issuer,
  );
  if (!related.length) return null;
  const name = `${document.issuer} ${t('Recurring documents', 'Wiederkehrende Dokumente')}`;
  return (
    <>
      <SectionHeader title={t('Series', 'Serie')} />
      <Card>
        <Text className="font-manrope-semibold text-base">{name}</Text>
        <Text className="text-muted">
          {related.length + 1} {t('documents in this series', 'Dokumente in dieser Serie')}
        </Text>
        <Button
          variant="outline"
          onPress={() =>
            router.push({
              pathname: '/document/series',
              params: { issuer: document.issuer, category: document.category },
            })
          }
        >
          <Text>{t('View all documents in series', 'Alle Dokumente der Serie anzeigen')}</Text>
        </Button>
      </Card>
    </>
  );
}
