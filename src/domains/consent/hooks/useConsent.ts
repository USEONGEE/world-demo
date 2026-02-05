'use client'

import { useConsentStore } from '../store/consent.store'

export function useConsent() {
  const consent = useConsentStore((s) => s.consent)
  const isHydrated = useConsentStore((s) => s.isHydrated)
  const grantConsent = useConsentStore((s) => s.grantConsent)
  const declineConsent = useConsentStore((s) => s.declineConsent)

  return {
    consent,
    isHydrated,
    hasConsented: consent === true,
    hasDeclined: consent === false,
    isPending: consent === null,
    grantConsent,
    declineConsent,
  }
}
