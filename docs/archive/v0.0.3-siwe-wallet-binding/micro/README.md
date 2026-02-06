# 개발 단계 - v0.0.3 SIWE Wallet Binding

## 전체 현황

| # | Step | 난이도 | 롤백 | Scope | FP/FN | 개발 | 완료일 |
|---|------|--------|------|-------|-------|------|--------|
| 01 | DB 마이그레이션 | 🟢 | ✅ | ✅ | ✅ | ✅ | 2026-02-06 |
| 02 | Contracts & Types 정의 | 🟢 | ✅ | ✅ | ✅ | ✅ | 2026-02-06 |
| 03 | Repository 구현 | 🟡 | ✅ | ✅ | ✅ | ✅ | 2026-02-06 |
| 04 | Server 로직 (Challenge/Verify) | 🟠 | ✅ | ✅ | ✅ | ✅ | 2026-02-06 |
| 05 | API 라우트 구현 | 🟡 | ✅ | ✅ | ✅ | ✅ | 2026-02-06 |
| 06 | Client Store & Hooks | 🟡 | ✅ | ✅ | ✅ | ✅ | 2026-02-06 |
| 07 | UI 컴포넌트 | 🟠 | ✅ | ✅ | ✅ | ✅ | 2026-02-06 |

## 의존성

```
01 → 02 → 03 → 04 → 05 → 06 → 07
```

- Step 01: DB 테이블 생성 (독립)
- Step 02: 타입 정의 (01 이후)
- Step 03: Repository 구현 (02 이후, DB 접근 필요)
- Step 04: Server 로직 (03 이후, repo 사용)
- Step 05: API 라우트 (04 이후, server 함수 호출)
- Step 06: Client Store (05 이후, API 호출)
- Step 07: UI 컴포넌트 (06 이후, store 사용)

## Step 상세
- [Step 01: DB 마이그레이션](step-01-db-migration.md)
- [Step 02: Contracts & Types 정의](step-02-types.md)
- [Step 03: Repository 구현](step-03-repository.md)
- [Step 04: Server 로직](step-04-server-logic.md)
- [Step 05: API 라우트 구현](step-05-api-routes.md)
- [Step 06: Client Store & Hooks](step-06-client-store.md)
- [Step 07: UI 컴포넌트](step-07-ui-components.md)

## README.md 성공 기준 매핑

| README.md 성공 기준 | 관련 micro step | 충족 여부 |
|-------------------|----------------|----------|
| POST /api/siwe/challenge 동작 | Step 04, 05 | ✅ |
| POST /api/siwe/verify 동작 | Step 04, 05 | ✅ |
| 동일 human_id 재바인딩 idempotent | Step 04 | ✅ |
| 다른 human_id 바인딩 409 Conflict | Step 04 | ✅ |
| Challenge 만료 처리 | Step 04 | ✅ |
| Challenge 재사용 차단 | Step 04 | ✅ |
| GET /api/wallet/bindings 동작 | Step 04, 05 | ✅ |
| UI에서 지갑 연결 플로우 | Step 06, 07 | ✅ |

## design.md 설계 반영 확인

| design.md 결정사항 | micro step 반영 | 판정 |
|------------------|----------------|------|
| siwe_challenge 테이블 | Step 01 | ✅ OK |
| wallet_binding 테이블 | Step 01 | ✅ OK |
| siwe/viem 라이브러리 | Step 04 | ✅ OK |
| 도메인 구조 (types/repo/server/client) | Step 02, 03, 04, 06 | ✅ OK |
| 기존 세션 시스템 재사용 | Step 04, 05 | ✅ OK |
| Challenge nonce 단일 사용 | Step 04 | ✅ OK |
| 에러 코드 (INVALID_CHALLENGE 등) | Step 02, 04 | ✅ OK |
| 지갑 목록 조회 endpoint | Step 04, 05 | ✅ OK |
| 분석 이벤트 | Step 06 | ✅ OK |
