# Step 07: UI 컴포넌트

## 메타데이터
- **난이도**: 🟠 중간
- **롤백 가능**: ✅ (파일 삭제/수정 롤백)
- **선행 조건**: Step 06

---

## 1. 구현 내용 (design.md 기반)
- WalletBindingButton.tsx: 지갑 연결 버튼 컴포넌트
- WalletList.tsx: 연결된 지갑 목록 표시
- WalletTab 또는 기존 탭에 지갑 섹션 추가
- 성공/실패/로딩 상태 UI
- 에러 메시지 표시

## 2. 예상 범위
- [x] Scope 탐색 완료

## 3. 완료 조건
- [x] `src/domains/wallet/client/components/WalletBindingButton.tsx` 파일 존재
- [x] WalletBindingButton 클릭 시 bindWallet() 호출
- [x] 로딩 중 스피너/disabled 상태 표시
- [x] 성공 시 "지갑 연결됨" 피드백 표시
- [x] 실패 시 에러 메시지 표시 (만료, 중복 바인딩 등)
- [x] `src/domains/wallet/client/components/WalletList.tsx` 파일 존재
- [x] WalletList가 연결된 지갑 목록 렌더링
- [x] 각 지갑 항목에 address (축약형), verified_at 표시
- [x] 탭 페이지에서 WalletBindingButton, WalletList 사용
- [x] 로그인하지 않은 상태에서는 "로그인 필요" 메시지 표시

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-06

### 수정 대상 파일
```
src/app/(tabs)/        # 수정 - 탭 페이지에 지갑 섹션 추가
                       # 정확한 파일은 탭 구조에 따라 결정
```

### 신규 생성 파일
```
src/domains/wallet/client/components/
├── WalletBindingButton.tsx    # 신규 - 지갑 연결 버튼
└── WalletList.tsx             # 신규 - 지갑 목록
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| src/domains/wallet/client/store | import | useWalletStore 사용 |
| src/domains/wallet/client/hooks | import | useWalletBinding 사용 |
| src/domains/human/client | import | useHuman (로그인 상태 확인) |
| UI 컴포넌트 라이브러리 | import | Button, Spinner 등 |

### Side Effect 위험
- 기존 탭 페이지 수정 시 레이아웃 영향 가능

### 참고할 기존 패턴
- 기존 탭 페이지 컴포넌트 구조
- `src/domains/human/client/components/`: 컴포넌트 패턴

---

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-06

### False Positive (과잉 - 제거 대상)
없음

### False Negative (누락 - 추가 대상)
없음

### 검증 체크리스트
- [x] Scope의 모든 파일이 구현 내용과 연결됨
- [x] 구현 내용의 모든 항목이 Scope에 반영됨
- [x] 불필요한 파일(FP)이 없음
- [x] 누락된 파일(FN)이 없음

### 검증 통과: ✅

---

→ Phase 완료 후: 아카이브 및 문서 정리
