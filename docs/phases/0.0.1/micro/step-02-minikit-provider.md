# Step 02: MiniKitProvider 설정

## 메타데이터
- **난이도**: 🟡 보통
- **롤백 가능**: ✅
- **선행 조건**: Step 01 완료

---

## 1. 구현 내용 (design.md 기반)

- MiniKitProvider 컴포넌트 생성 (MiniKitClientProvider.tsx)
- RootProviders 통합 컴포넌트 생성
- app/layout.tsx에서 MiniKitProvider 래핑
- appId 환경변수 연결

## 2. 예상 범위 (Step 4에서 확정)
- [ ] Scope 탐색 필요

## 3. 완료 조건

- [ ] `components/providers/MiniKitClientProvider.tsx` 파일 존재
- [ ] MiniKitClientProvider가 `'use client'` 지시어 포함
- [ ] MiniKitProvider가 `process.env.NEXT_PUBLIC_WLD_APP_ID`를 appId로 사용
- [ ] `components/providers/index.tsx`에서 RootProviders export
- [ ] `app/layout.tsx`에서 RootProviders로 children 래핑
- [ ] World App Simulator에서 앱 로딩 시 MiniKit 초기화 로그 확인 가능

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-05

### 신규 생성 파일
```
components/
└── providers/
    ├── index.tsx                    # RootProviders 통합 export
    └── MiniKitClientProvider.tsx    # 'use client' 컴포넌트
```

### 수정 대상 파일
```
app/
└── layout.tsx                       # RootProviders 래핑 추가
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| @worldcoin/minikit-js | 직접 의존 | MiniKitProvider import |
| app/layout.tsx | 수정 필요 | RootProviders 래핑 |

### Side Effect 위험
- 'use client' 지시어로 클라이언트 번들 증가
- MiniKit 초기화 시점에 따른 로딩 순서 영향

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-05

### False Positive (과잉 - 제거 대상)

| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| MiniKitClientProvider.tsx | design.md MiniKit 통합 | ✅ OK |
| providers/index.tsx | design.md RootProviders | ✅ OK |
| app/layout.tsx 수정 | design.md 래핑 | ✅ OK |

**FP 조치:** 없음

### False Negative (누락 - 추가 대상)

| 구현 내용 | Scope 포함 여부 | 판정 |
|----------|----------------|------|
| MiniKitProvider 컴포넌트 | ✅ MiniKitClientProvider.tsx | OK |
| RootProviders 통합 | ✅ providers/index.tsx | OK |
| layout.tsx 래핑 | ✅ app/layout.tsx 수정 | OK |

**FN 조치:** 없음

### 검증 통과: ✅

---

→ 다음: [Step 03: SafeAreaLayout + AppGuard](step-03-layout-guard.md)
