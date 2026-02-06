# MiniKit Kill Switch (전역 Guard 폐기) - v0.0.5

## 문제 정의

### 현상
- 전역 `AppGuard`가 `(tabs)` 그룹 하위 모든 페이지에서 MiniKit 미설치를 차단
- 브라우저 환경에서 `/wallet`, `/home`, `/settings` 등에 접근 불가 (`NotInstalledScreen` 표시)
- MiniKit이 실제로 필요한 기능은 Verify, Wallet Auth, Bridge Issue 등 일부에 불과

### 원인
- `AppGuard`가 `(tabs)/layout.tsx`에서 전역 래핑되어, MiniKit 미설치 시 모든 자식 페이지 렌더링 차단
- `allowWithoutMiniKit()` 함수로 `/home`만 예외 처리되어 있으나, 다른 경로는 모두 차단됨

### 영향
- 브라우저에서 앱 기능 확인/테스트 불가
- 브릿지를 통해 브라우저 접근한 사용자가 `/wallet`, `/settings` 페이지를 볼 수 없음
- MiniKit과 무관한 페이지(설정, 지갑 목록 조회 등)까지 불필요하게 차단

### 목표
- MiniKit 미설치여도 페이지 접근 허용 (단, SessionGuard 정책은 유지)
- MiniKit이 필요한 기능만 컴포넌트 레벨에서 비활성화 + 안내 표시
- 기존 SessionGuard 정책은 유지

## 성공 기준
- [x] MiniKit 미설치 환경에서 `/home`, `/wallet`, `/settings`, `/bridge`, `/bridge/connect` 페이지 접근 가능
- [x] MiniKit 의존 기능(VerifyButton, WalletBindingButton, BridgeIssueCard)은 미설치 시 비활성 + 안내
- [x] MiniKit 설치 환경에서 기존 기능 정상 동작
- [x] SessionGuard 정책 유지 (세션 없는 PROTECTED 경로 접근 → `/home` 리다이렉트)
- [x] `pnpm build` 성공
- [x] `/wallet` 진입 시 자동 Wallet Auth → 주소 비교 → 자동 바인딩/스킵 동작

## 제약사항
- BE 변경 없음
- 세션 가드 정책 변경 없음
- 기능 플로우 변경 없음 (Verify, Wallet Auth, Bridge Issue 로직 동일)
- URL 구조 변경 없음
- i18n은 ko, en만 지원

## 추가 변경사항
- MiniKit 설치 환경에서 `/wallet` 자동 Wallet Auth 플로우 추가
  - 주소 존재 + 이미 바인딩됨 → 바인딩 스킵
  - 주소 없음/미바인딩 → Wallet Auth → SIWE 바인딩 자동 수행
