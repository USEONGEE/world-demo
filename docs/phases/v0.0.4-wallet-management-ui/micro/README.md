# 개발 단계 - v0.0.4

## 전체 현황

| # | Step | 난이도 | 롤백 | Scope | FP/FN | 개발 | 완료일 |
|---|------|--------|------|-------|-------|------|--------|
| 01 | i18n 키 추가 | 🟢 | ✅ | ✅ | ✅ | ✅ 완료 | 2026-02-06 |
| 02 | WalletList 에러 상태 추가 | 🟡 | ✅ | ✅ | ✅ | ✅ 완료 | 2026-02-06 |
| 03 | WalletList 복사 기능 추가 | 🟡 | ✅ | ✅ | ✅ | ✅ 완료 | 2026-02-06 |
| 04 | WalletList verified 배지 + 빈 상태 개선 | 🟡 | ✅ | ✅ | ✅ | ✅ 완료 | 2026-02-06 |
| 05 | 분석 이벤트 추가 + 빌드 검증 | 🟢 | ✅ | ✅ | ✅ | ✅ 완료 | 2026-02-06 |

## FN 요약
- ~~WalletList 에러 상태/재시도 UI 미구현~~ ✅ 완료
- ~~주소 복사/피드백 미구현~~ ✅ 완료
- ~~verified 배지 + verification_method 표시 미구현~~ ✅ 완료
- ~~빈 상태 안내 텍스트 강화 미구현~~ ✅ 완료
- ~~분석 이벤트 wallet_list_view / wallet_copy 미구현~~ ✅ 완료
- ~~i18n 키 누락 (copy_address, copied, verified, fetch_error)~~ ✅ 완료

## 의존성

```
01 → 02 → 03 → 04 → 05
```

Step 01(i18n)이 선행되어야 하며, 02~04는 WalletList.tsx에 순차적으로 기능 추가. Step 05에서 이벤트 추가 및 최종 빌드 검증.

## Step 상세
- [Step 01: i18n 키 추가](step-01-i18n.md)
- [Step 02: WalletList 에러 상태 추가](step-02-error-state.md)
- [Step 03: WalletList 복사 기능 추가](step-03-copy.md)
- [Step 04: WalletList verified 배지 + 빈 상태 개선](step-04-badge-empty.md)
- [Step 05: 분석 이벤트 추가 + 빌드 검증](step-05-analytics-build.md)
