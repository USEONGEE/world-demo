export type Human = {
  id: string
  action: string
  nullifier_hash: string
  created_at: string
}

export type HumanSession = {
  human_id: string
  iat: number
  exp: number
}

// Client state for human verification
export type VerifyStatus = 'idle' | 'verifying' | 'success' | 'error' | 'duplicate'

export interface HumanState {
  humanId: string | null
  isVerified: boolean
  isLoading: boolean
  error: string | null
  status: VerifyStatus
  isHydrated: boolean
  verify: () => Promise<void>
  checkSession: () => Promise<void>
  reset: () => void
  setHydrated: () => void
}
