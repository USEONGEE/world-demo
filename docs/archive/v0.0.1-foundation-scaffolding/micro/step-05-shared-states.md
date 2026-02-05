# Step 05: shared/states 상태 화면

## 메타데이터
- **난이도**: 🟢 쉬움
- **롤백 가능**: ✅
- **선행 조건**: Step 04 완료
- **레이어**: shared (0) - 범용 UI

---

## 1. 구현 내용 (design.md 기반)

- 상태별 화면 컴포넌트 (NotInstalled, Loading, Error, Offline)
- useOffline 훅

## 2. Scope

### 신규 생성 파일
```
src/shared/
├── components/
│   └── states/
│       ├── NotInstalledScreen.tsx
│       ├── LoadingScreen.tsx
│       ├── ErrorBoundary.tsx
│       ├── OfflineScreen.tsx
│       └── index.ts
└── hooks/
    ├── useOffline.ts
    └── index.ts
```

### 의존성
- shared/components/ui (Button)
- 웹 API (navigator.onLine)
- Step 06 core/i18n (useTranslations)

## 3. 완료 조건

- [ ] `src/shared/components/states/NotInstalledScreen.tsx` 존재
- [ ] NotInstalledScreen이 i18n으로 메시지 표시
- [ ] `src/shared/components/states/LoadingScreen.tsx` 존재
- [ ] LoadingScreen이 i18n으로 로딩 메시지 표시
- [ ] `src/shared/components/states/ErrorBoundary.tsx` 존재
- [ ] ErrorBoundary가 i18n으로 에러 메시지 + 재시도 버튼 표시
- [ ] `src/shared/components/states/OfflineScreen.tsx` 존재
- [ ] OfflineScreen이 i18n으로 연결 없음 메시지 표시
- [ ] `src/shared/hooks/useOffline.ts` 존재
- [ ] useOffline이 online/offline 이벤트 리스너 등록

---

## 코드 패턴

```typescript
// src/shared/hooks/useOffline.ts
'use client'

import { useState, useEffect } from 'react'

export function useOffline() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    setIsOffline(!navigator.onLine)

    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOffline
}
```

```typescript
// src/shared/components/states/LoadingScreen.tsx
'use client'

import { useTranslations } from 'next-intl'

export function LoadingScreen() {
  const t = useTranslations('common')

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      <p className="mt-4 text-gray-600">{t('loading')}</p>
    </div>
  )
}
```

```typescript
// src/shared/components/states/NotInstalledScreen.tsx
'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/shared/components/ui'

export function NotInstalledScreen() {
  const t = useTranslations('notInstalled')

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
      <p className="text-gray-600 text-center mb-6">{t('description')}</p>
      <Button
        onClick={() => window.open('https://worldcoin.org/download', '_blank')}
      >
        {t('download')}
      </Button>
    </div>
  )
}
```

```typescript
// src/shared/components/states/OfflineScreen.tsx
'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/shared/components/ui'

export function OfflineScreen() {
  const t = useTranslations('offline')
  const common = useTranslations('common')

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
      <p className="text-gray-600 text-center mb-6">{t('description')}</p>
      <Button onClick={() => window.location.reload()}>
        {common('retry')}
      </Button>
    </div>
  )
}
```

---

## FP/FN 검증: ✅ 통과

→ 다음: [Step 06: core/i18n 다국어 설정](step-06-core-i18n.md)
