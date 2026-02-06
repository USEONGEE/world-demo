# 설계 - v0.0.3.1

## 해결 방식

### 접근법
MiniApp에서 발급된 Human 세션을 **1회성 6자리 숫자 브릿지 코드**로 PC 브라우저에 전달하고, 브라우저에서 MetaMask로 SIWE 서명을 수행하여 지갑 바인딩을 완료한다.

### 대안 검토

| 방식 | 장점 | 단점 | 선택 |
|------|------|------|------|
| A: 6자리 숫자 코드 + QR | OTP처럼 익숙한 UX, 수동 입력 가능, 외부 라이브러리 최소 | 100만 조합이므로 Rate Limit 필수 | ✅ |
| B: UUID 토큰 + QR 전용 | 엔트로피 매우 높음 (2^122) | 수동 입력 불가, 카메라 없는 PC 사용 불가 | ❌ |
| C: 8자리 영숫자 코드 | 높은 엔트로피 (32^8) | 대소문자 혼동, 입력 오류 확률 높음 | ❌ |

**선택 이유**: 6자리 숫자는 OTP와 동일한 사용자 경험이므로 학습 비용이 없다. 1회성 + 5분 만료 + Rate Limiting 조합으로 보안 충분. Telegram Web Login, Discord Device Auth 등 동일 패턴.

### 기술 결정

| 항목 | 결정 | 근거 |
|------|------|------|
| 코드 생성 | `crypto.randomInt(0, 1000000)` | Node.js 내장, CSPRNG, 외부 의존성 없음 |
| QR 생성 | `qrcode.react` | React 컴포넌트, ~2.5KB gzipped |
| 브라우저 지갑 연결 | `viem` (createWalletClient) | 이미 의존성에 포함 |
| SIWE 메시지 | `siwe` (SiweMessage) | 이미 의존성에 포함 |
| 코드 TTL | 5분 | OTP 표준 범위 |
| 코드 표시 | "XXX-XXX" (하이픈은 표시용) | 가독성 |
| Rate Limit | consume IP당 5회/5분 | in-memory Map |

## 구현 내용

### 1. DB
- `gate.bridge_token` 테이블 생성 (id, human_id, code, expires_at, used, created_at)
- Supabase types에 bridge_token 타입 추가

### 2. Bridge 도메인 백엔드
- `src/domains/bridge/` 도메인 생성 (types/repo/server 4층 구조)
- types: BridgeToken 타입 정의
- repo: insertBridgeToken, findByCode, markUsed
- server: issueBridge (코드 생성 + DB 저장), consumeBridge (코드 검증 + 세션 발급)

### 3. API + Contracts + ErrorCodes
- `POST /api/bridge/issue` (세션 필수, { code, expires_at } 반환)
- `POST /api/bridge/consume` (세션 불필요, { code } 입력, Set-Cookie 발급)
- `src/shared/contracts/bridge.ts` (Zod 스키마)
- ErrorCodes 추가: BRIDGE_NOT_FOUND, BRIDGE_EXPIRED, BRIDGE_ALREADY_USED

### 4. MiniApp FE
- bridge.store.ts (Zustand): 코드 발급/재발급 상태 관리
- useBridge hook
- BridgeIssueCard 컴포넌트: 코드 텍스트 + QR 표시 + 만료 카운트다운 + 재발급
- Home 페이지에 통합

### 5. 브라우저 FE
- `/bridge` 라우트 (AppGuard 밖, 데스크톱 레이아웃)
- `/bridge/page.tsx`: 6자리 코드 입력 폼 (?code= 쿼리 지원)
- `/bridge/connect/page.tsx`: MetaMask 연결 + SIWE 바인딩
- useBrowserWallet hook: window.ethereum + viem + siwe

### 6. i18n
- 6개 locale 파일에 bridge 섹션 추가

## 아키텍처

### 데이터 흐름
```
[MiniApp]                    [Server]                    [PC Browser]
    |                            |                            |
    |-- POST /api/bridge/issue ->|                            |
    |<- { code, expires_at } ----|                            |
    |                            |                            |
    | [코드/QR 표시]              |                            |
    |                            |    [사용자가 코드 입력]      |
    |                            |<- POST /api/bridge/consume -|
    |                            |   { code }                  |
    |                            |-- validate & mark used      |
    |                            |-- createSessionToken        |
    |                            |-> { ok } + Set-Cookie ------| wg_session 획득
    |                            |                            |
    |                            |<- POST /api/siwe/challenge -| { address }
    |                            |-> { nonce, ... } -----------|
    |                            |                            |
    |                            |    [MetaMask 서명]          |
    |                            |<- POST /api/siwe/verify ---|
    |                            |-> { address, bound } ------|
```

### 도메인 구조
```
src/domains/bridge/
├── types/index.ts
├── repo/
│   ├── bridge.repo.ts
│   └── index.ts
├── server/
│   ├── issueBridge.ts
│   ├── consumeBridge.ts
│   └── index.ts
├── client/
│   ├── store/bridge.store.ts
│   ├── hooks/
│   │   ├── useBridge.ts
│   │   ├── useBrowserWallet.ts
│   │   └── index.ts
│   ├── components/
│   │   ├── BridgeIssueCard.tsx
│   │   ├── BrowserWalletConnect.tsx
│   │   └── index.ts
│   └── index.ts
└── index.ts
```

### 브라우저 라우트 구조
```
src/app/bridge/
├── layout.tsx         (데스크톱 전용 레이아웃, AppGuard 밖)
├── page.tsx           (코드 입력 페이지)
└── connect/
    └── page.tsx       (지갑 연결 페이지)
```

## 리스크 및 완화

| 리스크 | 완화 |
|--------|------|
| 코드 충돌 (동시 발급 시 같은 6자리) | DB unique + 재시도 (최대 3회) |
| Rate Limit 우회 | IP 기반 + 짧은 TTL (5분) |
| window.ethereum 미감지 | MetaMask 설치 안내 메시지 |
| SameSite cookie 정책 | same-origin이므로 Lax 충분 |
| SIWE domain 불일치 | 동일 도메인에서 실행, window.location.host 사용 |
