# Phase 0.0.1.1 PRD — Refactor Plan (FE/BE 경계 정리)

## 목표
- 0.0.2 개발 전에 FE/BE 경계를 명확히 하고, 향후 기능 확장을 위한 구조를 정리한다.
- 현재 기능은 유지하고, 디렉토리/모듈 책임만 재배치한다.

## 범위
- 디렉토리 구조 정리 (domains/human, domains/wallet 추가)
- server/client 코드 경계 분리
- app/api 컨트롤러 역할 최소화
- 공통 타입/계약(shared/contracts) 도입

## 비범위
- 기능 추가 (World ID, SIWE 구현 자체는 0.0.2+)
- UI/UX 변경
- 데이터 모델 변경

## 현재 문제
- FE/BE 경계가 코드 레벨에서 명확하지 않음
- 도메인별 server/client 분리가 없어 BE 로직이 app/api에 몰릴 위험
- 공통 타입(요청/응답) 정의 위치가 없음

## 완료 기준
- `domains/human`, `domains/wallet` 폴더 생성
- `core/session` 생성 및 서버 전용 경로 분리
- `shared/contracts` 추가 (API Request/Response 타입)
- `app/api/*`는 컨트롤러만 남김
- FE는 server-only 모듈 import 금지

---

## 디렉토리 구조 (목표)
```
src/
├── app/
│   ├── (tabs)/
│   ├── consent/
│   └── api/
│       ├── verify/
│       ├── siwe/
│       └── wallets/
├── domains/
│   ├── human/
│   │   ├── server/
│   │   ├── repo/
│   │   ├── types/
│   │   └── client/
│   ├── wallet/
│   │   ├── server/
│   │   ├── repo/
│   │   ├── types/
│   │   └── client/
├── core/
│   ├── supabase/
│   ├── session/
│   ├── minikit/
│   ├── analytics/
│   └── i18n/
├── shared/
│   ├── components/
│   ├── utils/
│   ├── contracts/
│   └── errors/
```

---

## 작업 단계

### Step 1. 폴더 스캐폴딩
- 생성:
  - `src/domains/human/{server,repo,types,client}`
  - `src/domains/wallet/{server,repo,types,client}`
  - `src/core/session`
  - `src/shared/contracts`
  - `src/shared/errors`

### Step 2. 서버 전용/클라이언트 전용 분리
- `core/session` 및 `domains/*/server`에 `server-only` 적용
- FE에서 server-only import 금지 규칙 정리

### Step 3. app/api 컨트롤러 정리
- 컨트롤러는 요청 파싱 + 도메인 호출만 수행
- 실제 로직은 `domains/*/server`로 이동

### Step 4. 공통 타입 정리
- API 요청/응답 타입을 `shared/contracts`에 추가
- FE/BE가 동일 타입 참조

---

## 파일 매핑 가이드 (예시)
- `app/api/verify/route.ts` → `domains/human/server/verifyHuman.ts`
- `app/api/siwe/*` → `domains/wallet/server/*`
- `core/session/*` → 세션 발급/검증 전담

---

## 리스크 및 대응
- 리팩터링 중 기능 손상 위험
  - 대응: 기능 추가 없이 파일 이동/정리만 수행
- 잘못된 import 경로
  - 대응: tsconfig alias 유지, 리팩터링 이후 전체 typecheck

---

## 테스트/검증
- `pnpm lint`
- `pnpm build` 또는 `pnpm type-check` (가능 시)
- 주요 화면 정상 렌더링 확인

---

## 참조 문서
- `/docs/phases/ARCHITECTURE.md`
- `/docs/phases/v0.0.2-world-id-verify/PRD.md`
