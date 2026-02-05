# FE/BE 경계 및 디렉토리 구조

## 목표
- FE(UI)와 BE(검증/DB)의 책임을 디렉토리 구조로 분리한다.
- 각 레이어가 자신의 역할만 수행하도록 강제한다.

## 권장 디렉토리 구조
```
src/
├── app/
│   ├── (tabs)/                 # FE 라우트 (UI만)
│   ├── consent/                # FE 라우트 (UI만)
│   └── api/                    # BE 라우트(컨트롤러)
│       ├── verify/
│       ├── siwe/
│       └── wallets/
├── domains/
│   ├── human/
│   │   ├── server/             # BE 유스케이스/서비스/검증
│   │   ├── repo/               # DB 접근 (Supabase)
│   │   ├── types/              # 도메인 타입
│   │   └── client/             # FE 훅/스토어(선택)
│   ├── wallet/
│   │   ├── server/
│   │   ├── repo/
│   │   ├── types/
│   │   └── client/
├── core/
│   ├── supabase/               # server/client 분리
│   ├── session/                # 쿠키/토큰 검증 (server only)
│   ├── minikit/                # FE SDK 래퍼 (client only)
│   ├── analytics/              # FE 트래킹 (client only)
│   └── i18n/                    # FE i18n
├── shared/
│   ├── components/             # 공용 UI (client)
│   ├── utils/                  # 순수 유틸 (shared)
│   ├── contracts/              # API Request/Response 타입 + zod
│   └── errors/                 # 공통 에러 코드/메시지
```

## 경계 원칙 (필수)
- FE는 **UI + 상태 + fetch 호출만** 수행한다.
- BE는 **검증/세션/DB**를 전담한다.
- `app/api/*`는 **컨트롤러 역할만** 담당한다.
  - 요청 파싱 → 도메인 호출 → 응답 반환
- 도메인 로직은 `domains/*/server`에만 둔다.
- FE에서 서버 전용 모듈을 import 하지 않는다.

## Next.js 규칙
- 클라이언트 컴포넌트는 `use client` 필수.
- 서버 전용 모듈에는 `server-only` 사용 권장.
- `app/api`에서 UI 컴포넌트 import 금지.

## 적용 우선순위
1. 0.0.2: Human 검증/세션 → `domains/human/server`
2. 0.0.3: SIWE/Wallet → `domains/wallet/server`
3. 0.0.4: Wallet 조회 UI → `domains/wallet/client`
