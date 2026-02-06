# World Mini-App 개발 규칙

## 금지 사항
- "official" 표현, World 로고 사용, 운 기반 게임, 토큰 pre-sale
- **git push 임의 실행 금지** — 반드시 사용자 승인 후 push

## 인증/세션

- World ID verify는 로그인이 아니라 **1회 신원 증명**
- 세션 유실 시 재-verify 가능, `max_verifications_reached` → "이미 인증됨"으로 세션 재발급
- 로그인 유지 기준: `wg_session` HTTP-Only 쿠키
- 세션 검증: `GET /api/human/me`

## Guard 정책

- 경로 정책은 **중앙화된 함수**로만 관리 (`src/shared/guards/routes.ts`)
- PUBLIC: `/`, `/home`, `/bridge`, `/consent`
- PROTECTED: 그 외 전부 (`/wallet`, `/settings`, `/bridge/connect` 등)
- 세션 없이 PROTECTED 접근 → `/home`으로 리다이렉트

## MiniKit 접근

- 기본: MiniKit 미설치 환경은 접근 불가
- 예외: `/home`은 MiniKit 없이 접근 가능 (브라우저에서 브릿지 안내용)

## 세션 체크

- 전역 `SessionGuard`가 **단 한번만** 수행
- 개별 페이지에서 중복 체크 금지 (VerifyButton, /bridge/connect 등에서 제거됨)

## 브릿지 흐름

- 코드 발급: MiniApp + 세션 필수 (`/api/bridge/issue`)
- 코드 입력: 브라우저 `/bridge`에서만 가능
- `/bridge/connect`는 세션 필수
- 브라우저 로그인 유도: `/home` → `/bridge` 버튼

## API 에러 처리

- 모든 에러는 **`handleApiError()`로 통일** 처리 (`src/core/api/handleError.ts`)
- 응답 포맷: `{ error: { code, message, details }, timestamp, requestId }`
- 개별 라우트에서 statusMap 금지, 공통 매핑 사용

## World ID Action

- action 값은 **Developer Portal에 등록된 이름**만 사용
- 하이픈(`-`) 금지, 언더스코어(`_`) 사용
- `app_id + action` 조합 불일치 → `invalid_action` 에러

## DB/Schema

- 스키마: `gate` (`.schema('gate')`)
- Supabase API schemas에 `gate` 포함 필요 (`supabase/config.toml`)
- 마이그레이션: `supabase/migrations/`, 버전 `0000_`, `0001_` 순차

## i18n

- 지원 locale: **ko, en** 만 (다른 locale 추가 금지)
- 위치: `src/locales/{ko,en}.json`

## FE/BE 경계

- FE: 요청/표시만 담당
- 검증/권한/DB 처리 **모두 BE 전담**
- Frontend payload 신뢰 금지

## 보안

- 브릿지 코드: 1회성 + TTL, 모든 검증은 서버에서만 수행
- 사용자 자산 컨트랙트: Immutable, 테스트 커버리지 ≥90%

## 문서

- Phase 문서: `docs/phases/vX.Y.Z-feature-name/`
- 완료된 Phase: `docs/archive/vX.Y.Z-feature-name/`

## 개발 환경 테스트

World MiniApp은 World App 내부에서 실행됨. localhost 직접 접근 불가.

### 방법 1: ngrok 터널링
```bash
# 터미널 1: 개발 서버
pnpm dev

# 터미널 2: ngrok 터널링
ngrok http 3000
```
ngrok URL (예: `https://xxxx.ngrok-free.app`)을 Developer Portal에 등록

### 방법 2: Vercel 배포
```bash
vercel
```
Preview URL을 Developer Portal에 등록

### World Developer Portal 설정
1. https://developer.worldcoin.org 접속
2. 앱 생성/수정
3. **Mini App URL**에 ngrok/Vercel URL 입력
4. `.env.local`의 `NEXT_PUBLIC_WLD_APP_ID`를 Portal 발급값으로 설정

### 로컬 브라우저 테스트 (AppGuard 비활성화)
`src/app/(tabs)/layout.tsx`에서 `<AppGuard>` 주석 처리 후 브라우저에서 직접 테스트 가능

## 빌드/테스트 명령어

- `pnpm dev` — 개발 서버
- `pnpm build` — 프로덕션 빌드
- `npx tsc --noEmit` — 타입 체크

## 완료된 기능

| 버전 | 기능 | 문서 |
|------|------|------|
| v0.0.3.2 | SessionGuard / 로그인 개선 | [archive](docs/archive/v0.0.3.2-session-guard-login/) |
| v0.0.3.1 | Browser Wallet Bridge | [archive](docs/archive/v0.0.3.1-browser-wallet-bridge/) |
| v0.0.3 | SIWE Wallet Binding | [archive](docs/archive/v0.0.3-siwe-wallet-binding/) |
| v0.0.2 | World ID Verify | [archive](docs/archive/v0.0.2-world-id-verify/) |
| v0.0.1 | Foundation & Scaffolding | [archive](docs/archive/v0.0.1-foundation-scaffolding/) |

## 현재 페이즈

- **버전**: v0.0.4
- **기능**: Wallet 관리 UI + 상태 흐름
- **문서**: [docs/phases/v0.0.4-wallet-management-ui/](docs/phases/v0.0.4-wallet-management-ui/)
