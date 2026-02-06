'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js'
import { useTranslations } from 'next-intl'
import { Card } from '@/shared/components/ui/Card'
import { Button } from '@/shared/components/ui/Button'
import { useMiniKitInstalled } from '@/core/minikit'
import { cn } from '@/shared/utils'

const VERIFY_TIMEOUT = 10000
const VERIFY_ACTION = 'verify_human'

type ProofPayload = {
  merkle_root: string
  nullifier_hash: string
  proof: string
  verification_level?: string
}

type WorkerStatus = 'idle' | 'verifying' | 'success' | 'error'

export default function WorkerPage() {
  const t = useTranslations('worker')
  const isMiniKitInstalled = useMiniKitInstalled()
  const [status, setStatus] = useState<WorkerStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [payload, setPayload] = useState<ProofPayload | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const displayPayload = useMemo(() => {
    if (!payload) return ''
    return JSON.stringify(payload, null, 2)
  }, [payload])

  const handleVerify = useCallback(async () => {
    setStatus('verifying')
    setError(null)
    setCopied(false)

    try {
      if (isMiniKitInstalled !== true) {
        throw new Error(t('minikit_required'))
      }

      const verifyPromise = MiniKit.commandsAsync.verify({
        action: VERIFY_ACTION,
        verification_level: VerificationLevel.Device,
      })

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Verification timeout')), VERIFY_TIMEOUT)
      )

      const result = await Promise.race([verifyPromise, timeoutPromise])
      const finalPayload = result.finalPayload

      if ('status' in finalPayload && finalPayload.status !== 'success') {
        throw new Error(String(finalPayload.status ?? t('error_unknown')))
      }

      setPayload({
        merkle_root: finalPayload.merkle_root,
        nullifier_hash: finalPayload.nullifier_hash,
        proof: finalPayload.proof,
        verification_level: finalPayload.verification_level,
      })
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : t('error_unknown'))
    }
  }, [isMiniKitInstalled, t])

  const handleCopy = useCallback(async () => {
    if (!displayPayload) return
    await navigator.clipboard.writeText(displayPayload)
    setCopied(true)
  }, [displayPayload])

  if (isMiniKitInstalled === false) {
    return (
      <div className="py-8">
        <Card>
          <p className="text-gray-500 text-center">{t('minikit_required')}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="py-8 space-y-6">
      <Card>
        <div className="space-y-3 text-center">
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <p className="text-gray-600 text-sm">{t('description')}</p>
          <Button
            onClick={handleVerify}
            className={cn('w-full', status === 'verifying' && 'cursor-wait')}
            disabled={status === 'verifying' || isMiniKitInstalled === null}
          >
            {status === 'verifying' ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('verifying')}
              </span>
            ) : (
              t('verify_button')
            )}
          </Button>
        </div>
      </Card>

      {status === 'error' && error && (
        <Card className="bg-red-50 border-red-200">
          <div className="space-y-2">
            <p className="font-medium text-red-800">{t('error')}</p>
            <p className="text-sm text-red-600">{error}</p>
            <Button onClick={handleVerify} variant="secondary" className="w-full">
              {t('retry')}
            </Button>
          </div>
        </Card>
      )}

      {payload && (
        <Card>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{t('payload_title')}</h2>
              <Button
                onClick={handleCopy}
                variant="secondary"
                size="sm"
                disabled={!displayPayload}
              >
                {copied ? t('copied') : t('copy')}
              </Button>
            </div>
            <pre className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-auto">
              {displayPayload}
            </pre>
          </div>
        </Card>
      )}
    </div>
  )
}
