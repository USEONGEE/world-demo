# Phase 0.0.4.1 PRD — Wallet Auth 팝업 + EIP-1271 검증 수정

## 배경/문제
- MiniKit 환경에서 `MiniKit.user.walletAddress`가 비어 있는 경우
  - Wallet Auth 팝업이 뜨기 전에 프론트에서 실패
  - 결과적으로 서버 로그가 찍히지 않고 "No wallet address available" 에러 발생
- World App 지갑은 스마트월렛(계약 지갑) 구조가 일반적
  - EIP-1271 검증에서 SHA-256 해시 사용으로 서명 검증 실패
  - `Invalid signature` 오류 발생

## 목표
- 지갑 주소가 아직 없는 상태에서도 Wallet Auth 팝업이 정상적으로 뜨도록 한다.
- 스마트월렛(EIP-1271) 서명 검증이 정상 동작하도록 한다.

## 범위
### FE
- `MiniKit.user.walletAddress`가 없을 때도 Wallet Auth 플로우가 계속 진행되어야 함
- 챌린지 발급 시 임시 주소를 사용
- 서명 메시지에서 실제 주소를 추출해 추적/검증 흐름에 반영

### BE
- EIP-1271 검증 시 올바른 메시지 해시(EIP-191/keccak) 사용
- viem `hashMessage` 사용

## 비범위
- UI 디자인 변경
- DB 스키마 변경
- 세션/인증 구조 변경

## 기능 요구사항
### FE 요구사항
- walletAddress가 없으면 에러로 중단하지 않는다.
- `/api/siwe/challenge` 호출에 임시 주소를 사용한다.
- Wallet Auth 완료 후 `finalPayload.message`에서 주소를 파싱한다.
- 파싱된 주소를 analytics 및 이후 플로우에 사용한다.

### BE 요구사항
- EIP-1271 검증은 `hashMessage` 기반으로 수행한다.
- SHA-256 기반 커스텀 해시는 제거한다.

## 변경 파일
- `src/domains/wallet/client/store/wallet.store.ts`
- `src/domains/wallet/server/verifySiwe.ts`

## 리스크/주의사항
- 챌린지 테이블에 임시 주소가 저장될 수 있음
  - 검증 시 실제 주소는 메시지에서 추출해 사용됨
  - nonce/세션 기반 검증에는 영향 없음

## 테스트
1. World App MiniKit 환경에서 walletAddress가 없는 상태로 버튼 클릭 → Wallet Auth 팝업 노출 확인
2. 서명 완료 후 `/api/siwe/verify`가 200 OK로 통과되는지 확인
3. 스마트월렛 주소에 대해 EIP-1271 검증 실패가 더 이상 발생하지 않는지 확인

## 완료 기준
- Wallet Auth 팝업이 항상 정상적으로 뜬다 (walletAddress 유무와 무관)
- 스마트월렛 서명이 정상 검증된다
- `Invalid signature` 오류가 재현되지 않는다
