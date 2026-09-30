import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Card } from '@/components/app/card';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { usePreview } from '@/features/preview/provider';
import { Icon, Page } from '@/features/preview/ui';
import { useFileWorkflowStore } from '@/features/files/store';
import { processDocument } from '@/features/files/processing-pipeline';
import { Field } from '@/features/preview/ui';
import { userErrorMessage } from '@meindocs/domain';

// fallow-ignore-next-line complexity
function ProcessingSummary({
  t,
  step,
  fileName,
  kind,
}: {
  t: (english: string, german: string) => string;
  step: number;
  fileName?: string;
  kind?: 'pdf' | 'image';
}) {
  const isReady = step === 4;
  const label = kind === 'image' ? t('image', 'Bild') : `2 ${t('pages', 'Seiten')}`;
  return (
    <View className="items-center gap-md py-lg">
      <View className="h-24 w-24 items-center justify-center rounded-full bg-primary-soft">
        <Icon name={isReady ? 'checkmark-done-outline' : 'document-text-outline'} size={44} />
      </View>
      <Text className="text-center font-manrope-bold text-2xl">
        {isReady
          ? t('Everything is ready.', 'Alles ist bereit.')
          : t('A little order, coming right up.', 'Gleich ist alles sortiert.')}
      </Text>
      <Text className="text-center text-muted-foreground">
        {fileName ?? 'sample-document.pdf'} · {label}
      </Text>
    </View>
  );
}

function ProcessingSteps({ steps, step }: { steps: string[]; step: number }) {
  return (
    <Card>
      {steps.map((label, index) => (
        <View key={label} className="flex-row items-center gap-md py-sm">
          <Icon name={index < step ? 'checkmark-circle' : 'ellipse-outline'} />
          <Text className="flex-1">{label}</Text>
        </View>
      ))}
    </Card>
  );
}

function ProcessingButton({
  t,
  step,
  disabled,
  onPress,
}: {
  t: (english: string, german: string) => string;
  step: number;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Button disabled={disabled} onPress={onPress}>
      <Text>
        {step === 4
          ? t('Open document', 'Dokument öffnen')
          : t('Preview next step', 'Nächsten Schritt ansehen')}
      </Text>
    </Button>
  );
}

// fallow-ignore-next-line complexity
function DraftReview({
  t,
  title,
  setTitle,
  text,
  status,
  taxSuggestion,
}: {
  t: (english: string, german: string) => string;
  title: string;
  setTitle: (value: string) => void;
  text: string;
  status: 'completed' | 'needs-review' | 'unsupported';
  taxSuggestion?: {
    taxRelevant?: boolean;
    expenseCategory?: string;
    taxYear?: number;
    netAmount?: number;
    vatAmount?: number;
    grossAmount?: number;
    vatRate?: number;
    businessUsePercent?: number;
    reviewStatus?: string;
  };
}) {
  return (
    <Card>
      <Text className="font-manrope-semibold">{t('Review the draft', 'Entwurf prüfen')}</Text>
      <Field
        label={t('Document title', 'Dokumenttitel')}
        value={title}
        onChangeText={setTitle}
        maxLength={200}
      />
      <Text className="text-sm text-muted-foreground">
        {status === 'completed'
          ? t('OCR text extracted successfully.', 'OCR-Text erfolgreich extrahiert.')
          : status === 'unsupported'
            ? t(
                'PDF text extraction needs a PDF OCR adapter; review the title and file manually.',
                'Für PDF-Textextraktion wird noch ein PDF-OCR-Adapter benötigt; Titel und Datei bitte manuell prüfen.',
              )
            : t(
                'No readable text was found. Please review the file manually.',
                'Kein lesbarer Text gefunden. Bitte die Datei manuell prüfen.',
              )}
      </Text>
      {text ? (
        <Text numberOfLines={8} className="rounded-md bg-background p-md text-sm">
          {text}
        </Text>
      ) : null}
      {taxSuggestion ? (
        <View className="gap-xs rounded-md bg-background p-md">
          <Text className="font-manrope-semibold">{t('Tax suggestion', 'Steuervorschlag')}</Text>
          <Text className="text-sm">
            {t('Relevant', 'Relevant')}:{' '}
            {taxSuggestion.taxRelevant ? t('Yes', 'Ja') : t('No', 'Nein')} ·{' '}
            {t('Category', 'Kategorie')}: {taxSuggestion.expenseCategory ?? t('Review', 'Prüfen')}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {t('Net', 'Netto')} {taxSuggestion.netAmount ?? '—'} · {t('VAT', 'USt.')}{' '}
            {taxSuggestion.vatAmount ?? '—'} · {t('Gross', 'Brutto')}{' '}
            {taxSuggestion.grossAmount ?? '—'} · {t('Business use', 'Betriebliche Nutzung')}{' '}
            {taxSuggestion.businessUsePercent ?? '—'}%
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

// fallow-ignore-next-line complexity
export default function ProcessingScreen() {
  const { t, addDocument, notify } = usePreview();
  const pending = useFileWorkflowStore((state) => state.pending);
  const draft = useFileWorkflowStore((state) => state.draft);
  const setDraft = useFileWorkflowStore((state) => state.setDraft);
  const error = useFileWorkflowStore((state) => state.error);
  const setError = useFileWorkflowStore((state) => state.setError);
  const [step, setStep] = useState(1);
  const [opened, setOpened] = useState(false);
  const [title, setTitle] = useState('');
  const steps = [
    t('Document received', 'Dokument empfangen'),
    t('Reading the pages', 'Seiten werden gelesen'),
    t('Finding the important details', 'Wichtige Angaben erkennen'),
    t('Ready for your review', 'Bereit zur Prüfung'),
  ];
  useEffect(() => {
    if (!pending || draft || error) return;
    let cancelled = false;
    void processDocument(pending)
      .then((result) => {
        if (cancelled) return;
        setDraft(result);
        setTitle(result.title);
        setStep(4);
        notify('OCR draft ready for review', 'OCR-Entwurf zur Prüfung bereit');
      })
      .catch((cause) => {
        if (!cancelled) setError(userErrorMessage(cause, 'ocr'));
      });
    return () => {
      cancelled = true;
    };
  }, [draft, error, notify, pending, setDraft, setError]);

  async function advance() {
    if (!draft) return;
    setOpened(true);
    const id = await addDocument(pending ?? undefined, { ...draft, title });
    router.replace({ pathname: '/document/[id]', params: { id } });
  }
  return (
    <Page>
      <ProcessingSummary t={t} step={step} fileName={pending?.originalName} kind={pending?.kind} />
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: step * 25 }}
        className="h-2 overflow-hidden rounded-full bg-border"
      >
        <View style={{ width: `${step * 25}%` }} className="h-2 rounded-full bg-primary" />
      </View>
      <ProcessingSteps steps={steps} step={step} />
      {error ? (
        <Card className="border-danger">
          <Text accessibilityRole="alert" className="text-danger">
            {error}
          </Text>
        </Card>
      ) : null}
      {draft ? (
        <DraftReview
          t={t}
          title={title}
          setTitle={setTitle}
          text={draft.extractedText}
          status={draft.ocrStatus}
          taxSuggestion={draft.analysis?.taxSuggestion}
        />
      ) : null}
      <ProcessingButton
        t={t}
        step={draft ? 4 : 1}
        disabled={opened || !draft}
        onPress={() => void advance()}
      />
      <Text className="text-center text-sm text-muted-foreground">
        {t(
          'The file is saved locally, OCR is extracted on-device, and you review the draft before it is indexed.',
          'Die Datei wird lokal gespeichert, OCR wird auf dem Gerät extrahiert und du prüfst den Entwurf vor der Ablage.',
        )}
      </Text>
    </Page>
  );
}
