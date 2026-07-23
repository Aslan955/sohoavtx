# Bảng giai đoạn dự án (Kanban KH01–KH06)

Ngày: 2026-07-23

## Mục tiêu

Màn hình mới dạng Trello: mỗi cột là một giai đoạn KH, mỗi thẻ là một dự án PAKD.
Người dùng kéo thẻ sang cột khác để chuyển giai đoạn, rồi nhập kế hoạch đầu vào/đầu ra
của giai đoạn đích ngay tại chỗ — thay cho việc phải mở màn chi tiết và tìm dropdown.

## Quyết định thiết kế

### 1. Kéo thả chuyển giai đoạn ngay, không qua luồng duyệt 4 cấp

Hệ thống đã có sẵn hai đường chuyển giai đoạn:

- `requestPhaseAdvance` → GĐ Kinh doanh → GĐ Khối → Kế toán → BOD → `decidePhaseAdvance`
- Dropdown "Giai đoạn hiện tại" ở màn chi tiết: đổi thẳng, không duyệt

Kanban đi theo đường thứ hai. Nó là **giao diện tốt hơn cho một thao tác đã tồn tại và vốn
không bị chặn duyệt**, không phải một lối tắt vòng qua governance. Luồng duyệt 4 cấp vẫn giữ
nguyên cho trường hợp cần phê duyệt chính thức.

Bù lại, mọi lần kéo đều ghi audit log đầy đủ: ai chuyển, từ KH nào sang KH nào, lý do,
mục tiêu và đầu ra đã nhập.

### 2. Phân quyền

`KANBAN_MOVE_ROLES = [SALE, SALES_DIRECTOR, BUSINESS_DIRECTOR, BOD, ADMIN]`

Kế toán, IT, Khối sản xuất chỉ xem: thẻ không có thuộc tính `draggable` và màn hiện thông báo
giải thích. Quyền được kiểm tra **hai lớp** — ẩn ở UI và chặn lại trong `movePakdPhase`,
nên gọi thẳng hàm cũng không lách được.

### 3. Sửa lỗi tiềm ẩn: kéo lùi bị bật ngược

`effectiveCurrentPhase` cũ tính `max(currentPhase, KH xa nhất đã có thông tin)`. Vì thao tác
thả sẽ ghi mục tiêu/đầu ra vào giai đoạn đích, kéo một dự án từ KH05 về KH02 sẽ bị suy ngược
lại KH05 — thẻ nhảy về chỗ cũ ngay sau khi thả.

Thêm cờ `Pakd.phaseManual`. Khi người dùng đặt giai đoạn bằng tay (kéo thả, hoặc chọn dropdown
ở màn chi tiết), cờ được bật và `effectiveCurrentPhase` lấy đúng `currentPhase`. Dữ liệu cũ và
dữ liệu import không có cờ này nên vẫn suy ra như trước — thay đổi tương thích ngược.

Lỗi này cũng có ở dropdown "Giai đoạn hiện tại" sẵn có; sửa chung một chỗ.

### 4. Gom logic tính giai đoạn về một nguồn

`stepHasInfo` và `effectiveCurrentPhase` trước đây bị chép ở ba nơi (`ProjectsPage`,
`BodDashboard`, và bản mới). Nếu để nguyên, dashboard sẽ hiển thị dự án ở giai đoạn khác với
Kanban sau mỗi lần kéo. Cả ba nay dùng chung bản export từ `projectTypes.ts`.

## Kiến trúc

| Thành phần | Vai trò |
|---|---|
| `projectTypes.ts` | `phaseManual`, `stepHasInfo`, `effectiveCurrentPhase` — nguồn sự thật về giai đoạn |
| `projectWorkflow.ts` | `movePakdPhase`, `KANBAN_MOVE_ROLES`, `PhasePlanInput` — nghiệp vụ + validate + audit |
| `PhaseKanbanPage.tsx` | Bảng cột, kéo thả, modal nhập kế hoạch |
| `ProjectsPage.tsx` | Route `KANBAN`, nối `movePakdPhase` qua `runAction` |
| `constants.ts` / `App.tsx` | Mục menu dọc "Bảng giai đoạn" |

### Luồng dữ liệu

Thả thẻ → `PhaseKanbanPage` mở modal → xác nhận → `onMove(id, targetOrder, plan)` →
`runAction` → `movePakdPhase` validate → trả về `Pakd` mới + audit log → `setPakds` + `setAuditLog`.

Đây đúng cơ chế `runAction` mà mọi thao tác nghiệp vụ khác đang dùng, nên lỗi validate hiện ra
ở cùng chỗ với các lỗi khác.

### Xử lý lỗi

`movePakdPhase` chặn: sai vai trò, giai đoạn đích ngoài khoảng, thiếu mục tiêu, thiếu đầu ra,
ngày bắt đầu sau ngày kết thúc. Modal cũng validate trước khi gửi để người dùng thấy lỗi ngay.

Thả lại đúng cột cũ là no-op, không mở modal.

### Kéo thả

Dùng HTML5 drag-and-drop gốc, không thêm thư viện. Id dự án đi qua `dataTransfer` (nguồn sự
thật của trình duyệt), có state React làm dự phòng — tránh phụ thuộc thời điểm React flush state.

## Kiểm thử đã chạy

- `tsc --noEmit` sạch
- Kéo tiến KH01 → KH03: số đếm và tổng giá dự thầu từng cột cập nhật đúng
- Kéo lùi KH03 → KH01: thẻ ở lại KH01, không bật ngược (ca lỗi ở mục 3)
- Validate: bấm xác nhận khi bỏ trống → hiện "Nhập mục tiêu (đầu vào) của giai đoạn."
- Vai trò Kế toán: 0 thẻ kéo được, hiện thông báo chỉ-đọc
- Danh sách PAKD hiển thị cùng giai đoạn với Kanban sau khi kéo

## Giới hạn đã biết

State lưu trong bộ nhớ (`INITIAL_PAKDS`), rời khỏi module Project Management rồi quay lại sẽ
mất thay đổi. Đây là đặc tính sẵn có của bản demo, không phát sinh từ thay đổi này.
