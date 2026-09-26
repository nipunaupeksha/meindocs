// Font registration is deferred until UI work. These names are the intended
// Manrope font aliases to register in the mobile app.
export const typography = {
  fontFamily: {
    regular: 'Manrope_400Regular',
    medium: 'Manrope_500Medium',
    semibold: 'Manrope_600SemiBold',
    bold: 'Manrope_700Bold',
  },
  fontSize: { caption: 12, small: 14, body: 16, subtitle: 20, title: 28, display: 36 },
  lineHeight: { caption: 16, small: 20, body: 24, subtitle: 28, title: 36, display: 44 },
} as const;
