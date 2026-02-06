# Step 03: API 라우트 + Contracts + ErrorCodes

## 메타데이터
- **난이도**: 🟡 보통
- **롤백 가능**: ✅
- **선행 조건**: Step 02 (서버 로직 필요)

---

## 1. 구현 내용 (design.md 기반)
- `src/app/api/bridge/issue/route.ts`: POST, 세션 필수, issueBridge 호출, { code, expires_at } 반환
- `src/app/api/bridge/consume/route.ts`: POST, 세션 불필요, Zod 검증, consumeBridge 호출, createSessionToken + setSessionCookie + { ok: true }

> **Note**: ErrorCodes, Contracts는 Step 02에서 함께 구현 (의존성 해결)

## 2. 완료 조건
- [ ] `contracts/bridge.ts`의 BridgeConsumeRequestSchema가 8자리 Base32만 통과 (7K3M9T2Q ✅, 123456 ❌, abcdef ❌)
- [ ] `errors/http.ts`에 INVALID_BRIDGE_CODE, BRIDGE_EXPIRED, BRIDGE_ALREADY_USED, RATE_LIMITED 에러 코드 존재
- [ ] `POST /api/bridge/issue`가 세션 없으면 401 반환
- [ ] `POST /api/bridge/issue`가 세션 있으면 { code, expires_at } 반환
- [ ] `POST /api/bridge/consume`이 유효한 코드에 대해 200 + Set-Cookie: wg_session 반환
- [ ] `POST /api/bridge/consume`이 잘못된/미존재 코드에 대해 400 반환
- [ ] `POST /api/bridge/consume`이 만료 코드에 대해 400 반환
- [ ] `POST /api/bridge/consume`이 사용된 코드에 대해 400 반환
- [ ] `POST /api/bridge/issue`와 `POST /api/bridge/consume`이 Rate Limit 초과 시 429 반환
- [ ] `POST /api/bridge/consume`이 잘못된 형식에 대해 400 (validation error) 반환

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-06

### 수정 대상 파일
없음 (ErrorCodes/Contracts는 Step 02에서 완료)

### 신규 생성 파일
```
src/app/api/bridge/issue/route.ts           # 신규 - POST 브릿지 발급
src/app/api/bridge/consume/route.ts         # 신규 - POST 브릿지 소비 + 세션 발급
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| domains/bridge/server | 사용 | issueBridge, consumeBridge (Step 02) |
| core/session | 사용 | getSession, createSessionToken, setSessionCookie |
| core/api | 사용 | errorResponse, successResponse |
| shared/contracts | 사용 | Zod 스키마 |

### Side Effect 위험
- /api/bridge/consume은 세션 없이 호출 가능 → 의도적 설계 (코드 자체가 인증 수단)
- 쿠키 설정: SameSite=Lax, same-origin이므로 CORS 문제 없음

### 참고할 기존 패턴
- `src/app/api/siwe/challenge/route.ts`: 세션 필수 API 라우트
- `src/app/api/verify/route.ts`: 세션 발급 (setSessionCookie) 패턴
- `src/shared/contracts/wallet.ts`: Zod 스키마 + 타입 정의

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-06

### False Positive (과잉)

| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| api/bridge/issue/route.ts | POST 브릿지 발급 | ✅ OK |
| api/bridge/consume/route.ts | POST 브릿지 소비 + 세션 | ✅ OK |

FP 없음.

### False Negative (누락)

| 구현 내용 | Scope 포함 여부 | 판정 |
|----------|----------------|------|
| issue API | ✅ | OK |
| consume API + setSessionCookie | ✅ | OK |

FN 없음.

### 검증 체크리스트
- [x] Scope의 모든 파일이 구현 내용과 연결됨
- [x] 구현 내용의 모든 항목이 Scope에 반영됨

### 검증 통과: ✅

---

→ 다음: [Step 04: MiniApp FE](step-04-miniapp-fe.md)
