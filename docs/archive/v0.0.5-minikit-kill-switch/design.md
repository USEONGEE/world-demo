# 설계 - v0.0.5 MiniKit Kill Switch

## 해결 방식

### 접근법
전역 MiniKit 차단(AppGuard)을 제거하고, MiniKit 의존 기능만 컴포넌트 레벨에서 비활성화하는 "Kill Switch" 방식 적용.

### 대안 검토

| 방식 | 장점 | 단점 | 선택 |
|------|------|------|------|
| A: AppGuard에 경로 예외 추가 | 기존 구조 유지, 변경 최소 | 경로 늘어날 때마다 관리 필요, 근본적 해결 아님 | ❌ |
| B: AppGuard 완전 삭제 + 컴포넌트 레벨 disable | 깔끔한 구조, 모든 페이지 접근 보장 | AppGuard/NotInstalledScreen 코드 삭제 필요 | ✅ |
| C: AppGuard를 noop 래퍼로 변경 | 롤백 용이 | 불필요한 코드 잔존, 의도 불명확 | ❌ |

**선택 이유**: B 방식은 불필요한 전역 차단 로직을 완전히 제거하여 코드베이스를 단순화하고, 각 컴포넌트가 자체적으로 MiniKit 의존성을 관리하게 하여 단일 책임 원칙을 따름.

### 기술 결정

1. **AppGuard 완전 삭제**
   - `AppGuard.tsx` 파일 삭제
   - `(tabs)/layout.tsx`에서 AppGuard import/래핑 제거
   - `shared/components/layout/index.ts` 배럴에서 export 제거

2. **routes.ts 정리**
   - `allowWithoutMiniKit()` 함수 및 `MINIKIT_OPTIONAL_PATHS` 상수 삭제 (사용처 없어짐)

3. **NotInstalledScreen 삭제**
   - `NotInstalledScreen` 컴포넌트 삭제 (사용처 없어짐)
   - `shared/components/states` 배럴에서 export 제거
   - `notInstalled` i18n 키 삭제

4. **MiniKit 의존 컴포넌트 유지**
   - VerifyButton, WalletBindingButton, BridgeIssueCard는 이미 자체적으로 `useMiniKitInstalled()` 체크 + fallback UI를 구현하고 있음
   - **코드 변경 불필요** — 이미 Kill Switch 패턴이 컴포넌트 레벨에 있음

5. **유지 항목**
   - `SessionGuard`: 세션 기반 보호, MiniKit과 무관
   - `SafeAreaLayout`: MiniKit 없으면 기본값(0) 사용, 에러 없이 동작
   - `MiniKitClientProvider`: useLaunchLocation 등을 위해 유지
   - `useMiniKitInstalled()`: 컴포넌트 레벨에서 계속 사용

## 구현 내용

### 삭제 대상
- `src/shared/components/layout/AppGuard.tsx` — 파일 삭제
- `src/shared/components/states/NotInstalledScreen.tsx` — 파일 삭제 (사용처 없어짐)
- `src/shared/guards/routes.ts`의 `allowWithoutMiniKit()` 함수 + `MINIKIT_OPTIONAL_PATHS` 상수

### 수정 대상
- `src/app/(tabs)/layout.tsx` — AppGuard import/래핑 제거
- `src/shared/components/layout/index.ts` — AppGuard export 제거
- `src/shared/components/states/index.ts` — NotInstalledScreen export 제거
- `src/locales/ko.json` — `notInstalled` 섹션 삭제
- `src/locales/en.json` — `notInstalled` 섹션 삭제

### 변경 없음
- VerifyButton, WalletBindingButton, BridgeIssueCard (이미 자체 MiniKit 체크 구현)
- SessionGuard, SafeAreaLayout, MiniKitClientProvider
- BE 코드 전체

## 리스크

| 리스크 | 영향 | 대응 |
|--------|------|------|
| AppGuard 삭제 후 MiniKit 미설치 환경 UX | 각 컴포넌트가 개별 안내 표시 | 이미 컴포넌트 레벨 fallback 구현됨 |
| CLAUDE.md "로컬 브라우저 테스트" 섹션 outdated | 개발 가이드 오류 | AppGuard 주석 처리 안내 삭제 |
