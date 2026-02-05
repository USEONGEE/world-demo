# Step 04: shared/components 기반 UI

## 메타데이터
- **난이도**: 🟡 보통
- **롤백 가능**: ✅
- **선행 조건**: Step 01 완료
- **레이어**: shared (0) - 범용 UI

---

## 1. 구현 내용 (design.md 기반)

- shared/components/ui/ 기본 UI 컴포넌트
- shared/components/layout/ 레이아웃 컴포넌트
- shared/utils/ 유틸 함수

## 2. Scope

### 신규 생성 파일
```
src/shared/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts
│   ├── layout/
│   │   ├── SafeAreaLayout.tsx
│   │   ├── TabNavigation.tsx
│   │   ├── AppGuard.tsx
│   │   └── index.ts
│   └── index.ts
├── utils/
│   ├── cn.ts                # className 유틸 (clsx + tailwind-merge)
│   └── index.ts
└── index.ts
```

### 의존성
- Step 02 core/minikit (useMiniKitInstalled, useSafeAreaInsets)
- Step 05 shared/states (NotInstalledScreen, LoadingScreen)
- Step 06 core/i18n (useTranslations)
- Step 10 core/analytics (analytics)

## 3. 완료 조건

- [ ] `src/shared/components/ui/Button.tsx` 존재
- [ ] `src/shared/components/ui/Card.tsx` 존재
- [ ] `src/shared/components/layout/SafeAreaLayout.tsx` 존재
- [ ] SafeAreaLayout이 useSafeAreaInsets 사용
- [ ] SafeAreaLayout이 좌우 최소 24px 패딩 적용
- [ ] `src/shared/components/layout/TabNavigation.tsx` 존재
- [ ] TabNavigation이 2개 탭 (Home, Settings) 렌더링
- [ ] TabNavigation이 i18n (useTranslations) 사용
- [ ] TabNavigation이 탭 전환 시 `tab_switched` 이벤트 추적
- [ ] `src/shared/components/layout/AppGuard.tsx` 존재
- [ ] AppGuard가 useMiniKitInstalled 훅 사용
- [ ] `src/shared/utils/cn.ts` 존재

---

## 코드 패턴

```typescript
// src/shared/components/layout/SafeAreaLayout.tsx
'use client'

import { useSafeAreaInsets } from '@worldcoin/minikit-js/react'
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
```

```typescript
// src/shared/components/layout/AppGuard.tsx
'use client'

import { useMiniKitInstalled } from '@/core/minikit'
import { NotInstalledScreen, LoadingScreen } from '@/shared/components/states'
import { ReactNode } from 'react'

export function AppGuard({ children }: { children: ReactNode }) {
  const isInstalled = useMiniKitInstalled()

  if (isInstalled === null) return <LoadingScreen />
  if (!isInstalled) return <NotInstalledScreen />
  return <>{children}</>
}
```

```typescript
// src/shared/components/layout/TabNavigation.tsx
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
```

---

## Import 규칙 확인

- shared/ → core/ import: **허용** (useMiniKitInstalled)
- shared/ 내부 import: **허용**

---

## FP/FN 검증: ✅ 통과

→ 다음: [Step 05: shared/states 상태 화면](step-05-shared-states.md)
