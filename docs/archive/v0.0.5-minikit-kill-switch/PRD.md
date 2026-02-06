# Phase 0.0.5 PRD — MiniKit Kill Switch (전역 Guard 폐기)

## 배경/문제
- 전역 `AppGuard`가 `(tabs)` 그룹 하위 모든 페이지에서 MiniKit 미설치를 차단
- 브라우저 환경에서 `/wallet`, `/home`, `/settings` 접근이 막혀 사용자 흐름이 끊김
- 실제 MiniKit이 필요한 기능은 일부(Verify, Wallet Auth, Bridge Issue 등)에 불과

## 목표
- MiniKit 미설치여도 **페이지 접근은 허용**
- 단, **세션 정책(SessionGuard)은 유지**
- MiniKit이 필요한 기능만 “비활성화/안내” 처리 (Kill Switch)

## 범위
### FE
- 전역 `AppGuard` 제거 또는 우회
- MiniKit 필요 기능에만 조건부 UI 적용
  - 미설치 시 버튼 disable + 안내
  - 설치 시 정상 플로우 유지

### BE
- 변경 없음

## 비범위
- 세션 가드 정책 변경
- 기능 플로우 변경(Verify, Wallet Auth, Bridge Issue 로직은 동일)
- URL 구조 변경

## 기능 요구사항
### 전역 정책
- MiniKit 미설치여도 페이지 접근 가능
- SessionGuard는 유지되어 세션 없는 접근은 `/home`으로 리다이렉트

### MiniKit 전용 기능
- MiniKit 미설치 시:
  - Verify 버튼 비활성/안내
  - WalletBindingButton 비활성/안내
  - BridgeIssueCard 비활성/안내
- MiniKit 설치 시:
  - 기존 기능 그대로 동작

### 추가 요구사항 (Wallet 탭 자동 Wallet Auth)
- MiniKit 설치 환경에서 `/wallet` 진입 시:
  - `MiniKit.user.walletAddress`가 없으면 Wallet Auth를 자동 시도
  - Wallet Auth로 얻은 주소가 기존 지갑 목록에 있으면 **바인딩 스킵**
  - 지갑 목록에 없으면 SIWE 바인딩 자동 수행
  - 실패 시 재시도 UI 제공

## UX 가이드
- 비활성 상태에서 명확한 메시지 표시
  - 예: “World App에서만 사용할 수 있습니다”
- 버튼이 비활성화된 경우에도 동일한 레이아웃 유지

## 변경 대상 (예상)
- `src/app/(tabs)/layout.tsx` (AppGuard 제거)
- `src/shared/components/layout/AppGuard.tsx` (사용 중단 또는 noop)
- `src/domains/human/client/components/VerifyButton.tsx`
- `src/domains/wallet/client/components/WalletBindingButton.tsx`
- `src/domains/bridge/client/components/BridgeIssueCard.tsx`

## 테스트
1) 브라우저에서 `/home`, `/wallet`, `/settings`, `/bridge`, `/bridge/connect` 접근 가능
2) MiniKit 미설치 환경에서 버튼 비활성 + 안내 노출
3) MiniKit 설치 환경에서 기존 기능 정상 동작
4) 세션 미존재 시 `/home` 리다이렉트 유지
5) MiniKit 설치 + 지갑 주소 없음 → Wallet Auth 자동 실행
6) MiniKit 주소가 이미 바인딩된 경우 → 바인딩 스킵
7) 바인딩되지 않은 주소 → SIWE 바인딩 자동 수행

## 완료 기준
- MiniKit 미설치 환경에서도 페이지 접근 차단 없음(세션 정책 제외)
- MiniKit 기능만 Kill Switch로 안전하게 비활성화됨
- 기존 MiniKit 기능 동작은 유지됨
- `/wallet` 자동 Wallet Auth → 주소 비교 → 자동 바인딩/스킵 동작
