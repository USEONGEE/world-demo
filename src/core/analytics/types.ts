export interface AnalyticsEvent {
  name: string
  properties?: Record<string, unknown>
  timestamp: Date
}

export interface AnalyticsTracker {
  track(event: AnalyticsEvent): void
  identify(userId: string): void
  reset(): void
}

// Event type definitions
export type AppOpenEvent = {
  name: 'app_open'
  properties: {
    launchLocation?: string | null
    language: string
    isReturningUser: boolean
  }
}

export type ConsentEvent = {
  name: 'consent_granted' | 'consent_declined'
  properties: {
    previousConsent: boolean | null
  }
}

export type LanguageChangedEvent = {
  name: 'language_changed'
  properties: {
    from: string
    to: string
  }
}

export type TabSwitchedEvent = {
  name: 'tab_switched'
  properties: {
    from: string
    to: string
  }
}
