# Step 01: i18n 키 추가

## 메타데이터
- **난이도**: 🟢 쉬움
- **롤백 가능**: ✅
- **선행 조건**: 없음

---

## 1. 구현 내용 (design.md 기반)
- `src/locales/ko.json`의 wallet 네임스페이스에 키 추가: `copy_address`, `copied`, `verified`, `fetch_error`
- `src/locales/en.json`의 wallet 네임스페이스에 동일 키 추가

## 2. 예상 범위 (Step 4에서 확정)
- [ ] Scope 탐색 필요

## 3. 완료 조건
- [ ] ko.json의 wallet 섹션에 `copy_address`, `copied`, `verified`, `fetch_error` 키가 존재
- [ ] en.json의 wallet 섹션에 동일 4개 키가 존재
- [ ] 기존 키가 변경/삭제되지 않음
- [ ] JSON 파싱 에러 없음 (`pnpm build` 또는 JSON.parse로 확인)

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-06

### 수정 대상 파일
```
src/
├── locales/ko.json   # 수정 - wallet 네임스페이스에 4개 키 추가
└── locales/en.json   # 수정 - wallet 네임스페이스에 4개 키 추가
```

### 신규 생성 파일
없음

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| WalletList.tsx | 간접 영향 | Step 02~05에서 t('key') 형태로 참조 |

### Side Effect 위험
없음 (JSON 키 추가만, 기존 키 변경 없음)

### 참고할 기존 패턴
- 기존 wallet 키 14개 유지 (button, description, loading 등)

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-06

### False Positive (과잉 - 제거 대상)
| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| ko.json | i18n 키 추가 | ✅ OK |
| en.json | i18n 키 추가 | ✅ OK |

**FP 조치:** 없음

### False Negative (누락 - 추가 대상)
| 구현 내용 | Scope 포함 여부 | 판정 |
|----------|----------------|------|
| copy_address 키 | ✅ ko.json, en.json | OK |
| copied 키 | ✅ ko.json, en.json | OK |
| verified 키 | ✅ ko.json, en.json | OK |
| fetch_error 키 | ✅ ko.json, en.json | OK |

**FN 조치:** 없음 (모든 구현 항목이 Scope에 포함)

### 추가 확인
- `error`, `retry` 키는 wallet 네임스페이스에 이미 존재 ✅ (Step 02에서 재사용)
- `description` 키도 이미 존재 ✅ (Step 04 빈 상태에서 재사용)

### 검증 통과: ✅

---

→ 다음: [Step 02: WalletList 에러 상태 추가](step-02-error-state.md)
