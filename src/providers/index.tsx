'use client'

import { ReactNode } from 'react'
import { MiniKitClientProvider } from '@/core/minikit'
import { I18nProvider } from '@/core/i18n'
import { useSettingsStore } from '@/domains/settings'

import en from '@/locales/en.json'
import es from '@/locales/es.json'
import th from '@/locales/th.json'
import ja from '@/locales/ja.json'
import ko from '@/locales/ko.json'
import pt from '@/locales/pt.json'

const messages = { en, es, th, ja, ko, pt } as const

export function RootProviders({ children }: { children: ReactNode }) {
  const language = useSettingsStore((s) => s.language)
  const currentMessages = messages[language] || en

  return (
    <MiniKitClientProvider>
      <I18nProvider locale={language} messages={currentMessages}>
        {children}
      </I18nProvider>
    </MiniKitClientProvider>
  )
}
