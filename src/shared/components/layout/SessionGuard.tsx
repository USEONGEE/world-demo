'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useHuman } from '@/domains/human/client/hooks'
import { LoadingScreen } from '@/shared/components/states'

const PUBLIC_PATHS = new Set(['/','/home','/bridge','/consent'])

export function SessionGuard({ children }: { children: ReactNode }) {
  const { isVerified, isHydrated, checkSession } = useHuman()
  const [sessionChecked, setSessionChecked] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const isPublic = PUBLIC_PATHS.has(pathname)

  useEffect(() => {
    if (!isHydrated || isPublic) return
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
  }, [checkSession, isHydrated, isPublic, pathname])

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
