# Step 10: Analytics 추상화 레이어

## 메타데이터
- **난이도**: 🟡 보통
- **롤백 가능**: ✅
- **선행 조건**: Step 04 완료

---

## 1. 구현 내용 (design.md 기반)

- Analytics 타입 정의 (lib/analytics/types.ts)
- AnalyticsTracker 인터페이스 정의
- ConsoleTracker 구현 (개발용)
- app_open 이벤트 추적 (launchLocation 포함)
- useLaunchParams 훅 연동

## 2. 예상 범위 (Step 4에서 확정)
- [ ] Scope 탐색 필요

## 3. 완료 조건

- [ ] `lib/analytics/types.ts` 파일 존재
- [ ] AnalyticsEvent 인터페이스 정의 (name, properties, timestamp)
- [ ] AnalyticsTracker 인터페이스 정의 (track, identify, reset 메서드)
- [ ] `lib/analytics/consoleTracker.ts` 파일 존재
- [ ] ConsoleTracker가 이벤트를 console.log로 출력
- [ ] ConsoleTracker가 최근 100개 이벤트를 localStorage에 저장
- [ ] `lib/analytics/tracker.ts` 파일 존재
- [ ] analytics 인스턴스 export
- [ ] 앱 실행 시 `app_open` 이벤트 발생 확인
- [ ] app_open 이벤트에 launchLocation 속성 포함
- [ ] 개발자 도구 콘솔에서 이벤트 로그 확인 가능

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-05

### 신규 생성 파일
```
lib/analytics/
├── types.ts
├── tracker.ts
└── consoleTracker.ts

types/
└── analytics.ts
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| @worldcoin/minikit-js/react | 참조 필요 | useLaunchParams 훅 |
| localStorage | 웹 API | 이벤트 저장 (디버깅용) |

### 이벤트 발생 지점
| 이벤트 | 발생 위치 |
|--------|----------|
| app_open | app/layout.tsx 또는 RootProviders |
| consent_granted/declined | Step 07 useConsent 훅 |
| language_changed | Step 06 언어 선택 UI |
| tab_switched | Step 04 TabNavigation |
| error_occurred | Step 05 ErrorBoundary |

### Side Effect 위험
- localStorage에 최대 100개 이벤트 저장 (용량 제약)
- ConsoleTracker는 개발용 (프로덕션용 별도 구현 필요)
- useLaunchParams 훅은 World App 내에서만 동작

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-05

### False Positive (과잉 - 제거 대상)

| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| lib/analytics/types.ts | design.md Analytics 이벤트 | ✅ OK |
| lib/analytics/tracker.ts | design.md Analytics 추상화 | ✅ OK |
| lib/analytics/consoleTracker.ts | design.md 개발용 구현체 | ✅ OK |
| types/analytics.ts | design.md 이벤트 타입 | ✅ OK |

**FP 조치:** 없음

### False Negative (누락 - 추가 대상)

| 구현 내용 | Scope 포함 여부 | 판정 |
|----------|----------------|------|
| AnalyticsTracker 인터페이스 | ✅ types.ts | OK |
| ConsoleTracker 구현 | ✅ consoleTracker.ts | OK |
| analytics 싱글톤 | ✅ tracker.ts | OK |
| 이벤트 타입 정의 | ✅ types/analytics.ts | OK |
| app_open 이벤트 | ✅ tracker.ts | OK |

**FN 조치:** 없음

### 검증 통과: ✅

---

→ Phase 0.0.1 완료
