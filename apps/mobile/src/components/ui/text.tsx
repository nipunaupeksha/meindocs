import { cn } from '@/lib/utils';
import { Slot } from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Platform, Text as RNText, type Role } from 'react-native';

const textVariants = cva('font-manrope text-foreground text-base', {
  variants: {
    variant: {
      default: '',
      h1: 'text-3xl font-manrope-bold',
      h2: 'text-2xl font-manrope-semibold',
      h3: 'text-xl font-manrope-semibold',
      h4: 'text-base font-manrope-semibold',
      p: 'text-base',
      blockquote: 'border-l-2 border-border pl-sm text-muted-foreground',
      code: 'rounded-sm bg-muted px-xs font-mono text-sm',
      lead: 'text-xl text-muted-foreground',
      large: 'text-xl font-manrope-semibold',
      small: 'text-sm font-manrope-medium',
      muted: 'text-sm text-muted-foreground',
    },
  },
  defaultVariants: { variant: 'default' },
});

type TextVariantProps = VariantProps<typeof textVariants>;

type TextVariant = NonNullable<TextVariantProps['variant']>;

const ROLE: Partial<Record<TextVariant, Role>> = {
  h1: 'heading',
  h2: 'heading',
  h3: 'heading',
  h4: 'heading',
  blockquote: Platform.select({ web: 'blockquote' as Role }),
  code: Platform.select({ web: 'code' as Role }),
};

const ARIA_LEVEL: Partial<Record<TextVariant, string>> = {
  h1: '1',
  h2: '2',
  h3: '3',
  h4: '4',
};

const TextClassContext = React.createContext<string | undefined>(undefined);

function Text({
  className,
  asChild = false,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof RNText> &
  TextVariantProps & {
    asChild?: boolean;
  }) {
  const textClass = React.useContext(TextClassContext);
  const Component = asChild ? Slot : RNText;
  return (
    <Component
      className={cn(textVariants({ variant }), textClass, className)}
      role={variant ? ROLE[variant] : undefined}
      aria-level={variant ? ARIA_LEVEL[variant] : undefined}
      {...props}
    />
  );
}

export { Text, TextClassContext };
