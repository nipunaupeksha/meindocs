import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Slot } from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { View } from 'react-native';

const badgeVariants = cva(
  'shrink-0 flex-row items-center justify-center gap-xs rounded-full border px-sm py-xs',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary',
        secondary: 'border-transparent bg-secondary',
        destructive: 'border-transparent bg-destructive',
        outline: 'border-border bg-surface',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

const badgeTextVariants = cva('text-xs font-manrope-medium', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-secondary-foreground',
      destructive: 'text-destructive-foreground',
      outline: 'text-foreground',
    },
  },
  defaultVariants: { variant: 'default' },
});

type BadgeProps = ComponentProps<typeof View> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
  };

export function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Component = asChild ? Slot : View;
  return (
    <TextClassContext.Provider value={badgeTextVariants({ variant })}>
      <Component {...props} className={cn(badgeVariants({ variant }), className)} />
    </TextClassContext.Provider>
  );
}
