import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import sv from './locales/sv.json';
import es from './locales/es.json';
import sw from './locales/sw.json';

const resources = {
  en: { translation: en },
  sv: { translation: sv },
  es: { translation: es },
  sw: { translation: sw },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n; 