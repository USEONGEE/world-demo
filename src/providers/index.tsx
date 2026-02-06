'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { MiniKitClientProvider, useLaunchLocation } from '@/core/minikit'
import { I18nProvider } from '@/core/i18n'
import { analytics } from '@/core/analytics'
import { useConsentStore } from '@/domains/consent'
import { useSettingsStore } from '@/domains/settings'
import { ErrorBoundary, OfflineScreen } from '@/shared/components/states'
import { SessionGuard, TabNavigation } from '@/shared/components/layout'
import { useOffline } from '@/shared/hooks'

import en from '@/locales/en.json'
import ko from '@/locales/ko.json'

const messages = { en, ko } as const

export function RootProviders({ children }: { children: ReactNode }) {
  const language = useSettingsStore((s) => s.language)
  const consent = useConsentStore((s) => s.consent)
  const isHydrated = useConsentStore((s) => s.isHydrated)
  const launchLocation = useLaunchLocation()
  const isOffline = useOffline()
  const hasTrackedAppOpen = useRef(false)
  const currentMessages = messages[language] || en

  useEffect(() => {
    if (!isHydrated || hasTrackedAppOpen.current) return

    analytics.track({
      name: 'app_open',
      properties: {
        launchLocation,
        language,
        isReturningUser: consent !== null,
      },
      timestamp: new Date(),
    })

    hasTrackedAppOpen.current = true
  }, [consent, isHydrated, language, launchLocation])

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    fetch('/__nextjs_devtools_config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disableDevIndicator: true }),
    }).catch(() => {})

    fetch('/__nextjs_disable_dev_indicator', { method: 'POST' }).catch(() => {})
  }, [])

  return (
    <MiniKitClientProvider>
      <I18nProvider locale={language} messages={currentMessages}>
        <ErrorBoundary>
          {isOffline ? <OfflineScreen /> : (
            <>
              <SessionGuard>{children}</SessionGuard>
              <TabNavigation />
            </>
          )}
        </ErrorBoundary>
      </I18nProvider>
    </MiniKitClientProvider>
  )
}
