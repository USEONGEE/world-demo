# Step 05: 브라우저 FE (코드 입력 + 지갑 연결)

## 메타데이터
- **난이도**: 🔴 어려움
- **롤백 가능**: ✅
- **선행 조건**: Step 03 (API 필요)

---

## 1. 구현 내용 (design.md 기반)
- `src/app/bridge/layout.tsx`: 데스크톱 전용 레이아웃 (AppGuard 밖, max-w-md mx-auto)
- `src/app/bridge/page.tsx`: 6자리 코드 입력 폼, ?code= 쿼리 파라미터 지원, consume API 호출, 성공 시 /bridge/connect 리다이렉트
- `src/app/bridge/connect/page.tsx`: 세션 확인, MetaMask 연결 + SIWE 바인딩 UI
- `src/domains/bridge/client/hooks/useBrowserWallet.ts`: window.ethereum + viem createWalletClient + SiweMessage, 기존 /api/siwe/challenge, /api/siwe/verify 재사용

## 2. 완료 조건
- [ ] `/bridge` 라우트가 AppGuard 없이 접근 가능
- [ ] `/bridge` 페이지에 6자리 코드 입력 UI 렌더링
- [ ] URL `?code=123456` 쿼리 파라미터로 자동 입력 동작
- [ ] 유효한 코드 입력 시 POST /api/bridge/consume 호출 후 /bridge/connect로 리다이렉트
- [ ] 잘못된 코드 시 에러 메시지 표시 (미존재/만료/사용됨)
- [ ] `/bridge/connect` 페이지에서 /api/human/me로 세션 확인
- [ ] 세션 없으면 /bridge로 리다이렉트
- [ ] MetaMask 미설치 시 설치 안내 메시지 표시
- [ ] MetaMask 연결 → 주소 획득 → SIWE challenge → 서명 → verify 전체 플로우 동작
- [ ] 바인딩 성공 시 성공 UI 표시
- [ ] 바인딩 실패 시 에러 메시지 표시

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-06

### 수정 대상 파일
없음 (전부 신규)

### 신규 생성 파일
```
src/app/bridge/
├── layout.tsx                      # 신규 - 데스크톱 레이아웃 (AppGuard 없음)
├── page.tsx                        # 신규 - 코드 입력 폼
└── connect/
    └── page.tsx                    # 신규 - MetaMask 연결 + SIWE

src/domains/bridge/client/hooks/
└── useBrowserWallet.ts             # 신규 - viem + SiweMessage
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| POST /api/bridge/consume | API 호출 | 코드 검증 + 세션 발급 |
| POST /api/siwe/challenge | API 호출 | 기존 SIWE API 재사용 |
| POST /api/siwe/verify | API 호출 | 기존 SIWE API 재사용 |
| GET /api/human/me | API 호출 | 세션 확인 |
| viem | 사용 | createWalletClient, window.ethereum |
| siwe | 사용 | SiweMessage 구성 |

### Side Effect 위험
- AppGuard 우회: /bridge는 (tabs) 밖이므로 AppGuard 없음 → 의도적 설계
- window.ethereum 미감지: MetaMask 미설치 시 에러 처리 필수
- 세션 쿠키: /api/bridge/consume이 same-origin이므로 SameSite=Lax 동작
- Redirect loop: 세션 확인 실패 시 /bridge로만 리다이렉트 (무한루프 방지)

### 참고할 기존 패턴
- `src/app/(tabs)/layout.tsx`: 레이아웃 구조 (반대로 AppGuard 없는 버전)
- `src/domains/wallet/client/store/wallet.store.ts`: SIWE 플로우 (challenge→sign→verify)

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-06

### False Positive (과잉)

| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| bridge/layout.tsx | 데스크톱 레이아웃 | ✅ OK |
| bridge/page.tsx | 코드 입력 폼 | ✅ OK |
| bridge/connect/page.tsx | MetaMask + SIWE | ✅ OK |
| useBrowserWallet.ts | 지갑 연결 hook | ✅ OK |

FP 없음.

### False Negative (누락)

| 구현 내용 | Scope 포함 여부 | 판정 | 조치 |
|----------|----------------|------|------|
| window.ethereum 타입 선언 | ❌ 미포함 | FN | viem이 자체 타입 제공, 추가 선언 불필요 확인 |
| RootProviders 상속 확인 | ⚠️ 암시적 | OK | root layout 자동 상속, 명시 불필요 |

**FN 조치:**
- window.ethereum: viem의 `createWalletClient({ transport: custom(window.ethereum!) })` 사용 시 viem 내장 타입으로 충분. 별도 global.d.ts 불필요.

### 검증 체크리스트
- [x] Scope의 모든 파일이 구현 내용과 연결됨
- [x] 구현 내용의 모든 항목이 Scope에 반영됨
- [x] AppGuard 우회 의도적 설계 확인
- [x] viem 타입 충분성 확인

### 검증 통과: ✅

---

→ 다음: [Step 06: i18n + 통합 검증](step-06-i18n.md)
