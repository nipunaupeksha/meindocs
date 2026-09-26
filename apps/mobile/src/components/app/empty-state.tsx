import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

type EmptyStateProps = {
  title: string;
  description: string;
  illustration?: ReactNode;
  action?: {
    label: string;
    onPress: () => void;
  };
};

export function EmptyState({ title, description, illustration, action }: EmptyStateProps) {
  return (
    <View className="items-center gap-md px-md py-xl">
      {illustration ? (
        <View
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {illustration}
        </View>
      ) : null}

      <View className="w-full gap-sm">
        <Text accessibilityRole="header" className="text-center font-manrope-semibold text-xl">
          {title}
        </Text>

        <Text className="text-center text-muted-foreground">{description}</Text>
      </View>

      {action ? (
        <Button className="min-h-12" onPress={action.onPress} accessibilityLabel={action.label}>
          <Text>{action.label}</Text>
        </Button>
      ) : null}
    </View>
  );
}
