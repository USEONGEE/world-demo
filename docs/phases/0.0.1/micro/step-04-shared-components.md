# Step 04: shared/components 기반 UI

## 메타데이터
- **난이도**: 🟡 보통
- **롤백 가능**: ✅
- **선행 조건**: Step 01 완료
- **레이어**: shared (0) - 범용 UI

---

## 1. 구현 내용 (design.md 기반)

- shared/components/ui/ 기본 UI 컴포넌트
- shared/components/layout/ 레이아웃 컴포넌트
- shared/utils/ 유틸 함수

## 2. Scope

### 신규 생성 파일
```
src/shared/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts
│   ├── layout/
│   │   ├── SafeAreaLayout.tsx
│   │   ├── TabNavigation.tsx
│   │   ├── AppGuard.tsx
│   │   └── index.ts
│   └── index.ts
├── utils/
│   ├── cn.ts                # className 유틸 (clsx + tailwind-merge)
│   └── index.ts
└── index.ts
```

### 의존성
- `@worldcoin/minikit-js/react` (useSafeAreaInsets)
- Step 02 core/minikit (useMiniKitInstalled)
- Step 05 shared/states (NotInstalledScreen, LoadingScreen)

## 3. 완료 조건

- [ ] `src/shared/components/ui/Button.tsx` 존재
- [ ] `src/shared/components/ui/Card.tsx` 존재
- [ ] `src/shared/components/layout/SafeAreaLayout.tsx` 존재
- [ ] SafeAreaLayout이 useSafeAreaInsets 사용
- [ ] SafeAreaLayout이 좌우 최소 24px 패딩 적용
- [ ] `src/shared/components/layout/TabNavigation.tsx` 존재
- [ ] TabNavigation이 2개 탭 (Home, Settings) 렌더링
- [ ] `src/shared/components/layout/AppGuard.tsx` 존재
- [ ] AppGuard가 useMiniKitInstalled 훅 사용
- [ ] `src/shared/utils/cn.ts` 존재

---

## 코드 패턴

```typescript
// src/shared/components/layout/SafeAreaLayout.tsx
'use client'

import { useSafeAreaInsets } from '@worldcoin/minikit-js/react'
import { ReactNode } from 'react'

const MIN_HORIZONTAL_PADDING = 24
const TAB_BAR_HEIGHT = 60

export function SafeAreaLayout({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets()

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        paddingTop: insets.top,
        paddingBottom: Math.max(insets.bottom, TAB_BAR_HEIGHT),
        paddingLeft: Math.max(insets.left, MIN_HORIZONTAL_PADDING),
        paddingRight: Math.max(insets.right, MIN_HORIZONTAL_PADDING),
      }}
    >
      {children}
    </div>
  )
}
```

```typescript
// src/shared/components/layout/AppGuard.tsx
'use client'

import { useMiniKitInstalled } from '@/core/minikit'
import { NotInstalledScreen, LoadingScreen } from '@/shared/components/states'
import { ReactNode } from 'react'

export function AppGuard({ children }: { children: ReactNode }) {
  const isInstalled = useMiniKitInstalled()

  if (isInstalled === null) return <LoadingScreen />
  if (!isInstalled) return <NotInstalledScreen />
  return <>{children}</>
}
```

---

## Import 규칙 확인

- shared/ → core/ import: **허용** (useMiniKitInstalled)
- shared/ 내부 import: **허용**

---

## FP/FN 검증: ✅ 통과

→ 다음: [Step 05: shared/states 상태 화면](step-05-shared-states.md)
