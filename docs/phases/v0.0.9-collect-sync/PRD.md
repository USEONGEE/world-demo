# v0.0.9 Collect Sync (Gate)

## 1) 개요

Tax 계산 전에 **수집(collect) 동기화 상태를 확인하고, 필요 시 트랜잭션 동기화를 요청**한다.
Tax 화면(/tax) 안에 Collect 동기화 카드/상태를 추가한다.

> Tax 계산/Export 자체는 v0.0.8에서 이미 제공. 이 문서는 **Collect 동기화 부분만** 정의한다.

---

## 2) 목표 / 비목표

### 목표 (Goals)
- 주소별 **Collect 동기화 진행 여부**를 조회한다.
- 최신 블록 대비 **동기화 지연(>= 10,000 blocks)**이면 동기화 권장 상태를 표시한다.
- 사용자가 **동기화 요청**을 시작하고 **진행률을 폴링**으로 확인한다.
- 동기화 완료 시 **완료 표시(✓)** 를 제공한다.

### 비목표 (Non-Goals)
- Collect 서비스 내부 스케줄러/오라클 처리 구현
- Collect task 재큐(requeue) 호출
- Tax 계산 로직/결과 UI 변경

---

## 3) 사용자 스토리

- **US-01**: 지갑을 선택해 /tax 화면에 들어오면, 이미 진행 중인 동기화가 있는지 확인할 수 있다.
- **US-02**: 블록 차이가 10,000 이상이면 동기화를 권장 받는다.
- **US-03**: 사용자는 동기화를 요청하고 진행률을 확인할 수 있다.
- **US-04**: 동기화가 완료되면 완료 표시를 확인할 수 있다.

---

## 4) 정보 구조 / 라우팅

- 기존 `/tax?address=...` 화면에 **Collect Sync 카드** 추가
- 세션 필수 (기존 /tax 가드 유지)

---

## 5) UX 플로우

### 진입 시
1) `/tax?address=0x...` 진입
2) `GET /api/collect/tasks?address={address}&chain_id={chain_id}&limit=1&offset=0`
   - 최근 task 조회
3) 진행 중이면:
   - `GET /api/collect/tasks/{task_id}`로 상세 조회
   - 진행률 표시 + 3~5초 폴링
4) 진행 중이 아니라면:
   - **동기화 권장 여부** 확인 (아래 규칙)
   - "동기화 요청" 버튼 노출

### 동기화 요청
1) `POST /api/collect/sync` 호출
2) 응답의 `task_id` 저장
3) task 상세 폴링 시작
4) 완료 시 ✓ 표시 및 상태 업데이트

---

## 6) 동기화 권장 조건

- **현재 블록 높이 - 마지막 동기화 블록 ≥ 10,000** 이면 "동기화 권장" 배지 표시

### 기준 데이터 소스
- `GET /api/collect/status?address=...&chain_id=...` 응답의 `chain_tip`, `last_synced_block`, `gap`, `recommend_sync` 사용

---

## 7) API 연동 스펙 (collect)

### 7-1. 동기화 요청
`POST /api/collect/sync`

**Request: SyncRequest**
```json
{ "chain_id": 480, "address": "0x..." }
```

**Response: SyncResponse | ErrorResponse**
```json
{
  "success": true,
  "data": {
    "action": "sync",
    "task_id": "...",
    "mode": "...",
    "start_block": 0,
    "end_block": 0,
    "last_synced_block": 0
  },
  "error": null
}
```

### 7-2. 작업 목록
`GET /api/collect/tasks?address=0x...&chain_id=480&limit=1&offset=0`

**Response: TaskListResponse**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "task_id": "...",
        "state": "running",
        "mode": "...",
        "target_end_block": 0,
        "created_at": "...",
        "updated_at": "...",
        "completed_at": null,
        "error_code": null
      }
    ],
    "count": 1
  },
  "error": null
}
```

### 7-3. 작업 상세 (진행률 폴링)
`GET /api/collect/tasks/{task_id}`

**Response: TaskDetailResponse**
```json
{
  "success": true,
  "data": {
    "task_id": "...",
    "state": "running",
    "mode": "...",
    "target_end_block": 0,
    "created_at": "...",
    "updated_at": "...",
    "completed_at": null,
    "error_code": null,
    "progress": {
      "percent": 42,
      "is_estimate": true,
      "nodes": { "total": 0, "processing": 0, "done": 0, "error": 0, "split": 0 },
      "page": { "max_done": 0, "percent": 0 },
      "block": { "known_percent": 0 }
    }
  },
  "error": null
}
```

### 7-4. 상태 조회 (권장 여부 계산)
`GET /api/collect/status?address=0x...&chain_id=480`

**Response: StatusResponse**
```json
{
  "success": true,
  "data": {
    "chain_id": 480,
    "address": "0x...",
    "chain_tip": 12345678,
    "last_synced_block": 12330000,
    "gap": 15678,
    "recommend_sync": true,
    "active_task_id": "..."
  },
  "error": null
}
```

---

## 8) UI 요구사항

### Collect Sync 카드 ( /tax 상단 )
- 상태 배지: `Idle` / `Syncing` / `Completed` / `Error`
- 진행률: `%` + progress bar
- "동기화 권장" 배지 (블록 차이 기준)
- 액션 버튼
  - `동기화 요청` (Idle)
  - `진행 중...` (Syncing, disabled)
  - `완료됨 ✓` (Completed)

### 폴링 규칙
- Sync 중일 때 **3~5초 폴링**
- 완료/에러 시 폴링 중단

---

## 9) 에러 처리

- 422 ValidationError → 입력 오류 메시지
- 400/404 → 상태 메시지 + 재시도
- 네트워크 오류 → "다시 시도" 버튼

---

## 10) i18n (ko/en)

- `collect.title`, `collect.status_idle`, `collect.status_syncing`, `collect.status_done`, `collect.status_error`
- `collect.recommended`, `collect.sync_button`, `collect.syncing`, `collect.completed`
- `collect.progress`, `collect.last_synced`, `collect.current_block`, `collect.block_gap`

---

## 11) 수용 기준 (Acceptance Criteria)

- [ ] /tax 진입 시 collect task 상태를 조회한다.
- [ ] 동기화 진행 중이면 진행률이 폴링으로 갱신된다.
- [ ] 동기화가 완료되면 완료 표시가 나온다.
- [ ] 블록 차이가 10,000 이상일 때 동기화 권장 배지를 표시한다.

---

## 12) 작업 항목 (Implementation Tasks)

1. Collect API client 추가 (sync/tasks/task)
2. Collect status API 연동 (status)
3. /tax 화면에 Collect Sync 카드 UI 추가
4. 동기화 폴링 로직 구현
5. 상태 배지/진행률/완료 표시
6. i18n 키 추가

---

## 13) 오픈 이슈

- 없음 (status API 제공됨)
