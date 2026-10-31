import { createContext, useContext, useEffect, type PropsWithChildren } from 'react';
import { useSecurity } from '@/features/security/provider';
import type { SupportedLanguage } from './languages';
import i18n from './index';

type LanguageContextValue = {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: PropsWithChildren) {
  const { state, setState } = useSecurity();

  useEffect(() => {
    void i18n.changeLanguage(state.language);
  }, [state.language]);

  async function setLanguage(language: SupportedLanguage) {
    await setState({ language });
    await i18n.changeLanguage(language);
  }

  return (
    <LanguageContext.Provider value={{ language: state.language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useAppLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('LanguageProvider is required');
  return value;
}
