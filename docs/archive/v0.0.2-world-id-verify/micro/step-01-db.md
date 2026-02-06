# Step 01: DB 마이그레이션 + Supabase 타입

## 메타데이터
- **난이도**: 🟢 쉬움
- **롤백 가능**: ✅ (DROP TABLE gate.human)
- **선행 조건**: 없음

---

## 1. 구현 내용 (design.md 기반)

### DB 마이그레이션
- `supabase/migrations/0000_create_human.sql` 실행
- gate.human 테이블 생성: id(UUID), action(text), nullifier_hash(text), created_at(timestamptz)
- (action, nullifier_hash) 유니크 인덱스 생성
- RLS/권한 설정: `supabase/migrations/0001_gate_human_rls.sql` 실행 (권장)

### Supabase 타입 생성
- `src/core/supabase/types.ts`에 human 테이블 타입 추가
- Database 타입에 human 테이블 정의

## 2. 예상 범위 (Step 4에서 확정)
- [ ] Scope 탐색 필요

## 3. 완료 조건

### DB
- [ ] Supabase Dashboard에서 human 테이블 확인 가능
- [ ] gate.human 테이블에 id, action, nullifier_hash, created_at 4개 컬럼 존재
- [ ] (action, nullifier_hash) 유니크 인덱스 `human_action_nullifier_hash_key` 존재
- [ ] `SELECT * FROM gate.human;` 쿼리 정상 실행

### 타입
- [ ] `src/core/supabase/types.ts`에 human 테이블 타입 정의
- [ ] Database['gate']['Tables']['human'] 타입 접근 가능
- [ ] TypeScript 컴파일 에러 없음

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-06

### 수정 대상 파일
```
src/core/supabase/types.ts    # Database 타입에 human 테이블 추가
.env.example                   # SUPABASE_SERVICE_ROLE_KEY 추가 (선택)
```

### 신규 생성 파일
```
없음 (모든 구조가 스캐폴딩됨)
```

### SQL 실행
```
supabase/migrations/0000_create_human.sql
→ Supabase CLI: supabase db push
→ 또는 Supabase Dashboard SQL Editor에서 실행

supabase/migrations/0001_gate_human_rls.sql
→ RLS/권한 설정 (권장)
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| Step 02~05 | 차단 해제 | human 테이블과 타입이 모든 후속 작업의 기반 |
| v0.0.3 wallet | 향후 의존 | siwe_challenge, wallet_binding 테이블이 human(id) FK 참조 |

### Side Effect 위험
- **FK 체인**: v0.0.3에서 human 삭제 불가 (CASCADE 설정됨)
- **유니크 인덱스**: (action, nullifier_hash) 조합 중복 불가
- **pgcrypto**: 확장 모듈 설치 (이미 선언됨)

### 참고할 기존 패턴
- `src/core/supabase/types.ts`: Database 타입 구조 (Tables.Row/Insert/Update)

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-06

### False Positive (과잉 - 제거 대상)

Scope에 있지만 이 Step의 구현 내용에 불필요한 항목:

| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| src/core/supabase/types.ts | human 테이블 타입 추가 | ✅ OK |
| .env.example | SUPABASE_SERVICE_ROLE_KEY (선택) | ✅ OK |
| 001_create_human.sql | human 테이블 생성 | ✅ OK |

**FP 조치:** 없음 (모든 항목 필요)

### False Negative (누락 - 추가 대상)

구현 내용에 있지만 Scope에 없는 항목:

| 구현 내용 | Scope 포함 여부 | 판정 |
|----------|----------------|------|
| Supabase 테이블 생성 | ✅ SQL 실행 | OK |
| Database 타입 정의 | ✅ types.ts | OK |
| 유니크 인덱스 생성 | ✅ SQL 포함 | OK |

**FN 조치:** 없음 (모든 항목 포함됨)

### 검증 체크리스트
- [x] Scope의 모든 파일이 구현 내용과 연결됨
- [x] 구현 내용의 모든 항목이 Scope에 반영됨
- [x] 불필요한 파일(FP)이 제거됨
- [x] 누락된 파일(FN)이 추가됨

### 검증 통과: ✅

---

→ 다음: [Step 02: 세션 토큰 관리](step-02-session.md)
