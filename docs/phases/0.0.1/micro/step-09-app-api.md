# Step 09: app/api BE 엔드포인트

## 메타데이터
- **난이도**: 🟢 쉬움
- **롤백 가능**: ✅
- **선행 조건**: Step 01 완료
- **레이어**: app (3) - API 라우트

---

## 1. 구현 내용 (design.md 기반)

- GET /api/health 엔드포인트
- GET /api/config 엔드포인트
- core/api/ 유틸 (에러, 응답)

## 2. Scope

### 신규 생성 파일
```
src/app/api/
├── health/
│   └── route.ts
└── config/
    └── route.ts

src/core/api/
├── errors.ts
├── response.ts
└── index.ts
```

### 의존성
- next/server (NextResponse)
- 환경변수 (NEXT_PUBLIC_*)

## 3. 완료 조건

- [ ] `src/app/api/health/route.ts` 존재
- [ ] GET /api/health 응답:
  ```json
  { "status": "ok", "timestamp": "ISO8601", "version": "0.0.1" }
  ```
- [ ] `src/app/api/config/route.ts` 존재
- [ ] GET /api/config 응답에 appId, appName, supportedLanguages 포함
- [ ] `src/core/api/errors.ts` 존재
- [ ] ErrorCodes 상수 정의 (VALIDATION_ERROR, NOT_FOUND, INTERNAL_ERROR)
- [ ] `src/core/api/response.ts` 존재
- [ ] successResponse, errorResponse 헬퍼 함수 export
- [ ] curl `/api/health` → 200 OK
- [ ] curl `/api/config` → 200 OK

---

## 코드 패턴

```typescript
// src/core/api/errors.ts
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
```

```typescript
// src/core/api/response.ts
import { NextResponse } from 'next/server'
import { ErrorCode } from './errors'

export function successResponse<T>(data: T) {
  return NextResponse.json(data)
}

export function errorResponse(
  code: ErrorCode,
  message: string,
  status: number,
  details?: unknown
) {
  return NextResponse.json(
    {
      error: { code, message, details },
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    },
    { status }
  )
}
```

```typescript
// src/app/api/health/route.ts
import { successResponse } from '@/core/api'

export async function GET() {
  return successResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.0.1',
  })
}
```

```typescript
// src/app/api/config/route.ts
import { successResponse } from '@/core/api'
import { locales, defaultLocale } from '@/core/i18n'

export async function GET() {
  return successResponse({
    appId: process.env.NEXT_PUBLIC_WLD_APP_ID,
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'World Gate',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.0.1',
    supportedLanguages: locales,
    defaultLanguage: defaultLocale,
    features: {
      worldId: process.env.NEXT_PUBLIC_ENABLE_WORLD_ID === 'true',
      walletBinding: process.env.NEXT_PUBLIC_ENABLE_WALLET_BINDING === 'true',
    },
    contact: {
      email: process.env.NEXT_PUBLIC_DEVELOPER_EMAIL,
      supportUrl: process.env.NEXT_PUBLIC_SUPPORT_URL,
    },
  })
}
```

---

## FP/FN 검증: ✅ 통과

→ 다음: [Step 10: core/analytics 분석 레이어](step-10-core-analytics.md)
