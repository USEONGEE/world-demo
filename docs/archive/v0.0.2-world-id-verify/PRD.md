# Phase 0.0.2 PRD — World ID Verify (Human 인증)

## 목표
- World ID proof를 BE에서 검증하고, 익명 Human 레코드를 생성/조회한다.
- 중복 방지(nullifier_hash)와 세션 발급을 통해 이후 지갑 바인딩의 기반을 만든다.

## 범위
- FE: Verify 버튼 + 성공/실패 상태 UI
- FE: MiniKit Verify 호출 및 payload 전달
- BE: proof 검증, 중복 처리, Human 생성
- BE: 세션 발급(HTTP-only Cookie, 서명된 세션 토큰)
- DB: Human 테이블 및 유니크 제약 (Supabase)

## 비범위
- SIWE 지갑 바인딩
- 지갑 목록 조회/관리
- 세금 리포트

## 사용자 플로우
1. 사용자가 “사람 인증하기” 버튼 클릭
2. World App 인증 UI 승인
3. FE가 finalPayload를 BE로 전송
4. BE가 proof 검증 후 human_id 반환
5. FE가 인증 완료 상태 표시

## 기능 요구사항
### FE
- Verify Command 실행
- finalPayload.status === 'success'일 때만 BE에 전달
- finalPayload를 그대로 전달(해석/검증 금지, BE에서만 검증)
- 타임아웃/재시도 후 실패 UI 제공
- 성공/실패/중복 상태 UI 제공

### BE
- POST /api/verify
  - 입력: finalPayload(status, action, proof, merkle_root, nullifier_hash, verification_level?, signal?)
  - 유효성: status가 존재하면 'success'만 허용
  - 검증: verifyCloudProof 사용
  - 타임아웃/재시도: verifyCloudProof 10s 타임아웃 + 1회 재시도
  - 중복: (action, nullifier_hash) 유니크
  - 응답: { human_id, is_new }
  - 세션: human_id 기반 HTTP-only Cookie 발급(만료 포함)
- GET /api/human/me
  - 현재 세션의 human_id 반환

## FE/BE 경계 (필수)
- FE: Verify 커맨드 호출 + payload 전달 + 상태 UI만 담당
- BE: proof 검증, 중복 체크, Human 생성, 세션 발급 전담
- `app/api/verify`는 컨트롤러 역할만 수행 (도메인 호출)

## 데이터 모델
### Human (gate.human)
- id (UUID)
- action (world_action)
- nullifier_hash
- created_at

**제약:** (action, nullifier_hash) 유니크

## 세션 관리 결정 (P0)
**선택:** HTTP-only Cookie 기반 세션(서명된 토큰)

### 세션 스펙
- 쿠키명: `wg_session`
- 값: 서명된 토큰(JWT 또는 HMAC 서명 JSON)
- 포함 필드: `human_id`, `iat`, `exp`
- 만료: 기본 7일 (환경변수로 조정)
- 쿠키 옵션: `HttpOnly`, `SameSite=Lax`, `Secure`(prod), `Path=/`
- 검증: BE에서 서명/만료 검증 후 `human_id` 추출
- ENV: `SESSION_COOKIE_NAME`, `SESSION_TTL_SECONDS`, `SESSION_EXPIRES_IN` (fallback)

### 참고
- Bearer Token 방식은 제외 (FE 저장 위험/노출 리스크)
- 세션 관련 ENV는 `/docs/phases/ENV.md` 참고

## DB 마이그레이션 (P0)
Supabase SQL 스크립트 추가:
- `supabase/migrations/0000_create_human.sql`
- `supabase/migrations/0001_gate_human_rls.sql`
스키마:
- `gate.human`
Supabase 타입 추가(권장):
- `src/core/supabase/types.ts`에 human 테이블 타입 정의

## 도메인 구조 정의 (P1)
- `domains/human.md` 참고

## 보안/정책
- proof 및 PII 저장 금지
- FE payload 신뢰 금지, BE 검증 필수
- 무한 로딩 방지(타임아웃/재시도)

## 분석 이벤트
**FE 필수**
- verify_start
- verify_success
- verify_fail (reason)
- verify_duplicate

## 테스트
- BE: valid proof → human 생성
- BE: duplicate nullifier → is_new=false 또는 중복 응답
- BE: invalid proof → 4xx
- FE: 성공/실패/중복 UI 상태 전환

## 완료 기준
- 유효한 proof로 human_id 발급
- 중복 nullifier 처리 동작
- 세션 발급 및 /api/human/me 동작
- FE에서 인증 완료 표시

---

## MiniKit Verify Command 규칙

### Verify Input/Output 구조

```ts
// Input
interface VerifyCommandInput {
  action: string                              // 앱에서 정의한 액션 ID
  signal?: string                             // 추가 데이터 (선택)
  verification_level?: 'orb' | 'device'       // 인증 레벨
}

// Output
interface VerifyCommandOutput {
  status: 'success' | 'error'
  action: string
  proof?: string              // ZK proof
  merkle_root?: string        // Merkle tree root
  nullifier_hash?: string     // 익명 식별자 (중복 방지용)
  verification_level?: string
  signal?: string
}
```

### nullifier_hash 핵심 개념

| 특성 | 설명 |
|------|------|
| 동일 사용자 + 같은 action | 항상 같은 nullifier_hash 생성 |
| 사용자 식별 | 불가능 (익명성 보장) |
| action이 다르면 | 다른 nullifier_hash 생성 |
| 중복 방지 핵심 | `(action, nullifier_hash)` 쌍으로 체크 |

### FE 역할 제한

> **중요:** FE는 proof를 해석하지 않는다. World App이 준 payload를 그대로 BE로 전달만 한다.

```tsx
// FE: Verify Command 호출
import { MiniKit, VerifyCommandInput } from '@worldcoin/minikit-js'

async function verifyHuman() {
  if (!MiniKit.isInstalled()) return

  const verifyPayload: VerifyCommandInput = {
    action: 'verify-human',
    verification_level: 'orb',
  }

  const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload)

  if (finalPayload.status === 'success') {
    // BE로 payload 그대로 전송 (해석/검증 금지)
    await fetch('/api/verify', {
      method: 'POST',
      body: JSON.stringify(finalPayload),
    })
  }
}
```

### BE 검증 필수

> **중요:** 모든 검증은 반드시 BE에서 수행. FE payload 신뢰 금지.

```ts
// BE: verifyCloudProof 사용
import { verifyCloudProof } from '@worldcoin/minikit-js/backend'

export async function POST(request: Request) {
  const payload = await request.json()

  if (payload.status && payload.status !== 'success') {
    return Response.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const verifyRes = await verifyCloudProof(
    payload,
    process.env.WLD_APP_ID!,
    payload.action
  )

  if (verifyRes.success) {
    // nullifier_hash로 중복 체크
    const existing = await db.human.findUnique({
      where: {
        action_nullifier: {
          action: payload.action,
          nullifier_hash: payload.nullifier_hash,
        }
      }
    })

    if (existing) {
      return Response.json({ human_id: existing.id, is_new: false })
    }

    // 신규 human 생성
    const human = await db.human.create({
      data: {
        action: payload.action,
        nullifier_hash: payload.nullifier_hash,
      }
    })

    return Response.json({ human_id: human.id, is_new: true })
  }

  return Response.json({ error: 'Verification failed' }, { status: 400 })
}
```

### 보안 체크리스트

- [ ] proof 원문 저장 금지
- [ ] FE payload 신뢰 금지 (BE 검증 필수)
- [ ] `verifyCloudProof()` 사용
- [ ] `WLD_APP_ID` 환경변수 설정
- [ ] `(action, nullifier_hash)` 유니크 제약

### 참조 문서
- `/docs/World-Chain-Guide.md` - Verify Command 상세
- `/docs/phases/ENV.md` - 환경변수 통합 문서
- `/docs/phases/ARCHITECTURE.md` - FE/BE 경계 및 구조
- `@worldcoin/minikit-js/backend` - verifyCloudProof API
