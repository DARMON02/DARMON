
import { useLanguage } from './LanguageProvider';

// STRICT RE-EXPORT: Forces all components (Login, Dashboard, App) to use the SINGLE LanguageProvider instance.
export const useI18n = useLanguage;
