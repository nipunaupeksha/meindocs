import type { ComponentProps } from 'react';

import { BaseCard } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type CardProps = ComponentProps<typeof BaseCard>;

export function Card({ className, ...props }: CardProps) {
  return (
    <BaseCard
      {...props}
      className={cn(
        'gap-sm rounded-lg border border-border bg-surface p-md shadow-none',
        className,
      )}
    />
  );
}
