import type { Config } from 'tailwindcss';
import nativewindPreset from 'nativewind/preset';
import animate from 'tailwindcss-animate';

import { colors, radius, spacing, typography } from '@meindocs/ui';

const px = (value: number) => `${value}px`;

export default {
  darkMode: 'class',
  content: {
    relative: true,
    files: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  },
  presets: [nativewindPreset],
  theme: {
    extend: {
      colors: {
        background: colors.background,
        surface: colors.surface,
        foreground: colors.text,

        primary: {
          DEFAULT: colors.primary,
          foreground: colors.surface,
        },

        'primary-soft': colors.primarySoft,

        secondary: {
          DEFAULT: colors.primarySoft,
          foreground: colors.primary,
        },

        muted: {
          DEFAULT: colors.background,
          foreground: colors.muted,
        },

        accent: {
          DEFAULT: colors.accent,
          foreground: colors.text,
        },

        destructive: {
          DEFAULT: colors.danger,
          foreground: colors.surface,
        },

        card: {
          DEFAULT: colors.surface,
          foreground: colors.text,
        },

        popover: {
          DEFAULT: colors.surface,
          foreground: colors.text,
        },

        border: colors.border,
        input: colors.border,
        ring: colors.primary,

        success: colors.success,
        warning: colors.warning,
        danger: colors.danger,
        info: colors.info,
      },

      spacing: {
        none: px(spacing.none),
        xs: px(spacing.xs),
        sm: px(spacing.sm),
        md: px(spacing.md),
        lg: px(spacing.lg),
        xl: px(spacing.xl),
        xxl: px(spacing.xxl),
      },

      borderRadius: {
        none: px(radius.none),
        sm: px(radius.sm),
        md: px(radius.md),
        lg: px(radius.lg),
        full: px(radius.full),
      },

      fontFamily: {
        sans: [typography.fontFamily.regular],
        manrope: [typography.fontFamily.regular],
        'manrope-medium': [typography.fontFamily.medium],
        'manrope-semibold': [typography.fontFamily.semibold],
        'manrope-bold': [typography.fontFamily.bold],
      },

      fontSize: {
        xs: [px(typography.fontSize.caption), { lineHeight: px(typography.lineHeight.caption) }],
        sm: [px(typography.fontSize.small), { lineHeight: px(typography.lineHeight.small) }],
        base: [px(typography.fontSize.body), { lineHeight: px(typography.lineHeight.body) }],
        xl: [px(typography.fontSize.subtitle), { lineHeight: px(typography.lineHeight.subtitle) }],
        '2xl': [px(typography.fontSize.title), { lineHeight: px(typography.lineHeight.title) }],
        '3xl': [px(typography.fontSize.display), { lineHeight: px(typography.lineHeight.display) }],
      },
    },
  },
  plugins: [animate],
} satisfies Config;
