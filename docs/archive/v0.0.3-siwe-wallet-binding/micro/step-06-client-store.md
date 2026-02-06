# Step 06: Client Store & Hooks

## 메타데이터
- **난이도**: 🟡 보통
- **롤백 가능**: ✅ (파일 삭제)
- **선행 조건**: Step 05

---

## 1. 구현 내용 (design.md 기반)
- wallet.store.ts: Zustand 상태 관리 (지갑 목록, 바인딩 상태)
- useWalletBinding.ts: 지갑 바인딩 플로우 훅
- MiniKit.walletAuth() 호출 로직
- API 호출 및 상태 업데이트
- 분석 이벤트 트래킹 (siwe_challenge_issued, siwe_sign_success/fail, wallet_bind_success/fail)

## 2. 예상 범위
- [x] Scope 탐색 완료

## 3. 완료 조건
- [x] `src/domains/wallet/client/store/wallet.store.ts` 파일 존재
- [x] useWalletStore에 wallets, isLoading, error 상태 존재
- [x] useWalletStore에 bindWallet(), fetchWallets(), reset() 액션 존재
- [x] zustand persist는 선택 (필요 시 wallets 상태 로컬 저장)
- [x] `src/domains/wallet/client/hooks/useWalletBinding.ts` 파일 존재
- [x] useWalletBinding 훅이 bindWallet 플로우 제공
- [x] bindWallet 플로우: Challenge 요청 → MiniKit.walletAuth() → Verify 요청
- [x] MiniKit.walletAuth() 호출 시 nonce, statement, expirationTime 전달
- [x] 분석 이벤트: siwe_challenge_issued, siwe_sign_success/fail, wallet_bind_success/fail 기록
- [x] `src/domains/wallet/client/index.ts`에서 store, hooks re-export

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-06

### 수정 대상 파일
없음

### 신규 생성 파일
```
src/domains/wallet/client/
├── store/
│   └── wallet.store.ts          # 신규 - Zustand 상태
├── hooks/
│   └── useWalletBinding.ts      # 신규 - 바인딩 훅
└── index.ts                     # 신규 - Re-export
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| zustand | 외부 의존성 | 상태 관리 (이미 설치됨) |
| @worldcoin/minikit-js | 외부 의존성 | walletAuth 명령 (이미 설치됨) |
| src/domains/wallet/types | import | 타입 사용 |

### Side Effect 위험
- 없음 (신규 파일만)

### 참고할 기존 패턴
- `src/domains/human/client/store/human.store.ts`: Zustand 패턴
- `src/domains/human/client/hooks/useVerify.ts`: 훅 패턴

---

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-06

### False Positive (과잉 - 제거 대상)
없음

### False Negative (누락 - 추가 대상)
없음

### 검증 체크리스트
- [x] Scope의 모든 파일이 구현 내용과 연결됨
- [x] 구현 내용의 모든 항목이 Scope에 반영됨
- [x] 불필요한 파일(FP)이 없음
- [x] 누락된 파일(FN)이 없음

### 검증 통과: ✅

---

→ 다음: [Step 07: UI 컴포넌트](step-07-ui-components.md)
