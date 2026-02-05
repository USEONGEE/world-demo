# Step 06: i18n 설정 및 언어 전환

## 메타데이터
- **난이도**: 🟡 보통
- **롤백 가능**: ✅
- **선행 조건**: Step 04 완료

---

## 1. 구현 내용 (design.md 기반)

- next-intl 설정 (i18n.config.ts)
- 6개 언어 JSON 파일 생성 (EN/ES/TH/JA/KO/PT)
- I18nProvider 컴포넌트 구현
- 언어 전환 UI (Settings 탭)
- language_changed analytics 이벤트

## 2. 예상 범위 (Step 4에서 확정)
- [ ] Scope 탐색 필요

## 3. 완료 조건

- [ ] `locales/en.json` 파일 존재 (기본 번역 키 세트 포함)
- [ ] `locales/es.json` 파일 존재
- [ ] `locales/th.json` 파일 존재
- [ ] `locales/ja.json` 파일 존재
- [ ] `locales/ko.json` 파일 존재
- [ ] `locales/pt.json` 파일 존재
- [ ] 각 locale 파일에 다음 키 포함:
  - common.appName
  - common.loading
  - tabs.home
  - tabs.settings
  - consent.title
  - settings.language
- [ ] `components/providers/I18nProvider.tsx` 파일 존재
- [ ] Settings 탭에서 언어 선택 UI 표시
- [ ] 언어 변경 시 UI 텍스트 즉시 변경 확인
- [ ] 선택한 언어가 localStorage에 저장됨

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-05

### 신규 생성 파일
```
locales/
├── en.json
├── es.json
├── th.json
├── ja.json
├── ko.json
└── pt.json

i18n.config.ts

components/
└── providers/
    └── I18nProvider.tsx
```

### 수정 대상 파일
```
components/
└── providers/
    └── index.tsx                    # I18nProvider 추가

app/
└── (tabs)/
    └── settings/
        └── page.tsx                 # 언어 선택 UI 추가
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| next-intl | 직접 의존 | i18n 라이브러리 |
| localStorage | 웹 API | 언어 설정 저장 |
| Step 10 analytics | 참조 필요 | language_changed 이벤트 |

### Side Effect 위험
- 6개 언어 로케일 번들 추가 (번들 크기 증가)
- 언어 변경 시 전체 페이지 리렌더링
- localStorage에 선택 언어 캐싱

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-05

### False Positive (과잉 - 제거 대상)

| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| locales/*.json (6개) | design.md i18n 6개 언어 | ✅ OK |
| i18n.config.ts | design.md next-intl | ✅ OK |
| I18nProvider.tsx | design.md 프로바이더 | ✅ OK |

**FP 조치:** 없음

### False Negative (누락 - 추가 대상)

| 구현 내용 | Scope 포함 여부 | 판정 |
|----------|----------------|------|
| 6개 언어 JSON | ✅ locales/*.json | OK |
| next-intl 설정 | ✅ i18n.config.ts | OK |
| I18nProvider | ✅ I18nProvider.tsx | OK |
| 언어 전환 UI | ✅ settings/page.tsx 수정 | OK |

**FN 조치:** 없음

### 검증 통과: ✅

---

→ 다음: [Step 07: 데이터 수집 동의 UI](step-07-consent-ui.md)
