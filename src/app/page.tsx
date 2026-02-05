'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useConsentStore } from '@/domains/consent'
import { LoadingScreen } from '@/shared/components/states'

export default function RootPage() {
  const router = useRouter()
  const consent = useConsentStore((s) => s.consent)
  const isHydrated = useConsentStore((s) => s.isHydrated)

  useEffect(() => {
    if (!isHydrated) return

    if (consent === null) {
      router.replace('/consent')
    } else {
      router.replace('/home')
    }
  }, [consent, isHydrated, router])

  return <LoadingScreen />
}
