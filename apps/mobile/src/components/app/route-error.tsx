import { Screen } from '@/components/app/screen';
import { Text } from '@/components/ui/text';

export function RouteError({ message }: { message: string }) {
  return (
    <Screen edges={['left', 'right', 'bottom']}>
      <Text accessibilityRole="alert">{message}</Text>
    </Screen>
  );
}
