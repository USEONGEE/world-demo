# v0.0.3.3 실행 계획

## 1) 라우트 정책 중앙화
- PUBLIC/PROTECTED 경로를 `shared/guards/routes.ts`로 이동
- SessionGuard/AppGuard에서 동일 정책 사용

## 2) 세션 체크 중복 제거
- 전역 SessionGuard에서만 세션 확인 수행
- VerifyButton에서 세션 체크 호출 제거 또는 조건 분기

## 3) verifyHuman 로직 정리
- World ID 검증 로직을 헬퍼로 분리
- `max_verifications_reached` 처리 로직 테스트

## 4) API 에러 처리 공통화
- ApiError → HTTP status 매핑 헬퍼 도입
- `/api/verify`, `/api/bridge/*`, `/api/siwe/*` 적용

## 5) QA 시나리오
- 비로그인 보호 경로 → /home 리다이렉트
- MiniKit 없는 브라우저 /home → /bridge CTA
- 재검증(duplicate) → 세션 재발급
- 브릿지 코드 소비 → /bridge/connect 정상 진입
