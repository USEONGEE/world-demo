# Step 03: WalletList 복사 기능 추가

## 메타데이터
- **난이도**: 🟡 보통
- **롤백 가능**: ✅
- **선행 조건**: Step 01 (i18n 키 `copy_address`, `copied`), Step 02

---

## 1. 구현 내용 (design.md 기반)
- 각 지갑 카드에 복사 버튼 추가
- `navigator.clipboard.writeText(address)` 로 전체 주소 복사
- 인라인 피드백: 복사 아이콘 → 체크 아이콘 (2초 후 복원)
- `copiedAddress` 로컬 state (useState) 사용

## 2. 예상 범위 (Step 4에서 확정)
- [ ] Scope 탐색 필요

## 3. 완료 조건
- [x] 각 지갑 카드에 복사 버튼(아이콘)이 표시됨
- [x] 복사 버튼 클릭 시 `navigator.clipboard.writeText(전체주소)` 호출
- [x] 복사 성공 후 아이콘이 체크마크로 변경됨
- [x] 2초 후 원래 복사 아이콘으로 복원됨
- [x] 다른 주소 복사 시 이전 피드백이 리셋됨

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-06

### 수정 대상 파일
```
src/domains/wallet/client/components/WalletList.tsx  # 수정 - 복사 버튼 + 피드백 추가
```

### 신규 생성 파일
없음

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| React useState | 새 import | copiedAddress 로컬 state |
| React useEffect | 새 import | 타이머 cleanup용 |
| navigator.clipboard | 브라우저 API | HTTPS 환경 필요 (localhost OK) |

### Side Effect 위험
- Clipboard API는 HTTPS 환경에서만 동작 (개발서버 localhost는 OK)
- 타이머 cleanup 필요 (컴포넌트 언마운트 시 메모리 누수 방지)

### 참고할 기존 패턴
- SVG 아이콘: WalletList.tsx, BridgeIssueCard.tsx에서 인라인 SVG 사용
- 체크마크 아이콘 (M5 13l4 4L19 7): 기존 코드에서 사용

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-06

### False Positive (과잉 - 제거 대상)
| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| WalletList.tsx | 복사 기능 추가 | ✅ OK |

**FP 조치:** 없음

### False Negative (누락 - 추가 대상)
| 구현 내용 | Scope 포함 여부 | 판정 |
|----------|----------------|------|
| useState import | ✅ WalletList.tsx | OK |
| useEffect import | ✅ WalletList.tsx | OK |
| copiedAddress state | ✅ WalletList.tsx | OK |
| handleCopyAddress 핸들러 | ✅ WalletList.tsx | OK |
| 복사/체크마크 아이콘 UI | ✅ WalletList.tsx | OK |
| 타이머 cleanup useEffect | ✅ WalletList.tsx | OK |

**FN 조치:** 없음 (모든 구현 항목이 Scope에 포함)

### 추가 확인
- Clipboard API: HTTPS 환경 필요, localhost OK ✅
- 타이머 cleanup: useEffect return으로 clearTimeout ✅
- i18n 키 `copy_address`, `copied`: Step 01에서 추가 ✅

### 검증 통과: ✅

---

→ 다음: [Step 04: WalletList verified 배지 + 빈 상태 개선](step-04-badge-empty.md)
