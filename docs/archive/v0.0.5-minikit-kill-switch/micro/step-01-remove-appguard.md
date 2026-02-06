# Step 01: AppGuard 제거 + 정리

## 메타데이터
- **난이도**: 🟢 쉬움
- **롤백 가능**: ✅ (git revert)
- **선행 조건**: 없음

---

## 1. 구현 내용 (design.md 기반)

### 삭제
- `AppGuard.tsx` 파일 삭제
- `NotInstalledScreen.tsx` 파일 삭제
- `routes.ts`에서 `allowWithoutMiniKit()` 함수 + `MINIKIT_OPTIONAL_PATHS` 상수 삭제

### 수정
- `(tabs)/layout.tsx`에서 AppGuard import/래핑 제거
- `shared/components/layout/index.ts`에서 AppGuard export 제거
- `shared/components/states/index.ts`에서 NotInstalledScreen export 제거
- `locales/ko.json`에서 `notInstalled` 섹션 삭제
- `locales/en.json`에서 `notInstalled` 섹션 삭제

## 2. 예상 범위 (Step 4에서 확정)
- [ ] Scope 탐색 필요

## 3. 완료 조건
- [x] `src/shared/components/layout/AppGuard.tsx` 파일이 존재하지 않음
- [x] `src/shared/components/states/NotInstalledScreen.tsx` 파일이 존재하지 않음
- [x] `src/app/(tabs)/layout.tsx`에 `AppGuard` 문자열이 없음
- [x] `src/shared/components/layout/index.ts`에 `AppGuard` export가 없음
- [x] `src/shared/components/states/index.ts`에 `NotInstalledScreen` export가 없음
- [x] `src/shared/guards/routes.ts`에 `allowWithoutMiniKit` 함수가 없음
- [x] `src/shared/guards/routes.ts`에 `MINIKIT_OPTIONAL_PATHS` 상수가 없음
- [x] `src/locales/ko.json`에 `notInstalled` 키가 없음
- [x] `src/locales/en.json`에 `notInstalled` 키가 없음
- [x] 코드베이스 전체에서 `AppGuard` import가 없음
- [x] 코드베이스 전체에서 `NotInstalledScreen` import가 없음

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-07

### 삭제 대상 파일
```
src/shared/components/layout/AppGuard.tsx       # 삭제 - 전역 MiniKit 차단 Guard (17줄)
src/shared/components/states/NotInstalledScreen.tsx  # 삭제 - MiniKit 미설치 화면 (20줄)
```

### 수정 대상 파일
```
src/app/(tabs)/layout.tsx                       # 수정 - AppGuard import/래핑 제거
src/shared/components/layout/index.ts           # 수정 - AppGuard export 제거 (Line 3)
src/shared/components/states/index.ts           # 수정 - NotInstalledScreen export 제거 (Line 2)
src/shared/guards/routes.ts                     # 수정 - MINIKIT_OPTIONAL_PATHS(Line 3) + allowWithoutMiniKit(Lines 24-27) 삭제
src/locales/ko.json                             # 수정 - "notInstalled" 섹션 삭제 (Lines 25-29)
src/locales/en.json                             # 수정 - "notInstalled" 섹션 삭제 (Lines 25-29)
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| AppGuard | 삭제 | (tabs)/layout.tsx에서만 import (1곳) |
| NotInstalledScreen | 삭제 | AppGuard.tsx에서만 import (1곳) — AppGuard 삭제 시 자동 해소 |
| allowWithoutMiniKit | 삭제 | AppGuard.tsx에서만 import (1곳) — AppGuard 삭제 시 자동 해소 |
| useMiniKitInstalled | 유지 | VerifyButton, WalletBindingButton, BridgeIssueCard에서 계속 사용 |
| SessionGuard | 무관 | isPublicRoute, shouldCheckSession만 사용, allowWithoutMiniKit 미사용 |
| SafeAreaLayout | 무관 | useSafeAreaInsets만 사용, AppGuard와 독립 |

### Side Effect 위험
- 없음 (AppGuard는 단일 목적 컴포넌트, 다른 코드와 완전 독립)

### 참고할 기존 패턴
- 각 MiniKit 의존 컴포넌트가 이미 자체 `useMiniKitInstalled()` 체크 + fallback UI 구현 완료

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-07

### False Positive (과잉 - 제거 대상)

| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| AppGuard.tsx 삭제 | design.md "AppGuard 완전 삭제" | ✅ OK |
| NotInstalledScreen.tsx 삭제 | design.md "NotInstalledScreen 삭제" | ✅ OK |
| (tabs)/layout.tsx 수정 | design.md "layout.tsx에서 AppGuard 제거" | ✅ OK |
| layout/index.ts 수정 | design.md "배럴에서 export 제거" | ✅ OK |
| states/index.ts 수정 | design.md "states 배럴에서 export 제거" | ✅ OK |
| routes.ts 수정 | design.md "allowWithoutMiniKit() 삭제" | ✅ OK |
| ko.json 수정 | design.md "notInstalled i18n 키 삭제" | ✅ OK |
| en.json 수정 | design.md "notInstalled i18n 키 삭제" | ✅ OK |

**FP 발견: 0건**

### False Negative (누락 - 추가 대상)

| design.md 구현 항목 | Scope 포함 여부 | 판정 |
|-------------------|----------------|------|
| AppGuard.tsx 삭제 | ✅ 삭제 대상 파일 | OK |
| NotInstalledScreen.tsx 삭제 | ✅ 삭제 대상 파일 | OK |
| (tabs)/layout.tsx 수정 | ✅ 수정 대상 파일 | OK |
| layout/index.ts export 제거 | ✅ 수정 대상 파일 | OK |
| states/index.ts export 제거 | ✅ 수정 대상 파일 | OK |
| routes.ts 함수/상수 삭제 | ✅ 수정 대상 파일 | OK |
| locales notInstalled 삭제 | ✅ 수정 대상 파일 (ko, en) | OK |

**FN 발견: 0건**

### 검증 체크리스트
- [x] Scope의 모든 파일이 구현 내용과 연결됨
- [x] 구현 내용의 모든 항목이 Scope에 반영됨
- [x] 불필요한 파일(FP)이 없음
- [x] 누락된 파일(FN)이 없음

### 검증 통과: ✅

---

→ 다음: [Step 02: 빌드 검증 + 문서 업데이트](step-02-verify-and-docs.md)
