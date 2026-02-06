# Browser Wallet Bridge - v0.0.3.1

## 문제 정의

### 현상
- World App(MiniKit) 내부에서는 MetaMask 등 브라우저 지갑을 직접 사용할 수 없음
- v0.0.3에서 MiniKit SIWE 바인딩은 완료했지만, PC 브라우저 지갑으로의 바인딩 경로가 없음
- 사용자가 MiniApp에서 인증한 Human 세션을 PC 브라우저로 가져갈 방법이 없음

### 원인
- MiniKit은 World App 내장 브라우저에서 실행되며, 외부 브라우저 지갑 확장(MetaMask 등)에 접근 불가
- MiniApp 세션(wg_session)은 World App 도메인에 묶여 있어 PC 브라우저와 공유 불가

### 영향
- MetaMask 등 브라우저 지갑 사용자가 Human ↔ Address 바인딩을 수행할 수 없음
- DeFi/NFT 등 PC 브라우저 기반 Web3 활동과 World ID 인증을 연결할 수 없음
- MiniKit 미설치 사용자에게 지갑 바인딩 대안이 없음

### 목표
- MiniApp에서 발급된 Human 세션을 **1회성 브릿지 코드/QR**로 PC 브라우저에 안전하게 전달
- PC 브라우저에서 MetaMask 등으로 SIWE 서명을 수행하여 Human ↔ Address 바인딩 완료
- 기존 MiniKit 플로우와 **병렬 공존** (사용자가 둘 중 하나 선택 가능)

## 성공 기준
- [ ] MiniApp에서 브릿지 코드/QR 발급 → PC 브라우저에서 입력 → wg_session 쿠키 발급 성공
- [ ] PC 브라우저에서 MetaMask 연결 → SIWE 서명 → WalletBinding 저장 성공
- [ ] 브릿지 코드 1회성 + 만료(5~10분) 정책 동작
- [ ] 기존 MiniKit SIWE 플로우가 정상 동작 (회귀 없음)

## 제약사항
- 브릿지 코드는 짧은 TTL(5~10분), 1회성 사용
- 모든 검증은 백엔드에서 수행 (FE payload 신뢰 금지)
- WalletConnect/다중 지갑 지원은 비범위 (추후)
- 브라우저 지갑 자동 설치/딥링크는 비범위
