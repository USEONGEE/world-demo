# Phase 0.0.1 PRD — Foundation & Compliance Scaffolding

## 목표
- World Gate BE + Mini App FE 개발을 위한 최소 뼈대와 정책 준수 기반을 구축한다.
- World App 안에서 안정적으로 로딩되고, 탭 내비게이션과 안전 영역을 보장한다.

## 범위
- FE: Next.js 15 + TypeScript + MiniKitProvider 기본 설정, 탭 내비게이션 2~3개 탭 골격
- FE: MiniKit 설치 여부 감지 및 대체 UI (World App 외부 실행 대응)
- FE: safeAreaInsets 적용, 모바일 퍼스트 레이아웃 기본 스타일
- FE: 필수 언어(EN/ES/TH/JA/KO/PT) i18n 스캐폴딩 및 언어 전환 UI
- FE: 데이터 수집 동의 UI(간단 체크/확인) 및 개발자 연락처 화면
- FE: 초기 로딩/에러/오프라인 기본 상태 컴포넌트
- BE: 기본 서버 라우팅 스캐폴딩(health/config), 공통 에러 포맷
- BE: 환경 변수 구조 정의(WLD_APP_ID 등), 입력 검증/로깅 공통 미들웨어 설계
- 분석: app_open 이벤트(launchLocation 포함) 수집 구조

## 비범위
- World ID 검증, SIWE 바인딩, 지갑 목록/관리
- 트랜잭션 수집/세금 계산
- 스마트 컨트랙트 개발

## 사용자 플로우
1. 사용자가 World App에서 Mini App 실행
2. 앱 초기 로딩 화면 → 탭 내비게이션 진입
3. 데이터 수집 동의 확인(최초 1회)
4. 개발자 연락처 확인 가능

## 기능 요구사항
### FE
- MiniKitProvider로 앱 래핑
- MiniKit.isInstalled() 실패 시 안내 화면 제공
- safeAreaInsets 기반 패딩 적용
- 탭 내비게이션 필수(햄버거/푸터/사이드바 금지)
- 초기 로딩 2–3초 내 진입, 이후 화면 전환 < 1초
- 언어 전환 UI와 기본 번역 키 세트 제공
- 데이터 수집 동의 저장(로컬 스토리지 또는 BE 저장 중 택1)
- 개발자 연락처 정보 노출(이메일 또는 연락 폼)

### BE
- GET /api/health: 상태 체크
- GET /api/config: 공개 설정(예: appId) 제공
- 공통 에러 응답 스키마 정의

## 비기능/정책 준수
- 모든 민감 검증은 BE에서 수행 예정(Phase 0.0.2+)
- 무한 로딩 방지(타임아웃/재시도 UI)
- 저연결 상태 대응(오프라인/재시도 안내)
- World 로고 사용 금지

## 분석 이벤트
- app_open(launchLocation)
- consent_granted / consent_declined

## 테스트
- FE: 탭 전환, 언어 전환, safeArea 적용 스냅샷
- BE: /health, /config 응답 스모크 테스트

## 완료 기준
- World App 내부에서 정상 렌더링
- 탭 내비게이션과 safeArea 적용 확인
- i18n 6개 언어 스캐폴딩 완료
- 데이터 수집 동의 및 연락처 화면 확인
- /api/health, /api/config 정상 응답

---

## World MiniApp 프레임워크 규칙

### MiniKitProvider 설정

```tsx
// app/providers.tsx
'use client'

import { MiniKitProvider } from '@worldcoin/minikit-js/react'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MiniKitProvider appId={process.env.NEXT_PUBLIC_WLD_APP_ID}>
      {children}
    </MiniKitProvider>
  )
}
```

### isInstalled() 체크

World App 외부 실행 감지 및 대체 UI 제공:

```tsx
import { MiniKit } from '@worldcoin/minikit-js'

function MyComponent() {
  useEffect(() => {
    if (!MiniKit.isInstalled()) {
      // World App 외부에서 실행 중
      // 대체 UI 표시 또는 World App 설치 안내
      return
    }
    // MiniKit 사용 가능
  }, [])
}
```

### safeAreaInsets 처리

```tsx
import { useSafeAreaInsets } from '@worldcoin/minikit-js/react'

function Layout({ children }) {
  const insets = useSafeAreaInsets()

  return (
    <div style={{
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }}>
      {children}
    </div>
  )
}
```

### launchLocation 추적

```tsx
import { useLaunchParams } from '@worldcoin/minikit-js/react'

function App() {
  const { launchLocation } = useLaunchParams()

  useEffect(() => {
    trackEvent('app_open', { launchLocation })
  }, [launchLocation])
}
```

### 권한 상태 확인

```tsx
import { MiniKit } from '@worldcoin/minikit-js'

async function checkPermissions() {
  const permissions = await MiniKit.getPermissions()
  // notification: 'granted' | 'denied' | 'prompt'
  // contact: 'granted' | 'denied' | 'prompt'
  // microphone: 'granted' | 'denied' | 'prompt'
  return permissions
}
```

### 필수 정책

| 항목 | 규칙 |
|------|------|
| World 로고 | 사용 금지 |
| "official" 표현 | 사용 금지 |
| 운 기반 게임 | RNG 상금 게임 금지 |
| 토큰 pre-sale | 금지 |
| NFT 구매 | 금지 |

### UI 가이드라인

| 항목 | 규격 |
|------|------|
| 네비게이션 | Tab 네비게이션 필수 (햄버거/사이드바 금지) |
| 좌우 패딩 | 24px |
| 섹션 간격 | 32px |
| App Icon | 정사각형 (흰배경 제외) |
| Content Card | 345×240px |

### 성능 기준

| 메트릭 | 목표 |
|--------|------|
| 초기 로딩 | 2-3초 이내 |
| 후속 액션 | < 1초 |

### 참조 문서
- `/docs/World-Chain-Guide.md` - MiniKit 상세 가이드
- `@worldcoin/minikit-js` - MiniKit SDK
- `@worldcoin/mini-apps-ui-kit-react` - UI 컴포넌트 킷
