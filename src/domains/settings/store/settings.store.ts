import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { analytics } from '@/core/analytics'
import type { Locale } from '@/core/i18n'
import type { SettingsState } from '../types'

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      language: 'en' as Locale,
      setLanguage: (language: Locale) => {
        const from = get().language
        set({ language })
        analytics.track({
          name: 'language_changed',
          properties: { from, to: language },
          timestamp: new Date(),
        })
      },
    }),
    { name: 'world-gate-settings' }
  )
)
