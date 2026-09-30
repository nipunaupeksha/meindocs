import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { decodeBase64, encodeBase64 } from '@meindocs/domain';

const keyName = 'meindocs.backup.key.v1';

export async function getDeviceBackupKey() {
  const existing = await SecureStore.getItemAsync(keyName);
  if (existing) return decodeBase64(existing);
  const key = Crypto.getRandomValues(new Uint8Array(32));
  await SecureStore.setItemAsync(keyName, encodeBase64(key), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  return key;
}
