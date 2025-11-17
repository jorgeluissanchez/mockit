import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import es from './locales/es.json'
import en from './locales/en.json'

i18n
  // Detectar idioma del navegador
  .use(LanguageDetector)
  // Integrar con React
  .use(initReactI18next)
  // Inicializar i18next
  .init({
    resources: {
      es: es,
      en: en
    },
    fallbackLng: 'es',
    defaultNS: 'translation',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    },
    
    interpolation: {
      escapeValue: false // React ya escapa por defecto
    },
    
    react: {
      useSuspense: false
    }
  })

export default i18n

