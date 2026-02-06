'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { analytics } from '@/core/analytics'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { useWalletBinding } from '../hooks/useWalletBinding'

// Truncate address to 0x1234...5678 format
function truncateAddress(address: string): string {
  if (address.length <= 13) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Format date to locale string
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function WalletList() {
  const t = useTranslations('wallet')
  const router = useRouter()
  const { wallets, isLoading, error, fetchWallets } = useWalletBinding()
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (!copiedAddress) return
    const timer = setTimeout(() => setCopiedAddress(null), 2000)
    return () => clearTimeout(timer)
  }, [copiedAddress])

  const handleCopyAddress = useCallback(async (address: string) => {
    await navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    analytics.track({
      name: 'wallet_copy',
      properties: { address },
      timestamp: new Date(),
    })
  }, [])

  const handleOpenTax = useCallback((address: string) => {
    router.push(`/tax?address=${encodeURIComponent(address)}`)
  }, [router])

  // Track wallet list view once when wallets are loaded (even if empty)
  const hasTrackedView = useRef(false)
  useEffect(() => {
    if (hasTrackedView.current || isLoading || error) return
    hasTrackedView.current = true
    analytics.track({
      name: 'wallet_list_view',
      properties: { count: wallets.length },
      timestamp: new Date(),
    })
  }, [error, isLoading, wallets.length])

  // Loading state
  if (isLoading && wallets.length === 0) {
    return (
      <Card className="animate-pulse">
        <div className="h-20 bg-gray-100 rounded" />
      </Card>
    )
  }

  // Error state
  if (error) {
    const isTimeout = error.toLowerCase().includes('timeout')
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
              <p className="text-sm text-red-600">{t('fetch_error')}</p>
              {isTimeout && (
                <p className="text-xs text-red-500 mt-1">{t('timeout_hint')}</p>
              )}
            </div>
          </div>
          <Button onClick={fetchWallets} variant="secondary" className="w-full">
            {t('retry')}
          </Button>
        </div>
      </Card>
    )
  }

  // Empty state
  if (wallets.length === 0) {
    return (
      <Card>
        <div className="text-center space-y-1">
          <p className="text-gray-500">{t('no_wallets')}</p>
          <p className="text-sm text-gray-400">{t('description')}</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium text-gray-900">{t('connected_wallets')}</h3>
      <div className="space-y-2">
        {wallets.map((wallet) => (
          <Card
            key={`${wallet.chain}-${wallet.address}`}
            className="flex items-center justify-between cursor-pointer hover:border-gray-300"
            role="button"
            tabIndex={0}
            onClick={() => handleOpenTax(wallet.address)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleOpenTax(wallet.address)
              }
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <p className="font-mono text-sm font-medium text-gray-900">
                  {truncateAddress(wallet.address)}
                </p>
                <p className="text-xs text-gray-500">
                  {t('verified_on')} {formatDate(wallet.verified_at)}
                </p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {t('verified')} · {wallet.verification_method}
                </span>
                <p className="text-xs text-blue-600 mt-1">{t('view_tax_hint')}</p>
              </div>
            </div>
            <button
              onClick={(event) => {
                event.stopPropagation()
                handleCopyAddress(wallet.address)
              }}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={copiedAddress === wallet.address ? t('copied') : t('copy_address')}
            >
              {copiedAddress === wallet.address ? (
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </Card>
        ))}
      </div>
    </div>
  )
}
