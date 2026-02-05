# Step 01: Next.js 프로젝트 초기화

## 메타데이터
- **난이도**: 🟢 쉬움
- **롤백 가능**: ✅
- **선행 조건**: 없음

---

## 1. 구현 내용 (design.md 기반)

- Next.js 15 프로젝트 생성 (App Router)
- TypeScript 설정
- Tailwind CSS 설정
- 의존성 설치 (@worldcoin/minikit-js, next-intl)
- 환경 변수 파일 생성 (.env.example, .env.local)
- 기본 디렉토리 구조 생성

## 2. 예상 범위 (Step 4에서 확정)
- [ ] Scope 탐색 필요

## 3. 완료 조건

- [ ] `pnpm dev` 실행 시 localhost:3000에서 Next.js 기본 페이지 렌더링
- [ ] `pnpm build` 성공 (에러 없이 빌드 완료)
- [ ] package.json에 다음 의존성 포함:
  - next@^15.0.0
  - react@^19.0.0
  - @worldcoin/minikit-js@^1.9.0
  - next-intl@^3.0.0
  - tailwindcss@^3.4.0
- [ ] tsconfig.json에 `"strict": true` 설정
- [ ] .env.example 파일에 다음 변수 정의:
  - NEXT_PUBLIC_WLD_APP_ID
  - NEXT_PUBLIC_APP_NAME
  - NEXT_PUBLIC_APP_VERSION
- [ ] 디렉토리 구조 생성 확인:
  - app/
  - components/
  - lib/
  - locales/
  - types/

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-05

### 신규 생성 파일
```
project/
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.js
├── .env.example
├── .env.local
├── .gitignore
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── not-found.tsx
├── components/
│   └── .gitkeep
├── lib/
│   └── .gitkeep
├── locales/
│   └── .gitkeep
└── types/
    └── .gitkeep
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| next | 핵심 프레임워크 | App Router 기반 |
| @worldcoin/minikit-js | SDK | MiniKit 통합 |
| next-intl | i18n | 다국어 지원 |
| tailwindcss | 스타일 | 유틸리티 CSS |

### Side Effect 위험
- Node.js 버전 호환성 (v18+ 필요)
- TypeScript strict mode로 인한 타입 검사 엄격화

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-05

### False Positive (과잉 - 제거 대상)

| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| package.json | design.md 의존성 | ✅ OK |
| tsconfig.json | design.md TypeScript | ✅ OK |
| next.config.mjs | design.md Next.js 15 | ✅ OK |
| tailwind.config.ts | design.md Tailwind | ✅ OK |
| .env.example | design.md 환경 변수 | ✅ OK |
| app/layout.tsx | design.md 프로젝트 구조 | ✅ OK |
| app/page.tsx | design.md 프로젝트 구조 | ✅ OK |

**FP 조치:** 없음

### False Negative (누락 - 추가 대상)

| 구현 내용 | Scope 포함 여부 | 판정 |
|----------|----------------|------|
| Next.js 15 프로젝트 | ✅ package.json | OK |
| TypeScript 설정 | ✅ tsconfig.json | OK |
| Tailwind CSS | ✅ tailwind.config.ts | OK |
| 환경 변수 | ✅ .env.example | OK |
| 기본 디렉토리 | ✅ components/, lib/, locales/, types/ | OK |

**FN 조치:** 없음

### 검증 통과: ✅

---

→ 다음: [Step 02: MiniKitProvider 설정](step-02-minikit-provider.md)
