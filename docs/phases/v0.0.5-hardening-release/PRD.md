# Phase 0.0.5 PRD — Hardening, QA, Release Readiness

## 목표
- 보안/정책 준수와 품질 기준을 충족하고 릴리스 준비를 마친다.
- 네트워크/에러/성능 안정성을 확보한다.

## 범위
- 보안 점검, 로깅/모니터링 정비
- 성능/에러 처리 개선
- 테스트 보강(E2E 포함)
- 다국어 카피 완성 및 정책 준수 확인

## 비범위
- 신규 기능 추가
- 세금 엔진/트랜잭션 수집

## 기능 요구사항
- 입력 검증/스키마 검사 전면 적용
- Rate limit 또는 간단한 abuse 방지 로직
- 에러 코드/메시지 일관화
- 데이터 보존 정책 문서화(PII 미저장 명시)
- DB 마이그레이션 문서 최신화(`/docs/phases/DB-MIGRATIONS.md`)

## 보안/정책
- World 로고 사용 금지
- 특정 기관의 승인·제휴·인증을 암시하는 문구 금지
- proof/서명 원문 저장 금지
- 모든 검증은 BE에서 수행
- FE/BE 경계 준수 (검증/DB는 BE 전담)

## 성능/안정성
- 초기 로딩 2–3초 내, 후속 액션 < 1초
- 타임아웃/재시도 UI 모든 네트워크 요청에 적용
- 저연결 상태 대응(오프라인 안내)

## 분석 이벤트
- signup (method)
- first_value (action_type)
- notification_open (설정 시)

## 테스트
- 유닛: proof 검증, SIWE 검증, 중복 처리
- 통합: Verify → Wallet Bind → Wallet List E2E
- 다국어 스냅샷(6개 언어)
- 보안: nonce 재사용, 만료, 세션 위변조
- **커버리지 기준:** BE 유닛 테스트 statement/branch/line ≥ 80%

## 완료 기준
- 정책 체크리스트 전부 통과
- E2E 플로우 정상 동작
- 에러/오프라인/재시도 화면 검증
- 다국어 카피 적용 완료

---

## World MiniApp 정책 준수 체크리스트

### 금지 사항

- [ ] "official" 표현 사용 안함
- [ ] World 로고 사용 안함
- [ ] RNG 기반 상금 게임 없음 (운 기반 게임)
- [ ] 토큰 pre-sale 없음
- [ ] NFT 구매 기능 없음

### 필수 사항

- [ ] 저연결 상태 대응 (오프라인 안내)
- [ ] 무한 로딩 방지 (타임아웃/재시도 UI)
- [ ] 개발자 연락처 제공
- [ ] 데이터 수집 동의 획득
- [ ] 모든 검증은 BE에서 수행 (FE payload 신뢰 금지)
- [ ] proof/서명 원문 저장 금지

### 성능 메트릭

| 메트릭 | 목표 | 확인 |
|--------|------|------|
| 초기 로딩 | ≤ 3초 | [ ] |
| 후속 액션 | < 1초 | [ ] |
| Signup → First Value | ≥ 40% | [ ] |
| D1 Retention | ≥ 25% | [ ] |

### 분석 이벤트 완성 체크리스트

| 이벤트 | 트리거 시점 | 속성 | 구현 |
|--------|------------|------|------|
| app_open | 앱 실행 | launchLocation | [ ] |
| signup | 회원가입 완료 | method | [ ] |
| first_value | 첫 핵심 액션 | action_type | [ ] |
| verify_success | World ID 인증 성공 | verification_level | [ ] |
| verify_fail | World ID 인증 실패 | reason | [ ] |
| wallet_bind_success | 지갑 바인딩 성공 | chain, address_prefix | [ ] |
| wallet_bind_fail | 지갑 바인딩 실패 | reason | [ ] |

### 보안 검증 체크리스트

| 항목 | 검증 내용 | 확인 |
|------|----------|------|
| World ID proof | `verifyCloudProof()` 사용 | [ ] |
| SIWE 서명 | `SiweMessage.verify()` 사용 | [ ] |
| EIP-1271 | **viem** 기반 검증 | [ ] |
| nonce | 단일 사용 + 만료 처리 | [ ] |
| nullifier_hash | `(action, nullifier_hash)` 유니크 | [ ] |
| 세션 | 위변조 방지 (서명/암호화) | [ ] |
| 입력 검증 | 스키마 검사 전면 적용 | [ ] |
| Rate limit | abuse 방지 로직 | [ ] |

### 테스트 커버리지 체크리스트
**기준:** BE 유닛 테스트 statement/branch/line ≥ 80%

**유닛 테스트:**
- [ ] proof 검증 로직
- [ ] SIWE 서명 검증 로직
- [ ] nullifier 중복 처리
- [ ] nonce 재사용/만료 차단

**통합 테스트:**
- [ ] Verify → Session 발급 E2E
- [ ] Challenge → Sign → Bind E2E
- [ ] 지갑 목록 조회 E2E

**UI 테스트:**
- [ ] 다국어 스냅샷 (6개 언어)
- [ ] 에러/오프라인/재시도 화면
- [ ] 상태 전환 (인증 → 바인딩 → 확인)

### 참조 문서
- `/docs/World-Chain-Guide.md` - 정책 준수 체크리스트
- `CLAUDE.md` - 프로젝트 필수/금지 규칙
- `/docs/phases/ENV.md` - 환경변수 통합 문서
- `/docs/phases/DB-MIGRATIONS.md` - DB 마이그레이션 SQL 문서
- `/docs/phases/ARCHITECTURE.md` - FE/BE 경계 및 구조
