# Step 04: Human 서비스 + API 구현

## 메타데이터
- **난이도**: 🟠 중간
- **롤백 가능**: ✅ (코드 삭제)
- **선행 조건**: Step 02 (세션), Step 03 (Repo)

---

## 1. 구현 내용 (design.md 기반)

### Contracts (`src/shared/contracts/`)
- VerifyPayloadSchema (Zod): proof 검증 payload 스키마
  - 필수: action, proof, merkle_root, nullifier_hash
  - 선택: status, verification_level, signal
  - extra field는 passthrough 허용
- VerifyResponse 타입: { human_id, is_new }
- ErrorCodes에 VERIFICATION_FAILED 추가

### Human 서비스 (`src/domains/human/server/verifyHuman.ts`)
- `verifyHuman(payload)`:
  - Zod로 payload 검증
  - status가 존재하면 'success'만 허용 (그 외 400)
  - verifyCloudProof() 호출 (World ID 검증)
  - verifyCloudProof 타임아웃(10s) + 1회 재시도
  - human.repo.findByActionNullifier() 로 중복 확인
  - 없으면 human.repo.insertHuman() 으로 생성
  - createSessionToken() 으로 세션 생성
  - 반환: { human_id, is_new, sessionToken }

- `getCurrentHuman()`:
  - getSessionFromCookie() 로 세션 추출
  - human_id 반환

### API 라우트
- `src/app/api/verify/route.ts` (POST):
  - verifyHuman() 호출
  - 성공 시 Set-Cookie + { human_id, is_new } 응답
  - 실패 시 적절한 에러 응답

- `src/app/api/human/me/route.ts` (GET):
  - getCurrentHuman() 호출
  - 세션 없으면 401 Unauthorized
  - 있으면 { human_id } 응답

## 2. 예상 범위 (Step 4에서 확정)
- [ ] Scope 탐색 필요

## 3. 완료 조건

### Contracts
- [ ] VerifyPayloadSchema가 action, proof, merkle_root, nullifier_hash 필수 검증
- [ ] status, verification_level, signal은 optional로 허용
- [ ] unknown key는 passthrough 허용
- [ ] 잘못된 payload 시 Zod validation error 발생
- [ ] ErrorCodes.VERIFICATION_FAILED 존재

### verifyHuman 서비스
- [ ] 유효한 proof로 호출 시 { human_id, is_new: true, sessionToken } 반환 (신규)
- [ ] 동일 nullifier로 재호출 시 { human_id, is_new: false, sessionToken } 반환 (기존)
- [ ] 무효한 proof로 호출 시 VERIFICATION_FAILED 에러 throw
- [ ] status가 'success'가 아니면 400 에러
- [ ] verifyCloudProof 타임아웃 시 재시도 후 실패 반환
- [ ] proof 원문이 DB에 저장되지 않음 (보안)

### getCurrentHuman 서비스
- [ ] 유효한 세션 쿠키로 호출 시 human_id 반환
- [ ] 세션 없이 호출 시 null 반환
- [ ] 만료된 세션으로 호출 시 null 반환

### POST /api/verify
- [ ] 유효한 payload로 POST 시 200 + { human_id, is_new } 응답
- [ ] 응답에 Set-Cookie: wg_session 헤더 포함
- [ ] 무효한 payload로 POST 시 400 에러
- [ ] proof 검증 실패 시 400 + VERIFICATION_FAILED 에러

### GET /api/human/me
- [ ] 유효한 세션 쿠키로 GET 시 200 + { human_id } 응답
- [ ] 세션 없이 GET 시 401 Unauthorized
- [ ] 만료된 세션으로 GET 시 401 Unauthorized

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-06

### 수정 대상 파일
```
src/domains/human/server/verifyHuman.ts  # 수정 - stub 함수 구현
src/shared/contracts/human.ts             # 수정 - VerifyPayloadSchema/Response 타입 정리
src/shared/errors/http.ts                 # 수정 - VERIFICATION_FAILED 에러 코드 추가
```

### 신규 생성 파일
```
src/app/api/verify/route.ts              # 신규 - POST /api/verify
src/app/api/human/me/route.ts            # 신규 - GET /api/human/me
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| @worldcoin/minikit-js | 백엔드 사용 | verifyCloudProof() 함수 |
| human.repo | 직접 호출 | findHumanByActionNullifier, insertHuman |
| session | 직접 호출 | createSessionToken, getSessionFromCookie |
| successResponse/errorResponse | API 응답 | `@/core/api` |
| Zod | 입력 검증 | VerifyPayloadSchema |

### Side Effect 위험
- **verifyCloudProof 외부 의존성**: World ID 백엔드 API 호출, 타임아웃/재시도 필요
- **FE payload 신뢰 금지**: CLAUDE.md 규칙, BE 재검증 필수
- **세션 쿠키 설정**: Set-Cookie 헤더 포함 필수

### 참고할 기존 패턴
- `src/app/api/health/route.ts`: API 라우트 구조
- `src/app/api/config/route.ts`: successResponse 사용

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-06

### False Positive (과잉 - 제거 대상)

Scope에 있지만 이 Step의 구현 내용에 불필요한 항목:

| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| src/domains/human/server/verifyHuman.ts | 2개 함수 구현 | ✅ OK |
| src/shared/contracts/human.ts | 타입 검토 | ✅ OK |
| src/shared/errors/http.ts | VERIFICATION_FAILED 추가 | ✅ OK |
| src/app/api/verify/route.ts | POST 엔드포인트 | ✅ OK |
| src/app/api/human/me/route.ts | GET 엔드포인트 | ✅ OK |

**FP 조치:** 없음 (모든 항목 필요)

### False Negative (누락 - 추가 대상)

구현 내용에 있지만 Scope에 없는 항목:

| 구현 내용 | Scope 포함 여부 | 판정 |
|----------|----------------|------|
| VerifyPayloadSchema (Zod) | ✅ contracts/human.ts 또는 별도 | OK |
| verifyHuman 서비스 | ✅ verifyHuman.ts | OK |
| getCurrentHuman 서비스 | ✅ verifyHuman.ts | OK |
| POST /api/verify | ✅ verify/route.ts | OK |
| GET /api/human/me | ✅ human/me/route.ts | OK |
| VERIFICATION_FAILED 에러 | ✅ errors/http.ts | OK |

**FN 조치:** 없음 (모든 항목 포함됨)

### 검증 체크리스트
- [x] Scope의 모든 파일이 구현 내용과 연결됨
- [x] 구현 내용의 모든 항목이 Scope에 반영됨
- [x] 불필요한 파일(FP)이 제거됨
- [x] 누락된 파일(FN)이 추가됨

### 검증 통과: ✅

---

→ 다음: [Step 05: FE Verify UI + Store](step-05-fe.md)
