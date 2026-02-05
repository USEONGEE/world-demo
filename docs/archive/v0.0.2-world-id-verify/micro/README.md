# 개발 단계 - v0.0.2 World ID Verify

## 전체 현황

| # | Step | 난이도 | 롤백 | Scope | FP/FN | 개발 | 완료일 |
|---|------|--------|------|-------|-------|------|--------|
| 01 | DB 마이그레이션 + Supabase 타입 | 🟢 | ✅ | ✅ | ✅ 통과 | ✅ 완료 | 2026-02-06 |
| 02 | 세션 토큰 관리 (jose) | 🟡 | ✅ | ✅ | ✅ 통과 | ✅ 완료 | 2026-02-06 |
| 03 | Human Repo 구현 | 🟡 | ✅ | ✅ | ✅ 통과 | ✅ 완료 | 2026-02-06 |
| 04 | Human 서비스 + API 구현 | 🟠 | ✅ | ✅ | ✅ 통과 | ✅ 완료 | 2026-02-06 |
| 05 | FE Verify UI + Store | 🟠 | ✅ | ✅ | ✅ 통과 | ✅ 완료 | 2026-02-06 |

## 의존성

```
01 (DB) → 02 (세션) → 03 (Repo) → 04 (서비스/API) → 05 (FE)
              ↘          ↗
               └────────┘
```

- Step 01: DB 스키마가 모든 것의 기반
- Step 02: 세션 토큰은 API 구현 전 필요
- Step 03: Repo는 DB 스키마에 의존, 서비스에서 사용
- Step 04: 서비스는 Repo + 세션에 의존
- Step 05: FE는 API 완성 후 연동

## Step 상세

- [Step 01: DB 마이그레이션 + Supabase 타입](step-01-db.md)
- [Step 02: 세션 토큰 관리 (jose)](step-02-session.md)
- [Step 03: Human Repo 구현](step-03-repo.md)
- [Step 04: Human 서비스 + API 구현](step-04-api.md)
- [Step 05: FE Verify UI + Store](step-05-fe.md)

---

## README.md 성공 기준 매핑

| README.md 성공 기준 | 관련 micro step | 충족 여부 |
|-------------------|----------------|----------|
| 유효한 proof로 human_id 발급 (POST /api/verify) | Step 04 | ✅ |
| 중복 nullifier 처리 동작 | Step 03, 04 | ✅ |
| 세션 발급 및 /api/human/me 정상 동작 | Step 02, 04 | ✅ |
| FE에서 인증 완료/실패/중복 상태 UI 표시 | Step 05 | ✅ |
| proof, PII 저장 금지 | Step 03, 04 (구현 시 준수) | ✅ |

## design.md ↔ micro step FP/FN 검증

### False Positive (과잉) 검사

| Step | 구현 항목 | design.md 근거 | 판정 |
|------|----------|---------------|------|
| 01 | DB 마이그레이션 | "DB 마이그레이션" | ✅ OK |
| 01 | Supabase 타입 생성 | "DB 접근 - 타입 추가" | ✅ OK |
| 02 | jose JWT 생성/검증 | "세션 관리 - jose, HS256" | ✅ OK |
| 02 | 쿠키 설정 유틸 | "세션 관리 - HttpOnly/SameSite/Secure" | ✅ OK |
| 03 | findHumanByActionNullifier | "Human Repo" | ✅ OK |
| 03 | insertHuman | "Human Repo" | ✅ OK |
| 04 | verifyHuman 서비스 | "Human 서비스" | ✅ OK |
| 04 | getCurrentHuman 서비스 | "Human 서비스" | ✅ OK |
| 04 | status 검증 | "status 검증" | ✅ OK |
| 04 | verifyCloudProof 타임아웃/재시도 | "타임아웃/재시도" | ✅ OK |
| 04 | POST /api/verify | "API 라우트" | ✅ OK |
| 04 | GET /api/human/me | "API 라우트" | ✅ OK |
| 05 | useVerify hook | "FE 구현 - Verify Hook" | ✅ OK |
| 05 | Human store | "FE 구현 - Human Store" | ✅ OK |
| 05 | Verify UI | "FE 구현 - Verify UI" | ✅ OK |
| 05 | 분석 이벤트 | "분석 이벤트" | ✅ OK |

**FP 결과:** 없음 (모든 항목에 design.md 근거 있음)

### False Negative (누락) 검사

| design.md 구현 항목 | 대응 Step | 판정 |
|-------------------|----------|------|
| DB 마이그레이션 | Step 01 | ✅ OK |
| Supabase 타입 추가 | Step 01 | ✅ OK |
| jose 의존성 추가 | Step 02 | ✅ OK |
| createSessionToken | Step 02 | ✅ OK |
| verifySessionToken | Step 02 | ✅ OK |
| setSessionCookie | Step 02 | ✅ OK |
| getSessionFromCookie | Step 02 | ✅ OK |
| findHumanByActionNullifier | Step 03 | ✅ OK |
| insertHuman | Step 03 | ✅ OK |
| verifyHuman | Step 04 | ✅ OK |
| status 검증 | Step 04 | ✅ OK |
| verifyCloudProof 타임아웃/재시도 | Step 04 | ✅ OK |
| getCurrentHuman | Step 04 | ✅ OK |
| POST /api/verify | Step 04 | ✅ OK |
| GET /api/human/me | Step 04 | ✅ OK |
| useVerify hook | Step 05 | ✅ OK |
| Human store | Step 05 | ✅ OK |
| Verify UI | Step 05 | ✅ OK |
| FE 구조 (client/hooks/store/components) | Step 05 | ✅ OK |
| 분석 이벤트 | Step 05 | ✅ OK |
| 에러 처리 (VERIFICATION_FAILED) | Step 04 | ✅ OK |
| Zod 스키마 검증 | Step 04 | ✅ OK |

**FN 결과:** 없음 (모든 design.md 항목이 step에 포함됨)
