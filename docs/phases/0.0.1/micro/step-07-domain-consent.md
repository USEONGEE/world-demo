# Step 07: domains/consent 도메인

## 메타데이터
- **난이도**: 🟡 보통
- **롤백 가능**: ✅
- **선행 조건**: Step 04, 06, 10 완료
- **레이어**: domains (2) - 비즈니스 로직

---

## 1. 구현 내용 (design.md 기반)

- domains/consent/ 도메인 구조 생성
- Zustand store (consent.store.ts)
- ConsentForm 컴포넌트
- useConsent 훅
- Entry Point 패턴 적용

## 2. Scope

### 신규 생성 파일
```
src/domains/consent/
├── components/
│   ├── ConsentForm.tsx
│   └── index.ts
├── hooks/
│   ├── useConsent.ts
│   └── index.ts
├── store/
│   └── consent.store.ts    # Zustand store (persist)
├── types/
│   └── index.ts
├── client.ts               # Client Entry Point
└── index.ts                # Public Entry Point

src/app/consent/
└── page.tsx                # 동의 페이지
```

### 의존성
- `zustand` (create, persist)
- core/analytics (이벤트 추적)
- core/i18n (useTranslations)
- shared/components/ui (Button, Card)

## 3. 완료 조건

- [ ] `src/domains/consent/store/consent.store.ts` 존재
- [ ] useConsentStore가 Zustand persist 미들웨어 사용
- [ ] Store 상태: consent (boolean | null), isHydrated
- [ ] Store 액션: grantConsent(), declineConsent()
- [ ] grantConsent 호출 시 `consent_granted` 이벤트 발생
- [ ] declineConsent 호출 시 `consent_declined` 이벤트 발생
- [ ] `src/domains/consent/components/ConsentForm.tsx` 존재
- [ ] ConsentForm이 i18n (useTranslations) 사용
- [ ] ConsentForm에 동의/거부 버튼 포함
- [ ] `src/domains/consent/client.ts`에서 ConsentForm export
- [ ] `src/domains/consent/index.ts`에서 useConsentStore, types export
- [ ] `src/app/consent/page.tsx` 존재
- [ ] 동의 완료 시 /home으로 리다이렉트

---

## 코드 패턴

```typescript
// src/domains/consent/store/consent.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { analytics } from '@/core/analytics'

interface ConsentState {
  consent: boolean | null
  isHydrated: boolean
  grantConsent: () => void
  declineConsent: () => void
  setHydrated: () => void
}

export const useConsentStore = create<ConsentState>()(
  persist(
    (set, get) => ({
      consent: null,
      isHydrated: false,
      grantConsent: () => {
        const prev = get().consent
        set({ consent: true })
        analytics.track({
          name: 'consent_granted',
          properties: { previousConsent: prev },
          timestamp: new Date(),
        })
      },
      declineConsent: () => {
        const prev = get().consent
        set({ consent: false })
        analytics.track({
          name: 'consent_declined',
          properties: { previousConsent: prev },
          timestamp: new Date(),
        })
      },
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'world-gate-consent',
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    }
  )
)
```

```typescript
// src/domains/consent/index.ts (Public API)
export { useConsentStore } from './store/consent.store'
export type * from './types'

// src/domains/consent/client.ts (Client Entry)
export { ConsentForm } from './components/ConsentForm'
export { useConsent } from './hooks/useConsent'
```

---

## Import 규칙 확인

- domains/consent → core/ : **허용** (analytics)
- domains/consent → shared/ : **허용** (Button)
- domains/consent → domains/settings : **금지** (도메인 간 직접 참조)

---

## FP/FN 검증: ✅ 통과

→ 다음: [Step 08: domains/settings 도메인](step-08-domain-settings.md)
