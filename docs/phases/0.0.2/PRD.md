# Phase 0.0.2 PRD — World ID Verify (Human 인증)

## 목표
- World ID proof를 BE에서 검증하고, 익명 Human 레코드를 생성/조회한다.
- 중복 방지(nullifier_hash)와 세션 발급을 통해 이후 지갑 바인딩의 기반을 만든다.

## 범위
- FE: Verify 버튼 + 성공/실패 상태 UI
- FE: MiniKit Verify 호출 및 payload 전달
- BE: proof 검증, 중복 처리, Human 생성
- BE: 세션 발급(HTTP-only cookie 또는 Bearer 토큰)
- DB: Human 테이블 및 유니크 제약

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
- finalPayload를 그대로 BE에 전달(해석/검증 금지)
- 성공/실패/중복 상태 UI 제공

### BE
- POST /api/verify
  - 입력: finalPayload(action, proof, merkle_root, nullifier_hash, verification_level, signal?)
  - 검증: verifyCloudProof 사용
  - 중복: (action, nullifier_hash) 유니크
  - 응답: { human_id, is_new }
  - 세션: human_id 기반 세션 발급(만료 포함)
- GET /api/human/me
  - 현재 세션의 human_id 반환

## 데이터 모델
### Human
- id (UUID)
- action (world_action)
- nullifier_hash
- created_at

**제약:** (action, nullifier_hash) 유니크

## 보안/정책
- proof 및 PII 저장 금지
- FE payload 신뢰 금지, BE 검증 필수
- 무한 로딩 방지(타임아웃/재시도)

## 분석 이벤트
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
  proof?: string              // ZK proof
  merkle_root?: string        // Merkle tree root
  nullifier_hash?: string     // 익명 식별자 (중복 방지용)
  verification_level?: string
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
- `@worldcoin/minikit-js/backend` - verifyCloudProof API
