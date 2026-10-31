import { useState } from 'react';
import { router } from 'expo-router';
import { ImageBackground, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/features/preview/ui';
import { useSecurity } from '@/features/security/provider';
import { authenticateDevice } from '@/features/security/native';
import { requestReminderPermissions } from '@/features/reminders/notifications';
import { colors } from '@meindocs/ui';
import { useTranslation } from 'react-i18next';
import { useAppLanguage } from '@/i18n/provider';
import { LanguageSelector } from '@/i18n/ui';

const artwork = [
  { icon: 'documents-outline' as const, accent: colors.primary },
  { icon: 'shield-checkmark-outline' as const, accent: colors.success },
  { icon: 'language-outline' as const, accent: colors.accent },
  { icon: 'finger-print-outline' as const, accent: colors.primary },
  { icon: 'notifications-outline' as const, accent: colors.warning },
  { icon: 'cloud-done-outline' as const, accent: colors.info },
];

function OnboardingArtwork({ step }: { step: number }) {
  const { t } = useTranslation();
  const current = artwork[step] ?? artwork[0];
  return (
    <View className="flex-1 items-center justify-center">
      <View className="w-[82%] max-w-sm rounded-3xl border border-white/50 bg-white/35 p-lg shadow-lg">
        <View className="mb-lg flex-row items-center justify-between">
          <View className="flex-row items-center gap-sm">
            <View className="h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-white/45">
              <Icon name="document-text-outline" color={colors.primary} size={25} />
            </View>
            <View>
              <Text className="font-manrope-semibold text-foreground">MEINDOCS</Text>
              <Text className="text-xs text-muted-foreground">{t('brandTagline')}</Text>
            </View>
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/45">
            <Icon name={current.icon} color={current.accent} size={21} />
          </View>
        </View>
        <View className="gap-sm rounded-2xl border border-white/60 bg-white/55 p-md">
          <View className="flex-row items-center gap-sm">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-white/55">
              <Icon name={current.icon} color={current.accent} size={20} />
            </View>
            <View className="flex-1 gap-xs">
              <View className="h-2.5 w-2/3 rounded-full bg-primary/35" />
              <View className="h-2 w-1/2 rounded-full bg-primary/20" />
            </View>
            <Icon name="checkmark-circle" color={colors.success} size={20} />
          </View>
          <View className="h-px bg-border/80" />
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-muted-foreground">{t('documents')}</Text>
            <Text className="font-manrope-semibold text-sm text-foreground">{t('safeOrganised')}</Text>
          </View>
        </View>
        <View className="mt-lg flex-row justify-center gap-xs">
          {artwork.map((item, index) => (
            <View key={item.icon} className={index === step ? 'h-1.5 w-6 rounded-full bg-primary' : 'h-1.5 w-1.5 rounded-full bg-primary/30'} />
          ))}
        </View>
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { setState, refreshBiometrics } = useSecurity();
  const { language, setLanguage } = useAppLanguage();
  const [step, setStep] = useState(0);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const stepKeys = ['welcome', 'privacy', 'language', 'protection', 'notifications', 'backup'] as const;
  const current = stepKeys[step];
  async function next() {
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
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} className="flex-1 bg-background">
      <ImageBackground
        source={require('../assets/images/onboarding-radial.png')}
        resizeMode="cover"
        className="flex-1"
      >
        <View className="flex-1">
        <View className="flex-1 px-md">
          <OnboardingArtwork step={step} />
        </View>
        <View className="gap-md bg-transparent px-lg pb-lg pt-lg">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-manrope-semibold uppercase tracking-widest text-primary">
              {step === 0 ? 'MEINDOCS' : `${step + 1} / ${stepKeys.length}`}
            </Text>
            <Icon name={artwork[step]?.icon ?? 'document-text-outline'} color={colors.primary} size={22} />
          </View>
          <View className="gap-xs">
            <Text variant="h2" className="text-foreground">
              {t(`step.${current}.title`)}
            </Text>
            <Text className="text-foreground/75">
              {t(`step.${current}.description`)}
            </Text>
          </View>
          {step === 2 && (
            <LanguageSelector
              value={language}
              onChange={(nextLanguage) => void setLanguage(nextLanguage)}
            />
          )}
          {step === 3 && (
            <Button variant="outline" className="rounded-full border-primary/20 bg-white/45" onPress={async () => setBiometricAvailable((await refreshBiometrics()).available)}>
              <Text>{biometricAvailable ? t('biometricsAvailable') : t('enableBiometrics')}</Text>
            </Button>
          )}
          <Button className="rounded-full" onPress={() => void next()}>
            <Text>{step === stepKeys.length - 1 ? t('finish') : t('continue')}</Text>
          </Button>
          {(step === 4 || step === 5) && (
            <Button variant="ghost" onPress={() => void skip()}>
              <Text>{t('skip')}</Text>
            </Button>
          )}
        </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
