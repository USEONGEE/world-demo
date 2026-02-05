# Step 11: app/(tabs) 페이지 연결

## 메타데이터
- **난이도**: 🟡 보통
- **롤백 가능**: ✅
- **선행 조건**: Step 04, 07, 08 완료
- **레이어**: app (3) - 페이지/라우팅

---

## 1. 구현 내용 (design.md 기반)

- (tabs) 라우트 그룹 생성
- Home 페이지
- Settings 페이지 (언어 선택 + 연락처)
- 동의 체크 + 리다이렉트 로직
- RootProviders 최종 조립

## 2. Scope

### 신규/수정 파일
```
src/app/
├── layout.tsx              # RootProviders 최종 래핑
├── page.tsx                # 동의 체크 → 리다이렉트
├── (tabs)/
│   ├── layout.tsx          # AppGuard + SafeAreaLayout + TabNavigation
│   ├── home/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx        # LanguageSelector + DeveloperContact
└── consent/
    └── page.tsx            # ConsentForm

src/providers/
└── index.tsx               # 모든 Provider 조립
```

### 의존성
- domains/consent (ConsentForm, useConsentStore)
- domains/settings (LanguageSelector, DeveloperContact, useSettingsStore)
- shared/components/layout (AppGuard, SafeAreaLayout, TabNavigation)
- shared/components/states (ErrorBoundary, OfflineScreen)
- shared/hooks (useOffline)
- core/minikit (MiniKitClientProvider, useLaunchLocation)
- core/i18n (I18nProvider)
- core/analytics (analytics)

## 3. 완료 조건

- [ ] `src/app/(tabs)/layout.tsx` 존재
- [ ] layout.tsx에 AppGuard, SafeAreaLayout, TabNavigation 포함
- [ ] `src/app/(tabs)/home/page.tsx` 존재
- [ ] Home 페이지에 환영 메시지 표시
- [ ] `src/app/(tabs)/settings/page.tsx` 존재
- [ ] Settings 페이지에 LanguageSelector, DeveloperContact 포함
- [ ] `src/app/consent/page.tsx` 존재
- [ ] Consent 페이지에 ConsentForm 포함
- [ ] `src/app/page.tsx`에서 동의 여부 체크
- [ ] 동의 안함 → /consent 리다이렉트
- [ ] 동의 완료 → /home 리다이렉트
- [ ] 탭 전환 정상 동작 (Home ↔ Settings)
- [ ] RootProviders에 ErrorBoundary 포함
- [ ] RootProviders에 Offline 상태 처리 포함
- [ ] 앱 시작 시 `app_open` 이벤트 발생 확인

---

## 코드 패턴

```typescript
// src/providers/index.tsx
'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { MiniKitClientProvider, useLaunchLocation } from '@/core/minikit'
import { I18nProvider } from '@/core/i18n'
import { analytics } from '@/core/analytics'
import { useConsentStore } from '@/domains/consent'
import { useSettingsStore } from '@/domains/settings'
import { ErrorBoundary, OfflineScreen } from '@/shared/components/states'
import { useOffline } from '@/shared/hooks'

import en from '@/locales/en.json'
import es from '@/locales/es.json'
import th from '@/locales/th.json'
import ja from '@/locales/ja.json'
import ko from '@/locales/ko.json'
import pt from '@/locales/pt.json'

const messages = { en, es, th, ja, ko, pt } as const

export function RootProviders({ children }: { children: ReactNode }) {
  const language = useSettingsStore((s) => s.language)
  const consent = useConsentStore((s) => s.consent)
  const isHydrated = useConsentStore((s) => s.isHydrated)
  const launchLocation = useLaunchLocation()
  const isOffline = useOffline()
  const hasTrackedAppOpen = useRef(false)
  const currentMessages = messages[language] || en

  // app_open 이벤트 추적 (최초 1회)
  useEffect(() => {
    if (!isHydrated || hasTrackedAppOpen.current) return

    analytics.track({
      name: 'app_open',
      properties: {
        launchLocation,
        language,
        isReturningUser: consent !== null,
      },
      timestamp: new Date(),
    })

    hasTrackedAppOpen.current = true
  }, [consent, isHydrated, language, launchLocation])

  return (
    <MiniKitClientProvider>
      <I18nProvider locale={language} messages={currentMessages}>
        <ErrorBoundary>
          {isOffline ? <OfflineScreen /> : children}
        </ErrorBoundary>
      </I18nProvider>
    </MiniKitClientProvider>
  )
}
```

```typescript
// src/app/(tabs)/layout.tsx
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
```

```typescript
// src/app/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useConsentStore } from '@/domains/consent'
import { LoadingScreen } from '@/shared/components/states'

export default function RootPage() {
  const router = useRouter()
  const { consent, isHydrated } = useConsentStore()

  useEffect(() => {
    if (!isHydrated) return

    if (consent === null || consent === false) {
      router.replace('/consent')
    } else {
      router.replace('/home')
    }
  }, [consent, isHydrated, router])

  return <LoadingScreen />
}
```

```typescript
// src/app/(tabs)/settings/page.tsx
'use client'

import { LanguageSelector, DeveloperContact } from '@/domains/settings/client'
import { useTranslations } from 'next-intl'

export default function SettingsPage() {
  const t = useTranslations('tabs')

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{t('settings')}</h1>
      <LanguageSelector />
      <DeveloperContact />
    </div>
  )
}
```

---

## Import 규칙 확인

- app/ → domains/ : **허용**
- app/ → core/ : **허용**
- app/ → shared/ : **허용**

모든 import가 DDD 규칙 준수.

---

## FP/FN 검증: ✅ 통과

→ Phase 0.0.1 완료
