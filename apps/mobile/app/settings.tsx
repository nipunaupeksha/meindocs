import { Card } from '@/components/app/card';
import { SectionHeader } from '@/components/app/section-header';
import { Text } from '@/components/ui/text';
import { usePreview } from '@/features/preview/provider';
import { Options, Page, SettingToggle } from '@/features/preview/ui';
import { StorageSettings } from '@/features/preview/storage-settings';
import { BackupSettings } from '@/features/backup/settings';
import { SecuritySettings } from '@/features/security/settings';
function Preferences() {
  const { t, settings, setSettings, notify } = usePreview();
  function update(key: 'reminders' | 'wifi' | 'biometric', value: boolean) {
    setSettings((previous) => ({ ...previous, [key]: value }));
    notify('Preview preference updated', 'Vorschau-Einstellung geändert');
  }
  return (
    <Card>
      <SettingToggle
        title={t('Reminder alerts', 'Erinnerungsmitteilungen')}
        description={t(
          'Schedule a local notification when a new reminder is created.',
          'Beim Erstellen einer Erinnerung eine lokale Mitteilung planen.',
        )}
        value={settings.reminders}
        onChange={(value) => update('reminders', value)}
      />
      <SettingToggle
        title={t('Cloud transfers on Wi-Fi only', 'Cloud-Übertragung nur über WLAN')}
        description={t(
          'Preview preference; no files are transferred.',
          'Vorschau-Einstellung; keine Dateien werden übertragen.',
        )}
        value={settings.wifi}
        onChange={(value) => update('wifi', value)}
      />
      <SettingToggle
        title={t('Biometric app lock', 'Biometrische App-Sperre')}
        description={t(
          'UI preview only. This does not lock or protect the app yet.',
          'Nur UI-Vorschau. Die App wird dadurch noch nicht gesperrt oder geschützt.',
        )}
        value={settings.biometric}
        onChange={(value) => update('biometric', value)}
      />
    </Card>
  );
}
export default function SettingsScreen() {
  const { t, language, changeLanguage, toasts, changeToasts } = usePreview();
  return (
    <Page
      title={t('Make MeinDocs yours.', 'MeinDocs, wie du es magst.')}
      subtitle={t(
        'Your language. Your files. Your choice.',
        'Deine Sprache. Deine Dateien. Deine Wahl.',
      )}
    >
      <SectionHeader title={t('Language', 'Sprache')} />
      <Options
        value={language}
        onChange={changeLanguage}
        options={[
          { value: 'en', label: 'English' },
          { value: 'de', label: 'Deutsch' },
        ]}
      />
      <SectionHeader title={t('Notifications', 'Mitteilungen')} />
      <Card>
        <SettingToggle
          title={t('In-app pop-up notifications', 'Pop-up-Mitteilungen in der App')}
          description={t(
            'Show a short message at the top when something changes.',
            'Kurze Nachricht am oberen Rand anzeigen, wenn sich etwas ändert.',
          )}
          value={toasts}
          onChange={changeToasts}
        />
      </Card>
      <SectionHeader
        title={t('Files & storage', 'Dateien & Speicher')}
        description={t(
          'Choose a default location and a folder for each provider.',
          'Wähle einen Standard-Speicherort und einen Ordner je Anbieter.',
        )}
      />
      <Card className="bg-primary-soft">
        <Text className="font-manrope-semibold">
          {t('You stay in control', 'Du behältst die Kontrolle')}
        </Text>
        <Text className="text-sm">
          {t(
            'Local storage is the foundation. Cloud locations are optional. Connections and folder choices below are simulated; no files are moved or uploaded.',
            'Lokaler Speicher ist die Grundlage. Cloud-Speicher sind optional. Verbindungen und Ordnerauswahl sind simuliert; keine Dateien werden verschoben oder hochgeladen.',
          )}
        </Text>
      </Card>
      <StorageSettings />
      <SectionHeader
        title={t('Backups', 'Backups')}
        description={t(
          'Encrypted device backups only. No live sync.',
          'Nur verschlüsselte Geräte-Backups. Keine Live-Synchronisierung.',
        )}
      />
      <BackupSettings />
      <SectionHeader title={t('Privacy & preferences', 'Datenschutz & Einstellungen')} />
      <Preferences />
      <SectionHeader
        title={t('App security', 'App-Sicherheit')}
        description={t(
          'Protect this device without creating an online account.',
          'Schütze dieses Gerät ohne Online-Konto.',
        )}
      />
      <SecuritySettings />
      <Text className="text-center text-xs text-muted-foreground">MeinDocs · 0.0.0</Text>
    </Page>
  );
}
