# Changelog

## v0.0.3 - SIWE Wallet Binding (2026-02-06)

### Features
- **SIWE Challenge/Verify**: EIP-4361 기반 지갑 소유권 검증
- **Wallet Binding**: Human ↔ Wallet Address 1:1 매핑 저장
- **Wallet List UI**: 연결된 지갑 목록 조회 및 연결 플로우

### API Endpoints
- `POST /api/siwe/challenge`: SIWE nonce 발급
- `POST /api/siwe/verify`: 서명 검증 및 지갑 바인딩
- `GET /api/wallet/bindings`: 현재 사용자 지갑 목록

### Infrastructure
- **DB Migration**: `0002_create_siwe_challenge.sql`, `0003_create_wallet_binding.sql`
- **siwe + viem**: EIP-191/EIP-1271 서명 검증

### Dependencies
- `siwe`: SIWE 메시지 파싱/검증
- `viem`: Ethereum 서명 검증

📝 [Phase 문서](../archive/v0.0.3-siwe-wallet-binding/README.md)

---

## v0.0.2 - World ID Verify (2026-02-06)

### Features
- **World ID Human Verification**: World ID proof 검증 및 human_id 발급
- **JWT Session Management**: jose 기반 세션 토큰 생성/검증
- **Human Domain**: repo/service/API 완전 구현
- **Verify UI**: 인증 버튼 컴포넌트 (로딩/성공/실패/중복 상태)

### API Endpoints
- `POST /api/verify`: World ID proof 검증 및 세션 발급
- `GET /api/human/me`: 현재 세션의 human_id 조회

### Infrastructure
- **Supabase Admin Client**: service_role key로 RLS 우회
- **DB Migration**: `supabase/migrations/0000_create_human.sql`, `supabase/migrations/0001_gate_human_rls.sql`
- **Zod Validation**: API payload 검증 스키마

### Dependencies
- `jose`: JWT 생성/검증
- `zod`: 스키마 검증

📝 [Phase 문서](../archive/v0.0.2-world-id-verify/README.md)

---

## v0.0.1 - Foundation & Compliance Scaffolding (2026-02-05)

### Features
- **DDD 4-layer Architecture**: app/domains/core/shared 구조 구축
- **Next.js 15 App Router**: Turbopack 지원, Tailwind CSS 통합
- **MiniKit Integration**: World App 내 실행을 위한 SDK 연동
- **i18n 지원**: 6개 언어 (EN/ES/TH/JA/KO/PT) 완전 지원
- **Tab Navigation**: Home/Settings 탭 네비게이션 구현
- **Consent Flow**: 동의 흐름 및 리다이렉트 로직 구현
- **Analytics Layer**: Console tracker 기반 이벤트 추적

### Infrastructure
- **Zustand Stores**: consent, settings 영속화 스토어
- **Supabase Client**: 향후 Phase를 위한 클라이언트 설정
- **API Endpoints**: /api/health, /api/config 구현
- **Safe Area Support**: MiniKit safeAreaInsets 적용

### Documentation
- Phase 문서 구조 정립 (PRD, design.md, micro steps)
- World Chain 개발 가이드 문서 추가

📝 [Phase 문서](../archive/v0.0.1-foundation-scaffolding/README.md)
