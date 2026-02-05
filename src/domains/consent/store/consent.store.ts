import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { analytics } from '@/core/analytics'
import type { ConsentState } from '../types'

export const useConsentStore = create<ConsentState>()(
  persist(
    (set, get) => ({
      consent: null,
      isHydrated: false,
      grantConsent: () => {
        const prev = get().consent
        set({ consent: true })
        analytics.track({
          name: 'consent_granted',
          properties: { previousConsent: prev },
          timestamp: new Date(),
        })
      },
      declineConsent: () => {
        const prev = get().consent
        set({ consent: false })
        analytics.track({
          name: 'consent_declined',
          properties: { previousConsent: prev },
          timestamp: new Date(),
        })
      },
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'world-gate-consent',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    }
  )
)
