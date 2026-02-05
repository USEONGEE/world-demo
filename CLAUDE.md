# World Mini-App 개발 규칙

## 필수
- 모든 검증은 백엔드에서 수행 (Frontend payload 신뢰 금지)
- Mobile-first: Tab 네비게이션, 초기 로딩 2-3초, 이후 <1초
- 사용자 자산 컨트랙트는 Immutable, 테스트 커버리지 ≥90%

## 금지
- "official" 표현, World 로고 사용, 운 기반 게임, 토큰 pre-sale

## 개발 환경 테스트

World MiniApp은 World App 내부에서 실행됨. localhost 직접 접근 불가.

### 방법 1: ngrok 터널링
```bash
# 터미널 1: 개발 서버
pnpm dev

# 터미널 2: ngrok 터널링
ngrok http 3000
```
ngrok URL (예: `https://xxxx.ngrok-free.app`)을 Developer Portal에 등록

### 방법 2: Vercel 배포
```bash
vercel
```
Preview URL을 Developer Portal에 등록

### World Developer Portal 설정
1. https://developer.worldcoin.org 접속
2. 앱 생성/수정
3. **Mini App URL**에 ngrok/Vercel URL 입력
4. `.env.local`의 `NEXT_PUBLIC_WLD_APP_ID`를 Portal 발급값으로 설정

### 로컬 브라우저 테스트 (AppGuard 비활성화)
`src/app/(tabs)/layout.tsx`에서 `<AppGuard>` 주석 처리 후 브라우저에서 직접 테스트 가능
