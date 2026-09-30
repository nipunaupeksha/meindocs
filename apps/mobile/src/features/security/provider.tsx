import { AppState, type AppStateStatus } from 'react-native';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  authenticateDevice,
  biometricAvailability,
  readSecurityState,
  writeSecurityState,
} from './native';
import { shouldLock, type AutoLockTimeout, type SecurityState } from './state';

type SecurityContextValue = {
  state: SecurityState;
  loading: boolean;
  locked: boolean;
  setState: (patch: Partial<SecurityState>) => Promise<void>;
  unlock: () => Promise<boolean>;
  refreshBiometrics: () => Promise<{ available: boolean; types: number[] }>;
};
const SecurityContext = createContext<SecurityContextValue | null>(null);
export function SecurityProvider({ children }: PropsWithChildren) {
  const [state, setStateValue] = useState<SecurityState>({
    onboardingComplete: false,
    language: 'en',
    biometricEnabled: false,
    autoLockTimeout: 300_000,
    notificationsSkipped: false,
    backupSkipped: false,
  });
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  useEffect(() => {
    void readSecurityState().then((stored) => {
      setStateValue(stored);
      setLoading(false);
      if (stored.onboardingComplete && stored.biometricEnabled) setLocked(true);
    });
  }, []);
  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (next === 'background') void update({ lastBackgroundAt: Date.now() });
      if (next === 'active' && shouldLock(stateRef.current)) setLocked(true);
    };
    const subscription = AppState.addEventListener('change', onChange);
    return () => subscription.remove();
  }, []);
  async function update(patch: Partial<SecurityState>) {
    const next = { ...stateRef.current, ...patch };
    stateRef.current = next;
    setStateValue(next);
    await writeSecurityState(next);
  }
  async function unlock() {
    const success = await authenticateDevice();
    if (success) {
      setLocked(false);
      await update({ lastBackgroundAt: undefined });
    }
    return success;
  }
  return (
    <SecurityContext.Provider
      value={{
        state,
        loading,
        locked,
        setState: update,
        unlock,
        refreshBiometrics: biometricAvailability,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
}
export function useSecurity() {
  const value = useContext(SecurityContext);
  if (!value) throw new Error('SecurityProvider is required');
  return value;
}
