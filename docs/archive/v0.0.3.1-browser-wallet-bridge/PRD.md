# Phase 0.0.3.1 PRD — Browser Wallet Bridge (세션 연동 + 브라우저 SIWE)

## 목표
- World App(MiniKit)에서 발급된 human 세션을 **브라우저 환경으로 안전하게 전달**한다.
- 브라우저 지갑(MetaMask 등)으로 SIWE 서명을 수행해 **Human ↔ Address 바인딩**을 완료한다.
- MiniKit 플로우와 **공생**하는 병렬 파이프라인을 제공한다.

## 범위
- FE(MiniApp): 브라우저 연동 코드/QR 발급 UI
- FE(Web): 연동 코드 입력/QR 스캔, 브라우저 지갑 연결 UI
- BE: 1회성 브릿지 토큰 발급/검증, 세션 쿠키 설정
- BE: 브라우저 SIWE 검증(viem), 기존 WalletBinding 저장 재사용

## 비범위
- WalletConnect/다중 지갑 지원(추후)
- 브라우저 지갑 자동 설치/딥링크
- 이메일/소셜 로그인

---

## 사용자 플로우

### A. MiniApp → Web 브릿지
1. 사용자가 MiniApp에서 World ID 인증 완료
2. MiniApp에서 "브라우저로 지갑 연결" 버튼 클릭
3. BE가 **1회성 브릿지 코드/QR** 발급
4. 사용자가 PC 브라우저에서 코드를 입력하거나 QR 스캔
5. BE가 브릿지 코드 검증 후 **브라우저에 wg_session 쿠키 발급**

### B. Web 브라우저 SIWE
1. 브라우저에서 지갑 연결 버튼 클릭
2. viem으로 지갑 연결 + 주소 획득
3. BE에 Challenge 요청
4. 브라우저 지갑으로 서명
5. BE에서 SIWE 검증 후 WalletBinding 저장

---

## 기능 요구사항

### FE (MiniApp)
- "브라우저로 지갑 연결" 버튼 노출
- 브릿지 코드/QR 발급 API 호출
- 코드/QR 표시 (유효시간 표시)
- 재발급 버튼

### FE (Web)
- 브릿지 코드 입력 UI (또는 QR 스캔)
- 성공 시 세션 획득 안내
- 브라우저 지갑 연결 버튼 (MetaMask 우선)
- 연결/서명/성공/실패 상태 UI

### BE
- POST /api/bridge/issue
  - 입력: 없음 (세션 기반 human_id 필수)
  - 출력: { code, expires_at }
  - 저장: { human_id, code, expires_at, used=false }
- POST /api/bridge/consume
  - 입력: { code }
  - 검증: 만료/재사용/존재 확인
  - 성공: 브라우저에 wg_session 쿠키 발급
- 기존 /api/siwe/challenge, /api/siwe/verify 재사용

---

## 데이터 모델

### BridgeToken (gate.bridge_token)
- id (UUID)
- human_id
- code (고유, 1회성)
- expires_at
- used (boolean)
- created_at

**제약:** code 유니크, 10분 만료, 동일 human_id 중복 발급 시 이전 코드 폐기

### 코드 스펙 (추천 확정)
- 형식: 8자리 Base32 (대문자, 혼동 문자 제외: O/0, I/1 제거)
- 예시: `7K3M9T2Q`
- TTL: 10분
- 동시 발급: 새 코드 발급 시 기존 코드 **즉시 폐기**

---

## 세션 정책
- 브릿지 소비 시 서버에서 **wg_session 발급**
- 브라우저는 HTTP-only 쿠키 기반 세션 사용
- 브릿지 코드는 1회성 + 만료
- 브릿지 코드 소비 성공 시 used=true 업데이트

---

## 보안/정책
- 브릿지 코드는 짧은 TTL
- 브릿지 재사용 금지
- 서명/메시지 원문 저장 금지
- FE payload 신뢰 금지, 모든 검증 BE 수행
- Rate limit: issue 5회/10분, consume 10회/10분 (IP + human_id 기준)

---

## 분석 이벤트
- bridge_code_issued
- bridge_code_consumed
- bridge_code_issue_fail (reason)
- bridge_code_consume_fail (reason)
- wallet_bind_success / wallet_bind_fail (reason)

---

## 테스트
- Bridge code 발급/소비 성공
- 만료/재사용 시 4xx
- 브라우저 세션 발급 후 /api/human/me 정상
- 브라우저 지갑 SIWE 서명 성공

---

## 완료 기준
- MiniApp → Web 세션 연동 성공
- 브라우저 지갑으로 SIWE 바인딩 성공
- MiniKit 플로우와 공존 (둘 중 하나 선택 가능)

---

## API 스펙 (요약)

### POST /api/bridge/issue
- 세션 필요 (human_id)
- 응답: `{ code, expires_at }`
- 실패: 401(UNAUTHORIZED), 500(INTERNAL_ERROR)
 - 정책: 동일 human_id 중복 발급 시 이전 코드 폐기

### POST /api/bridge/consume
- 입력: `{ code }`
- 응답: `{ ok: true }` + Set-Cookie: wg_session
- 실패: 400(INVALID_BRIDGE_CODE|BRIDGE_EXPIRED|BRIDGE_ALREADY_USED), 500(INTERNAL_ERROR)
 - 정책: 1회성 소비 성공 시 used=true

---

## DB 마이그레이션
- `supabase/migrations/0004_create_bridge_token.sql`
  - `gate.bridge_token` 테이블 생성
  - `code` 유니크 인덱스
- `supabase/migrations/0005_bridge_token_rls.sql`
  - RLS 활성화, anon/authenticated 차단
  - service_role 접근 허용

---

## UI 노출 가이드

### MiniApp
- Wallet 탭 상단에 "브라우저로 지갑 연결" CTA
- MiniKit 미설치일 경우 안내 배너

### Web
- 라우트: `/bridge`
- 상단에 "World App에서 코드 발급" 안내
- 코드 입력/QR 스캔
- 연결 성공 후 브라우저 지갑 바인딩 진행
 - QR 포맷: `/bridge?code=XXXXXXXX`

---

## 참고 문서
- `/docs/phases/ENV.md` - 세션/환경변수
- `/docs/phases/ARCHITECTURE.md` - FE/BE 경계
- `siwe`, `viem` - 서명 검증
