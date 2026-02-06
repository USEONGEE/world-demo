# SIWE Wallet Binding - v0.0.3

## 문제 정의

### 현상
- 현재 World ID 인증으로 "인간임"만 증명되고, 지갑 소유권은 검증되지 않음
- 사용자가 자신의 EVM 지갑 주소를 앱에 연결할 방법이 없음
- Human과 Wallet Address 간 신뢰할 수 있는 매핑이 없음

### 원인
- SIWE(Sign-In with Ethereum) 기반 지갑 검증 기능이 구현되어 있지 않음
- 지갑 바인딩을 저장할 데이터 모델이 없음
- MiniKit의 Wallet Auth Command를 호출하는 플로우가 없음

### 영향
- 사용자가 지갑 기반 기능(온체인 보상, NFT 발급 등)을 이용할 수 없음
- Human ID와 지갑 주소를 연결한 서비스 제공 불가
- 탈중앙 서비스와의 연동 기반 부재

### 목표
- SIWE로 지갑 소유권을 검증하고 Human ↔ Address 매핑을 안전하게 저장
- World ID 인증 세션과 결합해 "인간 + 지갑" 결합 확정
- 하나의 지갑 주소는 하나의 Human에만 바인딩 가능

## 성공 기준
- [x] POST /api/siwe/challenge 호출 시 nonce/issued_at/expiration_time 반환
- [x] POST /api/siwe/verify 호출 시 유효한 서명이면 WalletBinding 생성
- [x] 동일 human_id로 같은 address 재바인딩 시 200 OK (idempotent)
- [x] 다른 human_id로 이미 바인딩된 address 시도 시 409 Conflict
- [x] Challenge 만료(10분) 후 verify 시 400 Bad Request
- [x] Challenge 재사용 시도 시 400 Bad Request (used=true)
- [x] GET /api/wallet/bindings로 현재 사용자의 지갑 목록 조회 가능
- [x] UI에서 지갑 연결 플로우 완료 가능

## 제약사항
- World App 내부에서만 동작 (MiniKit 필수)
- 모든 검증은 백엔드에서 수행 (Frontend payload 신뢰 금지)
- EIP-191 기본, EIP-1271은 viem으로 처리
- Challenge 유효시간: 10분

## 비범위 (Out of Scope)
- 지갑 목록 페이지 고도화
- 온체인 트랜잭션 실행
- 복수 지갑 관리 UI
- 세금 리포트
