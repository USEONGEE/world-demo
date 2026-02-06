# 설계 - v0.0.4

## 현재 상태 분석

BE 레이어(API, Server, Repo, Types, Contract)와 기본 FE 컴포넌트가 **이미 완성**되어 있음.
PRD 대비 누락된 것은 WalletList.tsx의 기능 강화와 i18n 키 추가.

### 이미 구현됨
| 레이어 | 파일 | 상태 |
|--------|------|------|
| API Route | `src/app/api/wallet/bindings/route.ts` | 완성 |
| Server | `src/domains/wallet/server/listWallets.ts` | 완성 |
| Repo | `src/domains/wallet/repo/wallet.repo.ts` | 완성 |
| Types | `src/domains/wallet/types/index.ts` | 완성 |
| Contract | `src/shared/contracts/wallet.ts` | 완성 |
| Store | `src/domains/wallet/client/store/wallet.store.ts` | 완성 |
| Hook | `src/domains/wallet/client/hooks/useWalletBinding.ts` | 완성 |
| Page | `src/app/(tabs)/wallet/page.tsx` | 완성 |

### PRD 대비 누락 사항
| 요구사항 | 현재 WalletList.tsx 상태 |
|----------|--------------------------|
| 주소 전체 복사 기능 | 없음 (표시만) |
| verified 상태 배지 | 없음 |
| verification_method 표시 | 없음 (chain만 표시) |
| 에러 상태 + 재시도 UI | 없음 (error가 store에 있지만 렌더링 안 함) |
| 빈 상태 안내 텍스트 강화 | 약함 (텍스트만, 유도 없음) |
| 분석 이벤트 (wallet_list_view, wallet_copy) | 없음 |
| i18n 키 (copy, verified, fetch_error 등) | 없음 |
| 섹션 간격 32px | 현재 `/wallet`은 `space-y-6` (24px) |
| 401 응답 스키마 | PRD 예시와 실제 응답에 `timestamp`, `requestId` 차이 |

## 해결 방식

### 접근법
기존 WalletList.tsx를 강화하여 누락된 기능을 추가한다. BE 코드, Store, Hook, API Route는 변경 불필요.

### 대안 검토

| 방식 | 장점 | 단점 | 선택 |
|------|------|------|------|
| A: 기존 컴포넌트 점진적 강화 | 최소 diff, 낮은 위험, BE 변경 없음, 기존 패턴 일관성 | mini-apps-ui-kit 미사용 | ✅ |
| B: @worldcoin/mini-apps-ui-kit-react 도입 후 재작성 | PRD 권장 준수, 네이티브 느낌 | 패키지 미설치, 기존 UI와 불일치, 추가 설정 필요 | ❌ |
| C: 하이브리드 (Kit + 기존 혼용) | 부분적 Kit 활용 | 두 디자인 시스템 혼재, 시각적 불일치 | ❌ |

**선택 이유**: `@worldcoin/mini-apps-ui-kit-react`는 프로젝트에 설치되어 있지 않고, 기존 전체 코드베이스가 커스텀 Card/Button + Tailwind를 사용. PRD에서도 "권장"이지 필수가 아님. Kit 도입은 별도 Phase로 분리하는 것이 적절.

### 기술 결정

#### 1. 컴포넌트 구조
WalletList.tsx 1개 파일 내에서 강화 (현재 72줄 → ~150줄 예상)

```
WalletList (export)
├── 에러 상태 분기 (신규)
├── 로딩 스켈레톤 (기존 유지)
├── 빈 상태 + 안내 텍스트 강화 (기존 개선)
└── 지갑 목록
     └── 각 지갑 카드
          ├── 축약 주소 + 복사 버튼 (신규)
          ├── Verified · SIWE 배지 (신규)
          └── 체인 + 인증일 (기존)
```

#### 2. 주소 복사
- `navigator.clipboard.writeText()` 사용
- 인라인 피드백: 복사 아이콘 → 체크 아이콘 (2초 후 복원)
- `copiedAddress` 로컬 state 사용 (전역 store 불필요)

#### 3. 에러 상태
- BridgeIssueCard.tsx 패턴 참조 (bg-red-50, border-red-200)
- store의 `error` + `fetchWallets` 활용
- 재시도 버튼 제공

#### 4. 분석 이벤트
| 이벤트 | 트리거 | properties |
|--------|--------|------------|
| `wallet_list_view` | wallets 로드 완료 시 1회 | `{ count }` |
| `wallet_copy` | 주소 복사 클릭 | `{ address }` |

#### 5. i18n 추가 키
- `copy_address`: "주소 복사" / "Copy address"
- `copied`: "복사됨" / "Copied"
- `verified`: "인증됨" / "Verified"
- `fetch_error`: "지갑 목록을 불러올 수 없습니다" / "Failed to load wallets"

#### 6. 수정 파일 목록 (총 3개)
| 파일 | 작업 |
|------|------|
| `src/locales/ko.json` | wallet 네임스페이스 키 추가 |
| `src/locales/en.json` | wallet 네임스페이스 키 추가 |
| `src/domains/wallet/client/components/WalletList.tsx` | 에러, 복사, 배지, 이벤트 추가 |
