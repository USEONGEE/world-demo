# Session Guard + Re-Verify Recovery - v0.0.3.2

## 요약
- 재검증(`max_verifications_reached`)을 에러가 아닌 "이미 인증됨"으로 처리
- 세션 기반 전역 가드 추가 (보호 경로 → /home 리다이렉트)
- /home은 MiniKit 미설치 환경에서도 접근 가능 + 브릿지 CTA 제공

## 핵심 변경
- 서버: `max_verifications_reached` → 세션 재발급 경로로 처리
- 클라이언트: SessionGuard로 보호 경로 통일
- UX: PC 브라우저에서 /home → /bridge로 유도

## 범위
- 로그인/인증 플로우 안정화
- 가드 정책 일관화
- 브릿지 안내 개선
