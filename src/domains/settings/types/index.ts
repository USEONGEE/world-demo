import type { Locale } from '@/core/i18n'

export interface SettingsState {
  language: Locale
  setLanguage: (lang: Locale) => void
}
