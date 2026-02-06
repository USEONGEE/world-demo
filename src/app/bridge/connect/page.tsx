'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { useBrowserWallet } from '@/domains/bridge/client/hooks/useBrowserWallet'
import { cn } from '@/shared/utils'

export default function BridgeConnectPage() {
  const t = useTranslations('bridge')
  const {
    address,
    isBound,
    isChecking,
    status,
    error,
    hasEthereum,
    connectWallet,
    connectAndBind,
    reset,
  } = useBrowserWallet()

  // MetaMask not installed
  if (!hasEthereum) {
    return (
      <Card className="bg-yellow-50 border-yellow-200">
        <div className="space-y-3 text-center">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="font-bold text-yellow-800">{t('no_wallet_title')}</h2>
          <p className="text-sm text-yellow-600">{t('no_wallet_description')}</p>
        </div>
      </Card>
    )
  }

  // Get loading text
  const getStatusText = () => {
    switch (status) {
      case 'connecting':
        return t('connecting_wallet')
      case 'signing':
        return t('signing_message')
      case 'verifying':
        return t('verifying_signature')
      default:
        return t('bind_wallet_button')
    }
  }

  const isLoading = status === 'connecting' || status === 'signing' || status === 'verifying'

  if (!address) {
    return (
      <Card>
        <div className="space-y-4">
          <div className="text-center">
            <h1 className="text-xl font-bold mb-2">{t('connect_wallet_title')}</h1>
            <p className="text-gray-600 text-sm">{t('connect_wallet_description')}</p>
          </div>

          {status === 'error' && error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button
            onClick={() => { reset(); connectWallet() }}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {getStatusText()}
              </span>
            ) : (
              t('connect_wallet_button')
            )}
          </Button>
        </div>
      </Card>
    )
  }

  const statusLabel = isChecking
    ? t('wallet_checking')
    : isBound
      ? t('wallet_bound')
      : t('wallet_unbound')

  const statusClass = isChecking
    ? 'text-gray-500'
    : isBound
      ? 'text-green-600'
      : 'text-yellow-700'

  return (
    <Card>
      <div className="space-y-4">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">{t('wallet_detected_title')}</h1>
          <p className="text-gray-600 text-sm">{t('wallet_detected_message')}</p>
        </div>

        <div className="rounded-lg border border-gray-200 px-4 py-3 text-center">
          <p className="font-mono text-sm break-all">{address}</p>
          <p className={cn('text-xs mt-2', statusClass)}>{statusLabel}</p>
        </div>

        {status === 'error' && error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <Button
          onClick={() => { reset(); connectAndBind() }}
          className="w-full"
          disabled={isLoading || isChecking || isBound === true}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {getStatusText()}
            </span>
          ) : (
            t('bind_wallet_button')
          )}
        </Button>

        <Button
          onClick={() => { reset(); connectWallet() }}
          variant="secondary"
          className="w-full"
          disabled={isLoading}
        >
          {t('switch_wallet_button')}
        </Button>
      </div>
    </Card>
  )
}
