import { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Card } from '@/components/app/card';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { usePreview } from '@/features/preview/provider';
import { Icon, Page } from '@/features/preview/ui';
export default function ProcessingScreen() {
  const { t, addDocument, notify } = usePreview();
  const [step, setStep] = useState(1);
  const [opened, setOpened] = useState(false);
  const steps = [
    t('Document received', 'Dokument empfangen'),
    t('Reading the pages', 'Seiten werden gelesen'),
    t('Finding the important details', 'Wichtige Angaben erkennen'),
    t('Ready for your review', 'Bereit zur Prüfung'),
  ];
  async function advance() {
    if (step < steps.length) {
      setStep(step + 1);
      notify('Preview step completed', 'Vorschau-Schritt abgeschlossen');
      return;
    }
    setOpened(true);
    const id = await addDocument();
    router.replace({ pathname: '/document/[id]', params: { id } });
  }
  return (
    <Page>
      <View className="items-center gap-md py-lg">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-primary-soft">
          <Icon name={step === 4 ? 'checkmark-done-outline' : 'document-text-outline'} size={44} />
        </View>
        <Text className="text-center font-manrope-bold text-2xl">
          {step === 4
            ? t('Everything is ready.', 'Alles ist bereit.')
            : t('A little order, coming right up.', 'Gleich ist alles sortiert.')}
        </Text>
        <Text className="text-center text-muted-foreground">
          sample-document.pdf · 2 {t('pages', 'Seiten')}
        </Text>
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: step * 25 }}
        className="h-2 overflow-hidden rounded-full bg-border"
      >
        <View style={{ width: `${step * 25}%` }} className="h-2 rounded-full bg-primary" />
      </View>
      <Card>
        {steps.map((label, index) => (
          <View key={label} className="flex-row items-center gap-md py-sm">
            <Icon name={index < step ? 'checkmark-circle' : 'ellipse-outline'} />
            <Text className="flex-1">{label}</Text>
          </View>
        ))}
      </Card>
      <Button disabled={opened} onPress={advance}>
        <Text>
          {step === 4
            ? t('Open document', 'Dokument öffnen')
            : t('Preview next step', 'Nächsten Schritt ansehen')}
        </Text>
      </Button>
      <Text className="text-center text-sm text-muted-foreground">
        {t(
          'Simulated progress. No OCR or AI analysis takes place.',
          'Simulierter Ablauf. Es findet keine OCR- oder KI-Analyse statt.',
        )}
      </Text>
    </Page>
  );
}
