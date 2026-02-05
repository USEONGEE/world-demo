'use client'

import { useSettingsStore } from '../store/settings.store'

export function useLanguage() {
  const language = useSettingsStore((s) => s.language)
  const setLanguage = useSettingsStore((s) => s.setLanguage)

  return { language, setLanguage }
}
