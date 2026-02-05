'use client'

import { MiniKitProvider } from '@worldcoin/minikit-js/minikit-provider'
import { ReactNode } from 'react'

export function MiniKitClientProvider({ children }: { children: ReactNode }) {
  return (
    <MiniKitProvider props={{ appId: process.env.NEXT_PUBLIC_WLD_APP_ID! }}>
      {children}
    </MiniKitProvider>
  )
}
