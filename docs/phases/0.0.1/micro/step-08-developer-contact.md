# Step 08: 개발자 연락처 화면

## 메타데이터
- **난이도**: 🟢 쉬움
- **롤백 가능**: ✅
- **선행 조건**: Step 04 완료

---

## 1. 구현 내용 (design.md 기반)

- Settings 탭에 개발자 연락처 섹션 추가
- 환경변수에서 연락처 정보 읽기
- 이메일/지원 URL 링크 제공

## 2. 예상 범위 (Step 4에서 확정)
- [ ] Scope 탐색 필요

## 3. 완료 조건

- [ ] Settings 페이지에 "Developer Contact" 섹션 존재
- [ ] 개발자 이메일 표시 (NEXT_PUBLIC_DEVELOPER_EMAIL 환경변수)
- [ ] 지원 URL 표시 (NEXT_PUBLIC_SUPPORT_URL 환경변수)
- [ ] 이메일 클릭 시 `mailto:` 링크 동작
- [ ] 지원 URL 클릭 시 외부 브라우저에서 열림
- [ ] 환경변수 미설정 시 기본값 표시 또는 섹션 숨김

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-05

### 수정 대상 파일
```
app/
└── (tabs)/
    └── settings/
        └── page.tsx                 # 연락처 섹션 추가
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| NEXT_PUBLIC_DEVELOPER_EMAIL | 환경변수 | 이메일 주소 |
| NEXT_PUBLIC_SUPPORT_URL | 환경변수 | 지원 URL |
| Step 06 i18n | 참조 필요 | settings.contact 번역 키 |

### Side Effect 위험
- 환경변수 미설정 시 섹션 숨김 처리 필요
- mailto: 링크로 기본 메일 앱 오픈
- 외부 URL 클릭 시 새 탭/브라우저 오픈

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-05

### False Positive (과잉 - 제거 대상)

| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| settings/page.tsx 수정 | design.md 개발자 연락처 | ✅ OK |

**FP 조치:** 없음

### False Negative (누락 - 추가 대상)

| 구현 내용 | Scope 포함 여부 | 판정 |
|----------|----------------|------|
| 연락처 섹션 | ✅ settings/page.tsx 수정 | OK |
| 이메일 링크 | ✅ 환경변수 참조 | OK |
| 지원 URL 링크 | ✅ 환경변수 참조 | OK |

**FN 조치:** 없음

### 검증 통과: ✅

---

→ 다음: [Step 09: BE API 엔드포인트](step-09-api-endpoints.md)
