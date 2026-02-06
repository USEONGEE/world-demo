# Step 04: MiniApp FE (코드 발급 + QR)

## 메타데이터
- **난이도**: 🟠 중간
- **롤백 가능**: ✅
- **선행 조건**: Step 03 (API 필요)

---

## 1. 구현 내용 (design.md 기반)
- `src/domains/bridge/client/store/bridge.store.ts`: Zustand store - 코드 발급/재발급 상태 관리
- `src/domains/bridge/client/hooks/useBridge.ts`: store wrapper hook
- `src/domains/bridge/client/components/BridgeIssueCard.tsx`: 코드 텍스트(XXXX-XXXX) + QR 표시 + 만료 카운트다운 + 재발급 버튼
- `src/domains/bridge/client/components/index.ts`: barrel export
- `src/domains/bridge/client/hooks/index.ts`: barrel export
- `src/domains/bridge/client/index.ts`: barrel export
- `src/domains/bridge/index.ts`: barrel export
- `src/app/(tabs)/wallet/page.tsx`에 BridgeIssueCard 통합
- `package.json`에 `qrcode.react` 의존성 추가

## 2. 완료 조건
- [ ] `bridge.store.ts`에 code, expiresAt, isLoading, error 상태 존재
- [ ] `bridge.store.ts`의 issueBridge()가 POST /api/bridge/issue 호출 후 code/expiresAt 설정
- [ ] `BridgeIssueCard.tsx`가 "브라우저로 지갑 연결" 버튼을 렌더링
- [ ] 코드 발급 후 "XXXX-XXXX" 형식으로 코드 표시
- [ ] 코드 발급 후 QR 코드 표시 (https://domain/bridge?code=XXXXXXXX 인코딩)
- [ ] 만료 카운트다운 표시 (남은 시간)
- [ ] 재발급 버튼 동작
- [ ] BridgeIssueCard가 isVerified=true일 때만 코드 발급 버튼 표시
- [ ] MiniKit 미설치 시 안내 메시지 표시
- [ ] Wallet 탭에서 BridgeIssueCard 컴포넌트 렌더링 확인
- [ ] `qrcode.react` 의존성이 package.json에 추가됨

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-06

### 수정 대상 파일
```
package.json                        # 수정 - qrcode.react 의존성 추가
src/app/(tabs)/wallet/page.tsx      # 수정 - BridgeIssueCard 컴포넌트 통합
```

### 신규 생성 파일
```
src/domains/bridge/client/
├── store/bridge.store.ts           # 신규 - Zustand (code, expiresAt, isLoading, error)
├── hooks/
│   ├── useBridge.ts                # 신규 - store wrapper hook
│   └── index.ts                    # 신규 - barrel export
├── components/
│   ├── BridgeIssueCard.tsx         # 신규 - 코드/QR/카운트다운/재발급
│   └── index.ts                    # 신규 - barrel export
└── index.ts                        # 신규 - barrel export
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| qrcode.react | 신규 의존성 | QR 코드 렌더링 (~2.5KB gzipped) |
| POST /api/bridge/issue | API 호출 | Step 03 완료 필수 |
| domains/human | 사용 | isVerified 상태 확인 (인증 후만 표시) |

### Side Effect 위험
- 카운트다운 타이머: useEffect cleanup 필수 (메모리 누수 방지)
- QR 코드 URL: 도메인이 하드코딩되면 환경별 문제 → window.location.origin 사용
- 번들 크기: qrcode.react ~2.5KB, 미미함

### 참고할 기존 패턴
- `src/domains/wallet/client/store/wallet.store.ts`: Zustand store 구조
- `src/domains/wallet/client/components/WalletBindingButton.tsx`: 상태별 UI 렌더링
- `src/domains/wallet/client/hooks/useWalletBinding.ts`: hook wrapper

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-06

### False Positive (과잉)

| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| package.json | qrcode.react 추가 | ✅ OK |
| home/page.tsx | BridgeIssueCard 통합 | ✅ OK |
| bridge.store.ts | Zustand store | ✅ OK |
| BridgeIssueCard.tsx | QR/코드 UI | ✅ OK |

FP 없음.

### False Negative (누락)

| 구현 내용 | Scope 포함 여부 | 판정 | 조치 |
|----------|----------------|------|------|
| pnpm-lock.yaml | ❌ 미포함 | FN | pnpm install 시 자동 생성, 별도 Scope 불필요 |
| isVerified 조건부 렌더링 | ❌ 미명시 | FN | 완료 조건에 추가 |

**FN 조치:**
- pnpm-lock.yaml: pnpm install 실행 시 자동 업데이트, Scope 추가 불필요
- isVerified: BridgeIssueCard는 인증된 사용자에게만 코드 발급 버튼 표시 → 완료 조건에 추가

### 검증 체크리스트
- [x] Scope의 모든 파일이 구현 내용과 연결됨
- [x] 구현 내용의 모든 항목이 Scope에 반영됨
- [x] pnpm-lock.yaml은 자동 생성 (별도 관리 불필요)
- [x] isVerified 조건 추가 완료

### 검증 통과: ✅

---

→ 다음: [Step 05: 브라우저 FE](step-05-browser-fe.md)
