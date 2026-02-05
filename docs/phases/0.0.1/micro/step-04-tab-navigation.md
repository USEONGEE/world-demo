# Step 04: TabNavigation 구현

## 메타데이터
- **난이도**: 🟡 보통
- **롤백 가능**: ✅
- **선행 조건**: Step 03 완료

---

## 1. 구현 내용 (design.md 기반)

- TabNavigation 컴포넌트 구현
- 2개 탭: Home, Settings
- (tabs) 라우트 그룹 및 레이아웃 생성
- 탭 전환 시 analytics 이벤트 전송 (tab_switched)

## 2. 예상 범위 (Step 4에서 확정)
- [ ] Scope 탐색 필요

## 3. 완료 조건

- [ ] `components/layout/TabNavigation.tsx` 파일 존재
- [ ] TabNavigation이 2개 탭 렌더링: "Home", "Settings"
- [ ] `app/(tabs)/layout.tsx` 파일 존재, TabNavigation 포함
- [ ] `app/(tabs)/home/page.tsx` 파일 존재
- [ ] `app/(tabs)/settings/page.tsx` 파일 존재
- [ ] Home 탭 클릭 시 `/home` 경로로 이동
- [ ] Settings 탭 클릭 시 `/settings` 경로로 이동
- [ ] 현재 활성 탭이 시각적으로 구분됨 (색상 또는 스타일 차이)
- [ ] 햄버거 메뉴, 사이드바, 푸터 없음 확인

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-05

### 신규 생성 파일
```
components/
└── layout/
    └── TabNavigation.tsx

app/
└── (tabs)/
    ├── layout.tsx                   # AppGuard, SafeAreaLayout, TabNavigation 포함
    ├── home/
    │   └── page.tsx
    └── settings/
        └── page.tsx
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| next/navigation | 직접 의존 | useRouter, usePathname |
| Step 03 SafeAreaLayout | 참조 필요 | 레이아웃 래핑 |
| Step 03 AppGuard | 참조 필요 | MiniKit 체크 |
| Step 10 analytics | 참조 필요 | tab_switched 이벤트 |

### Side Effect 위험
- (tabs) 라우트 그룹으로 URL 구조 변경 (/home, /settings)
- 탭 전환 시 페이지 리마운트 (상태 초기화)
- TabNavigation 고정 위치로 하단 스크롤 영역 감소

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-05

### False Positive (과잉 - 제거 대상)

| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| TabNavigation.tsx | design.md 탭 구조 | ✅ OK |
| (tabs)/layout.tsx | design.md 라우트 그룹 | ✅ OK |
| home/page.tsx | design.md Home 탭 | ✅ OK |
| settings/page.tsx | design.md Settings 탭 | ✅ OK |

**FP 조치:** 없음

### False Negative (누락 - 추가 대상)

| 구현 내용 | Scope 포함 여부 | 판정 |
|----------|----------------|------|
| TabNavigation 컴포넌트 | ✅ TabNavigation.tsx | OK |
| 2개 탭 (Home, Settings) | ✅ home/, settings/ | OK |
| (tabs) 라우트 그룹 | ✅ (tabs)/layout.tsx | OK |

**FN 조치:** 없음

### 검증 통과: ✅

---

→ 다음: [Step 05: 상태 화면 컴포넌트](step-05-state-screens.md)
