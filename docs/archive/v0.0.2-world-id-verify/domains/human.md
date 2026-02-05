# domains/human 구조 정의

## 역할
- World ID Verify 결과를 기반으로 익명 Human을 생성/조회한다.
- 세션 발급/검증에 필요한 최소 정보(human_id)를 제공한다.

## 책임
- proof 검증 결과를 받아 Human 레코드 생성
- nullifier 중복 체크
- 현재 세션의 human_id 조회

## 예상 폴더 구조
```
src/domains/human/
├── server/
│   ├── verifyHuman.ts         # proof 검증 & human 생성
│   └── index.ts               # 서버 API export
├── client/
│   ├── components/            # Verify UI
│   ├── hooks/                 # useVerify/useHuman
│   └── store/                 # Zustand store
├── types/
│   └── index.ts               # Human, HumanSession 타입
├── repo/
│   └── human.repo.ts          # Supabase 접근 계층
└── index.ts                   # Public API
```

## 타입 예시
```ts
export type Human = {
  id: string
  action: string
  nullifier_hash: string
  created_at: string
}

export type HumanSession = {
  human_id: string
  iat: number
  exp: number
}
```

## 공개 API (예시)
- `verifyHuman(payload): Promise<{ human_id: string; is_new: boolean }>`
- `getCurrentHuman(): Promise<{ human_id: string }>`

## 참고
- 세션 정책은 `/docs/phases/ENV.md`의 SESSION_* 항목 참고
