import { Alert } from 'react-native';
import { Card } from '@/components/app/card';
import { SettingToggle, Options } from '@/features/preview/ui';
import { useSecurity } from './provider';
import { authenticateDevice } from './native';
import { clearLocalFiles, exportLocalFileManifest } from '@/features/files/local-file-service';
import type { AutoLockTimeout } from './state';
export function SecuritySettings() {
  const { state, setState, refreshBiometrics } = useSecurity();
  async function toggleBiometrics(enabled: boolean) {
    if (enabled && !(await refreshBiometrics()).available) {
      Alert.alert(
        'Biometrics unavailable',
        'Set up Face ID, Touch ID, or Android biometrics first.',
      );
      return;
    }
    if (enabled && !(await authenticateDevice())) return;
    await setState({ biometricEnabled: enabled });
  }
  async function clearData() {
    Alert.alert(
      'Clear local data?',
      'This permanently removes local files and thumbnails from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear data', style: 'destructive', onPress: () => void clearLocalFiles() },
      ],
    );
  }
  async function exportData() {
    const uri = await exportLocalFileManifest();
    Alert.alert('Export ready', uri);
  }
  return (
    <Card>
      <SettingToggle
        title="Biometric app lock"
        description="Require Face ID, Touch ID, or Android biometrics on cold start and after inactivity."
        value={state.biometricEnabled}
        onChange={(value) => void toggleBiometrics(value)}
      />
      <Options
        value={String(state.autoLockTimeout)}
        onChange={(value) => void setState({ autoLockTimeout: Number(value) as AutoLockTimeout })}
        options={[
          { value: '0', label: 'Never auto-lock' },
          { value: '30000', label: 'After 30 seconds' },
          { value: '300000', label: 'After 5 minutes' },
          { value: '900000', label: 'After 15 minutes' },
        ]}
      />
      <SettingToggle
        title="Backup encryption"
        description="Encryption keys stay in SecureStore and never enter SQLite, cloud storage, or source code."
        value={true}
        onChange={() => undefined}
      />
      <SettingToggle
        title="Clear local data"
        description="Permanently delete local vault files and thumbnails."
        value={false}
        onChange={() => void clearData()}
      />
      <SettingToggle
        title="Export data"
        description="Create a local manifest export for the user to share or archive."
        value={false}
        onChange={() => void exportData()}
      />
    </Card>
  );
}
