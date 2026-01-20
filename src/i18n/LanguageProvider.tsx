
import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { translations, Language } from './translations';

// KEY CHANGE: Use specific key "app_lang" to ensure fresh state
const LANG_KEY = "app_lang";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['uz']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Initialize State from LocalStorage with safer parsing
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      return (stored === 'uz' || stored === 'ru' || stored === 'en') ? stored : 'uz';
    } catch {
      return 'uz';
    }
  });

  // 2. Reactive Update - Updates state AND LocalStorage
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANG_KEY, lang);
  }, []);

  // 3. Translation Function - Strongly coupled to 'language' state
  const t = useCallback((key: keyof typeof translations['uz']) => {
    const langTranslations = translations[language];
    // Fallback chain: Selected Language -> Uzbek -> Key Name
    return langTranslations[key] || translations['uz'][key] || key;
  }, [language]);

  // 4. Memoize Context Value to prevent unnecessary re-renders of consumers
  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
