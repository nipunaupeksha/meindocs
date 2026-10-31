# Internationalization and localization

MeinDocs uses **i18n** (internationalization) to keep interface text independent from components, and **l10n** (localization) to adapt language, date, number, and regional conventions for each market.

## Current foundation

- `apps/mobile/src/i18n` owns supported locales, region formatting identifiers, translation resources, and i18next initialization.
- `react-i18next` provides keyed translations in React components. English is the fallback while Danish (`da`), Norwegian Bokmål (`nb`), and Swedish (`sv`) resources are being translated.
- A shared `LanguageProvider` owns persisted locale selection and updates the shared i18next instance. Onboarding and Settings use the same flag-labeled language dropdown and endonyms.
- Existing `usePreview().t(english, german)` calls remain as a migration bridge. New and migrated UI should use `useTranslation()` and keys rather than adding more paired strings.
- Dates and currency keep using `Intl`, with the locale selected from the shared language setting. Currency choice remains an independent product preference; language alone must not silently change stored amounts.

## Migration plan

1. **Foundation (now):** Add i18next resources, supported locale codes, persisted selection, English fallback, and onboarding/Settings choices.
2. **Shared UI:** Migrate navigation labels, buttons, accessibility labels, empty states, and common components into a `common` namespace.
3. **Feature namespaces:** Move each area in small slices (`documents`, `tax`, `reminders`, `settings`, `backup`, `cases`, `people`, `organisations`, `onboarding`). Keep keys descriptive and stable; do not use translated text as keys.
4. **Locale formatting:** Route dates, numbers, and currencies through locale helpers backed by `Intl`. Keep currency selection independent and add region-specific date/number expectations.
5. **Scandinavian rollout:** Add reviewed `da`, `nb`, and `sv` resources feature by feature. Do not label a feature translated until every visible string and accessibility label has been reviewed by a fluent speaker.
6. **Quality gates:** Check key parity across locales, interpolation/plural cases, fallback behavior, long-string layouts, and persisted locale changes. Add screenshot coverage for the language selector and representative screens after the translation bundles are complete.

## Locale scope

The initial Scandinavian rollout targets Denmark (`da-DK`), Norway (`nb-NO`), and Sweden (`sv-SE`). Finnish (`fi-FI`) and Icelandic (`is-IS`) can be added as separate Nordic-market locales when product scope and translations are ready.
