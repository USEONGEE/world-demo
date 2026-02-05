'use client'

import { AppGuard, SafeAreaLayout, TabNavigation } from '@/shared/components/layout'

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppGuard>
      <SafeAreaLayout>
        {children}
        <TabNavigation />
      </SafeAreaLayout>
    </AppGuard>
  )
}
