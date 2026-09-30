import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/app/card';
import { SettingToggle } from '@/features/preview/ui';
import { usePreview } from '@/features/preview/provider';
import { GoogleDriveBackupProvider } from './google-drive';
import { GoogleDriveConnectButton } from './google-drive-auth';
import { BackupService, type BackupProgress, getBackupDeviceId, getDeviceBackupKey } from './index';
import { createLocalBackupRepository } from './repository';
import { userErrorMessage } from '@meindocs/domain';
import { logger } from '@/lib/logger';

// fallow-ignore-next-line complexity
export function BackupSettings() {
  const { t, notify } = usePreview();
  const provider = useMemo(() => new GoogleDriveBackupProvider('local-device'), []);
  const [service, setService] = useState<BackupService | null>(null);
  const [backups, setBackups] = useState<
    Awaited<ReturnType<GoogleDriveBackupProvider['listBackups']>>
  >([]);
  const [progress, setProgress] = useState<BackupProgress | null>(null);
  const [automatic, setAutomatic] = useState(false);

  useEffect(() => {
    void getBackupDeviceId()
      .then((id) => provider.setDeviceId(id))
      .catch((error) => {
        logger.warn('backup_device_id_failed', error);
        notify(userErrorMessage(error, 'backup'), userErrorMessage(error, 'backup'));
      });
  }, [provider]);

  const refresh = useCallback(async () => {
    if (!provider.isConnected()) return;
    setBackups(await provider.listBackups());
  }, [provider]);

  async function connect(token: string) {
    try {
      provider.setAccessToken(token);
      await provider.connect();
      const next = new BackupService(
        provider,
        createLocalBackupRepository(),
        await getDeviceBackupKey(),
        setProgress,
      );
      setService(next);
      await refresh();
      notify('Google Drive connected', 'Google Drive verbunden');
    } catch (error) {
      logger.warn('backup_connect_failed', error);
      notify(userErrorMessage(error, 'authentication'), userErrorMessage(error, 'authentication'));
    }
  }

  async function createBackup() {
    if (!service) return;
    try {
      await service.createBackup();
      await refresh();
      notify('Encrypted backup uploaded', 'Verschlüsseltes Backup hochgeladen');
    } catch (error) {
      logger.warn('backup_create_failed', error);
      notify(userErrorMessage(error, 'backup'), userErrorMessage(error, 'backup'));
    } finally {
      setProgress(null);
    }
  }

  async function restore(backupId: string) {
    if (!service) return;
    try {
      await service.restoreBackup(backupId, async () => {
        return new Promise((resolve) =>
          Alert.alert(
            t('Replace local data?', 'Lokale Daten ersetzen?'),
            t(
              'The selected backup will replace local data after validation.',
              'Das ausgewählte Backup ersetzt nach der Prüfung die lokalen Daten.',
            ),
            [
              { text: t('Cancel', 'Abbrechen'), style: 'cancel', onPress: () => resolve(false) },
              {
                text: t('Restore', 'Wiederherstellen'),
                style: 'destructive',
                onPress: () => resolve(true),
              },
            ],
          ),
        );
      });
    } catch (error) {
      logger.warn('backup_restore_failed', error, { backupId });
      notify(userErrorMessage(error, 'backup'), userErrorMessage(error, 'backup'));
    }
  }

  return (
    <Card>
      <Text className="font-manrope-semibold">
        {t('Encrypted Google Drive backup', 'Verschlüsseltes Google-Drive-Backup')}
      </Text>
      <Text className="text-sm text-muted-foreground">
        {provider.isConnected()
          ? t(
              'Connected. Keys stay on this device.',
              'Verbunden. Schlüssel bleiben auf diesem Gerät.',
            )
          : t(
              'Not connected. Backups are user-controlled and encrypted before upload.',
              'Nicht verbunden. Backups werden vor dem Upload lokal verschlüsselt.',
            )}
      </Text>
      {!provider.isConnected() ? (
        <GoogleDriveConnectButton
          onToken={(token) => void connect(token)}
          label={t('Connect Google Drive', 'Google Drive verbinden')}
        />
      ) : null}
      <SettingToggle
        title={t('Automatic backup', 'Automatisches Backup')}
        description={t(
          'Prepare a backup after future local changes.',
          'Nach zukünftigen lokalen Änderungen ein Backup vorbereiten.',
        )}
        value={automatic}
        onChange={setAutomatic}
      />
      <Button disabled={!service || progress !== null} onPress={() => void createBackup()}>
        <Text>{t('Create encrypted backup', 'Verschlüsseltes Backup erstellen')}</Text>
      </Button>
      {progress ? (
        <View className="gap-xs">
          <Text className="text-sm">
            {progress.phase} · {progress.completed}/{progress.total}
          </Text>
          <View className="h-2 overflow-hidden rounded-full bg-border">
            <View
              style={{
                width: `${progress.total ? (progress.completed / progress.total) * 100 : 0}%`,
              }}
              className="h-2 bg-primary"
            />
          </View>
        </View>
      ) : null}
      {backups.map((backup) => (
        <View
          key={backup.id}
          className="flex-row items-center justify-between gap-sm border-t border-border py-sm"
        >
          <View className="flex-1">
            <Text className="font-manrope-medium">{backup.backupId}</Text>
            <Text className="text-xs text-muted-foreground">
              {new Date(backup.createdAt).toLocaleString()}
            </Text>
          </View>
          <Button variant="outline" onPress={() => void restore(backup.id)}>
            <Text>{t('Restore', 'Wiederherstellen')}</Text>
          </Button>
        </View>
      ))}
    </Card>
  );
}
