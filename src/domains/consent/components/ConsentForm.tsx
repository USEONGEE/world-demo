'use client'

import { useRouter } from 'next/navigation'
import { Button, Card } from '@/shared/components/ui'
import { useConsent } from '../hooks/useConsent'

export function ConsentForm() {
  const router = useRouter()
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
      <h1 className="text-2xl font-bold mb-4">Data Collection</h1>
      <p className="text-gray-600 mb-6">
        We collect anonymous usage data to improve our service. This helps us
        understand how the app is used and make it better for everyone.
      </p>
      <div className="flex flex-col gap-3">
        <Button onClick={handleAccept} size="lg">
          I Agree
        </Button>
        <Button onClick={handleDecline} variant="secondary" size="lg">
          Decline
        </Button>
      </div>
    </Card>
  )
}
