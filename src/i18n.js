import { createI18n } from 'vue-i18n';
import en from './lang/en.json';
import es from './lang/es.json';

const i18n = createI18n({
  locale: localStorage.getItem('lang') || 'en', // Idioma por defecto
  fallbackLocale: 'en', // Idioma de respaldo
  messages: {
    en,
    es,
  },
});

export default i18n;