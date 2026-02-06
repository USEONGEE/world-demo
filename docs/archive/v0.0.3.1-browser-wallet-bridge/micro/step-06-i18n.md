# Step 06: i18n + 통합 검증

## 메타데이터
- **난이도**: 🟢 쉬움
- **롤백 가능**: ✅
- **선행 조건**: Step 03 (API 완성)

---

## 1. 구현 내용 (design.md 기반)
- 6개 locale 파일 (en, es, ja, ko, pt, th)에 bridge 섹션 추가
- 모든 bridge UI 텍스트를 i18n 키로 교체 확인

## 2. 완료 조건
- [ ] `src/locales/en.json`에 bridge 섹션 존재 (issue_title, issue_button, code_label 등)
- [ ] `src/locales/ko.json`에 bridge 섹션 한국어 번역 존재
- [ ] `src/locales/ja.json`에 bridge 섹션 일본어 번역 존재
- [ ] `src/locales/es.json`에 bridge 섹션 스페인어 번역 존재
- [ ] `src/locales/pt.json`에 bridge 섹션 포르투갈어 번역 존재
- [ ] `src/locales/th.json`에 bridge 섹션 태국어 번역 존재
- [ ] BridgeIssueCard 컴포넌트의 모든 텍스트가 i18n 키 사용
- [ ] 브라우저 페이지의 모든 텍스트가 i18n 키 사용

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-06

### 수정 대상 파일
```
src/locales/en.json     # 수정 - bridge 섹션 추가
src/locales/ko.json     # 수정 - bridge 섹션 추가
src/locales/ja.json     # 수정 - bridge 섹션 추가
src/locales/es.json     # 수정 - bridge 섹션 추가
src/locales/pt.json     # 수정 - bridge 섹션 추가
src/locales/th.json     # 수정 - bridge 섹션 추가
```

### 신규 생성 파일
없음

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| Step 04 컴포넌트 | 수정 대상 | BridgeIssueCard에서 i18n 키 사용 |
| Step 05 페이지 | 수정 대상 | bridge/page.tsx, connect/page.tsx에서 i18n 키 사용 |

### Side Effect 위험
- 번역 누락: 6개 locale 모두 동일한 키 구조 확인 필수
- next-intl: 존재하지 않는 키 접근 시 키 이름 그대로 표시 (에러는 아님)

### 참고할 기존 패턴
- `src/locales/en.json`: wallet 섹션 구조 참고
- `src/domains/wallet/client/components/WalletBindingButton.tsx`: useTranslations('wallet') 패턴

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-06

### False Positive (과잉)

| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| 6개 locale 파일 | bridge 섹션 추가 | ✅ OK |

FP 없음.

### False Negative (누락)

| 구현 내용 | Scope 포함 여부 | 판정 | 조치 |
|----------|----------------|------|------|
| 정확한 i18n 키 목록 | ❌ 미정의 | FN | 개발 시 Step 04, 05 컴포넌트에서 사용한 키 기반 정의 |
| next-intl 네임스페이스 등록 | ✅ 불필요 | OK | JSON 키 자동 인식 |

**FN 조치:**
- i18n 키 목록: Step 04, 05 개발 후 사용된 키를 기반으로 locale 파일 작성 (역방향)

### 검증 체크리스트
- [x] Scope의 모든 파일이 구현 내용과 연결됨
- [x] 구현 내용의 모든 항목이 Scope에 반영됨

### 검증 통과: ✅

---

→ 완료
