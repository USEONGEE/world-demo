# Step 02: WalletList 에러 상태 추가

## 메타데이터
- **난이도**: 🟡 보통
- **롤백 가능**: ✅
- **선행 조건**: Step 01 (i18n 키 `fetch_error`, `retry`)

---

## 1. 구현 내용 (design.md 기반)
- WalletList.tsx에서 store의 `error` 상태를 가져와 에러 UI 렌더링
- BridgeIssueCard.tsx 패턴 참조 (bg-red-50, border-red-200, 에러 아이콘, 재시도 버튼)
- `fetchWallets()` 호출로 재시도 기능

## 2. 예상 범위 (Step 4에서 확정)
- [ ] Scope 탐색 필요

## 3. 완료 조건
- [ ] WalletList에서 `error` 상태일 때 에러 카드(bg-red-50) 표시됨
- [ ] 에러 메시지 텍스트가 `t('fetch_error')` i18n 키 사용
- [ ] 재시도 버튼 클릭 시 `fetchWallets()` 호출
- [ ] 에러 상태에서 재시도 성공 시 정상 목록으로 전환

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-06

### 수정 대상 파일
```
src/domains/wallet/client/components/WalletList.tsx  # 수정 - 에러 상태 UI 추가
```

### 신규 생성 파일
없음

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| useWalletBinding hook | 직접 사용 | `error`, `fetchWallets` 이미 export 확인 ✅ |
| wallet.store.ts | 간접 사용 | error 상태 + fetchWallets 이미 구현 ✅ |
| Button 컴포넌트 | 새 import | 재시도 버튼용 `@/shared/components/ui/Button` |

### Side Effect 위험
없음 (기존 hook/store의 error, fetchWallets를 그대로 활용)

### 참고할 기존 패턴
- `src/domains/bridge/client/components/BridgeIssueCard.tsx:74-100`: 에러 카드 (bg-red-50, border-red-200, X 아이콘, 재시도 버튼)

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-06

### False Positive (과잉 - 제거 대상)
| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| WalletList.tsx | 에러 상태 UI 추가 | ✅ OK |

**FP 조치:** 없음

### False Negative (누락 - 추가 대상)
| 구현 내용 | Scope 포함 여부 | 판정 |
|----------|----------------|------|
| error destructure | ✅ WalletList.tsx | OK |
| fetchWallets destructure | ✅ WalletList.tsx | OK |
| 에러 카드 UI | ✅ WalletList.tsx | OK |
| Button import | ✅ WalletList.tsx | OK |

**FN 조치:** 없음 (모든 구현 항목이 Scope에 포함)

### 추가 확인
- `useWalletBinding` hook에서 `error`, `fetchWallets` 이미 export 확인 ✅
- `Button` import 경로: `@/shared/components/ui/Button` ✅
- i18n 키 `error` (제목), `retry` (버튼) 이미 wallet 네임스페이스에 존재 ✅
- `fetch_error` 키는 Step 01에서 추가 (에러 설명 텍스트용)

### 검증 통과: ✅

---

→ 다음: [Step 03: WalletList 복사 기능 추가](step-03-copy.md)
