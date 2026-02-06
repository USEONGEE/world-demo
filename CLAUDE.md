# World Mini-App 개발 규칙

## 필수
- 모든 검증은 백엔드에서 수행 (Frontend payload 신뢰 금지)
- Mobile-first: Tab 네비게이션, 초기 로딩 2-3초, 이후 <1초
- 사용자 자산 컨트랙트는 Immutable, 테스트 커버리지 ≥90%

## 금지
- "official" 표현, World 로고 사용, 운 기반 게임, 토큰 pre-sale
- **git push 임의 실행 금지** - 반드시 사용자 승인 후 push

## i18n
- 관리 대상 locale: **ko, en** 만 (나머지 locale 파일은 수정하지 않음)
- 위치: `src/locales/{ko,en}.json`

## World ID Action
- `MiniKit.commandsAsync.verify()`의 `action` 파라미터는 **Developer Portal에 미리 등록**해야 함
- 등록 위치: Developer Portal → 앱 선택 → Actions → Create Action
- Action 이름에 **하이픈(`-`) 사용 불가** ("common characters"만 허용) → 언더스코어(`_`) 사용
- `verifyCloudProof()` 호출 시 `app_id + action` 조합으로 유효성 검증됨
- 미등록 시 `invalid_action` / `Action not found.` 에러 발생

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

## DB 마이그레이션

- **스키마**: `gate` (모든 테이블은 `gate` 스키마 사용, `.schema('gate')`)
- 위치: `supabase/migrations/`
- 버전 규칙: `0000_`, `0001_`, `0002_` 순차 번호
- 실행: `supabase db push` 또는 Supabase Dashboard에서 직접 실행

## 완료된 기능

| 버전 | 기능 | 완료일 | 문서 |
|------|------|--------|------|
| v0.0.3 | SIWE Wallet Binding | 2026-02-06 | [archive](docs/archive/v0.0.3-siwe-wallet-binding/) |
| v0.0.2 | World ID Verify | 2026-02-06 | [archive](docs/archive/v0.0.2-world-id-verify/) |
| v0.0.1 | Foundation & Scaffolding | 2026-02-05 | [archive](docs/archive/v0.0.1-foundation-scaffolding/) |

## 현재 페이즈

- **버전**: v0.0.3.1
- **기능**: Browser Wallet Bridge
- **상태**: Step 6 완료 → 아카이브 대기
- **문서**: [docs/phases/v0.0.3.1-browser-wallet-bridge/](docs/phases/v0.0.3.1-browser-wallet-bridge/)
- **시작일**: 2026-02-06

## 문서 현황

- `docs/guide/` 문서들은 임시로 생성하지 않음 (changelog.md만 존재)
- Phase 문서: `docs/phases/vX.Y.Z-feature-name/`
- 완료된 Phase: `docs/archive/vX.Y.Z-feature-name/`
