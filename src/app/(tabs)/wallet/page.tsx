'use client'

import { useCallback, useEffect, useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { useTranslations } from 'next-intl'
import { WalletBindingButton, WalletList } from '@/domains/wallet/client'
import { BridgeIssueCard } from '@/domains/bridge/client'
import { useMiniKitInstalled } from '@/core/minikit'
import { useWalletStore } from '@/domains/wallet/client/store/wallet.store'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'

export default function WalletPage() {
  const t = useTranslations('wallet')
  const isMiniKitInstalled = useMiniKitInstalled()
  const fetchWallets = useWalletStore((state) => state.fetchWallets)
  const requestWalletAuth = useWalletStore((state) => state.requestWalletAuth)
  const verifyWalletAuth = useWalletStore((state) => state.verifyWalletAuth)
  const status = useWalletStore((state) => state.status)
  const error = useWalletStore((state) => state.error)
  const isLoading = useWalletStore((state) => state.isLoading)
  const [autoAttempted, setAutoAttempted] = useState(false)
  const [autoResolved, setAutoResolved] = useState(false)

  const needsWalletAuth = isMiniKitInstalled === true && !autoResolved

  const isAddressBound = useCallback((address: string, wallets: { address: string }[]) => {
    return wallets.some((wallet) => wallet.address.toLowerCase() === address.toLowerCase())
  }, [])

  const runAutoWalletFlow = useCallback(async () => {
    setAutoAttempted(true)

    try {
      const wallets = await fetchWallets()
      const existingAddress = MiniKit.user?.walletAddress

      if (existingAddress) {
        if (isAddressBound(existingAddress, wallets)) {
          setAutoResolved(true)
          useWalletStore.setState({ isLoading: false, error: null, status: 'success' })
          return
        }

        const auth = await requestWalletAuth({ force: true })
        await verifyWalletAuth(auth)
        setAutoResolved(true)
        return
      }

      const auth = await requestWalletAuth({ force: true })

      const address = auth.address.toLowerCase()
      const isBound = wallets.some((wallet) => wallet.address.toLowerCase() === address)

      if (isBound) {
        setAutoResolved(true)
        useWalletStore.setState({ isLoading: false, error: null, status: 'success' })
        return
      }

      if (!auth.payload || !auth.nonce) {
        setAutoResolved(true)
        useWalletStore.setState({ isLoading: false, error: null, status: 'idle' })
        return
      }

      await verifyWalletAuth(auth)
      setAutoResolved(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : t('auto_auth_error')
      useWalletStore.setState({ isLoading: false, error: message, status: 'error' })
    }
  }, [fetchWallets, isAddressBound, requestWalletAuth, t, verifyWalletAuth])

  useEffect(() => {
    if (!needsWalletAuth || autoAttempted || isLoading) return
    runAutoWalletFlow()
  }, [autoAttempted, isLoading, needsWalletAuth, runAutoWalletFlow])

  if (needsWalletAuth) {
    const statusText =
      status === 'signing'
        ? t('signing')
        : status === 'verifying'
          ? t('verifying')
          : t('loading')

    const buttonLabel = error ? t('retry') : t('auto_auth_button')

    return (
      <div className="py-8">
        <Card>
          <div className="space-y-4 text-center">
            <div>
              <h1 className="text-xl font-bold mb-2">{t('auto_auth_title')}</h1>
              <p className="text-gray-600 text-sm">{t('auto_auth_description')}</p>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <Button
              onClick={runAutoWalletFlow}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {statusText}
                </span>
              ) : (
                buttonLabel
              )}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="py-8 space-y-8">
      <WalletList />
      <WalletBindingButton />
      <BridgeIssueCard />
    </div>
  )
}
