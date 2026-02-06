'use client'

import { useCallback, useEffect } from 'react'
import { useWalletStore } from '../store/wallet.store'

/**
 * Hook for wallet binding functionality
 * Provides wallet list and binding actions
 */
export function useWalletBinding() {
  const {
    wallets,
    isLoading,
    error,
    status,
    fetchWallets,
    bindWallet,
    reset,
  } = useWalletStore()

  // Fetch wallets on mount
  useEffect(() => {
    fetchWallets()
  }, [fetchWallets])

  // Memoized bind function
  const handleBindWallet = useCallback(async () => {
    await bindWallet()
  }, [bindWallet])

  return {
    wallets,
    isLoading,
    error,
    status,
    bindWallet: handleBindWallet,
    fetchWallets,
    reset,
  }
}
