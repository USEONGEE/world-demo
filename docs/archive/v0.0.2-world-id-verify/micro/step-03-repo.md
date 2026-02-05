# Step 03: Human Repo 구현

## 메타데이터
- **난이도**: 🟡 보통
- **롤백 가능**: ✅ (코드 삭제)
- **선행 조건**: Step 01 (DB 스키마 + 타입)

---

## 1. 구현 내용 (design.md 기반)

### Human Repo (`src/domains/human/repo/human.repo.ts`)
- `findHumanByActionNullifier(action, nullifierHash)`: 중복 확인
  - Supabase Server Client 사용
  - human 테이블에서 action + nullifier_hash로 조회
  - 존재하면 Human 반환, 없으면 null

- `insertHuman({ action, nullifier_hash })`: 신규 human 생성
  - human 테이블에 insert
  - 생성된 Human 반환

### Supabase 클라이언트
- `src/core/supabase/server.ts`의 Server Client 사용
- service_role key로 RLS 우회

## 2. 예상 범위 (Step 4에서 확정)
- [ ] Scope 탐색 필요

## 3. 완료 조건

### findHumanByActionNullifier
- [ ] 존재하는 (action, nullifier_hash)로 조회 시 Human 객체 반환
- [ ] 반환된 객체에 id, action, nullifier_hash, created_at 필드 존재
- [ ] 존재하지 않는 조합으로 조회 시 null 반환
- [ ] DB 오류 시 에러 throw

### insertHuman
- [ ] 새로운 (action, nullifier_hash)로 insert 시 Human 객체 반환
- [ ] 반환된 객체의 id가 UUID 형식
- [ ] 반환된 객체의 created_at이 현재 시간 근처
- [ ] 중복 (action, nullifier_hash)로 insert 시 unique constraint 에러

### 타입 안전성
- [ ] TypeScript 컴파일 에러 없음
- [ ] Human 타입과 DB 타입 일치

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-06

### 수정 대상 파일
```
src/domains/human/repo/human.repo.ts  # 수정 - stub 함수 구현
```

### 신규 생성 파일
```
없음 (구조가 스캐폴딩됨)
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| createSupabaseServerClient | 직접 사용 | `@/core/supabase` |
| Database 타입 | 타입 사용 | Step 01에서 정의 |
| Human 타입 | 반환 타입 | `@/domains/human/types` |
| SUPABASE_SERVICE_ROLE_KEY | 환경변수 | 서버 전용 키 필요 |

### Side Effect 위험
- **Race Condition**: (action, nullifier_hash) 중복 삽입 시 UNIQUE 제약 위반
  - 대응: verifyHuman()에서 예외 처리 후 재조회
- **트랜잭션 없음**: Supabase에서 단일 INSERT/SELECT만 가능
- **proof 저장 금지**: insertHuman()에 proof 전달 금지 (보안)

### 참고할 기존 패턴
- `src/domains/wallet/repo/wallet.repo.ts`: Repo 함수 구조
- `src/domains/wallet/repo/challenge.repo.ts`: 유사 패턴

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-06

### False Positive (과잉 - 제거 대상)

Scope에 있지만 이 Step의 구현 내용에 불필요한 항목:

| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| src/domains/human/repo/human.repo.ts | 2개 함수 구현 | ✅ OK |

**FP 조치:** 없음 (모든 항목 필요)

### False Negative (누락 - 추가 대상)

구현 내용에 있지만 Scope에 없는 항목:

| 구현 내용 | Scope 포함 여부 | 판정 |
|----------|----------------|------|
| findHumanByActionNullifier | ✅ human.repo.ts | OK |
| insertHuman | ✅ human.repo.ts | OK |
| Supabase Server Client 사용 | ✅ 의존성 명시 | OK |

**FN 조치:** 없음 (모든 항목 포함됨)

### 검증 체크리스트
- [x] Scope의 모든 파일이 구현 내용과 연결됨
- [x] 구현 내용의 모든 항목이 Scope에 반영됨
- [x] 불필요한 파일(FP)이 제거됨
- [x] 누락된 파일(FN)이 추가됨

### 검증 통과: ✅

---

→ 다음: [Step 04: Human 서비스 + API 구현](step-04-api.md)
