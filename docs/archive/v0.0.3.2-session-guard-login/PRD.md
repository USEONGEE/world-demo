# v0.0.3.2 Session Guard + Re-Verify Recovery

## 목적
MiniApp/브라우저 환경에서 세션이 끊기는 경우에도 로그인이 자연스럽게 이어지도록 하고,
비로그인 상태에서 보호 경로 접근 시 일관된 가드 동작을 제공한다.

## 배경/문제
- MiniApp을 닫으면 쿠키가 사라질 수 있어 세션이 끊긴다.
- World ID는 동일 action에 대해 재검증 시 `max_verifications_reached`를 반환한다.
- 기존 구현은 이를 에러로 처리하여 재로그인이 불가능했다.
- 보호 경로(/wallet 등) 접근 시 세션 없으면 UX가 깨지거나 401만 발생했다.
- PC 브라우저에서 /home 접근 시 MiniKit 미설치로 막혀 브릿지 흐름이 불명확했다.

## 목표
1) `max_verifications_reached`를 "이미 인증됨"으로 처리하여 세션 재발급 가능
2) 보호 경로는 세션 기반 가드로 통일
3) /home은 MiniKit이 없어도 접근 가능하게 하여 브릿지 안내 제공

## 비목표
- 세션 TTL 정책 변경
- World ID action 체계 변경
- 브릿지 코드 정책(길이/TTL/재발급 제한) 변경

## 사용자 플로우
### A. MiniApp 최초 인증
1. /home에서 Verify
2. /api/verify → verifyCloudProof 성공
3. (없으면) human 생성 → 세션 발급
4. 이후 보호 경로 접근 가능

### B. MiniApp 재로그인 (세션 소실)
1. /home에서 Verify
2. World ID에서 `max_verifications_reached` 반환
3. 서버가 이를 성공으로 간주
4. DB에서 action+nullifier 조회
   - 있으면 세션 재발급
   - 없으면 신규 생성 후 세션 발급

### C. 브라우저 로그인
1. /home 접근(PC) → MiniKit 미설치 안내 + /bridge 이동 CTA
2. /bridge에서 코드 입력 → /api/bridge/consume
3. 세션 쿠키 발급 → /bridge/connect로 이동

### D. 보호 경로 접근
- PUBLIC: /, /home, /bridge, /consent
- PROTECTED: /wallet, /settings, /bridge/connect 등
- 세션 없으면 /home으로 리다이렉트

## 요구사항
### FE
- /home에서 MiniKit 미설치 상태일 때 브릿지 이동 CTA 표시
- 전역 SessionGuard로 보호 경로 리다이렉트

### BE
- verifyCloudProof 실패 중 `max_verifications_reached`는 성공으로 처리
- 이후 기존 human 조회 및 세션 재발급

## 수용 기준
- 재검증 시 400이 아니라 세션 재발급으로 처리됨
- /wallet, /settings, /bridge/connect는 세션 없으면 /home으로 이동
- PC 브라우저에서 /home 접근 시 브릿지 안내 CTA 노출

## 관련 변경 파일
- `src/domains/human/server/verifyHuman.ts`
- `src/shared/components/layout/SessionGuard.tsx`
- `src/shared/components/layout/AppGuard.tsx`
- `src/providers/index.tsx`
- `src/domains/human/client/components/VerifyButton.tsx`
- `src/locales/en.json`
- `src/locales/ko.json`
- `supabase/config.toml` (gate schema 노출)
