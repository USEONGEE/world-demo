# Step 03: core/supabase 클라이언트

## 메타데이터
- **난이도**: 🟢 쉬움
- **롤백 가능**: ✅
- **선행 조건**: Step 01 완료
- **레이어**: core (1) - 횡단 관심사

---

## 1. 구현 내용 (design.md 기반)

- core/supabase/ 디렉토리 생성
- 브라우저 클라이언트 (client.ts)
- 서버 클라이언트 (server.ts)
- Supabase 타입 정의 준비

## 2. Scope

### 신규 생성 파일
```
src/core/supabase/
├── client.ts             # 브라우저용 Supabase 클라이언트
├── server.ts             # 서버용 Supabase 클라이언트
├── types.ts              # Database 타입 (placeholder)
└── index.ts              # Entry Point
```

### 의존성
- `@supabase/supabase-js`
- `@supabase/ssr`

## 3. 완료 조건

- [ ] `src/core/supabase/client.ts` 존재
- [ ] createBrowserClient 사용하여 supabase 인스턴스 export
- [ ] `src/core/supabase/server.ts` 존재
- [ ] createServerClient 사용, cookies() 연동
- [ ] 환경변수 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 사용
- [ ] `src/core/supabase/index.ts`에서 client export
- [ ] 브라우저에서 `supabase.auth.getSession()` 호출 가능

---

## 코드 패턴

```typescript
// src/core/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

```typescript
// src/core/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component에서 호출 시 무시
          }
        },
      },
    }
  )
}
```

---

## 참고: Phase 0.0.1에서 Supabase 사용 범위

Phase 0.0.1에서는 Supabase를 직접 사용하지 않음 (동의는 localStorage/Zustand).
Phase 0.0.2+에서 Human, WalletBinding 저장에 활용 예정.
여기서는 클라이언트 설정만 준비.

---

## FP/FN 검증: ✅ 통과

→ 다음: [Step 04: shared/components 기반 UI](step-04-shared-components.md)
