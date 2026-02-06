'use client'

import { useMiniKitInstalled } from '@/core/minikit'
import { NotInstalledScreen, LoadingScreen } from '@/shared/components/states'
import { type ReactNode } from 'react'

export function AppGuard({ children }: { children: ReactNode }) {
  const isInstalled = useMiniKitInstalled()

  if (isInstalled === null) return <LoadingScreen />
  if (!isInstalled) return <NotInstalledScreen />
  return <>{children}</>
}
