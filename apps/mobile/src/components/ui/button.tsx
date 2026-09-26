import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { Pressable } from 'react-native';

const buttonVariants = cva(
  'group shrink-0 flex-row items-center justify-center gap-sm rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-primary active:bg-primary/90',
        destructive: 'bg-destructive active:bg-destructive/90',
        outline: 'border border-border bg-surface active:bg-primary-soft',
        secondary: 'bg-secondary active:bg-secondary/80',
        ghost: 'active:bg-primary-soft',
        link: '',
      },
      size: {
        default: 'min-h-12 px-md py-sm',
        sm: 'min-h-12 px-sm py-xs',
        lg: 'min-h-14 px-lg py-md',
        icon: 'min-h-12 min-w-12 p-sm',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

const buttonTextVariants = cva('text-sm font-manrope-medium text-center', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      destructive: 'text-destructive-foreground',
      outline: 'text-foreground',
      secondary: 'text-secondary-foreground',
      ghost: 'text-primary',
      link: 'text-primary underline',
    },
  },
  defaultVariants: { variant: 'default' },
});

type ButtonProps = ComponentProps<typeof Pressable> & VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  disabled,
  accessibilityState,
  ...props
}: ButtonProps) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant })}>
      <Pressable
        {...props}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ ...accessibilityState, disabled: Boolean(disabled) }}
        className={cn(buttonVariants({ variant, size }), disabled && 'opacity-50', className)}
      />
    </TextClassContext.Provider>
  );
}
