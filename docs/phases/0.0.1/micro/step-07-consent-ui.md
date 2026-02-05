# Step 07: 데이터 수집 동의 UI

## 메타데이터
- **난이도**: 🟡 보통
- **롤백 가능**: ✅
- **선행 조건**: Step 04 완료

---

## 1. 구현 내용 (design.md 기반)

- useConsent 훅 구현 (localStorage 기반)
- ConsentProvider 컴포넌트 구현
- 동의 화면 (app/consent/page.tsx)
- 동의 수락/거부 시 analytics 이벤트
- 앱 진입 시 동의 여부 체크 및 리다이렉트

## 2. 예상 범위 (Step 4에서 확정)
- [ ] Scope 탐색 필요

## 3. 완료 조건

- [ ] `lib/hooks/useConsent.ts` 파일 존재
- [ ] useConsent 훅이 localStorage에서 동의 상태 읽기/쓰기
- [ ] useConsent 훅이 `consent`, `isLoading`, `grantConsent`, `declineConsent` 반환
- [ ] `components/providers/ConsentProvider.tsx` 파일 존재
- [ ] `app/consent/page.tsx` 파일 존재
- [ ] 동의 화면에 다음 요소 포함:
  - 타이틀: "Data Collection"
  - 설명 텍스트
  - "I Agree" 버튼
  - "Decline" 버튼
- [ ] "I Agree" 클릭 시 `consent_granted` 이벤트 발생
- [ ] "Decline" 클릭 시 `consent_declined` 이벤트 발생
- [ ] 동의 후 `/home`으로 리다이렉트
- [ ] 동의하지 않은 사용자가 `/home` 접근 시 `/consent`로 리다이렉트

---

## Scope (Step 4 결과)

### 탐색 일시
- 2026-02-05

### 신규 생성 파일
```
lib/
└── hooks/
    └── useConsent.ts

components/
└── providers/
    └── ConsentProvider.tsx

app/
└── consent/
    └── page.tsx
```

### 수정 대상 파일
```
components/
└── providers/
    └── index.tsx                    # ConsentProvider 추가

app/
└── page.tsx                         # 동의 체크 후 리다이렉트
```

### 의존성 분석
| 모듈 | 영향 유형 | 설명 |
|------|----------|------|
| localStorage | 웹 API | 동의 상태 저장 |
| Step 06 i18n | 참조 필요 | consent.* 번역 키 |
| Step 10 analytics | 참조 필요 | consent_granted/declined 이벤트 |

### Side Effect 위험
- 초기 로드 시 localStorage 접근 (클라이언트 사이드)
- 동의 없이는 /home 접근 불가
- localStorage 제거 시 동의 초기화

## FP/FN 검증 (Step 5 결과)

### 검증 일시
- 2026-02-05

### False Positive (과잉 - 제거 대상)

| Scope 항목 | 구현 내용 근거 | 판정 |
|-----------|---------------|------|
| useConsent.ts | design.md 동의 관리 Hook | ✅ OK |
| ConsentProvider.tsx | design.md 프로바이더 | ✅ OK |
| consent/page.tsx | design.md 동의 화면 | ✅ OK |

**FP 조치:** 없음

### False Negative (누락 - 추가 대상)

| 구현 내용 | Scope 포함 여부 | 판정 |
|----------|----------------|------|
| useConsent 훅 | ✅ useConsent.ts | OK |
| ConsentProvider | ✅ ConsentProvider.tsx | OK |
| 동의 화면 | ✅ consent/page.tsx | OK |
| 리다이렉트 로직 | ✅ app/page.tsx 수정 | OK |

**FN 조치:** 없음

### 검증 통과: ✅

---

→ 다음: [Step 08: 개발자 연락처 화면](step-08-developer-contact.md)
