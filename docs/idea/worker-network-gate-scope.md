# Worker Network — Gate(FE) 범위

## 배경

별도 프로젝트 `oracle/PRD-v2.md`에 정의된 "World ID 기반 Public Worker Network" 데모(v0.1).
Gate FE에서 필요한 건 **딱 1개 페이지**.

## 할 일

> World ID Verify 결과(proof payload)를 사용자에게 보여주고 복사할 수 있게 하는 페이지

### 플로우
```
사용자 → Verify 버튼 → proof payload 생성 → 화면에 JSON 표시 → 사용자가 복사
```

### 페이지 요구사항
- Verify 버튼 (기존 VerifyButton 재사용 또는 별도)
- Verify 성공 시 proof payload JSON을 화면에 표시
- 원클릭 복사 버튼
- 복사 완료 피드백 ("복사됨")

### 표시할 Proof Payload
```json
{
  "merkle_root": "0x...",
  "nullifier_hash": "0x...",
  "proof": "0x...",
  "verification_level": "orb"
}
```

## 결정 사항

- **action name**: 기존 `verify_human` 재사용 (Developer Portal 등록 불필요)

## 미결정 사항

- **페이지 경로**: `/worker` 또는 `/worker/register` 등
- **접근 환경**: MiniKit 환경에서만? 브라우저에서도?

## 참조
- `oracle/PRD-v2.md` — 전체 설계서
