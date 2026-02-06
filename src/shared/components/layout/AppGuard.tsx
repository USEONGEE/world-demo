'use client'

import { usePathname } from 'next/navigation'
import { useMiniKitInstalled } from '@/core/minikit'
import { NotInstalledScreen, LoadingScreen } from '@/shared/components/states'
import { type ReactNode } from 'react'

export function AppGuard({ children }: { children: ReactNode }) {
  const isInstalled = useMiniKitInstalled()
  const pathname = usePathname()
  const allowWithoutMiniKit = pathname === '/home'

  if (isInstalled === null) return <LoadingScreen />
  if (!isInstalled && !allowWithoutMiniKit) return <NotInstalledScreen />
  return <>{children}</>
}
