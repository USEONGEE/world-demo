# Step 05: FE Verify UI + Store

## 메타데이터
- **난이도**: 🟠 중간
- **롤백 가능**: ✅ (코드 삭제)
- **선행 조건**: Step 04 (API 완성)

---

## 1. 구현 내용 (design.md 기반)

### Verify Hook (`src/domains/human/client/hooks/useVerify.ts`)
- `useVerify()`:
  - MiniKit.commandsAsync.verify() 호출
  - finalPayload.status === 'success'일 때만 POST /api/verify 전송
  - MiniKit verify 타임아웃(예: 10s) 처리 후 에러 상태 설정
  - /api/verify 요청 타임아웃(예: 10s) 처리 후 에러 상태 설정
  - 결과에 따라 상태 업데이트

### Human Store (`src/domains/human/client/store/human.store.ts`)
```typescript
interface HumanState {
  humanId: string | null
  isVerified: boolean
  isLoading: boolean
  error: string | null
  verify: () => Promise<void>
  checkSession: () => Promise<void>
}
```
- Zustand store로 인증 상태 관리
- verify(): useVerify 로직 호출
- checkSession(): GET /api/human/me 호출하여 세션 확인

### Verify UI 컴포넌트
- "사람 인증하기" 버튼
- 로딩 상태: 스피너 표시
- 성공 상태: 인증 완료 메시지
- 실패 상태: 에러 메시지 + 재시도 버튼
- 중복 상태: "이미 인증됨" 메시지

### 분석 이벤트 (필수)
- verify_start
- verify_success
- verify_fail (reason)
- verify_duplicate

## 2. 예상 범위 (Step 4에서 확정)
- [ ] Scope 탐색 필요

## 3. 완료 조건

### useVerify hook
- [ ] MiniKit 설치 확인 후 verify 호출
- [ ] finalPayload.status === 'success' 시 /api/verify 호출
- [ ] finalPayload.status === 'error' 시 에러 상태 설정
- [ ] MiniKit verify 타임아웃 발생 시 에러 상태 설정
- [ ] /api/verify 타임아웃 발생 시 에러 상태 설정
- [ ] API 응답에 따라 store 상태 업데이트

### Human store
- [ ] 초기 상태: humanId=null, isVerified=false, isLoading=false
- [ ] verify() 호출 시 isLoading=true
- [ ] 성공 시 humanId 설정, isVerified=true, isLoading=false
- [ ] 실패 시 error 설정, isLoading=false
- [ ] checkSession() 호출 시 /api/human/me 결과로 상태 업데이트

### Verify UI
- [ ] 버튼 클릭 시 verify() 호출
- [ ] isLoading=true 시 버튼 비활성화 + 스피너 표시
- [ ] isVerified=true 시 인증 완료 UI 표시
- [ ] error 존재 시 에러 메시지 + 재시도 버튼 표시
- [ ] World App 외부에서 MiniKit 미설치 시 안내 메시지
- [ ] 타임아웃 발생 시 안내 메시지 표시

### 분석 이벤트
- [ ] verify_start
- [ ] verify_success
- [ ] verify_fail (reason)
- [ ] verify_duplicate

### 통합 테스트
- [ ] World App 시뮬레이터에서 인증 플로우 동작 확인
- [ ] 인증 성공 후 새로고침 시 세션 유지 확인
- [ ] 세션 만료 후 재인증 가능 확인

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-06

### 수정 대상 파일
```
src/domains/human/client/index.ts         # 수정 - hook/컴포넌트 export
src/domains/human/types/index.ts          # 확장 - VerifyState 인터페이스 추가
src/app/(tabs)/home/page.tsx              # 수정 - VerifyButton 배치 (권장)
```

### 신규 생성 파일
```
src/domains/human/client/store/human.store.ts    # 신규 - Zustand store
src/domains/human/client/hooks/useVerify.ts      # 신규 - MiniKit verify hook
src/domains/human/client/hooks/useHuman.ts       # 신규 - Store 접근 hook
src/domains/human/client/hooks/index.ts          # 신규 - hook export
src/domains/human/client/components/VerifyButton.tsx  # 신규 - 인증 버튼 UI
src/domains/human/client/components/index.ts     # 신규 - 컴포넌트 export
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| zustand | Store 구현 | 이미 설치됨 (v5.0.2) |
| @worldcoin/minikit-js | verify 호출 | 이미 설치됨 (v1.9.0) |
| useMiniKitInstalled | 설치 확인 | `@/core/minikit/hooks` |
| Button, Card | UI 재사용 | `@/shared/components/ui` |
| useTranslations | i18n | `next-intl` |
| analytics | 이벤트 추적 | `@/core/analytics` |

### UI 배치 전략
**권장: home 페이지에 VerifyButton 추가**
- AppGuard 내부라 MiniKit 환경 안전
- 사용자 흐름: root → consent → home (verify 선택)

### Side Effect 위험
- **Hydration Mismatch**: Zustand persist 미들웨어 사용 시 isHydrated 플래그 필수
- **MiniKit 미설치**: AppGuard에서 체크됨, 추가 에러 처리 불필요
- **LocalStorage 키**: `world-gate-human` 사용 (기존 consent, settings와 구분)

### 참고할 기존 패턴
- `src/domains/consent/store/consent.store.ts`: Zustand + persist 패턴
- `src/domains/consent/hooks/useConsent.ts`: Store 접근 hook 패턴
- `src/domains/consent/components/ConsentForm.tsx`: 컴포넌트 구조

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-06

### False Positive (과잉 - 제거 대상)

Scope에 있지만 이 Step의 구현 내용에 불필요한 항목:

| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| src/domains/human/client/index.ts | export 업데이트 | ✅ OK |
| src/domains/human/types/index.ts | VerifyState 타입 추가 | ✅ OK |
| src/app/(tabs)/home/page.tsx | VerifyButton 배치 | ✅ OK |
| src/domains/human/client/store/human.store.ts | Zustand store | ✅ OK |
| src/domains/human/client/hooks/useVerify.ts | MiniKit hook | ✅ OK |
| src/domains/human/client/hooks/useHuman.ts | Store hook | ✅ OK |
| src/domains/human/client/hooks/index.ts | export | ✅ OK |
| src/domains/human/client/components/VerifyButton.tsx | UI 버튼 | ✅ OK |
| src/domains/human/client/components/index.ts | export | ✅ OK |

**FP 조치:** 없음 (모든 항목 필요)

### False Negative (누락 - 추가 대상)

구현 내용에 있지만 Scope에 없는 항목:

| 구현 내용 | Scope 포함 여부 | 판정 |
|----------|----------------|------|
| useVerify hook | ✅ client/hooks/useVerify.ts | OK |
| Human store | ✅ client/store/human.store.ts | OK |
| VerifyButton 컴포넌트 | ✅ client/components/VerifyButton.tsx | OK |
| 상태 UI (로딩/성공/실패) | ✅ VerifyButton 내 구현 | OK |

**FN 조치:** 없음 (모든 항목 포함됨)

### 검증 체크리스트
- [x] Scope의 모든 파일이 구현 내용과 연결됨
- [x] 구현 내용의 모든 항목이 Scope에 반영됨
- [x] 불필요한 파일(FP)이 제거됨
- [x] 누락된 파일(FN)이 추가됨

### 검증 통과: ✅

---

← 이전: [Step 04: Human 서비스 + API 구현](step-04-api.md)
