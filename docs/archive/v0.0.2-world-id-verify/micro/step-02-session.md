# Step 02: 세션 토큰 관리 (jose)

## 메타데이터
- **난이도**: 🟡 보통
- **롤백 가능**: ✅ (코드 삭제)
- **선행 조건**: Step 01 (DB 타입 정의)

---

## 1. 구현 내용 (design.md 기반)

### 의존성 추가
- `pnpm add jose` 실행

### 세션 토큰 함수 (`src/core/session/index.ts`)
- `createSessionToken(payload)`: JWT 생성, HS256, 7일 만료
- `verifySessionToken(token)`: JWT 검증, payload 반환
- `setSessionCookie(response, token)`: HTTP-only Cookie 설정
- `getSessionFromCookie(request)`: Request에서 세션 추출

### 환경변수
- `SESSION_SECRET`: JWT 서명 시크릿 (32+ 문자)
- `SESSION_COOKIE_NAME`: 쿠키명 (기본 `wg_session`)
- `SESSION_TTL_SECONDS`: 만료 시간 (기본 604800)
- `SESSION_EXPIRES_IN`: 만료 시간 (기본 '7d', TTL 미설정 시 fallback)

## 2. 예상 범위 (Step 4에서 확정)
- [ ] Scope 탐색 필요

## 3. 완료 조건

### 의존성
- [ ] `package.json`에 jose 패키지 추가됨
- [ ] `pnpm install` 후 jose import 가능

### 토큰 생성
- [ ] `createSessionToken({ human_id: 'test' })` 호출 시 JWT 문자열 반환
- [ ] 반환된 토큰이 `eyJ`로 시작 (JWT 형식)
- [ ] jwt.io에서 토큰 디코드 시 human_id, iat, exp 필드 확인

### 토큰 검증
- [ ] 유효한 토큰으로 `verifySessionToken()` 호출 시 payload 반환
- [ ] 만료된 토큰으로 호출 시 에러 throw
- [ ] 잘못된 서명 토큰으로 호출 시 에러 throw

### 쿠키 유틸
- [ ] `setSessionCookie()` 호출 시 Response에 `wg_session` 쿠키 설정
- [ ] 쿠키 옵션: HttpOnly=true, SameSite=Lax, Secure(prod)=true, Path=/
- [ ] `getSessionFromCookie()` 호출 시 Request 쿠키에서 세션 추출

### 환경변수
- [ ] `SESSION_SECRET` 없이 실행 시 에러 발생
- [ ] `.env.example`에 SESSION_SECRET, SESSION_EXPIRES_IN, SESSION_COOKIE_NAME, SESSION_TTL_SECONDS 추가

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-06

### 수정 대상 파일
```
src/core/session/index.ts     # 수정 - stub 함수 구현
package.json                   # 수정 - jose 의존성 추가
.env.example                   # 수정 - SESSION_SECRET, SESSION_EXPIRES_IN, SESSION_COOKIE_NAME, SESSION_TTL_SECONDS 추가
.env.local                     # 수정 - 환경변수 값 설정
```

### 신규 생성 파일
```
src/core/session/constants.ts  # 선택 - 세션 관련 상수
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| jose | 신규 의존성 | JWT 생성/검증 라이브러리 |
| SessionPayload | 타입 사용 | 이미 정의됨 (human_id, iat, exp) |
| next/headers | 쿠키 처리 | cookies() 함수 사용 |
| ErrorCodes | 에러 처리 | SESSION_EXPIRED, INVALID_TOKEN 추가 권장 |

### Side Effect 위험
- **환경변수 필수**: SESSION_SECRET 없으면 런타임 에러
- **쿠키 이름 충돌**: Supabase도 쿠키 사용, `wg_session`으로 고유 이름 사용
- **Edge Runtime 호환**: jose 라이브러리는 Edge Runtime 지원

### 참고할 기존 패턴
- `src/core/supabase/server.ts`: cookies() 사용 패턴
- `src/shared/errors/http.ts`: ErrorCodes 정의 패턴

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-06

### False Positive (과잉 - 제거 대상)

Scope에 있지만 이 Step의 구현 내용에 불필요한 항목:

| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| src/core/session/index.ts | 4개 함수 구현 | ✅ OK |
| package.json | jose 의존성 추가 | ✅ OK |
| .env.example | SESSION_SECRET, SESSION_EXPIRES_IN, SESSION_COOKIE_NAME, SESSION_TTL_SECONDS | ✅ OK |
| .env.local | 환경변수 값 설정 | ✅ OK |
| src/core/session/constants.ts | 선택적 상수 파일 | ✅ OK (선택) |

**FP 조치:** 없음 (모든 항목 필요)

### False Negative (누락 - 추가 대상)

구현 내용에 있지만 Scope에 없는 항목:

| 구현 내용 | Scope 포함 여부 | 판정 |
|----------|----------------|------|
| jose 설치 | ✅ package.json | OK |
| createSessionToken | ✅ session/index.ts | OK |
| verifySessionToken | ✅ session/index.ts | OK |
| setSessionCookie | ✅ session/index.ts | OK |
| getSessionFromCookie | ✅ session/index.ts | OK |

**FN 조치:** 없음 (모든 항목 포함됨)

### 검증 체크리스트
- [x] Scope의 모든 파일이 구현 내용과 연결됨
- [x] 구현 내용의 모든 항목이 Scope에 반영됨
- [x] 불필요한 파일(FP)이 제거됨
- [x] 누락된 파일(FN)이 추가됨

### 검증 통과: ✅

---

→ 다음: [Step 03: Human Repo 구현](step-03-repo.md)
