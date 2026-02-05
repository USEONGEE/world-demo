export interface ConsentState {
  consent: boolean | null
  isHydrated: boolean
  grantConsent: () => void
  declineConsent: () => void
  setHydrated: () => void
}
