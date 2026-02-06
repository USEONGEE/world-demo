'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useHuman } from '@/domains/human/client/hooks'
import { LoadingScreen } from '@/shared/components/states'
import { isPublicRoute, shouldCheckSession } from '@/shared/guards/routes'

export function SessionGuard({ children }: { children: ReactNode }) {
  const { isVerified, isHydrated, checkSession } = useHuman()
  const [sessionChecked, setSessionChecked] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const isPublic = isPublicRoute(pathname)
  const needsSessionCheck = shouldCheckSession(pathname)

  useEffect(() => {
    if (!isHydrated) return
    if (!needsSessionCheck) {
      setSessionChecked(true)
      return
    }
    let isMounted = true
    setSessionChecked(false)
    checkSession()
      .catch(() => {
        // ignore - handled by checkSession state updates
      })
      .finally(() => {
        if (isMounted) setSessionChecked(true)
      })
    return () => {
      isMounted = false
    }
  }, [checkSession, isHydrated, needsSessionCheck])

  useEffect(() => {
    if (!isPublic && sessionChecked && !isVerified) {
      router.replace('/home')
    }
  }, [isPublic, isVerified, router, sessionChecked])

  if (isPublic) return <>{children}</>
  if (!isHydrated || !sessionChecked) return <LoadingScreen />
  if (!isVerified) return <LoadingScreen />
  return <>{children}</>
}
