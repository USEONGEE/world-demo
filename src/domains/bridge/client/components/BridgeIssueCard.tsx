'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { useHuman } from '@/domains/human/client'
import { useMiniKitInstalled } from '@/core/minikit'
import { useBridge } from '../hooks/useBridge'

function formatCode(code: string): string {
  return `${code.slice(0, 4)}-${code.slice(4)}`
}

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const t = useTranslations('bridge')
  const [remaining, setRemaining] = useState<number>(0)

  useEffect(() => {
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now()
      setRemaining(Math.max(0, Math.floor(diff / 1000)))
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60

  if (remaining <= 0) {
    return <p className="text-sm text-red-500">{t('expired')}</p>
  }

  return (
    <p className="text-sm text-gray-500">
      {t('expires_in', { time: `${minutes}:${String(seconds).padStart(2, '0')}` })}
    </p>
  )
}

export function BridgeIssueCard() {
  const t = useTranslations('bridge')
  const { isHydrated, isVerified } = useHuman()
  const isMiniKitInstalled = useMiniKitInstalled()
  const { code, expiresAt, isLoading, error, issueBridge, reset } = useBridge()

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

  // Not verified - don't show bridge card
  if (!isVerified) {
    return null
  }

  // Error state
  if (error) {
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
            onClick={() => { reset(); issueBridge() }}
            variant="secondary"
            className="w-full"
          >
            {t('retry')}
          </Button>
        </div>
      </Card>
    )
  }

  // Code issued - show code + QR
  if (code && expiresAt) {
    const bridgeUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/bridge?code=${code}`

    return (
      <Card>
        <div className="space-y-4">
          <p className="font-medium text-center">{t('code_label')}</p>
          <p className="text-3xl font-mono font-bold text-center tracking-wider">
            {formatCode(code)}
          </p>
          <div className="flex justify-center">
            <QRCodeSVG value={bridgeUrl} size={160} />
          </div>
          <CountdownTimer expiresAt={expiresAt} />
          <Button
            onClick={() => { reset(); issueBridge() }}
            variant="secondary"
            className="w-full"
            disabled={isLoading}
          >
            {t('reissue')}
          </Button>
        </div>
      </Card>
    )
  }

  // Default: Show issue button
  return (
    <Card>
      <div className="space-y-3">
        <p className="text-gray-600 text-center">{t('issue_description')}</p>
        <Button
          onClick={issueBridge}
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t('issuing')}
            </span>
          ) : (
            t('issue_button')
          )}
        </Button>
      </div>
    </Card>
  )
}
