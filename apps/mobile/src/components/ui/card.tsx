import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

export function BaseCard({ className, ...props }: ComponentProps<typeof View>) {
  return (
    <TextClassContext.Provider value="text-card-foreground">
      <View
        {...props}
        className={cn('gap-lg rounded-lg border border-border bg-card py-lg', className)}
      />
    </TextClassContext.Provider>
  );
}
