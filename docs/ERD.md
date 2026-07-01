# ERD — Module Quản lý PAKD động & Vòng đời Dự án

Tài liệu thiết kế dữ liệu cho backend thật (repo hiện là frontend mock, xem `src/components/projects/`). Schema dưới đây map 1:1 với `projectTypes.ts`.

## 1. Sơ đồ quan hệ (Mermaid)

```mermaid
erDiagram
    ROLE ||--o{ USER : "has"
    USER ||--o{ PAKD : "creator (Sale)"
    CUSTOMER ||--o{ PAKD : "customer_code"
    PAKD ||--o{ PROJECT_STEP : "bước động"
    PROJECT_STEP ||--o{ COST_ITEM : "khoản chi phí động"
    PAKD ||--o{ APPROVAL_RECORD : "lịch sử duyệt PAKD"
    PAKD ||--o{ CHANGE_REQUEST : "phiếu điều chỉnh"
    CHANGE_REQUEST ||--o{ COST_CHANGE : "dòng thay đổi"
    CHANGE_REQUEST ||--o{ APPROVAL_RECORD : "lịch sử duyệt phiếu"
    PAKD ||--o{ PAKD_VERSION : "phiên bản chi phí"
    PAKD ||--o{ AUDIT_LOG : "nhật ký"

    USER { uuid id PK; string full_name; uuid role_id FK; string department }
    ROLE { uuid id PK; string code "SALE|BUSINESS_DIRECTOR|BOD|ACCOUNTANT|IT|ADMIN" }
    CUSTOMER { uuid id PK; string code UK; string name }

    PAKD {
        uuid id PK
        string name
        string customer_code FK
        uuid creator_id FK
        string status "DRAFT|PENDING_BUSINESS_DIRECTOR|PENDING_BOD|PENDING_ACCOUNTANT|PENDING_IT|COMPLETED|RETURNED"
        string tender_package_code "Số hiệu gói thầu TBMT"
        string tender_investor "Chủ đầu tư / Bên mời thầu"
        string tender_bidding_method "Hình thức lựa chọn nhà thầu"
        string tender_field_type "Lĩnh vực gói thầu CNTT"
        string tender_contract_type "Loại hợp đồng"
        decimal tender_package_price "Giá gói thầu (mời thầu)"
        decimal tender_bid_security "Bảo lãnh dự thầu"
        date tender_close_date "Thời điểm đóng thầu"
        decimal revenue "Giá dự thầu (doanh thu dự kiến)"
        boolean locked "khóa chi phí sau khi GĐ Khối duyệt"
        int version
        string master_code UK "022.689"
        string business_code UK "022.689.1"
        string production_code UK "022.689.2"
        string jira_key
        string jira_url
        timestamp created_at
    }

    PROJECT_STEP {
        uuid id PK
        uuid pakd_id FK
        int order
        string name
        string assignee
        date start_date
        date end_date
        text note
    }

    COST_ITEM {
        uuid id PK
        uuid step_id FK
        string name
        string cost_type "Nhân công|Thiết bị|Logistics|Thuế|..."
        decimal amount
        text note
    }

    APPROVAL_RECORD {
        uuid id PK
        uuid parent_id FK "pakd_id hoặc change_request_id"
        string parent_type "PAKD|CHANGE_REQUEST"
        string step_label
        string role
        string actor
        string action "APPROVE|REJECT"
        text comment
        string old_status
        string new_status
        timestamp created_at
    }

    CHANGE_REQUEST {
        uuid id PK
        uuid pakd_id FK
        uuid created_by FK
        string status "DRAFT|PENDING_BUSINESS_DIRECTOR|PENDING_BOD|PENDING_ACCOUNTANT|APPROVED|REJECTED"
        text reason
        timestamp created_at
    }

    COST_CHANGE {
        uuid id PK
        uuid change_request_id FK
        string op "ADD|EDIT|DELETE"
        uuid step_id FK
        uuid target_cost_id FK "với EDIT/DELETE"
        string cost_name
        string cost_type
        decimal old_amount
        decimal new_amount
    }

    PAKD_VERSION {
        uuid id PK
        uuid pakd_id FK
        int version
        uuid change_request_id FK
        text reason
        decimal total_cost_before
        decimal total_cost_after
        timestamp created_at
    }

    AUDIT_LOG {
        uuid id PK
        uuid pakd_id FK
        uuid actor_id FK
        string role
        string action
        string old_status
        string new_status
        text note
        timestamp created_at
    }
```

## 2. Tổng tự cộng dồn (không lưu, tính khi đọc)
- Chi phí 1 bước = Σ `COST_ITEM.amount` của bước đó.
- Tổng chi phí PAKD = Σ chi phí các bước.
- Lợi nhuận = `PAKD.revenue` − tổng chi phí.

## 3. State machine

### PAKD (luồng tuyến tính, luôn qua BOD)
```
DRAFT → PENDING_BUSINESS_DIRECTOR → PENDING_BOD → PENDING_ACCOUNTANT → PENDING_IT → COMPLETED
```
- **GĐ Khối APPROVE** (`PENDING_BUSINESS_DIRECTOR → PENDING_BOD`): hệ thống **sinh 3 mã** (master/business/production) và đặt `locked = true`.
- **IT APPROVE** (`PENDING_IT → COMPLETED`): tạo dự án Jira (`jira_key`, `jira_url`).
- **REJECT** ở bất kỳ cấp → `RETURNED` (Sale chỉnh sửa & nộp lại). Lưu ý: nếu đã `locked`, chi phí vẫn chỉ sửa được qua phiếu điều chỉnh.

### Change Request (phiếu điều chỉnh chi phí)
```
DRAFT → PENDING_BUSINESS_DIRECTOR → PENDING_BOD → PENDING_ACCOUNTANT → APPROVED
                                          (REJECT bất kỳ cấp → REJECTED)
```
- Khi đạt `APPROVED`: hệ thống **áp dụng** các `COST_CHANGE` vào `COST_ITEM`, tăng `PAKD.version`, ghi 1 dòng `PAKD_VERSION` (giữ lịch sử). Bị `REJECTED` → chi phí giữ nguyên.

## 4. Ràng buộc chính
| Ràng buộc | Mô tả |
|---|---|
| `master/business/production_code` | Unique, immutable, sinh tự động khi GĐ Khối duyệt. |
| `PAKD.locked` | `true` sau khi GĐ Khối duyệt. Khi `locked`, không cho sửa `COST_ITEM` trực tiếp — bắt buộc qua `CHANGE_REQUEST`. |
| `CHANGE_REQUEST` chỉ tạo khi `PAKD.locked = true` | Trước khi khóa, Sale sửa chi phí trực tiếp ở trạng thái DRAFT/RETURNED. |
| `AUDIT_LOG` | Append-only, ghi mọi chuyển trạng thái, sinh mã, áp dụng phiếu điều chỉnh, tạo Jira. |

## 5. Mapping Firestore
Xem `firebase-blueprint.json` — collection: `pakds`, `pakds/{id}/steps`, `steps/{id}/costItems`, `pakds/{id}/changeRequests`, `pakds/{id}/versions`, `auditLogs`.
