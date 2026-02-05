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

## 3. 완료 조건

- [ ] `src/shared/components/states/NotInstalledScreen.tsx` 존재
- [ ] NotInstalledScreen이 "World App Required" 메시지 표시
- [ ] `src/shared/components/states/LoadingScreen.tsx` 존재
- [ ] LoadingScreen이 로딩 스피너 표시
- [ ] `src/shared/components/states/ErrorBoundary.tsx` 존재
- [ ] ErrorBoundary가 에러 메시지 + 재시도 버튼 표시
- [ ] `src/shared/components/states/OfflineScreen.tsx` 존재
- [ ] OfflineScreen이 "No Connection" 메시지 표시
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
// src/shared/components/states/NotInstalledScreen.tsx
'use client'

import { Button } from '@/shared/components/ui'

export function NotInstalledScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">World App Required</h1>
      <p className="text-gray-600 text-center mb-6">
        This app requires World App to function.
      </p>
      <Button
        onClick={() => window.open('https://worldcoin.org/download', '_blank')}
      >
        Download World App
      </Button>
    </div>
  )
}
```

---

## FP/FN 검증: ✅ 통과

→ 다음: [Step 06: core/i18n 다국어 설정](step-06-core-i18n.md)
