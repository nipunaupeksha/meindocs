import { clsx, type ClassValue } from 'clsx';
import { spacing } from '@meindocs/ui';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  extend: {
    theme: { spacing: Object.keys(spacing) },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
