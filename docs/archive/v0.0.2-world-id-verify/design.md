# 설계 - v0.0.2 World ID Verify

## 해결 방식

### 접근법
World ID Verify를 통해 사용자가 실제 사람임을 검증하고, 익명 Human 레코드를 관리한다.

**핵심 전략:**
1. FE: MiniKit Verify Command로 World App 인증 호출
2. BE: verifyCloudProof()로 proof 검증 (FE payload 신뢰 금지)
3. DB: (action, nullifier_hash) 유니크 제약으로 중복 방지
4. 세션: JWT 기반 HTTP-only Cookie로 인증 상태 유지
5. FE는 status === 'success'일 때만 전송, BE는 status 검증 + 타임아웃/재시도 처리

### 대안 검토

#### 세션 관리 방식

| 방식 | 장점 | 단점 | 선택 |
|------|------|------|------|
| A: JWT (jose) | 표준화, Edge Runtime 호환, 확장성, jwt.io 디버깅 | 의존성 추가 (~50KB) | ✅ |
| B: HMAC JSON | 의존성 없음, 경량 | 표준화 부족, 직접 만료 검증 필요 | ❌ |
| C: Supabase Auth | 인프라 재활용, 자동화 | PRD 불일치, 불필요한 복잡성 | ❌ |

**선택 이유:** JWT(jose)는 RFC 7519 표준으로 디버깅/유지보수 용이하고, Vercel Edge Runtime에서 완벽 동작하며, 향후 wallet 바인딩 시 추가 클레임 확장이 쉽다.

### 기술 결정

#### 1. 세션 관리
| 항목 | 결정 |
|------|------|
| 라이브러리 | jose |
| 알고리즘 | HS256 |
| 쿠키명 | wg_session |
| 만료 | 7일 |
| 옵션 | HttpOnly, SameSite=Lax, Secure(prod), Path=/ |

#### 2. DB 접근
| 항목 | 결정 |
|------|------|
| 클라이언트 | Supabase Server Client |
| Key | SUPABASE_SERVICE_ROLE_KEY |
| RLS | 비활성화 (서버 전용) |
| 타입 | `src/core/supabase/types.ts`에 human 테이블 타입 추가 |
| 스키마 | `gate` |

#### 3. 에러 처리
기존 `ErrorCodes` 확장:
- `VERIFICATION_FAILED`: proof 검증 실패

#### 4. 입력 검증
Zod 스키마로 payload 검증
- 필수: action, proof, merkle_root, nullifier_hash
- 선택: status, verification_level, signal
- extra field는 passthrough 허용

#### 5. FE 상태 관리
Zustand store로 인증 상태 관리
FE 구성은 `client/` 아래 hooks/store/components로 분리하고 index export 사용

---

## 구현 내용

### BE 구현

#### 1. 세션 토큰 관리 (`src/core/session/index.ts`)
- `createSessionToken(payload)`: JWT 생성, 7일 만료
- `verifySessionToken(token)`: JWT 검증, payload 반환
- `setSessionCookie(response, token)`: HTTP-only 쿠키 설정
- `getSessionFromCookie(request)`: 쿠키에서 세션 추출

#### 2. Human Repo (`src/domains/human/repo/human.repo.ts`)
- `findHumanByActionNullifier(action, nullifierHash)`: 중복 확인
- `insertHuman({ action, nullifier_hash })`: 신규 human 생성

#### 3. Human 서비스 (`src/domains/human/server/verifyHuman.ts`)
- `verifyHuman(payload)`:
  - verifyCloudProof() 호출
  - status가 존재하면 'success'만 허용
  - verifyCloudProof 타임아웃(10s) + 1회 재시도
  - 중복 확인 후 human 생성 또는 조회
  - 세션 토큰 발급
  - 반환: `{ human_id, is_new }`
- `getCurrentHuman()`: 세션에서 human_id 추출

#### 4. API 라우트
- `POST /api/verify`: proof 검증 및 human 생성
- `GET /api/human/me`: 현재 세션의 human 조회

### FE 구현

#### 1. Verify Hook (`src/domains/human/client/hooks/useVerify.ts`)
- MiniKit.commandsAsync.verify() 호출
- finalPayload.status === 'success'일 때만 BE로 전달

#### 2. Human Store (`src/domains/human/client/store/human.store.ts`)
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

#### 3. Verify UI 컴포넌트
- "사람 인증하기" 버튼
- 로딩/성공/실패/중복 상태 표시
- 홈 화면에 배치 (root → consent → home 플로우)

#### 4. 분석 이벤트
- verify_start
- verify_success
- verify_fail (reason)
- verify_duplicate

### DB 마이그레이션
`supabase/migrations/0000_create_human.sql` 실행 (gate.human)
`supabase/migrations/0001_gate_human_rls.sql` 실행 (RLS/권한)

---

## 데이터 흐름

```
[사용자] → [Verify 버튼] → [MiniKit.commandsAsync.verify()]
                                    ↓
                            [World App 인증 UI]
                                    ↓
                            [finalPayload 반환]
                                    ↓
[FE] ─────── POST /api/verify ──────→ [BE]
                                       ↓
                              verifyCloudProof()
                                       ↓
                              human.repo.findByNullifier()
                                       ↓
                           (exists?) → { human_id, is_new: false }
                           (new?) → human.repo.insert() → { human_id, is_new: true }
                                       ↓
                              createSessionToken()
                                       ↓
                              Set-Cookie: wg_session
                                       ↓
[FE] ←───── { human_id, is_new } ─────
```

---

## 보안 체크리스트

- [ ] proof 원문 DB 저장 금지
- [ ] FE payload 신뢰 금지 (BE verifyCloudProof 필수)
- [ ] SESSION_SECRET 32+ 문자 랜덤 값
- [ ] SUPABASE_SERVICE_ROLE_KEY 서버 전용
- [ ] HttpOnly 쿠키로 XSS 방어

---

## 의존성 추가

```bash
pnpm add jose
```

## 환경변수 (`docs/phases/ENV.md` 참고)
- `SESSION_SECRET`: JWT 서명용 시크릿 (32+ 문자)
- `SESSION_COOKIE_NAME`: 세션 쿠키명 (기본 `wg_session`)
- `SESSION_TTL_SECONDS`: 만료 시간 (기본 604800)
- `SESSION_EXPIRES_IN`: 만료 시간 (기본 7d, TTL 미설정 시 fallback)
- `WLD_APP_ID`: World Developer Portal 앱 ID
