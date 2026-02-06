'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { useMiniKitInstalled } from '@/core/minikit'
import { useHuman, useVerify } from '../hooks'
import { cn } from '@/shared/utils'

export function VerifyButton() {
  const t = useTranslations('verify')
  const isMiniKitInstalled = useMiniKitInstalled()
  const { isHydrated, isVerified, humanId } = useHuman()
  const { verify, isVerifying, error, status, isDuplicate } = useVerify()
  const router = useRouter()

  // Not hydrated yet - show nothing to avoid hydration mismatch
  if (!isHydrated) {
    return (
      <Card className="animate-pulse">
        <div className="h-24 bg-gray-100 rounded" />
      </Card>
    )
  }

  // MiniKit not installed
  if (isMiniKitInstalled === false) {
    return (
      <Card>
        <div className="space-y-3 text-center">
          <p className="text-gray-500">{t('minikit_required')}</p>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => router.push('/bridge')}
          >
            {t('bridge_cta')}
          </Button>
          <p className="text-xs text-gray-400">{t('bridge_cta_hint')}</p>
        </div>
      </Card>
    )
  }

  // Already verified
  if (isVerified && humanId) {
    return (
      <Card className="bg-green-50 border-green-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-green-800">{t('verified')}</p>
            <p className="text-sm text-green-600">{t('human_id_prefix')}: {humanId.slice(0, 8)}...</p>
          </div>
        </div>
      </Card>
    )
  }

  // Duplicate verification (already verified with same World ID)
  if (isDuplicate) {
    return (
      <Card className="bg-yellow-50 border-yellow-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-yellow-800">{t('duplicate')}</p>
            <p className="text-sm text-yellow-600">{t('duplicate_message')}</p>
          </div>
        </div>
      </Card>
    )
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
            onClick={verify}
            variant="secondary"
            className="w-full"
            disabled={isVerifying || isMiniKitInstalled === null}
          >
            {t('retry')}
          </Button>
        </div>
      </Card>
    )
  }

  // Default: Show verify button
  return (
    <Card>
      <div className="space-y-3">
        <p className="text-gray-600 text-center">{t('description')}</p>
        <Button
          onClick={verify}
          className={cn('w-full', isVerifying && 'cursor-wait')}
          disabled={isVerifying || isMiniKitInstalled === null}
        >
          {isVerifying ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t('verifying')}
            </span>
          ) : (
            t('button')
          )}
        </Button>
      </div>
    </Card>
  )
}
