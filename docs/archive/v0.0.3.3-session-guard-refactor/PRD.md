# Phase 0.0.3.3 PRD — Session/Guard Refactor

## 목표
- 인증/세션 가드 정책을 단일화해 유지보수 비용을 줄인다.
- 세션 확인/리다이렉트 동작을 일관되게 만든다.
- 로그인 흐름(verify/bridge)이 끊기지 않도록 UX를 정리한다.

## 범위
### FE
- PUBLIC/PROTECTED 경로 정책을 중앙화
- SessionGuard/AppGuard 중복 로직 정리
- 세션 체크 중복 요청 제거
- /home 브릿지 안내 UX 유지 (MiniKit 없는 환경 안내)

### BE
- verifyCloudProof 결과 처리 로직 정리 (max_verifications_reached 포함)
- API 에러 응답 매핑 공통화

## 비범위
- 세션 TTL 정책 변경
- 브릿지 코드 정책(길이/TTL/발급 제한) 변경
- World ID Action 정책 변경

## 사용자 플로우
1) 비로그인 사용자가 보호 경로 접근
- SessionGuard가 /home으로 리다이렉트

2) MiniApp 최초 인증
- /home → Verify → /api/verify → 세션 발급

3) MiniApp 재로그인 (세션 소실)
- /home → Verify
- World ID: max_verifications_reached
- 서버에서 기존 human 조회 후 세션 재발급

4) 브라우저 로그인
- /home(PC)에서 브릿지 안내 → /bridge 코드 입력
- /api/bridge/consume → 세션 발급 → /bridge/connect

## 기능 요구사항
### FE
- 경로 정책: PUBLIC/PROTECTED 라우트 중앙 관리
- 세션 체크는 한 번만 수행되도록 구조 개선
- /home MiniKit 미설치 시 브릿지 CTA 유지

### BE
- verifyHuman에서 max_verifications_reached 처리 보장
- API 에러 응답 형식/상태 코드 매핑 공통화

## FE/BE 경계
- FE: 라우팅/가드, UX 표시, 세션 체크 트리거만 담당
- BE: 세션 검증, World ID 검증, DB 상태 확인 및 세션 발급 담당

## 정책
### PUBLIC 경로
- /, /home, /bridge, /consent

### PROTECTED 경로
- /wallet, /settings, /bridge/connect, 그 외 모든 탭/내부 경로

## 리스크
- 가드 리팩토링 시 리다이렉트 루프 발생 위험
- 세션 체크 중복 제거 과정에서 최초 렌더 플리커 발생 가능

## 테스트
- 보호 경로 접근 시 /home 리다이렉트
- /home에서 MiniKit 없는 환경 → 브릿지 CTA 노출
- 재검증(max_verifications_reached) 시 세션 재발급
- API 에러 응답 포맷 통일성 확인

## 완료 기준
- 가드 정책이 단일 모듈로 관리됨
- 세션 체크 1회만 발생
- 브릿지/verify UX 끊김 없음
- 기존 v0.0.3.2 기능 회귀 없음

## 참조
- `docs/phases/ARCHITECTURE.md`
- `docs/phases/ENV.md`
