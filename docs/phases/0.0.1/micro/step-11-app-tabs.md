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
- core/minikit (MiniKitClientProvider)
- core/i18n (I18nProvider)

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

---

## 코드 패턴

```typescript
// src/providers/index.tsx
'use client'

import { ReactNode } from 'react'
import { MiniKitClientProvider } from '@/core/minikit'
import { I18nProvider } from '@/core/i18n'
import { useSettingsStore } from '@/domains/settings'

// 메시지 로드 (동적 import)
import en from '@/locales/en.json'
import es from '@/locales/es.json'
import th from '@/locales/th.json'
import ja from '@/locales/ja.json'
import ko from '@/locales/ko.json'
import pt from '@/locales/pt.json'

const messages: Record<string, typeof en> = { en, es, th, ja, ko, pt }

export function RootProviders({ children }: { children: ReactNode }) {
  const language = useSettingsStore((s) => s.language)

  return (
    <MiniKitClientProvider>
      <I18nProvider locale={language} messages={messages[language] || en}>
        {children}
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
