'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { useMiniKitInstalled } from '@/core/minikit'
import { useHuman } from '@/domains/human/client'
import { useWalletBinding } from '../hooks/useWalletBinding'
import { cn } from '@/shared/utils'

export function WalletBindingButton() {
  const t = useTranslations('wallet')
  const isMiniKitInstalled = useMiniKitInstalled()
  const { isHydrated, isVerified } = useHuman()
  const { status, error, bindWallet, isLoading } = useWalletBinding()

  // Not hydrated yet
  if (!isHydrated) {
    return (
      <Card className="animate-pulse">
        <div className="h-16 bg-gray-100 rounded" />
      </Card>
    )
  }

  // MiniKit not installed
  if (isMiniKitInstalled === false) {
    return (
      <Card>
        <p className="text-gray-500 text-center">{t('minikit_required')}</p>
      </Card>
    )
  }

  // Not verified - need to verify first
  if (!isVerified) {
    return (
      <Card className="bg-yellow-50 border-yellow-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-yellow-800">{t('login_required')}</p>
            <p className="text-sm text-yellow-600">{t('login_required_message')}</p>
          </div>
        </div>
      </Card>
    )
  }

  // Success state
  if (status === 'success') {
    return (
      <Card className="bg-green-50 border-green-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-green-800">{t('wallet_connected')}</p>
            <p className="text-sm text-green-600">{t('wallet_connected_message')}</p>
          </div>
        </div>
      </Card>
    )
  }

  // Error state
  if (error && status === 'error') {
    return (
      <Card className="bg-red-50 border-red-200">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-red-800">{t('error')}</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
          <Button
            onClick={bindWallet}
            variant="secondary"
            className="w-full"
            disabled={isLoading || isMiniKitInstalled === null}
          >
            {t('retry')}
          </Button>
        </div>
      </Card>
    )
  }

  // Get loading text based on status
  const getLoadingText = () => {
    switch (status) {
      case 'loading':
        return t('loading')
      case 'signing':
        return t('signing')
      case 'verifying':
        return t('verifying')
      default:
        return t('button')
    }
  }

  // Default: Show bind button
  return (
    <Card>
      <div className="space-y-3">
        <p className="text-gray-600 text-center">{t('description')}</p>
        <Button
          onClick={bindWallet}
          className={cn('w-full', isLoading && 'cursor-wait')}
          disabled={isLoading || isMiniKitInstalled === null}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {getLoadingText()}
            </span>
          ) : (
            t('button')
          )}
        </Button>
      </div>
    </Card>
  )
}
