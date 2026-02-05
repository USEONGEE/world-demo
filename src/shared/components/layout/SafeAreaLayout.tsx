'use client'

import { useSafeAreaInsets } from '@/core/minikit'
import { ReactNode } from 'react'

const MIN_HORIZONTAL_PADDING = 24
const TAB_BAR_HEIGHT = 60

export function SafeAreaLayout({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets()

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        paddingTop: insets.top,
        paddingBottom: Math.max(insets.bottom, TAB_BAR_HEIGHT),
        paddingLeft: Math.max(insets.left, MIN_HORIZONTAL_PADDING),
        paddingRight: Math.max(insets.right, MIN_HORIZONTAL_PADDING),
      }}
    >
      {children}
    </div>
  )
}
