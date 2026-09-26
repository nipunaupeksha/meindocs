import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
};

export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center gap-sm">
      <View className="min-w-0 flex-1 gap-xs">
        <Text accessibilityRole="header" className="font-manrope-semibold text-xl">
          {title}
        </Text>

        {description ? <Text className="text-sm text-muted-foreground">{description}</Text> : null}
      </View>

      {action ? (
        <Button
          variant="ghost"
          className="min-h-12"
          onPress={action.onPress}
          accessibilityLabel={action.label}
        >
          <Text>{action.label}</Text>
        </Button>
      ) : null}
    </View>
  );
}
