# Step 02: Bridge 도메인 백엔드

## 메타데이터
- **난이도**: 🟡 보통
- **롤백 가능**: ✅
- **선행 조건**: Step 01 (DB 테이블 필요)

---

## 1. 구현 내용 (design.md 기반)
- `src/shared/errors/http.ts`에 BRIDGE_NOT_FOUND, BRIDGE_EXPIRED, BRIDGE_ALREADY_USED 추가 (Step 03에서 분리 → 의존성 해결)
- `src/shared/contracts/bridge.ts`: BridgeConsumeRequestSchema, BridgeIssueResponse, BridgeConsumeResponse 타입
- `src/shared/contracts/index.ts`에 bridge export 추가
- `src/domains/bridge/types/index.ts`: BridgeToken 타입 정의
- `src/domains/bridge/repo/bridge.repo.ts`: insertBridgeToken, findByCode, markUsed
- `src/domains/bridge/repo/index.ts`: barrel export
- `src/domains/bridge/server/issueBridge.ts`: crypto.randomInt로 6자리 코드 생성, 5분 TTL, DB 저장, 충돌 시 최대 3회 재시도
- `src/domains/bridge/server/consumeBridge.ts`: 코드 검증 (존재/만료/사용 여부), used=true, human_id 반환
- `src/domains/bridge/server/index.ts`: barrel export

## 2. 완료 조건
- [ ] `src/domains/bridge/types/index.ts`에 BridgeToken 타입이 DB Row와 일치
- [ ] `bridge.repo.ts`의 insertBridgeToken이 bridge_token 레코드를 생성하고 반환
- [ ] `bridge.repo.ts`의 findByCode가 code로 bridge_token을 조회 (null 가능)
- [ ] `bridge.repo.ts`의 markUsed가 used=true로 업데이트
- [ ] `issueBridge.ts`가 6자리 숫자 코드를 생성하고 DB에 저장 후 { code, expires_at } 반환
- [ ] `issueBridge.ts`에서 코드 충돌 시 최대 3회 재시도 로직 존재
- [ ] `consumeBridge.ts`가 코드 미존재 시 BRIDGE_NOT_FOUND ApiError throw
- [ ] `consumeBridge.ts`가 만료된 코드에 대해 BRIDGE_EXPIRED ApiError throw
- [ ] `consumeBridge.ts`가 사용된 코드에 대해 BRIDGE_ALREADY_USED ApiError throw
- [ ] `consumeBridge.ts`가 성공 시 used=true 처리 후 human_id 반환

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-06

### 수정 대상 파일
```
src/shared/errors/http.ts       # 수정 - BRIDGE_NOT_FOUND, BRIDGE_EXPIRED, BRIDGE_ALREADY_USED 추가
src/shared/contracts/index.ts   # 수정 - export * from './bridge' 추가
```

### 신규 생성 파일
```
src/shared/contracts/bridge.ts  # 신규 - BridgeConsumeRequestSchema, 응답 타입

src/domains/bridge/
├── types/index.ts              # 신규 - BridgeToken 타입
├── repo/
│   ├── bridge.repo.ts          # 신규 - insertBridgeToken, findByCode, markUsed
│   └── index.ts                # 신규 - barrel export
├── server/
│   ├── issueBridge.ts          # 신규 - 6자리 코드 생성 + DB 저장 + 재시도 3회
│   ├── consumeBridge.ts        # 신규 - 코드 검증 + human_id 반환
│   └── index.ts                # 신규 - barrel export
└── index.ts                    # 신규 - barrel export (types만)
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| core/supabase/server | 사용 | createSupabaseAdminClient() |
| shared/errors/http | 수정 | ErrorCodes 추가 (이 Step에서 직접) |
| shared/contracts | 수정 | bridge.ts 생성 + index.ts export |
| Step 01 DB | 필수 | bridge_token 테이블 존재 전제 |

### Side Effect 위험
- 코드 충돌: crypto.randomInt 동시 발급 시 같은 코드 가능 → DB unique + 재시도 3회
- Race condition: consumeBridge 동시 호출 시 → markUsed 후 재조회로 방어

### 참고할 기존 패턴
- `src/domains/wallet/repo/challenge.repo.ts`: Supabase admin 쿼리 패턴
- `src/domains/wallet/server/issueChallenge.ts`: 토큰 발급 서버 로직
- `src/domains/wallet/server/verifySiwe.ts`: 상태 검증 + ApiError throw 패턴

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-06

### False Positive (과잉)

| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| errors/http.ts 수정 | ErrorCodes 추가 (의존성 해결) | ✅ OK |
| contracts/bridge.ts | Zod 스키마 + 타입 | ✅ OK |
| contracts/index.ts 수정 | barrel export | ✅ OK |
| types/index.ts | BridgeToken 타입 | ✅ OK |
| bridge.repo.ts | DB CRUD | ✅ OK |
| issueBridge.ts | 코드 생성 로직 | ✅ OK |
| consumeBridge.ts | 코드 검증 로직 | ✅ OK |

FP 없음.

### False Negative (누락)

| 구현 내용 | Scope 포함 여부 | 판정 | 조치 |
|----------|----------------|------|------|
| ErrorCodes 추가 | ✅ errors/http.ts 수정 | OK | Step 03에서 이동 |
| Contracts | ✅ contracts/bridge.ts | OK | Step 03에서 이동 |
| 코드 재시도 로직 | ✅ issueBridge.ts에 명시 | OK | Scope 설명 보강 |
| Race condition 방어 | ✅ Side Effect에 명시 | OK | 구현 시 주의 |

FN 없음 (의존성 문제 해결 완료).

### 검증 체크리스트
- [x] Scope의 모든 파일이 구현 내용과 연결됨
- [x] 구현 내용의 모든 항목이 Scope에 반영됨
- [x] ErrorCodes 의존성 순서 문제 해결됨 (Step 02에 포함)

### 검증 통과: ✅

---

→ 다음: [Step 03: API 라우트 + Contracts + ErrorCodes](step-03-api.md)
