import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

WebBrowser.maybeCompleteAuthSession();

export function GoogleDriveConnectButton({
  onToken,
  label,
}: {
  onToken: (token: string) => void;
  label: string;
}) {
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  // fallow-ignore-next-line complexity
  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      onToken(response.authentication.accessToken);
    }
  }, [onToken, response]);

  return (
    <Button disabled={!request} onPress={() => void promptAsync()}>
      <Text>{label}</Text>
    </Button>
  );
}
