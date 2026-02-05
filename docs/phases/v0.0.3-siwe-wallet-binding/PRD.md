# Phase 0.0.3 PRD — SIWE Wallet Binding

## 목표
- SIWE로 지갑 소유권을 검증하고 Human ↔ Address 매핑을 안전하게 저장한다.
- World ID 인증 세션과 결합해 “인간 + 지갑” 결합을 확정한다.

## 범위
- FE: 지갑 주소 입력/연결 UI, SIWE 서명 요청 및 결과 표시
- BE: Challenge 발급, 서명 검증(EIP-191/EIP-1271), WalletBinding 생성
- DB: WalletBinding, SiweChallenge 테이블

## 비범위
- 지갑 목록 페이지(표시/관리) 고도화
- 온체인 트랜잭션 실행
- 세금 리포트

## 사용자 플로우
1. 사용자가 지갑 주소 입력 또는 연결
2. FE → BE: Challenge 요청
3. BE → FE: nonce/expiration 반환
4. FE → World App: Wallet Auth 서명 요청
5. FE → BE: 서명 및 메시지 제출
6. BE: 검증 성공 시 WalletBinding 저장

## 기능 요구사항
### FE
- Wallet Auth Command 실행
- Challenge 요청/응답 처리
- 성공/실패/만료 상태 UI 제공

### BE
- POST /api/siwe/challenge
  - 입력: address
  - 검증: 세션 human_id 필요
  - 출력: nonce, issued_at, expiration_time
  - 저장: (human_id, address, nonce, issued_at, expiration_time, used=false)
- POST /api/siwe/verify
  - 입력: payload(message, signature), nonce
  - 검증: nonce 매칭/만료/단일 사용
  - 서명 검증: siwe.verify + 필요 시 EIP-1271
  - address 중복: 다른 human_id에 이미 바인딩된 경우 409
  - 성공: WalletBinding 생성
  - 응답: { address, bound: true }

## 데이터 모델
### SiweChallenge
- id (UUID)
- human_id
- address
- nonce
- issued_at
- expiration_time
- used (boolean)

### WalletBinding
- id (UUID)
- human_id
- chain ("evm")
- address
- verified_at
- verification_method ("SIWE")

**제약:** (chain, address) 유니크

## 보안/정책
- FE payload 신뢰 금지, BE 검증 필수
- 서명/메시지 원문 저장 최소화(로그 마스킹)
- Challenge 단일 사용 및 만료 처리

## 분석 이벤트
- siwe_challenge_issued
- siwe_sign_success / siwe_sign_fail
- wallet_bind_success / wallet_bind_fail (reason)

## 테스트
- BE: 정상 서명 → 바인딩 성공
- BE: nonce 불일치/만료/재사용 → 4xx
- BE: 주소 중복 바인딩 → 409
- FE: 성공/실패 상태 UI

## 완료 기준
- SIWE 서명 검증 성공 시 바인딩 저장
- 중복 주소 차단 동작
- Challenge 만료/재사용 차단

---

## MiniKit Wallet Auth (SIWE) 규칙

### SIWE 플로우

```
1. FE → BE: Challenge 요청
2. BE → FE: nonce + message 발급
3. FE → World App: 서명 요청
4. World App → FE: 서명 반환
5. FE → BE: 서명 검증 요청
6. BE: EIP-191 또는 EIP-1271 검증
```

### WalletAuth Input

```ts
interface WalletAuthInput {
  nonce: string           // BE에서 발급한 challenge nonce
  statement: string       // 서명 메시지 (사용자에게 표시)
  expirationTime: Date    // 서명 만료 시간
}
```

### BE Challenge 발급

```ts
// app/api/siwe/challenge/route.ts
import { generateNonce } from 'siwe'

export async function POST(request: Request) {
  const { address } = await request.json()

  const nonce = generateNonce()
  const issuedAt = new Date().toISOString()
  const expirationTime = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  // nonce를 DB에 저장 (검증 시 사용, 단일 사용)
  await db.siweChallenge.create({
    data: {
      human_id: currentHumanId,
      address,
      nonce,
      issued_at: issuedAt,
      expiration_time: expirationTime,
      used: false,
    }
  })

  return Response.json({
    nonce,
    issued_at: issuedAt,
    expiration_time: expirationTime,
  })
}
```

### FE: Wallet Auth 요청

> **중요:** FE는 서명을 검증하지 않는다. World App이 준 payload를 그대로 BE로 전달만 한다.

```tsx
import { MiniKit, WalletAuthInput } from '@worldcoin/minikit-js'

async function walletAuth() {
  // 1. Challenge 요청
  const challenge = await fetch('/api/siwe/challenge', {
    method: 'POST',
    body: JSON.stringify({ address: userAddress }),
  }).then(r => r.json())

  // 2. 서명 요청
  const walletAuthPayload: WalletAuthInput = {
    nonce: challenge.nonce,
    statement: 'Sign in to MyApp',
    expirationTime: new Date(Date.now() + 10 * 60 * 1000),
  }

  const { finalPayload } = await MiniKit.commandsAsync.walletAuth(walletAuthPayload)

  if (finalPayload.status === 'success') {
    // 3. BE 검증 (payload 그대로 전달)
    await fetch('/api/siwe/verify', {
      method: 'POST',
      body: JSON.stringify({
        payload: finalPayload,
        nonce: challenge.nonce,
      }),
    })
  }
}
```

### BE: 서명 검증

```ts
// app/api/siwe/verify/route.ts
import { SiweMessage } from 'siwe'

export async function POST(request: Request) {
  const { payload, nonce } = await request.json()

  // 1. Challenge 유효성 확인
  const challenge = await db.siweChallenge.findFirst({
    where: { nonce, used: false }
  })

  if (!challenge) {
    return Response.json({ error: 'Invalid or used nonce' }, { status: 400 })
  }

  if (new Date(challenge.expiration_time) < new Date()) {
    return Response.json({ error: 'Challenge expired' }, { status: 400 })
  }

  try {
    // 2. SIWE 메시지 검증
    const siweMessage = new SiweMessage(payload.message)
    const result = await siweMessage.verify({
      signature: payload.signature,
      nonce,
    })

    if (result.success) {
      // 3. Challenge 사용 처리
      await db.siweChallenge.update({
        where: { id: challenge.id },
        data: { used: true }
      })

      // 4. 지갑 바인딩 생성
      await db.walletBinding.create({
        data: {
          human_id: challenge.human_id,
          chain: 'evm',
          address: siweMessage.address,
          verification_method: 'SIWE',
        }
      })

      return Response.json({ address: siweMessage.address, bound: true })
    }
  } catch (error) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }
}
```

### 보안 규칙

| 항목 | 규칙 |
|------|------|
| nonce | 단일 사용 (used 플래그 관리) |
| 만료 처리 | expiration_time 체크 필수 |
| 서명 원문 | 저장 최소화 (로그 마스킹) |
| EIP-1271 | 스마트 컨트랙트 지갑 지원 고려 |
| FE payload | 신뢰 금지, BE 검증 필수 |

### 보안 체크리스트

- [ ] nonce 단일 사용 처리
- [ ] Challenge 만료 처리
- [ ] 서명 원문 저장 금지
- [ ] FE payload 신뢰 금지 (BE 검증 필수)
- [ ] `(chain, address)` 유니크 제약

### 참조 문서
- `/docs/World-Chain-Guide.md` - Wallet Auth 상세
- `siwe` - Sign-In with Ethereum 라이브러리
- `@worldcoin/minikit-js` - WalletAuth Command
