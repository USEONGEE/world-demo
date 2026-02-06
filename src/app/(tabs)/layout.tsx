'use client'

import { SafeAreaLayout } from '@/shared/components/layout'

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaLayout>
      {children}
    </SafeAreaLayout>
  )
}
