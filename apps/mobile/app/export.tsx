import { useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/app/card';
import { Options, Page } from '@/features/preview/ui';
import { usePreview } from '@/features/preview/provider';
import {
  cleanupExport,
  createDocumentExport,
  createTaxExport,
  previewTaxExport,
  shareExport,
} from '@/features/export/service';
import type { ExportDocument, TaxExportCategory } from '@meindocs/domain';
import { userErrorMessage } from '@meindocs/domain';

function toExportDocument(
  document: ReturnType<typeof usePreview>['documents'][number],
): ExportDocument {
  return {
    id: document.id,
    title: document.title.en,
    date: document.date,
    vendor: document.issuer,
    category: document.tax?.expenseCategory ?? document.category,
    description: document.summary,
    net: document.tax?.netAmount,
    vat: document.tax?.vatAmount,
    gross: document.tax?.grossAmount ?? document.amount,
    businessUsagePercent: document.tax?.businessUsePercent,
    deductibleAmount: document.tax?.grossAmount ?? document.amount,
    sourceFileName: document.id,
    sourceUri: document.localUri,
    taxYear: document.tax?.taxYear ?? Number(document.date.slice(0, 4)),
    reviewed: document.reviewed,
    taxRelevant: document.tax?.taxRelevant ?? document.amount !== undefined,
  };
}

export default function ExportScreen() {
  const { documents, t, notify } = usePreview();
  const params = useLocalSearchParams<{ mode?: string; documentId?: string }>();
  const isTax = params.mode === 'tax' || !params.documentId;
  const [year, setYear] = useState('2026');
  const [reviewedOnly, setReviewedOnly] = useState(false);
  const [category, setCategory] = useState<TaxExportCategory | 'all'>('all');
  const [result, setResult] = useState<{ uri: string }>();
  const exportDocuments = useMemo(() => documents.map(toExportDocument), [documents]);
  const selected = params.documentId
    ? exportDocuments.filter((item) => item.id === params.documentId)
    : exportDocuments;
  const preview = isTax
    ? previewTaxExport(exportDocuments, {
        year: Number(year),
        reviewedOnly,
        categories: category === 'all' ? undefined : [category],
      })
    : undefined;
  const generate = async () => {
    try {
      const created = isTax
        ? await createTaxExport(exportDocuments, {
            year: Number(year),
            reviewedOnly,
            categories: category === 'all' ? undefined : [category],
          })
        : await createDocumentExport(selected[0]);
      setResult(created);
      notify('Export created', 'The archive is ready to share.');
    } catch (error) {
      notify('Export failed', userErrorMessage(error, 'filesystem'));
    }
  };
  return (
    <Page
      title={t('Export', 'Exportieren')}
      subtitle={isTax ? t('TAX PACKAGE', 'STEUERPAKET') : t('DOCUMENT', 'DOKUMENT')}
    >
      {isTax ? (
        <>
          <Options
            value={year}
            onChange={setYear}
            options={[
              { value: '2026', label: '2026' },
              { value: '2025', label: '2025' },
            ]}
          />
          <Options
            value={category}
            onChange={setCategory}
            options={[
              { value: 'all', label: t('All categories', 'Alle Kategorien') },
              { value: 'business-expenses', label: t('Business expenses', 'Betriebsausgaben') },
              { value: 'travel', label: t('Travel', 'Reisen') },
              { value: 'home-office', label: t('Home office', 'Homeoffice') },
              { value: 'insurance', label: t('Insurance', 'Versicherung') },
            ]}
          />
          <Pressable onPress={() => setReviewedOnly((value) => !value)}>
            <Card>
              <Text>
                {reviewedOnly ? '✓ ' : ''}
                {t('Reviewed documents only', 'Nur geprüfte Dokumente')}
              </Text>
            </Card>
          </Pressable>
          <Card>
            <Text className="font-manrope-semibold">
              {preview?.documents.length ?? 0} {t('documents', 'Dokumente')}
            </Text>
            <Text>
              {t('Deductible', 'Absetzbar')}: {(preview?.totals.deductible ?? 0).toFixed(2)} €
            </Text>
            <Text className="text-sm text-muted-foreground">
              Tax-{year}/ with CSV, PDF index and source files
            </Text>
          </Card>
        </>
      ) : (
        <Card>
          <Text className="font-manrope-semibold">
            {selected[0]?.title ?? t('Document unavailable', 'Dokument nicht verfügbar')}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {t(
              'The original vault file is copied into a temporary archive.',
              'Die Originaldatei wird in ein temporäres Archiv kopiert.',
            )}
          </Text>
        </Card>
      )}
      {result ? (
        <Button
          onPress={async () => {
            await shareExport(result.uri);
            cleanupExport(result.uri);
          }}
        >
          <Text>{t('Share archive', 'Archiv teilen')}</Text>
        </Button>
      ) : (
        <Button onPress={generate} disabled={isTax ? !preview?.documents.length : !selected.length}>
          <Text>{t('Generate export', 'Export erstellen')}</Text>
        </Button>
      )}
      <Button variant="outline" onPress={() => router.back()}>
        <Text>{t('Close', 'Schließen')}</Text>
      </Button>
    </Page>
  );
}
