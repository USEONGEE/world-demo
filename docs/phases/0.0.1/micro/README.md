# 개발 단계 - v0.0.1 (DDD 아키텍처)

## 기술 스택
- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **State**: Zustand
- **SDK**: @worldcoin/minikit-js
- **i18n**: next-intl
- **Architecture**: DDD 4계층

## 전체 현황

| # | Step | 난이도 | 롤백 | Scope | FP/FN | 개발 | 완료일 |
|---|------|--------|------|-------|-------|------|--------|
| 01 | DDD 프로젝트 스캐폴딩 | 🟢 | ✅ | ⏳ | ⏳ | ⏳ | - |
| 02 | core/minikit 설정 | 🟡 | ✅ | ⏳ | ⏳ | ⏳ | - |
| 03 | core/supabase 클라이언트 | 🟢 | ✅ | ⏳ | ⏳ | ⏳ | - |
| 04 | shared/components 기반 UI | 🟡 | ✅ | ⏳ | ⏳ | ⏳ | - |
| 05 | shared/states 상태 화면 | 🟢 | ✅ | ⏳ | ⏳ | ⏳ | - |
| 06 | core/i18n 다국어 설정 | 🟡 | ✅ | ⏳ | ⏳ | ⏳ | - |
| 07 | domains/consent 도메인 | 🟡 | ✅ | ⏳ | ⏳ | ⏳ | - |
| 08 | domains/settings 도메인 | 🟡 | ✅ | ⏳ | ⏳ | ⏳ | - |
| 09 | app/api BE 엔드포인트 | 🟢 | ✅ | ⏳ | ⏳ | ⏳ | - |
| 10 | core/analytics 분석 레이어 | 🟡 | ✅ | ⏳ | ⏳ | ⏳ | - |
| 11 | app/(tabs) 페이지 연결 | 🟡 | ✅ | ⏳ | ⏳ | ⏳ | - |

## 의존성

```
01 (스캐폴딩)
├── 02 (core/minikit)
├── 03 (core/supabase)
├── 04 (shared/components) → 05 (shared/states)
├── 06 (core/i18n)
└── 10 (core/analytics)
    ↓
07 (domains/consent) ─┬─→ 11 (app/(tabs) 연결)
08 (domains/settings) ─┘
    ↓
09 (app/api)
```

## DDD 레이어 매핑

| Layer | Step |
|-------|------|
| **shared (0)** | 04, 05 |
| **core (1)** | 02, 03, 06, 10 |
| **domains (2)** | 07, 08 |
| **app (3)** | 01, 09, 11 |

## Step 상세

- [Step 01: DDD 프로젝트 스캐폴딩](step-01-ddd-scaffold.md)
- [Step 02: core/minikit 설정](step-02-core-minikit.md)
- [Step 03: core/supabase 클라이언트](step-03-core-supabase.md)
- [Step 04: shared/components 기반 UI](step-04-shared-components.md)
- [Step 05: shared/states 상태 화면](step-05-shared-states.md)
- [Step 06: core/i18n 다국어 설정](step-06-core-i18n.md)
- [Step 07: domains/consent 도메인](step-07-domain-consent.md)
- [Step 08: domains/settings 도메인](step-08-domain-settings.md)
- [Step 09: app/api BE 엔드포인트](step-09-app-api.md)
- [Step 10: core/analytics 분석 레이어](step-10-core-analytics.md)
- [Step 11: app/(tabs) 페이지 연결](step-11-app-tabs.md)

---

## README.md 성공 기준 ↔ micro step 매핑

| README.md 성공 기준 | 관련 micro step | 충족 여부 |
|-------------------|----------------|----------|
| World App 내부에서 정상 렌더링 | Step 02, 04, 11 | ✅ |
| 탭 네비게이션과 safeArea 적용 | Step 04, 11 | ✅ |
| i18n 6개 언어 스캐폴딩 | Step 06 | ✅ |
| 데이터 수집 동의 UI | Step 07 | ✅ |
| 개발자 연락처 화면 | Step 08 | ✅ |
| /api/health, /api/config 정상 응답 | Step 09 | ✅ |

## design.md ↔ micro step FP/FN 검증

### False Positive 없음 ✅
### False Negative 없음 ✅

모든 Step이 design.md의 DDD 4계층 구조에 근거함.
