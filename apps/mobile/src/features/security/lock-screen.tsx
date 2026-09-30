import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Page } from '@/features/preview/ui';
import { useSecurity } from './provider';
export function LockScreen() {
  const { unlock } = useSecurity();
  return (
    <Page
      title="MeinDocs locked"
      subtitle="Unlock with Face ID, Touch ID, or your device passcode."
    >
      <Button onPress={() => void unlock()}>
        <Text>Unlock</Text>
      </Button>
    </Page>
  );
}
