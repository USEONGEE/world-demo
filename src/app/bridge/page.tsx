'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { analytics } from '@/core/analytics'

function BridgeCodeForm() {
  const t = useTranslations('bridge')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  const initialCode = searchParams.get('code') ?? ''
  const normalizedInitial = useMemo(() => {
    return initialCode
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .replace(/[IO01]/g, '')
      .slice(0, 8)
  }, [initialCode])
  const [code, setCode] = useState<string>(normalizedInitial)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    async function checkSession() {
      try {
        const res = await fetch('/api/human/me')
        if (!isMounted) return
        if (res.ok) {
          router.replace('/bridge/connect')
          return
        }
        setHasSession(false)
      } catch {
        if (!isMounted) return
        setHasSession(false)
      }
    }
    checkSession()
    return () => {
      isMounted = false
    }
  }, [])

  if (hasSession === null) {
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

  const handleChange = (value: string) => {
    const cleaned = value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .replace(/[IO01]/g, '')
      .slice(0, 8)
    setCode(cleaned)
    setError(null)
  }

  const handleSubmit = async () => {
    if (code.length !== 8) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/bridge/consume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorCode = errorData.error?.code
        const errorMessage =
          errorCode === 'INVALID_BRIDGE_CODE'
            ? t('error_not_found')
            : errorCode === 'BRIDGE_EXPIRED'
              ? t('error_expired')
              : errorCode === 'BRIDGE_ALREADY_USED'
                ? t('error_already_used')
                : errorCode === 'RATE_LIMITED'
                  ? t('error_rate_limited')
                : errorData.error?.message ?? t('error_unknown')
        analytics.track({
          name: 'bridge_code_consume_fail',
          properties: { reason: errorCode ?? errorMessage },
          timestamp: new Date(),
        })
        throw new Error(errorMessage)
      }

      analytics.track({
        name: 'bridge_code_consumed',
        properties: {},
        timestamp: new Date(),
      })
      router.push('/bridge/connect')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error_unknown'))
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">{t('enter_code_title')}</h1>
          <p className="text-gray-600 text-sm">{t('enter_code_description')}</p>
        </div>

        <div>
          <input
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            value={code}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="7K3M9T2Q"
            className="w-full text-center text-3xl font-mono tracking-[0.35em] border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-black"
            maxLength={8}
            autoFocus
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={code.length !== 8 || isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t('verifying_code')}
            </span>
          ) : (
            t('submit_code')
          )}
        </Button>
      </div>
    </Card>
  )
}

export default function BridgeCodePage() {
  return (
    <Suspense
      fallback={
        <Card>
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-gray-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        </Card>
      }
    >
      <BridgeCodeForm />
    </Suspense>
  )
}
