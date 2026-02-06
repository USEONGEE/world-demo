# 설계 - v0.0.3 SIWE Wallet Binding

## 해결 방식

### 접근법
SIWE(Sign-In with Ethereum) 표준을 사용하여 지갑 소유권을 검증하고, MiniKit의 Wallet Auth Command를 통해 World App에서 서명을 요청한다.

**핵심 플로우:**
```
1. FE → BE: Challenge 요청 (address)
2. BE → FE: nonce/issued_at/expiration_time 반환
3. FE → World App: MiniKit.walletAuth() 서명 요청
4. World App → FE: 서명 반환
5. FE → BE: 서명 검증 요청 (payload, nonce)
6. BE: SIWE 검증 → WalletBinding 생성
```

### 대안 검토

| 방식 | 장점 | 단점 | 선택 |
|------|------|------|------|
| A: 자체 서명 스킴 | 유연성 | 표준 아님, 보안 검증 부담 | ❌ |
| B: SIWE + MiniKit | 표준화, World App 통합 | MiniKit 의존 | ✅ |
| C: WalletConnect | 범용성 | World App 최적화 아님 | ❌ |

**선택 이유**: SIWE는 EIP-4361 표준이며, MiniKit이 Wallet Auth Command를 네이티브 지원. World App 환경에 최적화.

### 기술 결정

**라이브러리:**
- `siwe`: SIWE 메시지 생성/검증 (v2.3+)
- `viem`: EIP-1271 스마트 컨트랙트 지갑 검증
- `@worldcoin/minikit-js`: Wallet Auth Command

**아키텍처:**
- 기존 도메인 구조(`src/domains/wallet/`) 활용
- 서버 로직은 `server/` 디렉토리
- Repository 패턴으로 DB 접근 분리
- 기존 세션 시스템(`wg_session` 쿠키) 재사용

**보안:**
- Challenge nonce 단일 사용 (used 플래그)
- Challenge 만료 시간 10분
- 서명 원문 저장 최소화
- Backend 검증 필수 (FE payload 신뢰 금지)

---

## 구현 내용

### 1. 데이터베이스

**siwe_challenge 테이블:**
```sql
create table gate.siwe_challenge (
  id uuid primary key,
  human_id uuid references gate.human(id),
  address text not null,
  nonce text unique not null,
  issued_at timestamptz not null,
  expiration_time timestamptz not null,
  used boolean default false
);
```

**wallet_binding 테이블:**
```sql
create table gate.wallet_binding (
  id uuid primary key,
  human_id uuid references gate.human(id),
  chain text not null default 'evm',
  address text not null,
  verified_at timestamptz default now(),
  verification_method text default 'SIWE',
  unique(chain, address)
);
```

### 2. API 엔드포인트

| Endpoint | Method | 입력 | 출력 |
|----------|--------|------|------|
| /api/siwe/challenge | POST | `{ address }` | `{ nonce, issued_at, expiration_time }` |
| /api/siwe/verify | POST | `{ payload, nonce }` | `{ address, bound, idempotent? }` |
| /api/wallet/bindings | GET | - | `{ wallets: [...] }` |

### 3. 도메인 구조

```
src/domains/wallet/
├── types/index.ts           # WalletBinding, SiweChallenge 타입
├── repo/
│   ├── challenge.repo.ts    # siwe_challenge CRUD
│   └── wallet.repo.ts       # wallet_binding CRUD
├── server/
│   ├── issueChallenge.ts    # Challenge 발급 로직
│   ├── verifySiwe.ts        # SIWE 검증 + 바인딩 로직
│   └── listWallets.ts       # 지갑 목록 조회
├── client/
│   ├── store/wallet.store.ts    # Zustand 상태
│   ├── hooks/useWalletBinding.ts
│   └── components/WalletBindingButton.tsx
└── index.ts
```

### 4. 세션 검증

모든 SIWE API는 기존 세션 시스템 사용:
```typescript
const session = await getSession()
if (!session) throw new ApiError('UNAUTHORIZED', 401)
const humanId = session.human_id
```

### 5. 에러 코드

| 상황 | HTTP | 에러 코드 |
|------|------|----------|
| 세션 없음 | 401 | UNAUTHORIZED |
| nonce 불일치/만료/재사용 | 400 | INVALID_CHALLENGE |
| 서명 검증 실패 | 400 | VERIFICATION_FAILED |
| 다른 human에 이미 바인딩 | 409 | ADDRESS_ALREADY_BOUND |

### 6. UI 플로우

```
WalletTab
├── 로그인 상태 확인 (isVerified)
├── 연결된 지갑 목록 표시
└── WalletBindingButton
    ├── 클릭 → Challenge 요청
    ├── MiniKit.walletAuth() 호출
    ├── 서명 완료 → Verify 요청
    └── 성공/실패 상태 표시
```

### 7. 분석 이벤트
- siwe_challenge_issued
- siwe_sign_success / siwe_sign_fail
- wallet_bind_success / wallet_bind_fail (reason)
