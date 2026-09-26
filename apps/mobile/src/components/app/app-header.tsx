import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
};

export function AppHeader({ title, subtitle, leading, trailing }: AppHeaderProps) {
  return (
    <View className="flex-row items-center gap-sm">
      {leading}

      <View className="min-w-0 flex-1 gap-xs">
        <Text accessibilityRole="header" className="font-manrope-bold text-2xl">
          {title}
        </Text>

        {subtitle ? <Text className="text-sm text-muted-foreground">{subtitle}</Text> : null}
      </View>

      {trailing}
    </View>
  );
}
