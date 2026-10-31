const en = {
  onboarding: {
    brandTagline: 'Private by design',
    documents: 'Your documents',
    safeOrganised: 'Safe & organised',
    step: {
      welcome: {
        title: 'Welcome to MeinDocs',
        description: 'Your documents stay on your phone and remain under your control.',
      },
      privacy: {
        title: 'Local-first privacy',
        description: 'MeinDocs works without an online account. Cloud backup is optional and encrypted.',
      },
      language: {
        title: 'Choose your language',
        description: 'You can change this later in Settings.',
      },
      protection: {
        title: 'Protect your app',
        description: 'Use Face ID, Touch ID, or Android biometrics. Your device passcode remains the fallback.',
      },
      notifications: {
        title: 'Notifications',
        description: 'Get local reminders for deadlines. You can skip this and enable it later.',
      },
      backup: {
        title: 'Optional Google Drive backup',
        description: 'Connect later if you want encrypted backups. MeinDocs remains fully usable offline.',
      },
    },
    biometricsAvailable: 'Biometrics available ✓',
    enableBiometrics: 'Enable biometrics',
    finish: 'Finish',
    continue: 'Continue',
    skip: 'Skip for now',
  },
} as const;

const de = {
  onboarding: {
    brandTagline: 'Datenschutz von Anfang an',
    documents: 'Deine Dokumente',
    safeOrganised: 'Sicher & übersichtlich',
    step: {
      welcome: {
        title: 'Willkommen bei MeinDocs',
        description: 'Deine Dokumente bleiben auf deinem Gerät und unter deiner Kontrolle.',
      },
      privacy: {
        title: 'Datenschutz zuerst',
        description: 'MeinDocs funktioniert ohne Online-Konto. Cloud-Backups sind optional und verschlüsselt.',
      },
      language: {
        title: 'Sprache wählen',
        description: 'Du kannst dies später in den Einstellungen ändern.',
      },
      protection: {
        title: 'App schützen',
        description: 'Nutze Face ID, Touch ID oder Android-Biometrie. Dein Gerätecode bleibt die Alternative.',
      },
      notifications: {
        title: 'Mitteilungen',
        description: 'Erhalte lokale Erinnerungen an Fristen. Du kannst dies überspringen.',
      },
      backup: {
        title: 'Optionales Google-Drive-Backup',
        description: 'Verbinde später ein Konto für verschlüsselte Backups. MeinDocs funktioniert vollständig offline.',
      },
    },
    biometricsAvailable: 'Biometrie verfügbar ✓',
    enableBiometrics: 'Biometrie aktivieren',
    finish: 'Fertig',
    continue: 'Weiter',
    skip: 'Überspringen',
  },
} as const;

export const resources = { en, de } as const;
