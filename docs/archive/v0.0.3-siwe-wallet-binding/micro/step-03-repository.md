# Step 03: Repository 구현

## 메타데이터
- **난이도**: 🟡 보통
- **롤백 가능**: ✅ (파일 삭제)
- **선행 조건**: Step 01, Step 02

---

## 1. 구현 내용 (design.md 기반)
- challenge.repo.ts: Challenge CRUD (insert, findByNonce, markUsed)
- wallet.repo.ts: WalletBinding CRUD (insert, findByChainAddress, listByHumanId)
- Supabase Admin Client 사용 (RLS 우회)

## 2. 예상 범위
- [x] Scope 탐색 완료

## 3. 완료 조건
- [x] `src/domains/wallet/repo/challenge.repo.ts` 파일 존재
- [x] `insertChallenge()` 함수가 siwe_challenge에 레코드 삽입
- [x] `findChallengeByNonce()` 함수가 nonce로 challenge 조회
- [x] `markChallengeUsed()` 함수가 used=true 업데이트
- [x] `src/domains/wallet/repo/wallet.repo.ts` 파일 존재
- [x] `insertWalletBinding()` 함수가 wallet_binding에 레코드 삽입
- [x] `findWalletBindingByChainAddress()` 함수가 (chain, address)로 조회
- [x] `listWalletBindingsByHumanId()` 함수가 human_id로 목록 조회
- [x] `src/domains/wallet/repo/index.ts`에서 모든 repo 함수 re-export

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-06

### 수정 대상 파일
없음

### 신규 생성 파일
```
src/domains/wallet/repo/
├── challenge.repo.ts    # 신규 - Challenge CRUD
├── wallet.repo.ts       # 신규 - WalletBinding CRUD
└── index.ts             # 신규 - Re-export
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| src/core/supabase/server.ts | import | createSupabaseAdminClient 사용 |
| src/domains/wallet/types | import | 타입 사용 |

### Side Effect 위험
- 없음 (신규 파일만)

### 참고할 기존 패턴
- `src/domains/human/repo/human.repo.ts`: Repository 패턴

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

→ 다음: [Step 04: Server 로직](step-04-server-logic.md)
