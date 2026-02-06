# Phase 0.0.7 PRD — Worker Proof Tab + Wallet Auto Auth

## 배경/문제
- Worker Network 데모를 위해 World ID proof payload를 사용자가 직접 확인/복사할 수 있는 단일 화면이 필요
- MiniKit 설치 환경에서 `/wallet` 진입 시 지갑 주소가 없거나 바인딩이 누락된 경우 자동 플로우가 필요
- MiniKit 설치 체크 시 초기 타이밍 예외로 콘솔 에러 발생 가능

## 목표
- MiniApp 전용 Worker 탭 제공 (proof payload 표시/복사)
- `/wallet` 자동 Wallet Auth → 바인딩 여부 확인 → 필요 시 자동 바인딩
- MiniKit 설치 체크는 에러 없이 polling

## 범위
### FE
- 하단 탭에 Worker 추가 (MiniKit 설치 환경에서만 표시)
- `/worker` 페이지 생성 (MiniKit verify 결과 payload 표시/복사)
- `/wallet` 자동 Wallet Auth 플로우 추가
- MiniKit 설치 체크 polling 안정화

### BE
- 변경 없음 (verify는 MiniKit 내부 수행, 서버 전송 없음)

## 비범위
- 신규 API 추가
- 세션 정책 변경
- 기존 Verify/Wallet/Bridge 플로우 변경

## 기능 요구사항
### Worker 탭
- MiniKit 설치 환경에서만 탭 노출
- `/worker` 접근 시 MiniKit 없으면 안내 표시
- Verify 버튼 → proof payload JSON 표시
- 복사 버튼 + "복사됨" 피드백
- action은 `verify_human` 재사용

### Wallet 자동 Wallet Auth
- MiniKit 설치 환경에서 `/wallet` 진입 시:
  1) 지갑 목록 조회
  2) MiniKit 주소 존재 여부 확인
     - 주소 + 목록에 있음 → 바인딩 스킵
     - 주소 + 목록에 없음 → Wallet Auth 강제 후 SIWE 바인딩
     - 주소 없음 → Wallet Auth 강제 후 주소 획득 → 목록 비교 후 바인딩/스킵
- 실패 시 재시도 버튼 제공

### MiniKit 설치 체크
- 1초 간격 polling
- 예외 발생 시 에러 노출 없이 false 처리
- 설치 감지 시 polling 중단

## UX 가이드
- Worker 탭은 단일 카드 + JSON 프리뷰 + 복사 버튼 구조
- Wallet 자동 플로우는 진행 상태 표시(loading/signing/verifying)
- 실패 시 간단한 오류 메시지 + 재시도

## 테스트 (수동)
1) MiniKit 설치 환경에서 탭에 Worker 표시
2) `/worker`에서 Verify → payload 표시/복사 확인
3) MiniKit 미설치 환경에서 Worker 안내 표시
4) `/wallet` 진입 시 자동 Wallet Auth 실행
5) 이미 바인딩된 주소면 자동 바인딩 스킵
6) 미바인딩 주소는 자동 바인딩 성공

## 완료 기준
- Worker 탭/페이지 동작 확인
- `/wallet` 자동 Wallet Auth 플로우 정상 동작
- MiniKit 설치 체크 에러 로그 제거

## 변경 파일 (요약)
- `src/shared/components/layout/TabNavigation.tsx`
- `src/shared/guards/routes.ts`
- `src/app/(tabs)/worker/page.tsx`
- `src/app/(tabs)/wallet/page.tsx`
- `src/domains/wallet/client/store/wallet.store.ts`
- `src/domains/wallet/types/index.ts`
- `src/core/minikit/hooks.ts`
- `src/locales/en.json`
- `src/locales/ko.json`
