// @ts-nocheck
import { expect, test } from 'bun:test';
import { defaultSecurityState, shouldLock } from './state';

test('new installs do not lock before onboarding', () => {
  expect(defaultSecurityState.onboardingComplete).toBe(false);
  expect(shouldLock({ biometricEnabled: false, autoLockTimeout: 30000, lastBackgroundAt: 0 })).toBe(
    false,
  );
});

test('auto-lock activates after configured timeout', () => {
  const background = 1000;
  expect(
    shouldLock(
      { biometricEnabled: true, autoLockTimeout: 30000, lastBackgroundAt: background },
      background + 30000,
    ),
  ).toBe(true);
  expect(
    shouldLock(
      { biometricEnabled: true, autoLockTimeout: 30000, lastBackgroundAt: background },
      background + 29999,
    ),
  ).toBe(false);
});
