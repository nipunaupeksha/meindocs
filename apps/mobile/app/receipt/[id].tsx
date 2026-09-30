import type { MockDocument } from '@/features/preview/data';
import { RouteError } from '@/components/app/route-error';
import { router, useLocalSearchParams } from 'expo-router';
import { Card } from '@/components/app/card';
import { SectionHeader } from '@/components/app/section-header';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { StatusBadge } from '@/components/app/status-badge';
import { usePreview } from '@/features/preview/provider';
import { money, formatDate } from '@/features/preview/data';
import { PdfPreview } from '@/features/preview/pdf-preview';
import { InfoRow, Page } from '@/features/preview/ui';
import { readRouteId } from '@/lib/route-params';
export default function ReceiptDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const { t, documents } = usePreview();
  const receipt = documents.find(
    (item) => item.id === readRouteId(params.id) && item.amount !== undefined,
  );
  if (!receipt)
    return (
      <RouteError
        message={t(
          'Receipt not found in this preview.',
          'Beleg in dieser Vorschau nicht gefunden.',
        )}
      />
    );
  return <DetailContent receipt={receipt} amount={receipt.amount ?? 0} />;
}
function DetailContent({ receipt, amount }: { receipt: MockDocument; amount: number }) {
  const { t, language, updateDocument } = usePreview();
  return (
    <Page title={receipt.issuer} subtitle={receipt.title[language]}>
      <StatusBadge
        label={receipt.reviewed ? t('Reviewed', 'Geprüft') : t('Needs review', 'Zu prüfen')}
        tone={receipt.reviewed ? 'success' : 'warning'}
      />
      <PdfPreview
        title={receipt.title[language]}
        issuer={receipt.issuer}
        thumbnailUri={receipt.thumbnailUri}
        localUri={receipt.localUri}
      />
      <SectionHeader title={t('Receipt details', 'Belegdetails')} />
      <Card>
        <InfoRow label={t('Merchant', 'Händler')} value={receipt.issuer} />
        <InfoRow label={t('Date', 'Datum')} value={formatDate(receipt.date, language)} />
        <InfoRow label={t('Total', 'Gesamtbetrag')} value={money(amount, language)} />
        <InfoRow label={t('Tax year', 'Steuerjahr')} value="2026" />
        <InfoRow
          label={t('Category', 'Kategorie')}
          value={t('Work-related expense', 'Berufliche Ausgabe')}
        />
      </Card>
      <Text className="text-sm text-muted-foreground">
        {t(
          'Sample classification. Eligibility and tax treatment have not been assessed.',
          'Beispielkategorisierung. Absetzbarkeit und steuerliche Behandlung wurden nicht geprüft.',
        )}
      </Text>
      <Button onPress={() => updateDocument(receipt.id, { reviewed: !receipt.reviewed })}>
        <Text>
          {receipt.reviewed
            ? t('Mark as needing review', 'Als ungeprüft markieren')
            : t('Confirm receipt details', 'Belegangaben bestätigen')}
        </Text>
      </Button>
      <Button
        variant="outline"
        onPress={() => router.push({ pathname: '/document/[id]', params: { id: receipt.id } })}
      >
        <Text>{t('Open document details', 'Dokumentdetails öffnen')}</Text>
      </Button>
    </Page>
  );
}
