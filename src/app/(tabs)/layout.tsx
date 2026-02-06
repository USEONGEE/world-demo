'use client'

import { AppGuard, SafeAreaLayout } from '@/shared/components/layout'

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppGuard>
      <SafeAreaLayout>
        {children}
      </SafeAreaLayout>
    </AppGuard>
  )
}
