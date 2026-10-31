import { View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '@meindocs/ui';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
    icon?: 'add-outline' | 'open-outline';
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
          variant="outline"
          className="min-h-10 gap-sm rounded-full border-primary bg-transparent px-md py-xs"
          onPress={action.onPress}
          accessibilityLabel={action.label}
        >
          <Ionicons name={action.icon ?? 'add-outline'} size={14} color={colors.primary} />
          <Text className="text-sm text-primary">{action.label}</Text>
        </Button>
      ) : null}
    </View>
  );
}
