'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { useBrowserWallet } from '@/domains/bridge/client/hooks/useBrowserWallet'

export default function BridgeConnectPage() {
  const t = useTranslations('bridge')
  const router = useRouter()
  const { address, status, error, hasEthereum, connectAndBind, reset } = useBrowserWallet()
  const [sessionChecked, setSessionChecked] = useState(false)

  // Check session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/human/me')
        if (!res.ok) {
          router.push('/bridge')
          return
        }
        setSessionChecked(true)
      } catch {
        router.push('/bridge')
      }
    }
    checkSession()
  }, [router])

  if (!sessionChecked) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-gray-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </Card>
    )
  }

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

  // Success state
  if (status === 'success' && address) {
    return (
      <Card className="bg-green-50 border-green-200">
        <div className="space-y-3 text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-bold text-green-800">{t('bind_success_title')}</h2>
          <p className="text-sm text-green-600 font-mono break-all">{address}</p>
          <p className="text-sm text-green-600">{t('bind_success_message')}</p>
        </div>
      </Card>
    )
  }

  // Error state
  if (status === 'error' && error) {
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
              <p className="font-medium text-red-800">{t('bind_error')}</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
          <Button
            onClick={() => { reset(); connectAndBind() }}
            variant="secondary"
            className="w-full"
          >
            {t('retry')}
          </Button>
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
        return t('connect_wallet_button')
    }
  }

  const isLoading = status === 'connecting' || status === 'signing' || status === 'verifying'

  // Default: Connect wallet button
  return (
    <Card>
      <div className="space-y-4">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">{t('connect_wallet_title')}</h1>
          <p className="text-gray-600 text-sm">{t('connect_wallet_description')}</p>
        </div>

        <Button
          onClick={connectAndBind}
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
            getStatusText()
          )}
        </Button>
      </div>
    </Card>
  )
}
