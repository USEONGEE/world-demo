# Step 02: core/minikit 설정

## 메타데이터
- **난이도**: 🟡 보통
- **롤백 가능**: ✅
- **선행 조건**: Step 01 완료
- **레이어**: core (1) - 횡단 관심사

---

## 1. 구현 내용 (design.md 기반)

- core/minikit/ 디렉토리 생성
- MiniKitProvider 래퍼 컴포넌트 구현
- useMiniKitInstalled 훅 구현
- providers/index.tsx에 MiniKit 추가

## 2. Scope

### 신규 생성 파일
```
src/core/minikit/
├── provider.tsx          # MiniKitClientProvider ('use client')
├── hooks.ts              # useMiniKitInstalled 훅
└── index.ts              # Entry Point
```

### 수정 대상 파일
```
src/providers/index.tsx   # MiniKitClientProvider 추가
src/app/layout.tsx        # RootProviders 래핑
```

### 의존성
- `@worldcoin/minikit-js` (MiniKitProvider, MiniKit)
- `@worldcoin/minikit-js/react` (useSafeAreaInsets, useLaunchParams)

## 3. 완료 조건

- [ ] `src/core/minikit/provider.tsx` 존재
- [ ] MiniKitClientProvider가 `'use client'` 지시어 포함
- [ ] MiniKitProvider가 `NEXT_PUBLIC_WLD_APP_ID` 환경변수 사용
- [ ] `src/core/minikit/hooks.ts`에 useMiniKitInstalled 훅 export
- [ ] `src/core/minikit/index.ts`에서 provider, hooks export
- [ ] `src/providers/index.tsx`에서 MiniKitClientProvider 사용
- [ ] `src/app/layout.tsx`에서 RootProviders로 children 래핑
- [ ] World App Simulator에서 MiniKit 초기화 확인

---

## 코드 패턴

```typescript
// src/core/minikit/provider.tsx
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

```typescript
// src/core/minikit/hooks.ts
'use client'

import { MiniKit } from '@worldcoin/minikit-js'
import { useState, useEffect } from 'react'

export function useMiniKitInstalled() {
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null)

  useEffect(() => {
    const check = () => setIsInstalled(MiniKit.isInstalled())
    check()
    const timer = setTimeout(check, 1000)
    return () => clearTimeout(timer)
  }, [])

  return isInstalled
}
```

---

## FP/FN 검증: ✅ 통과

→ 다음: [Step 03: core/supabase 클라이언트](step-03-core-supabase.md)
