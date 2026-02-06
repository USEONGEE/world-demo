# Step 01: DB 마이그레이션 + Supabase 타입

## 메타데이터
- **난이도**: 🟢 쉬움
- **롤백 가능**: ✅
- **선행 조건**: 없음

---

## 1. 구현 내용 (design.md 기반)
- `gate.bridge_token` 테이블 생성 (id, human_id, code, expires_at, used, created_at)
- code unique 제약, human_id FK → gate.human
- RLS 정책: service_role만 접근 허용 (기존 패턴)
- `src/core/supabase/types.ts`에 bridge_token 테이블 타입 추가

## 2. 완료 조건
- [ ] `supabase/migrations/0004_create_bridge_token.sql` 파일 존재
- [ ] gate.bridge_token 테이블에 id, human_id, code, expires_at, used, created_at 컬럼 존재
- [ ] code 컬럼에 unique 인덱스 존재
- [ ] human_id에 FK 제약 (gate.human 참조) 존재
- [ ] RLS 활성화 + service_role 정책 적용
- [ ] `src/core/supabase/types.ts`에 bridge_token Row/Insert/Update 타입 정의

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-06

### 수정 대상 파일
```
src/core/supabase/types.ts  # 수정 - bridge_token Row/Insert/Update 타입 추가
```

### 신규 생성 파일
```
supabase/migrations/0004_create_bridge_token.sql  # 신규 - 테이블 + RLS + 인덱스
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| gate.human | 참조 | FK human_id → gate.human(id) |

### Side Effect 위험
- 없음 (신규 테이블, 기존 코드 영향 없음)

### 참고할 기존 패턴
- `supabase/migrations/0002_create_siwe_challenge.sql`: 동일 구조 (FK, unique, RLS)
- `supabase/migrations/0001_gate_human_rls.sql`: RLS + service_role 정책 패턴

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-06

### False Positive (과잉)

| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| 0004_create_bridge_token.sql | 테이블 생성 | ✅ OK |
| types.ts 수정 | bridge_token 타입 | ✅ OK |

FP 없음.

### False Negative (누락)

| 구현 내용 | Scope 포함 여부 | 판정 |
|----------|----------------|------|
| 테이블 생성 | ✅ 0004 마이그레이션 | OK |
| unique 인덱스 | ✅ 0004에 포함 | OK |
| RLS 정책 | ✅ 0004에 포함 | OK |
| types.ts 수정 | ✅ Scope에 포함 | OK |

FN 없음.

### 검증 체크리스트
- [x] Scope의 모든 파일이 구현 내용과 연결됨
- [x] 구현 내용의 모든 항목이 Scope에 반영됨
- [x] 불필요한 파일(FP)이 없음
- [x] 누락된 파일(FN)이 없음

### 검증 통과: ✅

---

→ 다음: [Step 02: Bridge 도메인 백엔드](step-02-backend.md)
