import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { defaultSecurityState, type SecurityState } from './state';

const stateKey = 'meindocs.security.state.v1';

export async function readSecurityState(): Promise<SecurityState> {
  const stored = await SecureStore.getItemAsync(stateKey);
  if (!stored) return defaultSecurityState;
  try {
    return { ...defaultSecurityState, ...JSON.parse(stored) } as SecurityState;
  } catch {
    return defaultSecurityState;
  }
}

export async function writeSecurityState(state: SecurityState) {
  await SecureStore.setItemAsync(stateKey, JSON.stringify(state), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function biometricAvailability() {
  const [hardware, enrolled, types] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
    LocalAuthentication.supportedAuthenticationTypesAsync(),
  ]);
  return { available: hardware && enrolled, types };
}

export async function authenticateDevice() {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock MeinDocs',
    disableDeviceFallback: false,
    cancelLabel: 'Cancel',
  });
  return result.success;
}
