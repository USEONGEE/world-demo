# 설계 - v0.0.1 (DDD 아키텍처)

## 해결 방식

### 접근법
- **DDD 4계층 아키텍처** 기반 프로젝트 구조
- Next.js 15 App Router + Supabase + Zustand
- MiniKitProvider 기반 World App 통합
- Tab 네비게이션 중심의 모바일 퍼스트 UI
- 도메인 중심 설계로 확장성 확보

### 대안 검토

#### 프로젝트 구조

| 방식 | 장점 | 단점 | 선택 |
|------|------|------|------|
| A: 기능별 폴더 (pages/components/...) | 단순 | 도메인 분산, 확장 어려움 | ❌ |
| B: DDD 4계층 (app/domains/core/shared) | 도메인 응집, 확장성, 의존성 명확 | 초기 설정 복잡 | ✅ |
| C: 모듈별 폴더 (modules/feature) | 기능 단위 분리 | 횡단 관심사 처리 애매 | ❌ |

**선택 이유**: 추후 많은 도메인 추가 예정. DDD로 시작하면 확장 시 구조 변경 불필요.

#### 상태 관리

| 방식 | 장점 | 단점 | 선택 |
|------|------|------|------|
| A: React Context | 추가 의존성 없음 | 보일러플레이트, 리렌더링 이슈 | ❌ |
| B: Zustand | ~1KB, 단순 API, 도메인별 Store 분리 용이 | 추가 의존성 | ✅ |
| C: Jotai | Atomic 상태 | 러닝 커브 | ❌ |

**선택 이유**: 도메인별 Store 분리가 자연스럽고, DDD 구조와 잘 맞음.

#### 데이터베이스

| 방식 | 장점 | 단점 | 선택 |
|------|------|------|------|
| A: Supabase | 실시간, Auth 내장, PostgreSQL | 벤더 종속 | ✅ |
| B: PlanetScale | 서버리스 MySQL | 별도 Auth 필요 | ❌ |
| C: 자체 PostgreSQL | 완전한 통제 | 인프라 관리 부담 | ❌ |

**선택 이유**: Phase 0.0.1에서는 단순 설정 저장만, Phase 0.0.2+에서 Human/Wallet 저장에 활용.

---

## DDD 4계층 아키텍처

```
┌──────────────────────────────────┐
│  app (3) - 라우팅, 페이지, API    │
│  ┌────────────────────────────┐  │
│  │  domains (2) - 비즈니스 로직 │  │
│  │  ┌──────────────────────┐  │  │
│  │  │  core (1) - 횡단 관심사│  │  │
│  │  │  ┌────────────────┐  │  │  │
│  │  │  │  shared (0)    │  │  │  │
│  │  │  │  범용 유틸/UI  │  │  │  │
│  │  │  └────────────────┘  │  │  │
│  │  └──────────────────────┘  │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

### 의존성 방향
- `app → domains → core → shared` (외부 → 내부만 가능)
- 역방향 import 금지

---

## 기술 결정

### 의존성

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@worldcoin/minikit-js": "^1.9.0",
    "@supabase/supabase-js": "^2.0.0",
    "zustand": "^5.0.0",
    "next-intl": "^3.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "@types/react": "^19.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### 프로젝트 구조 (DDD 4계층)

```
src/
├── app/                           # Layer 3: 라우팅, 페이지, API
│   ├── layout.tsx                 # Root layout (providers 래핑)
│   ├── page.tsx                   # Entry point
│   ├── globals.css
│   ├── (tabs)/                    # 탭 네비게이션 그룹
│   │   ├── layout.tsx
│   │   ├── home/page.tsx
│   │   └── settings/page.tsx
│   ├── consent/page.tsx
│   └── api/
│       ├── health/route.ts
│       └── config/route.ts
│
├── domains/                       # Layer 2: 비즈니스 도메인
│   ├── consent/                   # 동의 도메인
│   │   ├── components/
│   │   │   └── ConsentForm.tsx
│   │   ├── hooks/
│   │   │   └── useConsent.ts
│   │   ├── store/
│   │   │   └── consent.store.ts   # Zustand store
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── client.ts              # Client Entry Point
│   │   └── index.ts               # Public Entry Point
│   │
│   └── settings/                  # 설정 도메인
│       ├── components/
│       │   ├── LanguageSelector.tsx
│       │   └── DeveloperContact.tsx
│       ├── hooks/
│       │   └── useLanguage.ts
│       ├── store/
│       │   └── settings.store.ts  # Zustand store
│       ├── types/
│       │   └── index.ts
│       ├── client.ts
│       └── index.ts
│
├── core/                          # Layer 1: 횡단 관심사
│   ├── analytics/                 # 분석
│   │   ├── types.ts
│   │   ├── tracker.ts
│   │   └── console.tracker.ts
│   ├── api/                       # API 유틸
│   │   ├── errors.ts
│   │   └── response.ts
│   ├── i18n/                      # 다국어
│   │   ├── config.ts
│   │   └── provider.tsx
│   ├── minikit/                   # MiniKit 통합
│   │   ├── provider.tsx
│   │   └── hooks.ts
│   └── supabase/                  # Supabase 클라이언트
│       ├── client.ts
│       └── server.ts
│
├── shared/                        # Layer 0: 범용 유틸/UI
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Modal.tsx
│   │   ├── layout/
│   │   │   ├── SafeAreaLayout.tsx
│   │   │   ├── TabNavigation.tsx
│   │   │   └── AppGuard.tsx
│   │   └── states/
│   │       ├── NotInstalledScreen.tsx
│   │       ├── LoadingScreen.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── OfflineScreen.tsx
│   ├── hooks/
│   │   └── useOffline.ts
│   ├── types/
│   │   └── common.ts
│   └── utils/
│       └── cn.ts                  # className 유틸
│
├── locales/                       # i18n 번역 파일
│   ├── en.json
│   ├── es.json
│   ├── th.json
│   ├── ja.json
│   ├── ko.json
│   └── pt.json
│
└── providers/                     # Root Providers
    └── index.tsx                  # RootProviders 통합
```

### 환경 변수

```env
# World App
NEXT_PUBLIC_WLD_APP_ID=app_staging_xxx
WLD_APP_ID=app_staging_xxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# App Metadata
NEXT_PUBLIC_APP_NAME=World Gate
NEXT_PUBLIC_APP_VERSION=0.0.1

# Developer Contact
NEXT_PUBLIC_DEVELOPER_EMAIL=contact@example.com
NEXT_PUBLIC_SUPPORT_URL=https://example.com/support

# Feature Flags
NEXT_PUBLIC_ENABLE_WORLD_ID=false
NEXT_PUBLIC_ENABLE_WALLET_BINDING=false
```

### tsconfig.json 경로 별칭

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/app/*": ["./src/app/*"],
      "@/domains/*": ["./src/domains/*"],
      "@/core/*": ["./src/core/*"],
      "@/shared/*": ["./src/shared/*"]
    }
  }
}
```

---

## 도메인 설계

### Phase 0.0.1 도메인

| 도메인 | 책임 | Store |
|--------|------|-------|
| consent | 데이터 수집 동의 관리 | consent.store.ts |
| settings | 언어 설정, 연락처 | settings.store.ts |

### Zustand Store 패턴

```typescript
// domains/consent/store/consent.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ConsentState {
  consent: boolean | null
  isLoading: boolean
  grantConsent: () => void
  declineConsent: () => void
}

export const useConsentStore = create<ConsentState>()(
  persist(
    (set, get) => ({
      consent: null,
      isLoading: true,
      grantConsent: () => {
        set({ consent: true })
        analytics.track({ name: 'consent_granted', ... })
      },
      declineConsent: () => {
        set({ consent: false })
        analytics.track({ name: 'consent_declined', ... })
      },
    }),
    { name: 'world-gate-consent' }
  )
)
```

```typescript
// domains/settings/store/settings.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  language: string
  setLanguage: (lang: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => {
        set({ language })
        analytics.track({ name: 'language_changed', ... })
      },
    }),
    { name: 'world-gate-settings' }
  )
)
```

---

## API 설계

### GET /api/health

```typescript
{
  "status": "ok",
  "timestamp": "ISO8601",
  "version": "0.0.1"
}
```

### GET /api/config

```typescript
{
  "appId": "app_staging_xxx",
  "appName": "World Gate",
  "version": "0.0.1",
  "supportedLanguages": ["en", "es", "th", "ja", "ko", "pt"],
  "features": {
    "worldId": false,
    "walletBinding": false
  },
  "contact": {
    "email": "contact@example.com",
    "supportUrl": "https://example.com/support"
  }
}
```

---

## 레이어별 Import 규칙

### 허용

```typescript
// app/ → domains/, core/, shared/ (모두 OK)
import { useConsentStore } from '@/domains/consent'
import { analytics } from '@/core/analytics'
import { Button } from '@/shared/components/ui'

// domains/ → core/, shared/ (OK)
import { analytics } from '@/core/analytics'
import { cn } from '@/shared/utils'

// core/ → shared/ (OK)
import { cn } from '@/shared/utils'
```

### 금지

```typescript
// ❌ shared/ → core/ (역방향)
// ❌ core/ → domains/ (역방향)
// ❌ domains/ → app/ (역방향)
// ❌ domains/a/ → domains/b/ (도메인 간 직접 참조)
```

---

## 핵심 구현 패턴

### MiniKit Provider (core/minikit/)

```typescript
// core/minikit/provider.tsx
'use client'

import { MiniKitProvider } from '@worldcoin/minikit-js/react'
import { ReactNode } from 'react'

export function MiniKitClientProvider({ children }: { children: ReactNode }) {
  return (
    <MiniKitProvider appId={process.env.NEXT_PUBLIC_WLD_APP_ID}>
      {children}
    </MiniKitProvider>
  )
}
```

### Supabase Client (core/supabase/)

```typescript
// core/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// core/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

### Domain Entry Point 패턴

```typescript
// domains/consent/index.ts (Public API)
export { useConsentStore } from './store/consent.store'
export type { ConsentState } from './types'

// domains/consent/client.ts (Client 전용)
export { ConsentForm } from './components/ConsentForm'
export { useConsent } from './hooks/useConsent'
```

---

## Analytics 이벤트

| 이벤트 | 속성 | 트리거 |
|--------|------|--------|
| app_open | launchLocation, language | 앱 실행 |
| consent_granted | previousConsent | 동의 수락 |
| consent_declined | previousConsent | 동의 거부 |
| language_changed | from, to | 언어 변경 |
| tab_switched | from, to | 탭 전환 |

---

## 참조 문서

- [PRD.md](./PRD.md) - 상세 요구사항
- [README.md](./README.md) - 문제 정의
- [DDD 리팩토링 가이드](/Users/mousebook/.claude/skills/ddd-refactoring/SKILL.md)
