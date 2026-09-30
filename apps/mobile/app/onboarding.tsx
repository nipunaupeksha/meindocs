import { useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/app/card';
import { Icon, Options, Page } from '@/features/preview/ui';
import { useSecurity } from '@/features/security/provider';
import { authenticateDevice } from '@/features/security/native';
import { requestReminderPermissions } from '@/features/reminders/notifications';
import { colors } from '@meindocs/ui';

const artwork = [
  { icon: 'documents-outline' as const, accent: colors.primary },
  { icon: 'shield-checkmark-outline' as const, accent: colors.success },
  { icon: 'language-outline' as const, accent: colors.accent },
  { icon: 'finger-print-outline' as const, accent: colors.primary },
  { icon: 'notifications-outline' as const, accent: colors.warning },
  { icon: 'cloud-done-outline' as const, accent: colors.info },
];

function OnboardingArtwork({ step }: { step: number }) {
  const current = artwork[step] ?? artwork[0];
  return (
    <View className="h-56 overflow-hidden rounded-2xl bg-primary-soft p-lg">
      <View className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/60" />
      <View className="absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-accent/20" />
      <View className="flex-1 flex-row items-center justify-between">
        <View className="h-24 w-24 items-center justify-center rounded-2xl bg-surface shadow-sm">
          <Icon name="document-text-outline" color={colors.primary} size={42} />
          <View className="absolute -bottom-2 -right-2 h-10 w-10 items-center justify-center rounded-full bg-surface">
            <Icon name={current.icon} color={current.accent} size={23} />
          </View>
        </View>
        <View className="items-end gap-sm">
          <View className="h-3 w-20 rounded-full bg-white/80" />
          <View className="h-3 w-28 rounded-full bg-white/60" />
          <View className="h-3 w-16 rounded-full bg-white/50" />
        </View>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="font-manrope-bold text-lg text-primary">MEINDOCS</Text>
        <View className="flex-row gap-xs">
          {artwork.map((item, index) => (
            <View
              key={item.icon}
              className={
                index === step
                  ? 'h-2 w-6 rounded-full bg-primary'
                  : 'h-2 w-2 rounded-full bg-primary/30'
              }
            />
          ))}
        </View>
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const { state, setState, refreshBiometrics } = useSecurity();
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState<'en' | 'de'>(state.language);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const copy = [
    [
      'Welcome to MeinDocs',
      'Willkommen bei MeinDocs',
      'Your documents stay on your phone and remain under your control.',
      'Deine Dokumente bleiben auf deinem Gerät und unter deiner Kontrolle.',
    ],
    [
      'Local-first privacy',
      'Datenschutz zuerst',
      'MeinDocs works without an online account. Cloud backup is optional and encrypted.',
      'MeinDocs funktioniert ohne Online-Konto. Cloud-Backups sind optional und verschlüsselt.',
    ],
    [
      'Choose your language',
      'Sprache wählen',
      'You can change this later in Settings.',
      'Du kannst dies später in den Einstellungen ändern.',
    ],
    [
      'Protect your app',
      'App schützen',
      'Use Face ID, Touch ID, or Android biometrics. Your device passcode remains the fallback.',
      'Nutze Face ID, Touch ID oder Android-Biometrie. Dein Gerätecode bleibt die Alternative.',
    ],
    [
      'Notifications',
      'Mitteilungen',
      'Get local reminders for deadlines. You can skip this and enable it later.',
      'Erhalte lokale Erinnerungen an Fristen. Du kannst dies überspringen.',
    ],
    [
      'Optional Google Drive backup',
      'Optionales Google-Drive-Backup',
      'Connect later if you want encrypted backups. MeinDocs remains fully usable offline.',
      'Verbinde später ein Konto für verschlüsselte Backups. MeinDocs funktioniert vollständig offline.',
    ],
  ];
  const current = copy[step];
  async function next() {
    if (step === 2) await setState({ language });
    if (step === 3 && biometricAvailable && (await authenticateDevice()))
      await setState({ biometricEnabled: true });
    if (step === 4) {
      const granted = await requestReminderPermissions().catch(() => false);
      await setState({ notificationsSkipped: !granted });
    }
    if (step === 5) {
      await setState({ backupSkipped: true, onboardingComplete: true });
      router.replace('/(tabs)');
      return;
    }
    setStep((value) => value + 1);
  }
  async function skip() {
    if (step === 4) await setState({ notificationsSkipped: true });
    if (step === 5) {
      await setState({ backupSkipped: true, onboardingComplete: true });
      router.replace('/(tabs)');
      return;
    }
    setStep((value) => value + 1);
  }
  return (
    <Page
      edges={['top', 'left', 'right', 'bottom']}
      showPreviewNote={false}
      title={language === 'de' ? current[1] : current[0]}
      subtitle={language === 'de' ? current[3] : current[2]}
    >
      <OnboardingArtwork step={step} />
      <Card className="gap-sm bg-surface">
        <View className="flex-row items-center justify-between">
          <Text className="font-manrope-bold text-xl">
            {step === 0 ? 'MEINDOCS' : `${step + 1} / ${copy.length}`}
          </Text>
          <Icon
            name={artwork[step]?.icon ?? 'document-text-outline'}
            color={artwork[step]?.accent ?? colors.primary}
            size={24}
          />
        </View>
        <Text className="text-muted-foreground">{language === 'de' ? current[3] : current[2]}</Text>
      </Card>
      {step === 2 && (
        <Options
          value={language}
          onChange={setLanguage}
          options={[
            { value: 'en', label: 'English' },
            { value: 'de', label: 'Deutsch' },
          ]}
        />
      )}
      {step === 3 && (
        <Button
          variant="outline"
          onPress={async () => setBiometricAvailable((await refreshBiometrics()).available)}
        >
          <Text>{biometricAvailable ? 'Biometrics available ✓' : 'Enable biometrics'}</Text>
        </Button>
      )}
      <Button onPress={() => void next()}>
        <Text>
          {step === 5
            ? language === 'de'
              ? 'Fertig'
              : 'Finish'
            : language === 'de'
              ? 'Weiter'
              : 'Continue'}
        </Text>
      </Button>
      {(step === 4 || step === 5) && (
        <Button variant="ghost" onPress={() => void skip()}>
          <Text>{language === 'de' ? 'Überspringen' : 'Skip for now'}</Text>
        </Button>
      )}
    </Page>
  );
}
