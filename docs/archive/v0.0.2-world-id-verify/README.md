# World ID Verify (Human 인증) - v0.0.2

## 문제 정의

### 현상
- 현재 앱에서 사용자가 실제 사람인지 검증하는 기능이 없음
- World App 내부에서 실행되지만 World ID 인증을 활용하지 않음
- 봇이나 중복 계정을 구분할 수 없음

### 원인
- World ID Verify 기능이 미구현 상태
- MiniKit Verify Command 호출 로직 없음
- proof 검증 및 Human 레코드 관리 시스템 부재

### 영향
- 사용자 신원 확인 불가로 서비스 신뢰도 저하
- 동일 사용자의 중복 가입 방지 불가
- 이후 지갑 바인딩(v0.0.3)의 선행 조건 미충족

### 목표
- World ID proof를 BE에서 검증하고 익명 Human 레코드 생성
- nullifier_hash 기반 중복 방지
- 세션 발급으로 인증 상태 유지
- 이후 지갑 바인딩의 기반 마련

## 성공 기준
- [ ] 유효한 proof로 human_id 발급 (POST /api/verify)
- [ ] 중복 nullifier 처리 동작 (동일 사용자 재인증 시 기존 human_id 반환)
- [ ] 세션 발급 및 /api/human/me 정상 동작
- [ ] FE에서 인증 완료/실패/중복 상태 UI 표시
- [ ] proof, PII 저장 금지 (보안 요구사항)

## 제약사항

### 기술적 제약
- FE: MiniKit Verify Command 사용 필수
- BE: verifyCloudProof()로만 검증 (FE payload 신뢰 금지)
- DB: Supabase 사용, Human 테이블 필요

### 비즈니스 제약
- proof 원문 저장 금지 (개인정보 보호)
- nullifier_hash만 저장 (익명성 보장)

### 범위 제한 (Out of Scope)
- SIWE 지갑 바인딩 (v0.0.3)
- 지갑 목록 조회/관리 (v0.0.4)
- 세금 리포트

## 참고 문서
- [PRD.md](./PRD.md) - 상세 기능 요구사항
- [supabase/migrations/0000_create_human.sql](/supabase/migrations/0000_create_human.sql) - DB 스키마
- [supabase/migrations/0001_gate_human_rls.sql](/supabase/migrations/0001_gate_human_rls.sql) - RLS/권한
- [domains/human.md](./domains/human.md) - 도메인 구조
