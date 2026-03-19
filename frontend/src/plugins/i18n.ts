import { createI18n } from 'vue-i18n'
import pt from '../locales/pt.json'
import en from '../locales/en.json'
import projetoPT from '../modules/Projeto/locales/pt.json'
import projetoEN from '../modules/Projeto/locales/en.json'
import moduloPT from '../modules/Modulo/locales/pt.json'
import moduloEN from '../modules/Modulo/locales/en.json'
import documentoPT from '../modules/Documento/locales/pt.json'
import documentoEN from '../modules/Documento/locales/en.json'


const savedLanguage = localStorage.getItem('language')

const messages = {
  pt: {
    ...pt,
    ...projetoPT,
    ...moduloPT,
    ...documentoPT,
  },
  en: {
    ...en,
    ...projetoEN,
    ...moduloEN,
    ...documentoEN,
  }
}

export const i18n = createI18n({
  legacy: false,
  locale: savedLanguage || 'en',
  fallbackLocale: 'pt',
  messages
})