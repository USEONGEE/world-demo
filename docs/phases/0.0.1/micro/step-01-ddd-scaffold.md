# Step 01: DDD 프로젝트 스캐폴딩

## 메타데이터
- **난이도**: 🟢 쉬움
- **롤백 가능**: ✅
- **선행 조건**: 없음
- **레이어**: app (3) - 프로젝트 루트

---

## 1. 구현 내용 (design.md 기반)

- Next.js 15 프로젝트 생성 (App Router)
- DDD 4계층 디렉토리 구조 생성 (app, domains, core, shared)
- 의존성 설치 (zustand, @supabase/supabase-js, @worldcoin/minikit-js, next-intl)
- tsconfig.json 경로 별칭 설정 (@/domains/*, @/core/*, @/shared/*)
- 환경 변수 파일 생성

## 2. Scope

### 신규 생성 파일
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── not-found.tsx
├── domains/
│   └── .gitkeep
├── core/
│   └── .gitkeep
├── shared/
│   └── .gitkeep
├── locales/
│   └── .gitkeep
└── providers/
    └── index.tsx

package.json
tsconfig.json
next.config.mjs
tailwind.config.ts
postcss.config.js
.env.example
.env.local
.gitignore
```

### 의존성
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@worldcoin/minikit-js": "^1.9.0",
    "@supabase/supabase-js": "^2.0.0",
    "@supabase/ssr": "^0.5.0",
    "zustand": "^5.0.0",
    "next-intl": "^3.0.0"
  }
}
```

## 3. 완료 조건

- [ ] `pnpm dev` 실행 시 localhost:3000 정상 동작
- [ ] `pnpm build` 에러 없이 완료
- [ ] src/ 하위에 정확히 4개 디렉토리 존재: `app/`, `domains/`, `core/`, `shared/`
- [ ] tsconfig.json에 경로 별칭 설정:
  - `@/*` → `./src/*`
  - `@/domains/*` → `./src/domains/*`
  - `@/core/*` → `./src/core/*`
  - `@/shared/*` → `./src/shared/*`
- [ ] package.json에 zustand, @supabase/supabase-js 포함
- [ ] .env.example에 Supabase 환경변수 정의:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY

---

## FP/FN 검증: ✅ 통과

→ 다음: [Step 02: core/minikit 설정](step-02-core-minikit.md)
