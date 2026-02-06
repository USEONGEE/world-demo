# Step 05: API 라우트 구현

## 메타데이터
- **난이도**: 🟡 보통
- **롤백 가능**: ✅ (파일 삭제)
- **선행 조건**: Step 04

---

## 1. 구현 내용 (design.md 기반)
- POST /api/siwe/challenge: Challenge 발급 API
- POST /api/siwe/verify: SIWE 검증 API
- GET /api/wallet/bindings: 지갑 목록 조회 API
- 모든 라우트에서 세션 검증 (getSession)
- Zod 스키마로 입력 검증
- 표준 응답 형식 (successResponse, errorResponse)

## 2. 예상 범위
- [x] Scope 탐색 완료

## 3. 완료 조건
- [x] `src/app/api/siwe/challenge/route.ts` 파일 존재
- [x] POST /api/siwe/challenge 호출 시 세션 검증 수행
- [x] POST /api/siwe/challenge 호출 시 address 파라미터 Zod 검증
- [x] POST /api/siwe/challenge 성공 시 `{ nonce, issued_at, expiration_time }` 반환
- [x] `src/app/api/siwe/verify/route.ts` 파일 존재
- [x] POST /api/siwe/verify 호출 시 세션 검증 수행
- [x] POST /api/siwe/verify 호출 시 payload/nonce 파라미터 Zod 검증
- [x] POST /api/siwe/verify 성공 시 `{ address, bound, idempotent? }` 반환
- [x] `src/app/api/wallet/bindings/route.ts` 파일 존재
- [x] GET /api/wallet/bindings 호출 시 세션 검증 수행
- [x] GET /api/wallet/bindings 성공 시 `{ wallets: [...] }` 반환
- [x] 모든 API에서 에러 발생 시 표준 에러 응답 반환

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-06

### 수정 대상 파일
없음

### 신규 생성 파일
```
src/app/api/
├── siwe/
│   ├── challenge/route.ts    # 신규 - Challenge 발급 API
│   └── verify/route.ts       # 신규 - SIWE 검증 API
└── wallet/
    └── bindings/route.ts     # 신규 - 지갑 목록 API
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| src/domains/wallet/server | import | 서버 함수 호출 |
| src/shared/contracts/wallet | import | Zod 스키마 사용 |
| src/core/session | import | getSession 사용 |
| src/core/api/response | import | 응답 헬퍼 사용 |

### Side Effect 위험
- 없음 (신규 API 추가)

### 참고할 기존 패턴
- `src/app/api/verify/route.ts`: API 라우트 패턴
- `src/app/api/human/me/route.ts`: GET API 패턴

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

→ 다음: [Step 06: Client Store & Hooks](step-06-client-store.md)
