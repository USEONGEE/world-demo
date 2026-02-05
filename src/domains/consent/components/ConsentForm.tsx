'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button, Card } from '@/shared/components/ui'
import { useConsent } from '../hooks/useConsent'

export function ConsentForm() {
  const router = useRouter()
  const t = useTranslations('consent')
  const { grantConsent, declineConsent } = useConsent()

  const handleAccept = () => {
    grantConsent()
    router.replace('/home')
  }

  const handleDecline = () => {
    declineConsent()
    // User can still use app but analytics won't be collected
    router.replace('/home')
  }

  return (
    <Card className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
      <p className="text-gray-600 mb-6">{t('description')}</p>
      <div className="flex flex-col gap-3">
        <Button onClick={handleAccept} size="lg">
          {t('accept')}
        </Button>
        <Button onClick={handleDecline} variant="secondary" size="lg">
          {t('decline')}
        </Button>
      </div>
    </Card>
  )
}
