# API Specification — Module PAKD động & Vòng đời Dự án

Thiết kế cho backend thật (repo hiện là frontend mock — logic tương đương ở `src/components/projects/projectWorkflow.ts`). Base path: `/api/v1`. Auth: Bearer JWT, claim `role` ∈ `{SALE, BUSINESS_DIRECTOR, BOD, ACCOUNTANT, IT, ADMIN}`.

## Mã lỗi
| Code | Khi nào |
|---|---|
| 400 | Body sai/thiếu field |
| 403 | Role không có quyền với hành động/trạng thái hiện tại |
| 404 | Không tìm thấy tài nguyên |
| 409 | Sai trạng thái state machine (vd duyệt khi không phải bước của mình) |
| 422 | Vi phạm business rule (vd sửa chi phí trực tiếp khi đã khóa; nộp PAKD không có bước) |

---

## 1. PAKD

### `POST /pakds` — Tạo PAKD (Sale)
Body: `{ name, customerCode, revenue }`. 422 nếu thiếu name/revenue. → status `DRAFT`.

### `GET /pakds?status=&search=` · `GET /pakds/{id}`
Trả PAKD kèm steps, costItems, tổng tự tính, changeRequests, versionHistory.

### `PUT /pakds/{id}` — Sửa thông tin chung (Sale, khi DRAFT/RETURNED).

### `POST /pakds/{id}/submit` — Nộp trình duyệt (Sale)
Pre: status `DRAFT`/`RETURNED` và có ≥1 bước (422 nếu rỗng). → `PENDING_BUSINESS_DIRECTOR`.

## 2. Bước & chi phí (động) — chỉ khi `!locked` và role SALE, status DRAFT/RETURNED
- `POST /pakds/{id}/steps` · `PUT /steps/{stepId}` · `DELETE /steps/{stepId}` · `PUT /steps/{stepId}/reorder`
- `POST /steps/{stepId}/costs` · `PUT /costs/{costId}` · `DELETE /costs/{costId}`
- 422 `PAKD_LOCKED` nếu PAKD đã khóa → phải dùng phiếu điều chỉnh (mục 4).

## 3. Phê duyệt PAKD
### `GET /approvals/pakd?role={role}` — Hàng đợi PAKD chờ role hiện tại.
### `POST /pakds/{id}/decision` — Body `{ action: APPROVE|REJECT, comment }`
Role phải khớp bước hiện tại (`PENDING_BUSINESS_DIRECTOR`→BUSINESS_DIRECTOR, `PENDING_BOD`→BOD, `PENDING_ACCOUNTANT`→ACCOUNTANT, `PENDING_IT`→IT); 403/409 nếu sai.
- BUSINESS_DIRECTOR APPROVE → sinh 3 mã + `locked=true` → `PENDING_BOD`.
- BOD APPROVE → `PENDING_ACCOUNTANT`. ACCOUNTANT APPROVE → `PENDING_IT`.
- IT APPROVE → tạo Jira → `COMPLETED`.
- REJECT bất kỳ cấp → `RETURNED`.

## 4. Phiếu điều chỉnh chi phí (Change Request)
### `POST /pakds/{id}/change-requests` — Tạo phiếu (Sale)
Pre: `locked=true` (422 nếu chưa khóa). Body: `{ reason, changes: [{ op, stepId, targetCostId?, costName, costType, newAmount? }] }`. → CR status `PENDING_BUSINESS_DIRECTOR`.

### `GET /approvals/change-requests?role={role}` — Hàng đợi phiếu chờ role hiện tại.
### `POST /change-requests/{crId}/decision` — Body `{ action, comment }`
Luồng: `PENDING_BUSINESS_DIRECTOR`→BUSINESS_DIRECTOR, `PENDING_BOD`→BOD, `PENDING_ACCOUNTANT`→ACCOUNTANT.
- APPROVE cấp cuối (Kế toán) → **áp dụng** changes vào costItems, `PAKD.version += 1`, tạo bản ghi version snapshot.
- REJECT bất kỳ cấp → CR `REJECTED`, chi phí giữ nguyên.

## 5. Khác
- `GET /pakds/{id}/codes` — 3 mã dự án (read-only).
- `GET /pakds/{id}/versions` — lịch sử phiên bản chi phí.
- `GET /audit-logs?pakdId=&actor=&from=&to=` — nhật ký (append-only).

## 6. Ma trận phân quyền
| Action | SALE | BUSINESS_DIRECTOR | BOD | ACCOUNTANT | IT | ADMIN |
|---|---|---|---|---|---|---|
| Tạo/sửa PAKD + bước + chi phí (DRAFT/RETURNED) | ✅ | – | – | – | – | ✅ |
| Nộp PAKD | ✅ | – | – | – | – | – |
| Duyệt PAKD bước GĐ Khối (sinh mã + khóa) | – | ✅ | – | – | – | – |
| Duyệt PAKD bước BOD | – | – | ✅ | – | – | – |
| Duyệt PAKD bước Kế toán | – | – | – | ✅ | – | – |
| Duyệt PAKD bước IT (tạo Jira) | – | – | – | – | ✅ | – |
| Tạo phiếu điều chỉnh | ✅ | – | – | – | – | – |
| Duyệt phiếu điều chỉnh | – | ✅ (1) | ✅ (2) | ✅ (3, áp dụng) | – | – |
| Xem nhật ký toàn cục | – | – | – | – | – | ✅ |
