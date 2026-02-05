'use client'

import { useHumanStore } from '../store/human.store'

export function useHuman() {
  const humanId = useHumanStore((s) => s.humanId)
  const isVerified = useHumanStore((s) => s.isVerified)
  const isLoading = useHumanStore((s) => s.isLoading)
  const error = useHumanStore((s) => s.error)
  const status = useHumanStore((s) => s.status)
  const isHydrated = useHumanStore((s) => s.isHydrated)
  const verify = useHumanStore((s) => s.verify)
  const checkSession = useHumanStore((s) => s.checkSession)
  const reset = useHumanStore((s) => s.reset)

  return {
    humanId,
    isVerified,
    isLoading,
    error,
    status,
    isHydrated,
    verify,
    checkSession,
    reset,
  }
}
