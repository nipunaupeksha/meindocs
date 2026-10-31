export const supportedLanguages = ['en', 'de', 'da', 'nb', 'sv'] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export const languageOptions: { value: SupportedLanguage; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'da', label: 'Dansk', flag: '🇩🇰' },
  { value: 'nb', label: 'Norsk bokmål', flag: '🇳🇴' },
  { value: 'sv', label: 'Svenska', flag: '🇸🇪' },
];

export const localeByLanguage: Record<SupportedLanguage, string> = {
  en: 'en-GB',
  de: 'de-DE',
  da: 'da-DK',
  nb: 'nb-NO',
  sv: 'sv-SE',
};
