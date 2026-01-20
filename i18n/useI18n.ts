
import { useState, useEffect } from 'react';
import { translations, Language } from './translations';

const LANG_KEY = "app:language";

export const useI18n = () => {
  const [language, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem(LANG_KEY);
    return (stored === 'uz' || stored === 'ru' || stored === 'en') ? stored : 'uz';
  });

  const setLanguage = (lang: Language) => {
    setLangState(lang);
    localStorage.setItem(LANG_KEY, lang);
  };

  const t = (key: keyof typeof translations['uz']) => {
    return translations[language][key] || key;
  };

  return { language, setLanguage, t };
};
