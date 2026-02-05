# World Chain Guide

> World Mini-App 개발을 위한 포괄적인 가이드 문서

---

## 1. World 생태계 개요

### 1.1 핵심 개념: "블록체인이 아니라 자격 증명 레이어"

World는 단순한 블록체인이 아닙니다. **4개의 레이어**로 구성된 프라이버시 보존 자격 증명 시스템입니다.

| 레이어 | 역할 | 개발자 관점 |
|--------|------|-------------|
| **World App** | 사용자 호스트 앱 (지갑, 인증, 승인 UI) | Mini App이 실행되는 환경 |
| **MiniKit** | Mini App ↔ World App 브릿지 | 우리가 사용하는 주요 SDK |
| **World ID** | "이 요청은 사람에게서 왔다" 증명 | ZKP 기반 인증 |
| **World Chain** | 증명 규칙/상태의 앵커 (개인정보 저장 X) | 온체인 검증 레이어 |

### 1.2 World ID가 해결하는 문제

기존 인증:
- ❌ "당신 이름이 뭐죠?"
- ❌ "주민번호 주세요"
- ❌ "여권 사진 업로드하세요"

World ID 인증:
- ✅ "이 요청은 **유일한 인간**에게서 왔는가?"
- ✅ "이 인간은 **특정 조건을 만족**하는가?"

**→ 조건 충족 여부만 알고, 개인정보는 절대 알 수 없음 (ZKP)**

---

## 2. MiniKit 초기화 상세 가이드

### 2.1 기술 스택

```
Framework: Next.js 15
Package Manager: pnpm
SDK: @worldcoin/minikit-js
UI Kit: @worldcoin/mini-apps-ui-kit-react
Language: TypeScript
```

### 2.2 MiniKitProvider 설정

```tsx
// app/providers.tsx
'use client'

import { MiniKitProvider } from '@worldcoin/minikit-js/react'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MiniKitProvider
      appId={process.env.NEXT_PUBLIC_WLD_APP_ID}
      config={{
        // 선택적 설정
      }}
    >
      {children}
    </MiniKitProvider>
  )
}
```

```tsx
// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### 2.3 isInstalled() 체크 패턴

```tsx
import { MiniKit } from '@worldcoin/minikit-js'

function MyComponent() {
  useEffect(() => {
    if (!MiniKit.isInstalled()) {
      // World App 외부에서 실행 중
      // 대체 UI 표시 또는 World App 설치 안내
      return
    }
    // MiniKit 사용 가능
  }, [])
}
```

### 2.4 safeAreaInsets 처리

World App 내에서 Mini App은 노치, 홈 인디케이터 등의 시스템 UI를 고려해야 합니다.

```tsx
import { useSafeAreaInsets } from '@worldcoin/minikit-js/react'

function Layout({ children }) {
  const insets = useSafeAreaInsets()

  return (
    <div style={{
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }}>
      {children}
    </div>
  )
}
```

### 2.5 launchLocation 추적

사용자가 어디서 Mini App을 실행했는지 추적합니다.

```tsx
import { useLaunchParams } from '@worldcoin/minikit-js/react'

function App() {
  const { launchLocation } = useLaunchParams()

  useEffect(() => {
    // Analytics 이벤트 전송
    trackEvent('app_open', { launchLocation })
  }, [launchLocation])
}
```

### 2.6 권한 상태 확인

```tsx
import { MiniKit } from '@worldcoin/minikit-js'

async function checkPermissions() {
  const permissions = await MiniKit.getPermissions()

  // notification: 'granted' | 'denied' | 'prompt'
  // contact: 'granted' | 'denied' | 'prompt'
  // microphone: 'granted' | 'denied' | 'prompt'

  return permissions
}
```

### 2.7 초기화 체크리스트

- [ ] MiniKitProvider 래핑
- [ ] MiniKit.isInstalled() 체크
- [ ] safeAreaInsets 처리
- [ ] launchLocation 추적
- [ ] 권한 상태 확인 (notification, contact, microphone)

---

## 3. MiniKit Commands 상세 가이드

### 3.1 Verify (World ID)

사용자가 유일한 인간임을 증명합니다.

#### Proof 구조

```ts
interface VerifyCommandInput {
  action: string              // 앱에서 정의한 액션 ID
  signal?: string             // 추가 데이터 (선택)
  verification_level?: 'orb' | 'device'  // 인증 레벨
}

interface VerifyCommandOutput {
  status: 'success' | 'error'
  proof?: string              // ZK proof
  merkle_root?: string        // Merkle tree root
  nullifier_hash?: string     // 익명 식별자 (중복 방지용)
  verification_level?: string
}
```

#### nullifier_hash 이해하기

- 동일 사용자가 같은 action에 대해 항상 같은 nullifier_hash 생성
- 사용자 식별 불가능 (익명성 보장)
- action이 다르면 다른 nullifier_hash 생성
- **중복 방지의 핵심**: `(action, nullifier_hash)` 쌍으로 중복 체크

#### 프론트엔드 구현

```tsx
import { MiniKit, VerifyCommandInput } from '@worldcoin/minikit-js'

async function verifyHuman() {
  if (!MiniKit.isInstalled()) return

  const verifyPayload: VerifyCommandInput = {
    action: 'verify-human',
    signal: 'optional-extra-data',
    verification_level: 'orb',  // 또는 'device'
  }

  const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload)

  if (finalPayload.status === 'success') {
    // BE로 proof 전송하여 검증
    const response = await fetch('/api/verify', {
      method: 'POST',
      body: JSON.stringify(finalPayload),
    })
  }
}
```

#### 백엔드 검증 (필수)

```ts
// app/api/verify/route.ts
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
      return Response.json({ error: 'Already verified' }, { status: 400 })
    }

    // 신규 human 생성
    const human = await db.human.create({
      data: {
        action: payload.action,
        nullifier_hash: payload.nullifier_hash,
      }
    })

    return Response.json({ human_id: human.id })
  }

  return Response.json({ error: 'Verification failed' }, { status: 400 })
}
```

---

### 3.2 Pay (WLD/USDC)

사용자에게 결제를 요청합니다.

#### 결제 플로우

```
1. FE: Pay 커맨드 실행
2. World App: 결제 승인 UI 표시
3. 사용자: 승인
4. World App: 결제 실행
5. FE: 결과 수신
6. BE: 트랜잭션 확인 (필수)
```

#### 프론트엔드 구현

```tsx
import { MiniKit, PayCommandInput, Tokens } from '@worldcoin/minikit-js'

async function requestPayment() {
  const payPayload: PayCommandInput = {
    reference: crypto.randomUUID(),  // 고유 참조 ID
    to: '0x...recipient_address',
    tokens: [
      {
        symbol: Tokens.WLD,
        token_amount: '1.5',  // string으로 전달
      }
      // 또는 USDC
    ],
    description: '서비스 결제',
  }

  const { finalPayload } = await MiniKit.commandsAsync.pay(payPayload)

  if (finalPayload.status === 'success') {
    // BE에서 트랜잭션 확인
    await fetch('/api/confirm-payment', {
      method: 'POST',
      body: JSON.stringify({
        reference: payPayload.reference,
        transaction_hash: finalPayload.transaction_hash,
      }),
    })
  }
}
```

---

### 3.3 Wallet Auth (SIWE)

Sign-In with Ethereum으로 지갑 소유권을 증명합니다.

#### SIWE 플로우

```
1. FE → BE: Challenge 요청
2. BE → FE: nonce + message 발급
3. FE → World App: 서명 요청
4. World App → FE: 서명 반환
5. FE → BE: 서명 검증 요청
6. BE: EIP-191 또는 EIP-1271 검증
```

#### Challenge 발급 (BE)

```ts
// app/api/siwe/challenge/route.ts
import { generateNonce } from 'siwe'

export async function POST(request: Request) {
  const { address } = await request.json()

  const nonce = generateNonce()
  const issuedAt = new Date().toISOString()

  // nonce를 세션/DB에 저장 (검증 시 사용)
  await saveChallenge(address, nonce, issuedAt)

  return Response.json({
    nonce,
    issued_at: issuedAt,
    expiration_time: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  })
}
```

#### 프론트엔드 구현

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
    // 3. BE 검증
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

#### 서명 검증 (BE)

```ts
// app/api/siwe/verify/route.ts
import { SiweMessage } from 'siwe'

export async function POST(request: Request) {
  const { payload, nonce } = await request.json()

  try {
    // SIWE 메시지 파싱 및 검증
    const siweMessage = new SiweMessage(payload.message)
    const result = await siweMessage.verify({
      signature: payload.signature,
      nonce,
    })

    if (result.success) {
      // 지갑 주소 바인딩
      await db.walletBinding.create({
        data: {
          human_id: currentHumanId,
          chain: 'evm',
          address: siweMessage.address,
          verification_method: 'SIWE',
        }
      })

      return Response.json({ success: true })
    }
  } catch (error) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }
}
```

---

### 3.4 Send Transaction

온체인 트랜잭션을 실행합니다.

```tsx
import { MiniKit, SendTransactionInput } from '@worldcoin/minikit-js'

async function sendTransaction() {
  const txPayload: SendTransactionInput = {
    transaction: [
      {
        address: '0x...contract_address',
        abi: contractABI,
        functionName: 'transfer',
        args: ['0x...recipient', BigInt('1000000000000000000')],
      }
    ],
  }

  const { finalPayload } = await MiniKit.commandsAsync.sendTransaction(txPayload)

  if (finalPayload.status === 'success') {
    console.log('Transaction hash:', finalPayload.transaction_hash)
  }
}
```

---

### 3.5 Sign Message

메시지 서명을 요청합니다.

```tsx
import { MiniKit, SignMessageInput } from '@worldcoin/minikit-js'

async function signMessage() {
  const signPayload: SignMessageInput = {
    message: 'Hello, World!',
  }

  const { finalPayload } = await MiniKit.commandsAsync.signMessage(signPayload)

  if (finalPayload.status === 'success') {
    console.log('Signature:', finalPayload.signature)
    // BE에서 서명 검증
  }
}
```

---

### 3.6 Share Contacts

사용자 연락처 접근을 요청합니다.

```tsx
import { MiniKit } from '@worldcoin/minikit-js'

async function shareContacts() {
  const { finalPayload } = await MiniKit.commandsAsync.shareContacts()

  if (finalPayload.status === 'success') {
    const contacts = finalPayload.contacts
    // contacts 처리
  }
}
```

---

### 3.7 Notifications

푸시 알림 설정을 관리합니다.

```tsx
import { MiniKit } from '@worldcoin/minikit-js'

// 알림 권한 요청
async function requestNotificationPermission() {
  const result = await MiniKit.requestPermission('notification')

  if (result === 'granted') {
    // 푸시 토큰 등록
    const token = await MiniKit.getPushToken()
    await fetch('/api/register-push', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
  }
}
```

---

## 4. 백엔드 검증 가이드

### 4.1 핵심 원칙

> **중요:** 모든 검증은 백엔드에서 수행. Frontend payload 신뢰 금지.

FE는:
- proof를 해석하지 않는다
- 서명을 검증하지 않는다
- **World App이 준 payload를 그대로 BE로 전달만 한다**

### 4.2 World ID Proof 서버 검증

```ts
import { verifyCloudProof, IVerifyResponse } from '@worldcoin/minikit-js/backend'

async function verifyWorldIdProof(payload: any): Promise<IVerifyResponse> {
  return await verifyCloudProof(
    payload,
    process.env.WLD_APP_ID!,
    payload.action
  )
}
```

### 4.3 SIWE 서명 검증 (EIP-191/1271)

```ts
import { SiweMessage } from 'siwe'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

async function verifySiweSignature(
  message: string,
  signature: string,
  nonce: string
) {
  const siweMessage = new SiweMessage(message)

  // 1. 기본 검증 (nonce, 만료 시간 등)
  const result = await siweMessage.verify({
    signature,
    nonce,
  })

  if (!result.success) {
    throw new Error('SIWE verification failed')
  }

  // 2. 스마트 컨트랙트 지갑 지원 (EIP-1271)
  // 필요한 경우 추가 검증

  return siweMessage.address
}
```

### 4.4 Nullifier 기반 중복 방지

```ts
// 스키마 예시 (Prisma)
model Human {
  id             String   @id @default(uuid())
  action         String
  nullifier_hash String
  created_at     DateTime @default(now())

  @@unique([action, nullifier_hash])
}

// 중복 체크 로직
async function checkDuplicate(action: string, nullifierHash: string) {
  const existing = await prisma.human.findUnique({
    where: {
      action_nullifier_hash: {
        action,
        nullifier_hash: nullifierHash,
      }
    }
  })

  return !!existing
}
```

---

## 5. 데이터 모델 예시

### 5.1 Human (사람)

실명 없음, 이메일 없음. World ID Verify를 통과한 "익명 인간".

```ts
interface Human {
  human_id: string        // UUID
  world_action: string    // 앱에서 정의한 액션 ID
  nullifier_hash: string  // 익명 식별자
  created_at: Date
}
```

### 5.2 WalletBinding

```ts
interface WalletBinding {
  human_id: string
  chain: string           // 'evm', 'solana' 등
  address: string
  verified_at: Date
  verification_method: 'SIWE'
}
```

### 5.3 Prisma 스키마 예시

```prisma
model Human {
  id             String          @id @default(uuid())
  action         String
  nullifier_hash String
  created_at     DateTime        @default(now())
  wallets        WalletBinding[]

  @@unique([action, nullifier_hash])
}

model WalletBinding {
  id                  String   @id @default(uuid())
  human_id            String
  chain               String
  address             String
  verified_at         DateTime @default(now())
  verification_method String   @default("SIWE")
  human               Human    @relation(fields: [human_id], references: [id])

  @@unique([chain, address])
}
```

---

## 6. UI/UX 가이드라인

### 6.1 필수 사항

- **탭 네비게이션 사용** (필수)
- **초기 로딩**: 2-3초 이내
- **후속 액션**: 1초 이내
- **좌우 패딩**: 24px
- **섹션 간격**: 32px

### 6.2 금지 사항

- 푸터/사이드바
- 햄버거 메뉴
- 과도한 스크롤

### 6.3 앱 자산 규격

| 자산 | 규격 | 비고 |
|------|------|------|
| App Icon | 정사각형 | 흰색 배경 제외 |
| Content Card | 345×240px | 하단 94px 여유 |

---

## 7. 정책 준수 체크리스트

### 7.1 금지 사항 확인

- [ ] "official" 표현 사용 안함
- [ ] World 로고 사용 안함
- [ ] RNG 기반 상금 게임 없음 (운 기반 게임)
- [ ] 토큰 pre-sale 없음
- [ ] NFT 구매 기능 없음

### 7.2 필수 사항 확인

- [ ] 저연결 상태 대응
- [ ] 무한 로딩 방지 (타임아웃/재시도)
- [ ] 개발자 연락처 제공
- [ ] 데이터 수집 동의 획득
- [ ] 모든 검증은 백엔드에서 수행

---

## 8. Growth 전략

### 8.1 추적 이벤트

| 이벤트 | 트리거 시점 | 속성 |
|--------|------------|------|
| app_open | 앱 실행 | launchLocation |
| signup | 회원가입 완료 | method |
| first_value | 첫 핵심 액션 | action_type |
| invite_sent | 초대 발송 | channel |
| invite_accepted | 초대 수락 | referrer_id |
| notification_open | 푸시 클릭 | notification_type |

### 8.2 목표 메트릭

| 메트릭 | 목표 |
|--------|------|
| Signup → First Value | ≥40% |
| D1 Retention | ≥25% |
| Invite Acceptance | ≥15% |
| Push Open Rate | ≥15% |

---

## 9. 다국어 지원

| 언어 | 코드 | 우선순위 |
|------|------|----------|
| English | EN | 필수 |
| Spanish | ES | 필수 |
| Thai | TH | 필수 |
| Japanese | JA | 필수 |
| Korean | KO | 필수 |
| Portuguese | PT | 필수 |

---

## 10. PRD 템플릿

> 새 프로젝트 시작 시 아래 템플릿을 복사하여 사용하세요.

### 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **앱 이름** | _[World 포함 금지, 일반 용어 금지]_ |
| **한 줄 설명** | _[25단어 이내]_ |
| **타겟 사용자** | _[구체적인 사용자 페르소나]_ |
| **핵심 가치 제안** | _[사용자가 얻는 주요 혜택]_ |

### MiniKit 통합 기능

사용할 Commands를 체크하세요:

- [ ] **Verify** - World ID 인증
- [ ] **Pay** - WLD/USDC 결제
- [ ] **Wallet Auth** - SIWE 인증
- [ ] **Send Transaction** - 온체인 트랜잭션
- [ ] **Sign Message** - 메시지 서명
- [ ] **Share Contacts** - 연락처 공유
- [ ] **Notifications** - 푸시 알림

### 화면 구성

| 화면 | 설명 | 주요 컴포넌트 |
|------|------|---------------|
| _[화면명]_ | _[설명]_ | _[컴포넌트]_ |

### 백엔드 검증

| 항목 | 검증 내용 | 구현 위치 |
|------|----------|----------|
| _[항목]_ | _[검증 로직]_ | _[API 엔드포인트]_ |

### 스마트 컨트랙트 (해당 시)

| 컨트랙트명 | 용도 | 불변성 여부 |
|-----------|------|------------|
| _[이름]_ | _[용도]_ | _[Yes/No]_ |

**필수 요구사항:**
- [ ] 사용자 자산 관리 컨트랙트는 Immutable
- [ ] 테스트 커버리지 ≥90%
- [ ] NatSpec 주석 작성
- [ ] OpenZeppelin 라이브러리 활용

### 마일스톤

| 단계 | 주요 작업 | 완료 기준 |
|------|----------|----------|
| MVP | _[작업]_ | _[기준]_ |
| Beta | _[작업]_ | _[기준]_ |
| Launch | _[작업]_ | _[기준]_ |
