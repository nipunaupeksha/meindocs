export type AutoLockTimeout = 0 | 30_000 | 300_000 | 900_000;
export type SecurityState = {
  onboardingComplete: boolean;
  language: 'en' | 'de';
  biometricEnabled: boolean;
  autoLockTimeout: AutoLockTimeout;
  notificationsSkipped: boolean;
  backupSkipped: boolean;
  lastBackgroundAt?: number;
};

export const defaultSecurityState: SecurityState = {
  onboardingComplete: false,
  language: 'en',
  biometricEnabled: false,
  autoLockTimeout: 300_000,
  notificationsSkipped: false,
  backupSkipped: false,
};
export function shouldLock(
  state: Pick<SecurityState, 'biometricEnabled' | 'autoLockTimeout' | 'lastBackgroundAt'>,
  now = Date.now(),
) {
  if (!state.biometricEnabled || state.autoLockTimeout === 0 || !state.lastBackgroundAt)
    return false;
  return now - state.lastBackgroundAt >= state.autoLockTimeout;
}
