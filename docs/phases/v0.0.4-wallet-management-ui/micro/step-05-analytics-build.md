# Step 05: 분석 이벤트 추가 + 빌드 검증

## 메타데이터
- **난이도**: 🟢 쉬움
- **롤백 가능**: ✅
- **선행 조건**: Step 03, Step 04

---

## 1. 구현 내용 (design.md 기반)
- `wallet_list_view` 이벤트: wallets 로드 완료 시 1회 트래킹 (`useEffect`)
- `wallet_copy` 이벤트: 주소 복사 클릭 시 트래킹 (Step 03 복사 핸들러에 추가)
- `analytics.track()` 사용 (기존 패턴: `src/core/analytics`)
- 전체 빌드 검증 (`npx tsc --noEmit && pnpm build`)

## 2. 예상 범위 (Step 4에서 확정)
- [ ] Scope 탐색 필요

## 3. 완료 조건
- [x] WalletList 마운트 + wallets 로드 완료 시 `wallet_list_view` 이벤트 1회 발생
- [x] `wallet_list_view` 이벤트 properties에 `{ count: wallets.length }` 포함
- [x] 주소 복사 시 `wallet_copy` 이벤트 발생
- [x] `wallet_copy` 이벤트 properties에 `{ address }` 포함
- [x] `npx tsc --noEmit` 타입 체크 통과
- [x] `pnpm build` 프로덕션 빌드 성공

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-06

### 수정 대상 파일
```
src/domains/wallet/client/components/WalletList.tsx  # 수정 - analytics 이벤트 추가
```

### 신규 생성 파일
없음

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| analytics | 새 import | `import { analytics } from '@/core/analytics'` |
| React useEffect | 사용 | wallet_list_view 이벤트 1회 트래킹 |
| React useRef | 사용 | 이벤트 중복 방지 flag |

### Side Effect 위험
- wallet_list_view 이벤트 중복 발생 방지 필요 (useRef flag 사용)
- ConsoleTracker가 개발 환경에서 console.log 출력 (정상)

### 참고할 기존 패턴
- `src/domains/wallet/client/store/wallet.store.ts:100-104`: analytics.track() 호출 패턴
- AnalyticsEvent 타입: `{ name: string, properties?: Record<string, unknown>, timestamp: Date }`

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-06

### False Positive (과잉 - 제거 대상)
| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| WalletList.tsx | 분석 이벤트 추가 | ✅ OK |

**FP 조치:** 없음

### False Negative (누락 - 추가 대상)
| 구현 내용 | Scope 포함 여부 | 판정 |
|----------|----------------|------|
| analytics import | ✅ WalletList.tsx | OK |
| useRef import | ✅ WalletList.tsx | OK |
| wallet_list_view 이벤트 | ✅ WalletList.tsx | OK |
| wallet_copy 이벤트 | ✅ WalletList.tsx | OK |
| 중복 방지 (useRef flag) | ✅ WalletList.tsx | OK |
| 빌드 검증 | ✅ 명령어 실행 | OK |

**FN 조치:** 없음 (모든 구현 항목이 Scope에 포함)

### 추가 확인
- analytics import 경로: `@/core/analytics` ✅
- AnalyticsEvent 타입: `{ name: string, properties?: Record<string, unknown>, timestamp: Date }` ✅
- 기존 패턴 참조: wallet.store.ts:100-104 ✅
- 중복 방지: useRef(false) + hasTracked.current 패턴 ✅

### 검증 통과: ✅
