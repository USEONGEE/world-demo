# Step 05: 상태 화면 컴포넌트

## 메타데이터
- **난이도**: 🟢 쉬움
- **롤백 가능**: ✅
- **선행 조건**: Step 04 완료

---

## 1. 구현 내용 (design.md 기반)

- NotInstalledScreen 컴포넌트 (World App 미설치 안내)
- LoadingScreen 컴포넌트 (초기 로딩)
- ErrorBoundary 컴포넌트 (에러 상태)
- OfflineScreen 컴포넌트 (오프라인 상태)
- useOffline 훅 구현

## 2. 예상 범위 (Step 4에서 확정)
- [ ] Scope 탐색 필요

## 3. 완료 조건

- [ ] `components/states/NotInstalledScreen.tsx` 파일 존재
- [ ] NotInstalledScreen이 "World App Required" 타이틀 표시
- [ ] NotInstalledScreen이 World App 다운로드 안내 포함
- [ ] `components/states/LoadingScreen.tsx` 파일 존재
- [ ] LoadingScreen이 로딩 인디케이터 표시
- [ ] `components/states/ErrorBoundary.tsx` 파일 존재
- [ ] ErrorBoundary가 에러 메시지 + 재시도 버튼 표시
- [ ] `components/states/OfflineScreen.tsx` 파일 존재
- [ ] OfflineScreen이 "No Connection" 메시지 표시
- [ ] `lib/hooks/useOffline.ts` 파일 존재
- [ ] useOffline 훅이 navigator.onLine 상태 추적

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-05

### 신규 생성 파일
```
components/
├── states/
│   ├── NotInstalledScreen.tsx
│   ├── LoadingScreen.tsx
│   ├── ErrorBoundary.tsx
│   └── OfflineScreen.tsx
└── ui/
    ├── Button.tsx
    ├── Card.tsx
    └── Modal.tsx

lib/
└── hooks/
    └── useOffline.ts
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| React ErrorBoundary | 직접 의존 | 에러 경계 API |
| navigator.onLine | 웹 API | 오프라인 상태 감지 |
| Step 10 analytics | 참조 필요 | error_occurred 이벤트 |

### Side Effect 위험
- useOffline 훅이 'online'/'offline' 이벤트 리스너 등록
- ErrorBoundary 범위에 따른 에러 처리 범위 결정
- 네트워크 상태 변경 시 UI 업데이트

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-05

### False Positive (과잉 - 제거 대상)

| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| NotInstalledScreen.tsx | design.md 상태 화면 | ✅ OK |
| LoadingScreen.tsx | design.md 상태 화면 | ✅ OK |
| ErrorBoundary.tsx | design.md 상태 화면 | ✅ OK |
| OfflineScreen.tsx | design.md 상태 화면 | ✅ OK |
| useOffline.ts | design.md 훅 | ✅ OK |
| ui/Button.tsx | design.md UI 컴포넌트 | ✅ OK |
| ui/Card.tsx | design.md UI 컴포넌트 | ✅ OK |
| ui/Modal.tsx | design.md UI 컴포넌트 | ✅ OK |

**FP 조치:** 없음

### False Negative (누락 - 추가 대상)

| 구현 내용 | Scope 포함 여부 | 판정 |
|----------|----------------|------|
| NotInstalledScreen | ✅ NotInstalledScreen.tsx | OK |
| LoadingScreen | ✅ LoadingScreen.tsx | OK |
| ErrorBoundary | ✅ ErrorBoundary.tsx | OK |
| OfflineScreen | ✅ OfflineScreen.tsx | OK |
| useOffline 훅 | ✅ useOffline.ts | OK |

**FN 조치:** 없음

### 검증 통과: ✅

---

→ 다음: [Step 06: i18n 설정 및 언어 전환](step-06-i18n.md)
