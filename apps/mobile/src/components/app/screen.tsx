import { colors, spacing } from '@meindocs/ui';
import type { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { cn } from '@/lib/utils';

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  className?: string;
  edges?: Edge[];
}>;

export function Screen({
  children,
  scroll = false,
  className,
  edges = ['top', 'right', 'bottom', 'left'],
}: ScreenProps) {
  return (
    <SafeAreaView
      edges={edges}
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            padding: spacing.md,
          }}
          automaticallyAdjustKeyboardInsets
          keyboardShouldPersistTaps="handled"
        >
          <View className={cn('min-h-full w-full flex-grow gap-lg', className)}>{children}</View>
        </ScrollView>
      ) : (
        <View className={cn('flex-1 gap-lg p-md', className)}>{children}</View>
      )}
    </SafeAreaView>
  );
}
