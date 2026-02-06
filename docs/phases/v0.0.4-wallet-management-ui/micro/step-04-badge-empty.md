# Step 04: WalletList verified 배지 + 빈 상태 개선

## 메타데이터
- **난이도**: 🟡 보통
- **롤백 가능**: ✅
- **선행 조건**: Step 01 (i18n 키 `verified`), Step 03

---

## 1. 구현 내용 (design.md 기반)
- 각 지갑 카드에 verified 상태 배지 표시 ("Verified · SIWE")
- verification_method 표시 (현재 chain만 표시)
- 빈 상태 안내 텍스트 강화 (기존 description 키 활용)

## 2. 예상 범위 (Step 4에서 확정)
- [ ] Scope 탐색 필요

## 3. 완료 조건
- [x] 각 지갑 카드에 "Verified · SIWE" 형태의 배지가 표시됨 (초록색 계열)
- [x] `verification_method` 필드 값이 배지에 반영됨
- [x] 빈 상태에서 `t('no_wallets')` + `t('description')` 텍스트가 표시됨
- [x] i18n 키 `verified`가 배지 텍스트에 사용됨

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-06

### 수정 대상 파일
```
src/domains/wallet/client/components/WalletList.tsx  # 수정 - verified 배지 + 빈 상태 개선
```

### 신규 생성 파일
없음

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| WalletBinding type | 직접 사용 | `verification_method` 필드 ('SIWE') 확인 ✅ |
| i18n 키 `verified` | 직접 사용 | Step 01에서 추가 |
| i18n 키 `description` | 직접 사용 | 이미 존재 ("검증된 신원에 지갑을 연결하세요") |

### Side Effect 위험
없음 (UI 표시 변경만)

### 참고할 기존 패턴
- WalletBinding type: `{ verification_method: 'SIWE' }` (src/domains/wallet/types/index.ts)
- 배지 스타일: green-100/green-800 (프로젝트 내 컬러 일관성)

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-06

### False Positive (과잉 - 제거 대상)
| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| WalletList.tsx | 배지 + 빈 상태 개선 | ✅ OK |

**FP 조치:** 없음

### False Negative (누락 - 추가 대상)
| 구현 내용 | Scope 포함 여부 | 판정 |
|----------|----------------|------|
| verified 배지 UI | ✅ WalletList.tsx | OK |
| verification_method 표시 | ✅ WalletList.tsx | OK |
| 빈 상태 텍스트 강화 | ✅ WalletList.tsx | OK |

**FN 조치:** 없음 (모든 구현 항목이 Scope에 포함)

### 추가 확인
- WalletBinding type에 `verification_method: 'SIWE'` 필드 존재 ✅
- i18n 키 `verified`: Step 01에서 추가 ✅
- i18n 키 `description`: 이미 존재 ("검증된 신원에 지갑을 연결하세요") ✅
- barrel export 변경 불필요 ✅

### 검증 통과: ✅

---

→ 다음: [Step 05: 분석 이벤트 추가 + 빌드 검증](step-05-analytics-build.md)
