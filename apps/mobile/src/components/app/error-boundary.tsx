import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { safeError, logger } from '@/lib/logger';

type Props = PropsWithChildren<{ area: string }>;
type State = { error: ReturnType<typeof safeError> | null };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error: safeError(error) };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    logger.error('navigation_area_failed', error, {
      area: this.props.area,
      componentStack: info.componentStack ? '[redacted]' : undefined,
    });
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <View className="flex-1 items-center justify-center gap-md bg-background p-lg">
        <Text className="font-manrope-bold text-xl">Something went wrong</Text>
        <Text className="text-center text-muted-foreground">{this.state.error.message}</Text>
        <Button onPress={() => this.setState({ error: null })}>
          <Text>Try again</Text>
        </Button>
      </View>
    );
  }
}
