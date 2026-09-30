import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PreviewProvider, usePreview } from '@/features/preview/provider';
import { SecurityProvider, useSecurity } from '@/features/security/provider';
import { LockScreen } from '@/features/security/lock-screen';
import '../global.css';

import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, typography } from '@meindocs/ui';
import { useFonts } from 'expo-font';
import { Redirect, Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { AppErrorBoundary } from '@/components/app/error-boundary';

void SplashScreen.preventAutoHideAsync();

// Gives directly opened stack routes a tab screen underneath them.
export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    ...Ionicons.font,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (fontError) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-lg">
        <Text accessibilityRole="alert">
          The app fonts could not be loaded. Please restart the app.
        </Text>
      </View>
    );
  }

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppErrorBoundary area="root-navigation">
      <SafeAreaProvider>
        <SecurityProvider>
          <PreviewProvider>
            <RootNavigator />
          </PreviewProvider>
        </SecurityProvider>
      </SafeAreaProvider>
    </AppErrorBoundary>
  );
}

function RootNavigator() {
  const { t } = usePreview();
  const { loading, state, locked } = useSecurity();
  const segments = useSegments();
  const [welcomePreview, setWelcomePreview] = useState(
    process.env.EXPO_PUBLIC_SHOW_ONBOARDING === '1',
  );

  useEffect(() => {
    // The preview flag is intentionally session-only. Once onboarding is visible,
    // allow its Finish action to navigate to the app without redirecting back.
    if (segments[0] === 'onboarding') setWelcomePreview(false);
  }, [segments]);
  if (loading)
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading MeinDocs…</Text>
      </View>
    );
  if (locked) return <LockScreen />;
  if ((!state.onboardingComplete || welcomePreview) && segments[0] !== 'onboarding')
    return <Redirect href="/onboarding" />;
  return (
    <AppErrorBoundary area="navigation">
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontFamily: typography.fontFamily.semibold,
            fontSize: typography.fontSize.subtitle,
          },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        <Stack.Screen
          name="add-document"
          options={{ title: t('Add Document', 'Dokument hinzufügen') }}
        />

        <Stack.Screen name="processing" options={{ title: t('Processing', 'Verarbeitung') }} />

        <Stack.Screen
          name="document/[id]"
          options={{ title: t('Document Detail', 'Dokumentdetails') }}
        />

        <Stack.Screen
          name="create-reminder"
          options={{ title: t('Create Reminder', 'Erinnerung erstellen') }}
        />

        <Stack.Screen
          name="receipt/[id]"
          options={{ title: t('Receipt Detail', 'Belegdetails') }}
        />

        <Stack.Screen name="settings" options={{ title: t('Settings', 'Einstellungen') }} />
      </Stack>
    </AppErrorBoundary>
  );
}
