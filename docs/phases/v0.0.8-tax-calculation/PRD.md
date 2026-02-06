# v0.0.8 Tax Calculation & Export (Gate)

## 1) 개요

Gate에서 사용자가 **지갑 주소별 세금 계산 요청**을 보내고, **Export JSON**을 받아 화면에 표시한다.

### 핵심 기능
1. 사용자는 자신의 지갑 주소에 대해 **세금 계산 요청**을 할 수 있다.
2. 계산 결과에 대해 **Export JSON**을 요청하고 화면에서 확인/다운로드할 수 있다.

---

## 2) 목표 / 비목표

### 목표 (Goals)
- 지갑 목록에서 특정 주소를 선택해 세금 화면으로 진입한다.
- Tax API (world-tax) 연동으로 계산 요청/Export 결과를 표시한다.
- 응답 JSON을 안전하게 표시하고 복사/다운로드한다.

### 비목표 (Non-Goals)
- 세금 계산 로직 구현 (tax 서비스가 담당)
- 리포트 이력/요약/세부 자산 UI (vNext)
- 다국가 지원 (현재 KR만)

---

## 3) 사용자 스토리

- **US-01**: 지갑 목록에서 주소를 클릭하면 세금 화면으로 이동한다.
- **US-02**: 연도/체인/방식 입력 후 세금 계산 요청을 보낸다.
- **US-03**: Export JSON을 받아 화면에 확인하고 파일로 저장한다.

---

## 4) 정보 구조 / 라우팅

### 신규 화면
- **/tax** (root route)
  - query: `?address=0x...`

### 접근 제어
- `/tax`는 **세션 필수(PROTECTED)**
- MiniKit 유무와 무관 (Kill Switch 정책 유지)

---

## 5) UX 플로우

1. 사용자가 **/wallet**에서 연결된 주소 클릭
2. **/tax?address=0x...** 이동
3. 기본값 세팅
   - `year`: 드롭다운 **[2025, 2026]** (기본 2026)
   - `chain_id`: 드롭다운 **[480, 999]** (기본 480)
   - `country`: `KR` 고정
   - `cost_basis_method`: 사용자 선택 (FIFO/LIFO/HIFO/AVERAGE_COST)
4. **세금 계산 요청** 클릭 → `/api/tax/{address}/calculate`
5. 성공 시 계산 결과 표시 + **Export 가져오기** 활성화
6. **Export 가져오기** 클릭 → `/api/tax/{address}/export`
7. Export JSON 표시 (코드 블록 + 복사/다운로드)

---

## 6) API 연동 스펙 (world-tax)

> MSA 규칙상 **모든 요청은 `/api/tax/...`**로 전송 (nginx 라우팅)

### 6-1. Health
`GET /api/tax/health`

**Response: HealthResponse**
```json
{ "status": "ok" }
```

### 6-2. 세금 계산 요청
`POST /api/tax/{address}/calculate`

**Request: TaxCalculateRequest**
```json
{
  "chain_id": 480,
  "year": 2026,
  "cost_basis_method": "FIFO",
  "country": "KR"
}
```

**Response: TaxCalculateResponse**
```json
{
  "success": true,
  "data": {
    "taxResult": {
      "country": "KR",
      "year": 2026,
      "currency": "KRW",
      "gross_gains": 0,
      "gross_losses": 0,
      "net_gains": 0,
      "taxable_income": 0,
      "total_tax": 0,
      "effective_rate": 0,
      "filing_deadline": "2026-05-31T00:00:00Z",
      "forms_required": [],
      "disposal_count": 0,
      "by_asset": {},
      "basic_deduction": 0,
      "national_tax": 0,
      "local_tax": 0,
      "exchange_rate_used": 0
    },
    "lots": [
      {
        "id": "...",
        "asset": "...",
        "amount": 0,
        "remaining_amount": 0,
        "cost_per_unit": 0,
        "cost_basis_usd": 0,
        "acquired_at": "2026-01-01T00:00:00Z",
        "tx_hash": null,
        "source": "swap",
        "metadata": null
      }
    ],
    "disposals": [
      {
        "id": "...",
        "asset": "...",
        "amount_disposed": 0,
        "proceeds": 0,
        "cost_basis": 0,
        "gain": 0,
        "holding_period_days": 0,
        "is_long_term": false,
        "lots_used": [
          {
            "lot_id": "...",
            "amount_used": 0,
            "cost_basis": 0,
            "acquired_at": "2026-01-01T00:00:00Z",
            "holding_period_days": 0
          }
        ],
        "disposed_at": "2026-01-01T00:00:00Z",
        "tx_hash": null,
        "method": "FIFO"
      }
    ]
  }
}
```

### 6-3. Export JSON
`POST /api/tax/{address}/export`

**Request: ExportRequest**
```json
{ "chain_id": 480, "year": 2026 }
```

**Response: ExportReportResponse**
```json
{
  "success": true,
  "data": {
    "headers": ["asset", "amount", "proceeds", "cost_basis", "gain", "disposed_at", "tx_hash"],
    "rows": [
      {
        "asset": "...",
        "amount": 0,
        "proceeds": 0,
        "cost_basis": 0,
        "gain": 0,
        "disposed_at": "2026-01-01T00:00:00Z",
        "tx_hash": "0x..."
      }
    ]
  }
}
```

### 6-4. (vNext) 상세 API
- `GET /api/tax/{address}/summary/{year}?chain_id=...` → `TaxSummaryResponse`
- `GET /api/tax/{address}/taxable-income/{year}?chain_id=...` → `TaxableIncomeResponse`
- `GET /api/tax/{address}/lots?chain_id=...` → `TaxLotsResponse`
- `GET /api/tax/{address}/disposals/{year}?chain_id=...` → `TaxDisposalsResponse`
- `GET /api/tax/{address}/reports?chain_id=...` → `TaxReportsResponse`

---

## 7) UI 요구사항

### /tax 화면 구성
- 상단: 선택된 주소 + 복사 버튼
- 입력 영역
  - Year (dropdown: 2025, 2026)
  - Chain ID (dropdown: 480, 999)
  - Cost Basis Method (select)
- 액션
  - **세금 계산 요청**
  - **Export 가져오기**
- 결과 영역
  - 계산 결과 요약 (taxResult 핵심 필드)
  - Export JSON 코드 블록
  - 복사 + 다운로드 버튼

### /wallet → /tax 이동
- 지갑 카드 클릭 시 `/tax?address=0x...`

---

## 8) 상태/에러 처리

### 상태
- `idle` → `calculating` → `calculated` → `exporting` → `ready`

### 에러
- 422 ValidationError → 필드별 에러 표시
- 네트워크/서버 오류 → 배너/토스트

---

## 9) i18n

- `ko`, `en`만
- 키 예시
  - `tax.title`, `tax.calculate`, `tax.export`, `tax.year`, `tax.chain_id`, `tax.cost_basis`, `tax.result`, `tax.export_json`

---

## 10) 보안/권한

- 세션 없는 접근 차단
- 주소 파라미터는 **내 지갑 목록에 존재하는 주소만 허용**

---

## 11) 수용 기준 (Acceptance Criteria)

- [ ] /wallet에서 주소 클릭 시 /tax로 이동한다
- [ ] calculate 요청이 정상 전송되고 결과를 표시한다
- [ ] export 요청으로 JSON을 받아 렌더링한다
- [ ] JSON 복사/다운로드 가능
- [ ] ValidationError/네트워크 에러 표시

---

## 12) 작업 항목 (Implementation Tasks)

1. `/tax` 페이지 추가
2. `/wallet` 카드 클릭 → `/tax?address=` 연결
3. Tax API client 함수 구현
4. 계산/Export UI 및 상태 처리
5. i18n 키 추가
6. address 권한 검증

---

## 13) 오픈 이슈

- 체인 ID/Year 옵션 확정됨 (480/999, 2025/2026)
- Export 응답 JSON 포맷 고정 여부 확인 필요
