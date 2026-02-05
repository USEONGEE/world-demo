# Step 03: SafeAreaLayout + AppGuard

## 메타데이터
- **난이도**: 🟡 보통
- **롤백 가능**: ✅
- **선행 조건**: Step 02 완료

---

## 1. 구현 내용 (design.md 기반)

- SafeAreaLayout 컴포넌트 구현 (useSafeAreaInsets 훅 사용)
- AppGuard 컴포넌트 구현 (MiniKit.isInstalled() 체크)
- 좌우 패딩 24px 적용
- 탭바 높이 고려한 하단 패딩

## 2. 예상 범위 (Step 4에서 확정)
- [ ] Scope 탐색 필요

## 3. 완료 조건

- [ ] `components/layout/SafeAreaLayout.tsx` 파일 존재
- [ ] SafeAreaLayout이 `useSafeAreaInsets()` 훅 사용
- [ ] SafeAreaLayout이 좌우 최소 24px 패딩 적용 (World 가이드라인)
- [ ] `components/layout/AppGuard.tsx` 파일 존재
- [ ] AppGuard가 `MiniKit.isInstalled()` 체크
- [ ] AppGuard가 설치 안됨 상태에서 NotInstalledScreen 컴포넌트 렌더링
- [ ] AppGuard가 로딩 중 상태에서 LoadingScreen 컴포넌트 렌더링
- [ ] World App 외부에서 접근 시 "World App Required" 화면 표시

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-05

### 신규 생성 파일
```
components/
└── layout/
    ├── SafeAreaLayout.tsx           # useSafeAreaInsets 훅 사용
    └── AppGuard.tsx                 # MiniKit.isInstalled() 체크
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| @worldcoin/minikit-js/react | 직접 의존 | useSafeAreaInsets |
| @worldcoin/minikit-js | 직접 의존 | MiniKit.isInstalled |
| Step 05 상태 화면 | 참조 필요 | NotInstalledScreen, LoadingScreen |

### Side Effect 위험
- 초기 설치 체크 1초 타이머로 인한 로딩 지연
- 탭바 고정 높이(60px) 하드코딩
- useSafeAreaInsets가 iOS 노치/인셋 감지

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-05

### False Positive (과잉 - 제거 대상)

| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| SafeAreaLayout.tsx | design.md SafeArea 레이아웃 | ✅ OK |
| AppGuard.tsx | design.md MiniKit 설치 체크 | ✅ OK |

**FP 조치:** 없음

### False Negative (누락 - 추가 대상)

| 구현 내용 | Scope 포함 여부 | 판정 |
|----------|----------------|------|
| SafeAreaLayout (useSafeAreaInsets) | ✅ SafeAreaLayout.tsx | OK |
| AppGuard (isInstalled 체크) | ✅ AppGuard.tsx | OK |
| 좌우 24px 패딩 | ✅ SafeAreaLayout.tsx | OK |

**FN 조치:** 없음

### 검증 통과: ✅

---

→ 다음: [Step 04: TabNavigation 구현](step-04-tab-navigation.md)
