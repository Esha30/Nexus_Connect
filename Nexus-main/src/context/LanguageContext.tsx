import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, LanguageCode } from '../translations';
import { useAuth } from './AuthContext';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<LanguageCode>('English');

  // Load language from user profile if available
  useEffect(() => {
    if (user?.profile?.language && Object.keys(translations).includes(user.profile.language)) {
      setLanguageState(user.profile.language as LanguageCode);
    }
  }, [user]);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
  };

  const t = (path: string): string => {
    const keys = path.split('.');
    
    // Recursive lookup helper to avoid 'any'
    const lookup = (obj: Record<string, unknown>, keyArr: string[]): string | undefined => {
      let current: unknown = obj;
      for (const key of keyArr) {
        if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
          current = (current as Record<string, unknown>)[key];
        } else {
          return undefined;
        }
      }
      return typeof current === 'string' ? current : undefined;
    };

    const result = lookup(translations[language] as unknown as Record<string, unknown>, keys);
    if (result !== undefined) return result;

    // Fallback to English
    const fallback = lookup(translations['English'] as unknown as Record<string, unknown>, keys);
    return fallback !== undefined ? fallback : path;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

export const useLanguage = useTranslation;
