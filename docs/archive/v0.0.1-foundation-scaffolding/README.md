# Foundation & Compliance Scaffolding - v0.0.1

## 문제 정의

### 현상
- World Gate BE + Mini App FE 개발을 위한 기본 인프라가 없음
- World App 환경에서 안정적으로 동작하는 MiniApp 기반 구조가 필요
- 정책 준수(World 로고 금지, official 표현 금지 등)를 위한 기반이 없음

### 원인
- 신규 프로젝트로 기존 코드베이스가 없음
- World MiniApp 프레임워크 규칙에 맞는 초기 설정 필요
- 다국어 지원, 데이터 수집 동의 등 필수 요소 미구현

### 영향
- MiniApp 개발 시작 불가
- World App 내부에서 정상 동작 불가
- 정책 미준수로 앱 리젝 가능성

### 목표
- World App 안에서 안정적으로 로딩되는 MiniApp 기반 구축
- 탭 네비게이션과 안전 영역(safeAreaInsets) 보장
- 정책 준수 기반 마련

## 성공 기준

- [ ] World App 내부에서 정상 렌더링
- [ ] 탭 네비게이션과 safeArea 적용 확인
- [ ] i18n 6개 언어(EN/ES/TH/JA/KO/PT) 스캐폴딩 완료
- [ ] 데이터 수집 동의 UI 및 개발자 연락처 화면 확인
- [ ] /api/health, /api/config API 정상 응답

## 제약사항

### 기술적 제약
- Next.js 15 + TypeScript 사용
- @worldcoin/minikit-js SDK 필수
- 초기 로딩 2-3초 이내, 후속 액션 < 1초

### 정책 제약
- World 로고 사용 금지
- "official" 표현 사용 금지
- 운 기반 게임, 토큰 pre-sale, NFT 구매 금지

### 비범위
- World ID 검증 (Phase 0.0.2)
- SIWE 바인딩 (Phase 0.0.3)
- 지갑 목록/관리 (Phase 0.0.4)
- 트랜잭션 수집/세금 계산

## 참조 문서
- [PRD.md](./PRD.md) - 상세 요구사항
- [World-Chain-Guide.md](/docs/World-Chain-Guide.md) - MiniKit 가이드
