'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { analytics } from '@/core/analytics'
import { cn } from '@/shared/utils'

export function TabNavigation() {
  const t = useTranslations('tabs')
  const pathname = usePathname()
  const previousPath = useRef<string | null>(null)

  const tabs = useMemo(
    () => [
      { href: '/home', label: t('home'), icon: '🏠' },
      { href: '/wallet', label: t('wallet'), icon: '👛' },
      { href: '/settings', label: t('settings'), icon: '⚙️' },
    ],
    [t]
  )

  useEffect(() => {
    const currentTab = tabs.find((tab) => tab.href === pathname)
    if (!currentTab) return

    if (previousPath.current && previousPath.current !== pathname) {
      const fromTab = tabs.find((tab) => tab.href === previousPath.current)
      if (fromTab) {
        analytics.track({
          name: 'tab_switched',
          properties: { from: fromTab.href, to: currentTab.href },
          timestamp: new Date(),
        })
      }
    }

    previousPath.current = pathname
  }, [pathname, tabs])

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
      <div className="flex justify-around items-center h-[60px]">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive ? 'text-black' : 'text-gray-400'
              )}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="text-xs mt-1">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
