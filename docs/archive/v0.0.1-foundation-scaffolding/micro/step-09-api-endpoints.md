# Step 09: BE API 엔드포인트

## 메타데이터
- **난이도**: 🟢 쉬움
- **롤백 가능**: ✅
- **선행 조건**: Step 01 완료

---

## 1. 구현 내용 (design.md 기반)

- GET /api/health 엔드포인트
- GET /api/config 엔드포인트
- 공통 에러 응답 스키마 (lib/api/errors.ts)
- 응답 헬퍼 함수 (lib/api/response.ts)

## 2. 예상 범위 (Step 4에서 확정)
- [ ] Scope 탐색 필요

## 3. 완료 조건

- [ ] `app/api/health/route.ts` 파일 존재
- [ ] GET /api/health 응답:
  ```json
  {
    "status": "ok",
    "timestamp": "ISO8601 형식",
    "version": "0.0.1"
  }
  ```
- [ ] `app/api/config/route.ts` 파일 존재
- [ ] GET /api/config 응답에 다음 필드 포함:
  - appId
  - appName
  - version
  - supportedLanguages
  - defaultLanguage
  - features
  - contact
- [ ] `lib/api/errors.ts` 파일 존재
- [ ] ErrorCodes 상수 정의 (VALIDATION_ERROR, NOT_FOUND, INTERNAL_ERROR)
- [ ] `lib/api/response.ts` 파일 존재
- [ ] successResponse, errorResponse 헬퍼 함수 export
- [ ] curl로 `/api/health` 호출 시 200 OK 응답
- [ ] curl로 `/api/config` 호출 시 200 OK 응답

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-05

### 신규 생성 파일
```
app/api/
├── health/
│   └── route.ts
└── config/
    └── route.ts

lib/api/
├── errors.ts
├── response.ts
└── middleware.ts
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| next/server | 직접 의존 | NextResponse |
| 환경변수 | 참조 필요 | NEXT_PUBLIC_* 변수들 |

### Side Effect 위험
- Next.js 서버리스 함수로 배포 시 콜드 스타트
- /api/* 경로 예약됨
- NEXT_PUBLIC_* 환경변수는 클라이언트에 노출

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-05

### False Positive (과잉 - 제거 대상)

| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| health/route.ts | design.md API 설계 | ✅ OK |
| config/route.ts | design.md API 설계 | ✅ OK |
| lib/api/errors.ts | design.md 공통 에러 스키마 | ✅ OK |
| lib/api/response.ts | design.md 응답 헬퍼 | ✅ OK |
| lib/api/middleware.ts | design.md 미들웨어 | ✅ OK |

**FP 조치:** 없음

### False Negative (누락 - 추가 대상)

| 구현 내용 | Scope 포함 여부 | 판정 |
|----------|----------------|------|
| GET /api/health | ✅ health/route.ts | OK |
| GET /api/config | ✅ config/route.ts | OK |
| 에러 코드 정의 | ✅ errors.ts | OK |
| 응답 헬퍼 | ✅ response.ts | OK |

**FN 조치:** 없음

### 검증 통과: ✅

---

→ 다음: [Step 10: Analytics 추상화 레이어](step-10-analytics.md)
