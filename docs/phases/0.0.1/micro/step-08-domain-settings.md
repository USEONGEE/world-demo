# Step 08: domains/settings 도메인

## 메타데이터
- **난이도**: 🟡 보통
- **롤백 가능**: ✅
- **선행 조건**: Step 06, 10 완료
- **레이어**: domains (2) - 비즈니스 로직

---

## 1. 구현 내용 (design.md 기반)

- domains/settings/ 도메인 구조 생성
- Zustand store (settings.store.ts)
- LanguageSelector 컴포넌트
- DeveloperContact 컴포넌트
- Entry Point 패턴 적용

## 2. Scope

### 신규 생성 파일
```
src/domains/settings/
├── components/
│   ├── LanguageSelector.tsx
│   ├── DeveloperContact.tsx
│   └── index.ts
├── hooks/
│   ├── useLanguage.ts
│   └── index.ts
├── store/
│   └── settings.store.ts   # Zustand store (persist)
├── types/
│   └── index.ts
├── client.ts               # Client Entry Point
└── index.ts                # Public Entry Point
```

### 의존성
- `zustand` (create, persist)
- core/analytics (이벤트 추적)
- core/i18n (locales 목록)
- shared/components/ui (Button, Card)

## 3. 완료 조건

- [ ] `src/domains/settings/store/settings.store.ts` 존재
- [ ] useSettingsStore가 Zustand persist 미들웨어 사용
- [ ] Store 상태: language (string)
- [ ] Store 액션: setLanguage(lang: string)
- [ ] setLanguage 호출 시 `language_changed` 이벤트 발생
- [ ] `src/domains/settings/components/LanguageSelector.tsx` 존재
- [ ] LanguageSelector가 i18n (useTranslations) 사용
- [ ] LanguageSelector가 6개 언어 선택 가능
- [ ] `src/domains/settings/components/DeveloperContact.tsx` 존재
- [ ] DeveloperContact가 i18n (useTranslations) 사용
- [ ] DeveloperContact가 이메일 + 지원 URL 표시
- [ ] 환경변수 NEXT_PUBLIC_DEVELOPER_EMAIL, NEXT_PUBLIC_SUPPORT_URL 사용
- [ ] `src/domains/settings/client.ts`에서 컴포넌트 export
- [ ] `src/domains/settings/index.ts`에서 useSettingsStore export

---

## 코드 패턴

```typescript
// src/domains/settings/store/settings.store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { analytics } from '@/core/analytics'

interface SettingsState {
  language: string
  setLanguage: (lang: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      language: 'en',
      setLanguage: (language) => {
        const from = get().language
        set({ language })
        analytics.track({
          name: 'language_changed',
          properties: { from, to: language },
          timestamp: new Date(),
        })
      },
    }),
    { name: 'world-gate-settings' }
  )
)
```

```typescript
// src/domains/settings/components/DeveloperContact.tsx
'use client'

import { Card } from '@/shared/components/ui'
import { useTranslations } from 'next-intl'

export function DeveloperContact() {
  const t = useTranslations('settings')
  const email = process.env.NEXT_PUBLIC_DEVELOPER_EMAIL
  const supportUrl = process.env.NEXT_PUBLIC_SUPPORT_URL

  return (
    <Card>
      <h3 className="font-semibold mb-4">{t('contact')}</h3>
      {email && (
        <a href={`mailto:${email}`} className="block text-blue-600 mb-2">
          {email}
        </a>
      )}
      {supportUrl && (
        <a
          href={supportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-blue-600"
        >
          {supportUrl}
        </a>
      )}
    </Card>
  )
}
```

---

## Import 규칙 확인

- domains/settings → core/ : **허용** (analytics, i18n)
- domains/settings → shared/ : **허용** (Button, Card)
- domains/settings → domains/consent : **금지**

---

## FP/FN 검증: ✅ 통과

→ 다음: [Step 09: app/api BE 엔드포인트](step-09-app-api.md)
