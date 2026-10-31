import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  className?: string;
};

export function AppHeader({ title, subtitle, leading, trailing, className }: AppHeaderProps) {
  return (
    <View className={`flex-row items-center gap-sm ${className ?? ''}`}>
      {leading}

      <View className="min-w-0 flex-1 gap-xs">
        <Text accessibilityRole="header" variant="h2">
          {title}
        </Text>

        {subtitle ? (
          <Text variant="p" className="text-muted-foreground">
            {subtitle}
          </Text>
        ) : null}
      </View>

      {trailing}
    </View>
  );
}
