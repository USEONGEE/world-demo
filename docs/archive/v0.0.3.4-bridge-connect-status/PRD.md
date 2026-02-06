# v0.0.3.4 Bridge Connect Status UX

## 목적
브라우저 지갑 연결 화면(/bridge/connect)의 상태를 명확히 보여주고,
이미 등록된 지갑 여부에 따라 행동을 분기한다.

## 배경
- /bridge/connect는 기존에 “연결만” 제공하여 현재 지갑의 등록 상태를 알 수 없었다.
- 사용자가 브라우저 지갑을 바꾸는 경우, 등록 여부 확인이 필요하다.

## 목표
1) 현재 브라우저 지갑 주소 표시
2) 해당 주소가 이미 등록되어 있는지 확인
3) 등록되어 있으면 체크 상태 표시
4) 등록되지 않았으면 “서명하고 등록” CTA 제공

## 비목표
- 지갑 변경 버튼 제공 (사용자는 브라우저 확장 UI에서 계정 변경)

## 기능 요구사항
### FE
- /bridge/connect 진입 시 브라우저 지갑 주소 확인
- 등록 상태: 확인 중/등록됨/미등록 표시
- 미등록 상태에서만 서명/등록 버튼 활성화

### BE
- GET /api/wallet/bindings 응답으로 등록 여부 판단

## 수용 기준
- 브라우저 지갑 주소가 표시됨
- 등록된 주소면 “이미 등록됨” 표시
- 미등록 주소면 서명 CTA 제공
- 지갑 계정 변경 시 상태 자동 갱신

## 관련 변경 파일
- `src/domains/bridge/client/hooks/useBrowserWallet.ts`
- `src/app/bridge/connect/page.tsx`
- `src/locales/en.json`
- `src/locales/ko.json`
