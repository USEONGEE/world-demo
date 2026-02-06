# Step 01: DB 마이그레이션

## 메타데이터
- **난이도**: 🟢 쉬움
- **롤백 가능**: ✅ (DROP TABLE)
- **선행 조건**: 없음

---

## 1. 구현 내용 (design.md 기반)
- siwe_challenge 테이블 생성 (id, human_id, address, nonce, issued_at, expiration_time, used)
- wallet_binding 테이블 생성 (id, human_id, chain, address, verified_at, verification_method)
- 인덱스 생성 (human_id, address, unique constraint)

## 2. 예상 범위
- [x] Scope 탐색 완료

## 3. 완료 조건
- [x] `supabase/migrations/0002_create_siwe_challenge.sql` 파일 존재
- [x] `supabase/migrations/0003_create_wallet_binding.sql` 파일 존재
- [x] siwe_challenge 테이블에 id, human_id, address, nonce, issued_at, expiration_time, used 컬럼 존재
- [x] wallet_binding 테이블에 id, human_id, chain, address, verified_at, verification_method 컬럼 존재
- [x] siwe_challenge.nonce에 UNIQUE 제약 존재
- [x] wallet_binding (chain, address)에 UNIQUE 제약 존재
- [x] human_id FK가 gate.human(id) 참조하며 ON DELETE CASCADE

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-06

### 수정 대상 파일
없음 (신규 파일만 생성)

### 신규 생성 파일
```
supabase/migrations/
├── 0002_create_siwe_challenge.sql    # 신규 - Challenge 테이블
└── 0003_create_wallet_binding.sql    # 신규 - Binding 테이블
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| human 테이블 | FK 참조 | human_id가 gate.human(id) 참조 |

### Side Effect 위험
- 없음 (신규 테이블 생성만)

### 참고할 기존 패턴
- `supabase/migrations/0000_create_human.sql`: 테이블 생성 패턴

---

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-06

### False Positive (과잉 - 제거 대상)
없음

### False Negative (누락 - 추가 대상)
없음

### 검증 체크리스트
- [x] Scope의 모든 파일이 구현 내용과 연결됨
- [x] 구현 내용의 모든 항목이 Scope에 반영됨
- [x] 불필요한 파일(FP)이 없음
- [x] 누락된 파일(FN)이 없음

### 검증 통과: ✅

---

→ 다음: [Step 02: Contracts & Types 정의](step-02-types.md)
