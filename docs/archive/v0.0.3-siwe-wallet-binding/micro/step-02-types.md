# Step 02: Contracts & Types 정의

## 메타데이터
- **난이도**: 🟢 쉬움
- **롤백 가능**: ✅ (파일 삭제)
- **선행 조건**: Step 01 (DB 스키마 참조)

---

## 1. 구현 내용 (design.md 기반)
- WalletBinding, SiweChallenge 도메인 타입 정의
- API 요청/응답 Zod 스키마 정의
- Supabase Database 타입에 새 테이블 추가
- SIWE 관련 에러 코드 추가

## 2. 예상 범위
- [x] Scope 탐색 완료

## 3. 완료 조건
- [x] `src/domains/wallet/types/index.ts`에 WalletBinding, SiweChallenge 타입 정의
- [x] `src/shared/contracts/wallet.ts`에 Zod 스키마 정의 (SiweChallengeRequestSchema, SiweVerifyRequestSchema)
- [x] `src/core/supabase/types.ts`에 siwe_challenge, wallet_binding 테이블 타입 추가
- [x] `src/shared/errors/http.ts`에 INVALID_CHALLENGE, ADDRESS_ALREADY_BOUND 에러 코드 추가

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-06

### 수정 대상 파일
```
src/
├── core/supabase/types.ts        # 수정 - 새 테이블 타입 추가
└── shared/errors/http.ts         # 수정 - 에러 코드 추가
```

### 신규 생성 파일
```
src/
├── domains/wallet/types/index.ts     # 신규 - 도메인 타입
└── shared/contracts/wallet.ts        # 신규 - Zod 스키마
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| src/core/supabase/types.ts | 수정 | Database 타입 확장 |
| src/shared/errors/ | 수정 | 에러 코드 추가 |

### Side Effect 위험
- Supabase 타입 변경 시 기존 쿼리 타입 체크 영향 가능 (낮음)

### 참고할 기존 패턴
- `src/domains/human/types/index.ts`: 도메인 타입 패턴
- `src/shared/contracts/human.ts`: Zod 스키마 패턴
- `src/core/api/response.ts`: 에러 코드 패턴

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

→ 다음: [Step 03: Repository 구현](step-03-repository.md)
