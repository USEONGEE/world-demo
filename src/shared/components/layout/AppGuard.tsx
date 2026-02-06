'use client'

import { usePathname } from 'next/navigation'
import { useMiniKitInstalled } from '@/core/minikit'
import { NotInstalledScreen, LoadingScreen } from '@/shared/components/states'
import { allowWithoutMiniKit } from '@/shared/guards/routes'
import { type ReactNode } from 'react'

export function AppGuard({ children }: { children: ReactNode }) {
  const isInstalled = useMiniKitInstalled()
  const pathname = usePathname()
  const isOptional = allowWithoutMiniKit(pathname)

  if (isInstalled === null) return <LoadingScreen />
  if (!isInstalled && !isOptional) return <NotInstalledScreen />
  return <>{children}</>
}
