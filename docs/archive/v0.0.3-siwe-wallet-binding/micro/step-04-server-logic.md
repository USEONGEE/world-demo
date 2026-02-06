# Step 04: Server 로직 (Challenge/Verify)

## 메타데이터
- **난이도**: 🟠 중간
- **롤백 가능**: ✅ (파일 삭제)
- **선행 조건**: Step 03

---

## 1. 구현 내용 (design.md 기반)
- issueChallenge.ts: nonce 생성, DB 저장, 응답 반환
- verifySiwe.ts: SIWE 메시지 검증, 중복 체크, WalletBinding 생성
- listWallets.ts: 현재 사용자의 지갑 목록 조회
- siwe 라이브러리로 nonce 생성 및 메시지 검증
- EIP-1271 스마트 지갑 검증은 viem으로 처리
- 에러 처리 (만료, 재사용, 중복 바인딩)

## 2. 예상 범위
- [x] Scope 탐색 완료

## 3. 완료 조건
- [x] `src/domains/wallet/server/issueChallenge.ts` 파일 존재
- [x] `issueChallenge(humanId, address)` 함수가 nonce/issued_at/expiration_time 반환
- [x] Challenge 유효시간 10분으로 설정
- [x] `src/domains/wallet/server/verifySiwe.ts` 파일 존재
- [x] `verifySiwe(humanId, payload, nonce)` 함수가 SIWE 검증 수행
- [x] EIP-191 실패 시 EIP-1271 검증 경로(viem) 수행
- [x] 동일 human_id + address 재바인딩 시 `{ address, bound: true, idempotent: true }` 반환
- [x] 다른 human_id에 이미 바인딩된 address 시 ADDRESS_ALREADY_BOUND 에러 throw
- [x] Challenge 만료 시 INVALID_CHALLENGE 에러 throw
- [x] Challenge 이미 사용됨(used=true) 시 INVALID_CHALLENGE 에러 throw
- [x] nonce 불일치 시 INVALID_CHALLENGE 에러 throw
- [x] 검증 성공 시 challenge.used=true 업데이트
- [x] `src/domains/wallet/server/listWallets.ts` 파일 존재
- [x] `listWallets(humanId)` 함수가 지갑 목록 반환
- [x] `src/domains/wallet/server/index.ts`에서 모든 서버 함수 re-export

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-06

### 수정 대상 파일
```
package.json    # 수정 - siwe, viem 의존성 추가
```

### 신규 생성 파일
```
src/domains/wallet/server/
├── issueChallenge.ts    # 신규 - Challenge 발급 로직
├── verifySiwe.ts        # 신규 - SIWE 검증 + 바인딩 로직
├── listWallets.ts       # 신규 - 지갑 목록 조회
└── index.ts             # 신규 - Re-export
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| src/domains/wallet/repo | import | Repository 함수 사용 |
| src/core/session | import | getSession 사용 |
| src/shared/errors | import | ApiError 사용 |
| siwe (npm) | 외부 의존성 | SIWE 메시지 검증 |
| viem (npm) | 외부 의존성 | EIP-1271 검증 (스마트 지갑) |

### Side Effect 위험
- 의존성 추가로 번들 크기 증가 (siwe, viem)

### 참고할 기존 패턴
- `src/domains/human/server/verifyHuman.ts`: 검증 로직 패턴

---

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-06

### False Positive (과잉 - 제거 대상)
없음

### False Negative (누락 - 추가 대상)
| 구현 내용 | Scope 포함 여부 | 판정 |
|----------|----------------|------|
| siwe 의존성 설치 | package.json 수정에 포함 | ✅ OK |

### 검증 체크리스트
- [x] Scope의 모든 파일이 구현 내용과 연결됨
- [x] 구현 내용의 모든 항목이 Scope에 반영됨
- [x] 불필요한 파일(FP)이 없음
- [x] 누락된 파일(FN)이 없음

### 검증 통과: ✅

---

→ 다음: [Step 05: API 라우트 구현](step-05-api-routes.md)
