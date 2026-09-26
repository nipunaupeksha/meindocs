import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { StatusBadge, type StatusTone } from '@/components/app/status-badge';
import { Text } from '@/components/ui/text';

type DocumentRowProps = {
  title: string;
  metadata: string;
  thumbnail?: ReactNode;
  status?: {
    label: string;
    tone: StatusTone;
  };
  onPress: () => void;
  disabled?: boolean;
};

export function DocumentRow({
  title,
  metadata,
  thumbnail,
  status,
  onPress,
  disabled = false,
}: DocumentRowProps) {
  const accessibilityLabel = [title, metadata, status?.label].filter(Boolean).join(', ');

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      className="min-h-20 flex-row items-center gap-md rounded-lg border border-border bg-surface p-md active:bg-primary-soft disabled:opacity-50"
    >
      {thumbnail ? (
        <View
          className="h-12 w-12 items-center justify-center overflow-hidden rounded-md bg-primary-soft"
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {thumbnail}
        </View>
      ) : null}

      <View className="min-w-0 flex-1 gap-xs">
        <Text numberOfLines={2} className="font-manrope-semibold">
          {title}
        </Text>

        <Text numberOfLines={2} className="text-sm text-muted-foreground">
          {metadata}
        </Text>

        {status ? <StatusBadge label={status.label} tone={status.tone} /> : null}
      </View>
    </Pressable>
  );
}
