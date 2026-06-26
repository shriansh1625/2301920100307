# Notification System Design

Campus notification platform for delivering Placement, Event, and Result updates to students.

---

## Stage 1

### Core Actions

| Action | Description |
|--------|-------------|
| List notifications | Paginated list with optional type filter |
| Get notification by ID | Fetch a single notification |
| Get unread count | Return count of unread notifications |
| Mark as read | Mark one notification as read |
| Mark all as read | Mark all notifications as read |
| Priority inbox | Return top `n` unread notifications by importance |
| Real-time delivery | Push new notifications to connected clients instantly |

### Assumptions

- Users are pre-authorised; no login/register in the application.
- All protected routes use `Authorization: Bearer <token>`.
- Notification types: `Placement`, `Result`, `Event`.

### REST API Endpoints

#### 1. List Notifications

```
GET /api/v1/notifications
```

**Headers**

| Header | Value |
|--------|-------|
| Authorization | Bearer \<token\> |
| Accept | application/json |

**Query Parameters**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 10, max: 50) |
| notification_type | string | No | Filter: `Placement`, `Result`, or `Event` |

**Response 200**

```json
{
  "notifications": [
    {
      "id": "d146095a-0d86-4a34-9e69-3900a14576bc",
      "type": "Result",
      "message": "mid-sem",
      "timestamp": "2026-04-22T17:51:30Z",
      "isRead": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 42,
    "totalPages": 5
  }
}
```

**Error Responses**

| Status | Body |
|--------|------|
| 400 | `{ "error": "invalid notification_type" }` |
| 401 | `{ "error": "unauthorized" }` |
| 500 | `{ "error": "internal server error" }` |

---

#### 2. Get Notification by ID

```
GET /api/v1/notifications/{id}
```

**Headers:** Authorization, Accept

**Response 200**

```json
{
  "id": "d146095a-0d86-4a34-9e69-3900a14576bc",
  "type": "Result",
  "message": "mid-sem",
  "timestamp": "2026-04-22T17:51:30Z",
  "isRead": false
}
```

**Error Responses:** 404 `{ "error": "notification not found" }`

---

#### 3. Get Unread Count

```
GET /api/v1/notifications/unread-count
```

**Response 200**

```json
{
  "unreadCount": 7
}
```

---

#### 4. Mark Notification as Read

```
PATCH /api/v1/notifications/{id}/read
```

**Request Body:** empty

**Response 200**

```json
{
  "id": "d146095a-0d86-4a34-9e69-3900a14576bc",
  "isRead": true
}
```

---

#### 5. Mark All as Read

```
POST /api/v1/notifications/read-all
```

**Response 200**

```json
{
  "updatedCount": 7
}
```

---

#### 6. Priority Inbox

```
GET /api/v1/notifications/priority
```

**Query Parameters**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| limit | integer | No | Top n unread (default: 10) |

**Response 200**

```json
{
  "notifications": [
    {
      "id": "b283218f-ea5a-4b7c-93a9-1f2f240d64b0",
      "type": "Placement",
      "message": "CSX Corporation hiring",
      "timestamp": "2026-04-22T17:51:18Z",
      "isRead": false,
      "priorityScore": 1745344278
    }
  ]
}
```

---

### Real-Time Notification Mechanism

**Choice: Server-Sent Events (SSE)**

```
GET /api/v1/notifications/stream
Headers: Authorization: Bearer <token>
Accept: text/event-stream
```

**Flow**

1. Client opens a persistent SSE connection after page load.
2. Server pushes events when a new notification is created:

```
event: notification
data: {"id":"...","type":"Placement","message":"...","timestamp":"..."}
```

3. Client updates UI and unread badge without full page reload.

**Why SSE over WebSockets**

- One-way server-to-client fits notification delivery.
- Simpler than WebSockets for this use case.
- Works through standard HTTP proxies.
- Automatic reconnect in the EventSource API.

**Fallback:** short polling every 30 seconds if SSE is unavailable.

---

## Stage 2

### Persistent Storage Choice

**PostgreSQL** (relational SQL database)

### Rationale

- Strong ACID guarantees for read/unread state.
- Mature indexing for filtered and paginated queries.
- JSONB available if schema evolves.
- Fits the existing relational setup referenced in Stage 3.
- Good tooling for migrations, backups, and replication.

### Database Schema

```sql
CREATE TYPE notification_type AS ENUM ('Event', 'Result', 'Placement');

CREATE TABLE students (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id        BIGINT NOT NULL REFERENCES students(id),
    notification_type notification_type NOT NULL,
    message           VARCHAR(255) NOT NULL,
    is_read           BOOLEAN NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_student_read_created
    ON notifications (student_id, is_read, created_at DESC);
```

### Scale Problems

| Problem | Cause |
|---------|-------|
| Slow reads | Missing or wrong indexes at millions of rows |
| Write bottlenecks | Single primary handling all inserts |
| Storage growth | Unbounded notification history |
| Hot partitions | All recent rows hit the same index leaf pages |

### Solutions

- Composite indexes aligned to query patterns.
- Table partitioning by `created_at` (monthly).
- Archive notifications older than 90 days to cold storage.
- Read replicas for list/read-heavy traffic.
- Redis cache for unread counts and recent pages.

### SQL Queries (Stage 1 APIs)

**List notifications (paginated, optional filter)**

```sql
SELECT id, notification_type, message, is_read, created_at
FROM notifications
WHERE student_id = $1
  AND ($2::notification_type IS NULL OR notification_type = $2)
ORDER BY created_at DESC
LIMIT $3 OFFSET ($4 - 1) * $3;
```

**Unread count**

```sql
SELECT COUNT(*) AS unread_count
FROM notifications
WHERE student_id = $1 AND is_read = FALSE;
```

**Mark as read**

```sql
UPDATE notifications
SET is_read = TRUE
WHERE id = $1 AND student_id = $2;
```

**Mark all as read**

```sql
UPDATE notifications
SET is_read = TRUE
WHERE student_id = $1 AND is_read = FALSE;
```

---

## Stage 3

### Is the query accurate?

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;
```

**Partially accurate** for fetching unread notifications for one student, but has issues:

- `SELECT *` returns unnecessary columns.
- Inconsistent naming (`studentID` vs snake_case convention).
- No `LIMIT` — returns all unread rows.
- Ascending order shows oldest first; inbox UIs usually prefer newest first.

### Why is it slow at scale?

- Without a composite index on `(student_id, is_read, created_at)`, PostgreSQL may scan millions of rows.
- `SELECT *` increases disk I/O.
- Sorting a large unread set is expensive.
- 5M notifications × 50K students makes unindexed lookups costly.

### Improved query

```sql
SELECT id, notification_type, message, created_at
FROM notifications
WHERE student_id = 1042 AND is_read = FALSE
ORDER BY created_at DESC
LIMIT 20;
```

**Index**

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications (student_id, is_read, created_at DESC);
```

**Computation cost:** index seek O(log n) + fetch limited rows, vs full scan O(n).

### Index on every column?

**Not effective.**

- Wastes storage and slows INSERT/UPDATE/DELETE.
- Query planner may pick suboptimal indexes.
- Indexes should match actual query patterns, not every column.

### Students with placement notification in last 7 days

```sql
SELECT DISTINCT student_id
FROM notifications
WHERE notification_type = 'Placement'
  AND created_at >= NOW() - INTERVAL '7 days';
```

---

## Stage 4

### Problem

Fetching all notifications on every page load overwhelms the database and hurts UX (slow loads, high latency).

### Strategies and Tradeoffs

| Strategy | How it helps | Tradeoffs |
|----------|--------------|-----------|
| **Pagination** | Loads small chunks | More requests when browsing deep pages |
| **Redis cache (recent page)** | Sub-ms reads for hot data | Cache invalidation on new notifications |
| **Unread count cache** | Avoids COUNT(*) on every load | Can be briefly stale |
| **SSE push** | Eliminates polling | Connection management overhead |
| **Lazy load / infinite scroll** | Better perceived performance | Complex UI state |
| **Read replicas** | Offloads primary DB | Replication lag |
| **CDN for static assets** | Faster page shell | Does not help personalised API data |

### Recommended approach

1. Paginated API (`page`, `limit`) — default 10 items.
2. Cache first page + unread count in Redis (TTL 30s, invalidate on write).
3. SSE for real-time new notifications.
4. Client-side viewed-state in localStorage (no extra DB reads for UI badge).

This reduces DB load while keeping data fresh enough for a campus notification platform.

---

## Stage 5

### Shortcomings of original `notify_all`

1. **Sequential loop** — 50,000 iterations are slow and block the caller.
2. **No batching** — email, DB, and push are done one-by-one.
3. **No retry** — 200 email failures are lost with no recovery.
4. **Tight coupling** — one slow email API call delays DB writes for others.
5. **No idempotency** — retries can duplicate notifications.
6. **No progress tracking** — HR cannot see partial completion status.

### If 200 emails fail midway?

- 200 students miss email; in-app notification may also be incomplete.
- Without a queue, there is no way to retry only failed IDs.
- Need per-student job status: `pending`, `sent`, `failed`.

### Should DB save and email happen together?

**No.** They are separate concerns:

- DB write is the source of truth for in-app notifications.
- Email depends on an external API with different failure modes.
- Decoupling allows independent retries and scaling.

### Revised pseudocode

```yaml
function notify_all(student_ids, message, notification_type):
    notification_batch = bulk_insert_notifications(student_ids, message, notification_type)

    for chunk in split(student_ids, size=500):
        job_queue.enqueue("push_notifications", chunk, notification_batch.ids)
        job_queue.enqueue("email_notifications", chunk, message)

worker push_worker:
    for job in job_queue.consume("push_notifications"):
        try:
            push_to_app(job.student_ids, job.notification_ids)
            mark_status(job, "push", "sent")
        catch error:
            mark_status(job, "push", "failed")
            job_queue.retry_with_backoff(job)

worker email_worker:
    for job in job_queue.consume("email_notifications"):
        try:
            send_email_batch(job.student_ids, job.message)
            mark_status(job, "email", "sent")
        catch error:
            mark_status(job, "email", "failed")
            dead_letter_queue.add(job)  # 200 failures go here for retry

function retry_failed_jobs():
    for job in dead_letter_queue.pending():
        if job.retry_count < MAX_RETRIES:
            job_queue.re_enqueue(job)
        else:
            alert_ops_team(job)
```

**Benefits:** parallel workers, batching, isolated failures, retry with backoff, dead-letter queue for the 200 failed emails.

---

## Stage 6

### Priority Approach

Priority combines **type weight** and **recency**:

| Type | Weight |
|------|--------|
| Placement | 3 |
| Result | 2 |
| Event | 1 |

**Score formula**

```
priorityScore = (typeWeight × 1,000,000,000,000) + unixTimestamp
```

Higher weight always outranks lower weight. Within the same type, newer timestamps win.

### Top 10 Selection

Implementation file: `priority-inbox/src/priority.ts`

- Initial load: score all notifications, sort descending, take top 10.
- Streaming updates: maintain a **min-heap of size 10** storing the current top notifications. When a new notification arrives, compute its score; if it beats the heap minimum, replace the minimum and re-heapify. Complexity per insert: O(log 10).

### Output

Run:

```bash
cd priority-inbox
npm install
npm start
```

Capture screenshots of terminal output showing the ranked top 10 notifications.

---
