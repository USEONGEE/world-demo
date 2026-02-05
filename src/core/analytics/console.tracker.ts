import { AnalyticsEvent, AnalyticsTracker } from './types'

const STORAGE_KEY = 'analytics_events'
const MAX_EVENTS = 100

export class ConsoleTracker implements AnalyticsTracker {
  private events: AnalyticsEvent[] = []
  private userId: string | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          this.events = JSON.parse(stored)
        } catch {
          this.events = []
        }
      }
    }
  }

  track(event: AnalyticsEvent): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event.name, event.properties)
    }

    this.events.push(event)
    if (this.events.length > MAX_EVENTS) {
      this.events = this.events.slice(-MAX_EVENTS)
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.events))
    }
  }

  identify(userId: string): void {
    this.userId = userId
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Identify:', userId)
    }
  }

  reset(): void {
    this.events = []
    this.userId = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }
}
