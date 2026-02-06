'use client'

import { useCallback } from 'react'
import { useBridgeStore } from '../store/bridge.store'

export function useBridge() {
  const {
    code,
    expiresAt,
    isLoading,
    error,
    issueBridge,
    reset,
  } = useBridgeStore()

  const handleIssueBridge = useCallback(async () => {
    await issueBridge()
  }, [issueBridge])

  return {
    code,
    expiresAt,
    isLoading,
    error,
    issueBridge: handleIssueBridge,
    reset,
  }
}
