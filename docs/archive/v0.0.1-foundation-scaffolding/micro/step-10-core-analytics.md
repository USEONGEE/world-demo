# Step 10: core/analytics 분석 레이어

## 메타데이터
- **난이도**: 🟡 보통
- **롤백 가능**: ✅
- **선행 조건**: Step 01 완료
- **레이어**: core (1) - 횡단 관심사

---

## 1. 구현 내용 (design.md 기반)

- core/analytics/ 디렉토리 생성
- AnalyticsTracker 인터페이스 정의
- ConsoleTracker 구현 (개발용)
- analytics 싱글톤 인스턴스
- app_open 이벤트 추적

## 2. Scope

### 신규 생성 파일
```
src/core/analytics/
├── types.ts              # AnalyticsEvent, AnalyticsTracker
├── tracker.ts            # analytics 싱글톤
├── console.tracker.ts    # 개발용 구현체
└── index.ts              # Entry Point
```

### 의존성
- @worldcoin/minikit-js/react (useLaunchParams)

## 3. 완료 조건

- [ ] `src/core/analytics/types.ts` 존재
- [ ] AnalyticsEvent 인터페이스 (name, properties, timestamp)
- [ ] AnalyticsTracker 인터페이스 (track, identify, reset)
- [ ] `src/core/analytics/console.tracker.ts` 존재
- [ ] ConsoleTracker가 console.log로 이벤트 출력
- [ ] ConsoleTracker가 localStorage에 최근 100개 이벤트 저장
- [ ] `src/core/analytics/tracker.ts` 존재
- [ ] analytics 싱글톤 export
- [ ] `src/core/analytics/index.ts`에서 analytics, types export
- [ ] 앱 실행 시 `app_open` 이벤트 발생 확인

---

## 코드 패턴

```typescript
// src/core/analytics/types.ts
export interface AnalyticsEvent {
  name: string
  properties?: Record<string, unknown>
  timestamp: Date
}

export interface AnalyticsTracker {
  track(event: AnalyticsEvent): void
  identify(userId: string): void
  reset(): void
}

// 이벤트 타입 정의
export type AppOpenEvent = {
  name: 'app_open'
  properties: {
    launchLocation?: string
    language: string
    isReturningUser: boolean
  }
}

export type ConsentEvent = {
  name: 'consent_granted' | 'consent_declined'
  properties: {
    previousConsent: boolean | null
  }
}

export type LanguageChangedEvent = {
  name: 'language_changed'
  properties: {
    from: string
    to: string
  }
}

export type TabSwitchedEvent = {
  name: 'tab_switched'
  properties: {
    from: string
    to: string
  }
}
```

```typescript
// src/core/analytics/console.tracker.ts
import { AnalyticsEvent, AnalyticsTracker } from './types'

const STORAGE_KEY = 'analytics_events'
const MAX_EVENTS = 100

export class ConsoleTracker implements AnalyticsTracker {
  private events: AnalyticsEvent[] = []
  private userId: string | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          this.events = JSON.parse(stored)
        } catch {
          this.events = []
        }
      }
    }
  }

  track(event: AnalyticsEvent): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event.name, event.properties)
    }

    this.events.push(event)
    if (this.events.length > MAX_EVENTS) {
      this.events = this.events.slice(-MAX_EVENTS)
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.events))
    }
  }

  identify(userId: string): void {
    this.userId = userId
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Identify:', userId)
    }
  }

  reset(): void {
    this.events = []
    this.userId = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }
}
```

```typescript
// src/core/analytics/tracker.ts
import { AnalyticsTracker } from './types'
import { ConsoleTracker } from './console.tracker'

export const analytics: AnalyticsTracker = new ConsoleTracker()
```

```typescript
// src/core/analytics/index.ts
export { analytics } from './tracker'
export type * from './types'
```

---

## app_open 이벤트 발생 위치

```typescript
// src/providers/index.tsx 또는 별도 훅
'use client'

import { useEffect } from 'react'
import { useLaunchParams } from '@worldcoin/minikit-js/react'
import { analytics } from '@/core/analytics'
import { useSettingsStore } from '@/domains/settings'
import { useConsentStore } from '@/domains/consent'

export function useTrackAppOpen() {
  const { launchLocation } = useLaunchParams()
  const language = useSettingsStore((s) => s.language)
  const consent = useConsentStore((s) => s.consent)

  useEffect(() => {
    analytics.track({
      name: 'app_open',
      properties: {
        launchLocation,
        language,
        isReturningUser: consent !== null,
      },
      timestamp: new Date(),
    })
  }, []) // 최초 1회만
}
```

---

## FP/FN 검증: ✅ 통과

→ 다음: [Step 11: app/(tabs) 페이지 연결](step-11-app-tabs.md)
