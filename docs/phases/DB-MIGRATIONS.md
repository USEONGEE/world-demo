# DB Migration SQL 문서

## v0.0.2 — World ID Verify
- `supabase/migrations/0000_create_human.sql`
  - `gate.human` 테이블 생성
  - `(action, nullifier_hash)` 유니크 인덱스
- `supabase/migrations/0001_gate_human_rls.sql`
  - `gate.human` RLS 활성화
  - anon/authenticated 접근 차단
  - service_role 접근 허용

## v0.0.3 — SIWE Wallet Binding
- `supabase/migrations/0002_create_siwe_challenge.sql`
  - `siwe_challenge` 테이블 생성
- `supabase/migrations/0003_create_wallet_binding.sql`
  - `wallet_binding` 테이블 생성
  - `(chain, address)` 유니크 인덱스

## v0.0.3.1 — Browser Wallet Bridge
- `supabase/migrations/0004_create_bridge_token.sql`
  - `gate.bridge_token` 테이블 생성
  - `code` 유니크 인덱스
- `supabase/migrations/0005_bridge_token_rls.sql`
  - `gate.bridge_token` RLS 활성화
  - anon/authenticated 접근 차단
  - service_role 접근 허용

## 참고
- Supabase SQL Editor에서 실행
- 변경 시 파일 추가/버전 증가
