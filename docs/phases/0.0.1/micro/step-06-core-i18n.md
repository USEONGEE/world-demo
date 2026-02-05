# Step 06: core/i18n 다국어 설정

## 메타데이터
- **난이도**: 🟡 보통
- **롤백 가능**: ✅
- **선행 조건**: Step 01 완료
- **레이어**: core (1) - 횡단 관심사

---

## 1. 구현 내용 (design.md 기반)

- core/i18n/ 디렉토리 생성
- next-intl 설정
- 6개 언어 JSON 파일 (EN/ES/TH/JA/KO/PT)
- I18nProvider 컴포넌트

## 2. Scope

### 신규 생성 파일
```
src/core/i18n/
├── config.ts             # next-intl 설정
├── provider.tsx          # I18nProvider ('use client')
└── index.ts              # Entry Point

src/locales/
├── en.json
├── es.json
├── th.json
├── ja.json
├── ko.json
└── pt.json

i18n.ts                   # next-intl request config
```

### 수정 대상 파일
```
src/providers/index.tsx   # I18nProvider 추가
```

### 의존성
- `next-intl`

## 3. 완료 조건

- [ ] `src/core/i18n/config.ts` 존재 (지원 언어 목록)
- [ ] `src/core/i18n/provider.tsx` 존재
- [ ] 6개 locales JSON 파일 존재 (en, es, th, ja, ko, pt)
- [ ] 각 locale 파일에 기본 키 세트 포함:
  - common.appName
  - common.loading
  - common.error
  - tabs.home
  - tabs.settings
  - consent.title
  - consent.accept
  - consent.decline
  - settings.language
  - settings.contact
- [ ] providers/index.tsx에 NextIntlClientProvider 추가
- [ ] 언어 변경 시 UI 텍스트 변경 확인

---

## 코드 패턴

```typescript
// src/core/i18n/config.ts
export const locales = ['en', 'es', 'th', 'ja', 'ko', 'pt'] as const
export const defaultLocale = 'en'
export type Locale = (typeof locales)[number]
```

```typescript
// src/core/i18n/provider.tsx
'use client'

import { NextIntlClientProvider } from 'next-intl'
import { ReactNode } from 'react'

interface I18nProviderProps {
  children: ReactNode
  locale: string
  messages: Record<string, unknown>
}

export function I18nProvider({ children, locale, messages }: I18nProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
```

```json
// src/locales/en.json
{
  "common": {
    "appName": "World Gate",
    "loading": "Loading...",
    "error": "An error occurred",
    "retry": "Retry"
  },
  "tabs": {
    "home": "Home",
    "settings": "Settings"
  },
  "consent": {
    "title": "Data Collection",
    "description": "We collect anonymous usage data to improve our service.",
    "accept": "I Agree",
    "decline": "Decline"
  },
  "settings": {
    "language": "Language",
    "contact": "Developer Contact"
  },
  "notInstalled": {
    "title": "World App Required",
    "description": "This app requires World App to function.",
    "download": "Download World App"
  },
  "offline": {
    "title": "No Connection",
    "description": "Please check your internet connection."
  }
}
```

---

## FP/FN 검증: ✅ 통과

→ 다음: [Step 07: domains/consent 도메인](step-07-domain-consent.md)
