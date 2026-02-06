'use client'

import { useTranslations } from 'next-intl'
import { Card } from '@/shared/components/ui/Card'
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
  const { wallets, isLoading } = useWalletBinding()

  // Loading state
  if (isLoading && wallets.length === 0) {
    return (
      <Card className="animate-pulse">
        <div className="h-20 bg-gray-100 rounded" />
      </Card>
    )
  }

  // Empty state
  if (wallets.length === 0) {
    return (
      <Card>
        <p className="text-gray-500 text-center">{t('no_wallets')}</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium text-gray-900">{t('connected_wallets')}</h3>
      <div className="space-y-2">
        {wallets.map((wallet) => (
          <Card key={`${wallet.chain}-${wallet.address}`} className="flex items-center justify-between">
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
              </div>
            </div>
            <span className="text-xs text-gray-400 uppercase">{wallet.chain}</span>
          </Card>
        ))}
      </div>
    </div>
  )
}
