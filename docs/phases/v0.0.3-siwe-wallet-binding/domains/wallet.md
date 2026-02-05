# domains/wallet 구조 정의

## 역할
- SIWE 인증 결과로 지갑 바인딩을 생성/조회한다.
- 지갑 중복 바인딩 시나리오를 처리한다.

## 책임
- Challenge 발급/검증 로직 보조
- WalletBinding 생성/조회
- 주소 중복(다른 human_id) 처리

## 예상 폴더 구조
```
src/domains/wallet/
├── services/
│   ├── issueChallenge.ts       # nonce 발급
│   ├── verifySiwe.ts            # 서명 검증 + 바인딩
│   └── listWallets.ts           # 지갑 목록 조회
├── types/
│   └── index.ts                 # WalletBinding, SiweChallenge 타입
├── repo/
│   ├── wallet.repo.ts           # wallet_binding 접근
│   └── challenge.repo.ts        # siwe_challenge 접근
├── hooks/
│   └── useWallets.ts            # FE 상태 래핑 (선택)
├── store/
│   └── wallet.store.ts          # FE 상태 (선택, Zustand)
└── index.ts                     # Public API
```

## 타입 예시
```ts
export type WalletBinding = {
  id: string
  human_id: string
  chain: 'evm'
  address: string
  verified_at: string
  verification_method: 'SIWE'
}

export type SiweChallenge = {
  id: string
  human_id: string
  address: string
  nonce: string
  issued_at: string
  expiration_time: string
  used: boolean
}
```

## 공개 API (예시)
- `issueChallenge(address): Promise<{ nonce; issued_at; expiration_time }>`
- `verifySiwe(payload, nonce): Promise<{ address; bound }>`
- `listWallets(): Promise<WalletBinding[]>`
