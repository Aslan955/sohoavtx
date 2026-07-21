# ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)
## Hệ thống IMIS — Module PLM (Quản lý PAKD đấu thầu)

| Mục | Nội dung |
|---|---|
| Tài liệu | Software Requirements Specification (SRS) |
| Phiên bản | 1.0 (baseline theo mã nguồn) |
| Ngày | 2026-07-16 |
| Công nghệ | React 19 + TypeScript + Vite 6 + TailwindCSS 4; thư viện xlsx cho import/export |
| Tài liệu liên quan | BRD.md, ERD.md, HDSD (docx) |

---

## 1. Giới thiệu

### 1.1. Mục đích
Đặc tả chi tiết các yêu cầu chức năng và phi chức năng của module PLM thuộc hệ thống IMIS, làm cơ sở phát triển, kiểm thử và nghiệm thu.

### 1.2. Phạm vi phần mềm
Ứng dụng web SPA quản lý vòng đời PAKD đấu thầu: khởi tạo, phê duyệt nhiều cấp, sinh mã, lập & điều chỉnh phương án chi phí, theo dõi chi thực tế, triển khai sản xuất, dashboard lãnh đạo, import hàng loạt và nhật ký hệ thống.

### 1.3. Định nghĩa & Viết tắt
| Thuật ngữ | Ý nghĩa |
|---|---|
| PAKD | Phương án Kinh doanh — thực thể trung tâm |
| KH01–KH06 | 6 giai đoạn chuẩn của một PAKD |
| AM | Account Manager (vai trò SALE) |
| GĐ Khối / GĐ KD | Giám đốc Khối / Giám đốc Kinh doanh |
| BOD | Ban Giám đốc |
| CR | Change Request — phiếu điều chỉnh chi phí |
| Mã tổng/KD/SX | Mã dự án tổng / kinh doanh / sản xuất |
| Versioning | Cơ chế phiên bản phương án (V1, V2…) |

---

## 2. Mô tả tổng thể

### 2.1. Bối cảnh sản phẩm
PLM là một module trong nền tảng IMIS (điều hướng qua Sidebar). Mặc định mở màn **Projects (PLM)**. Các module HR khác (Chấm công, Nghỉ phép, Timesheet…) chạy song song nhưng ngoài phạm vi SRS này.

### 2.2. Chức năng tổng quát (module tabs)
1. Dashboard BOD (BOD/Admin)
2. Dashboard GĐ Khối (GĐ Khối/Admin)
3. Danh sách PAKD
4. Đơn của tôi
5. Khách hàng
6. Import PAKD (SALE/GĐ/Admin)
7. Chi thực tế (Kế toán)
8. Hàng đợi duyệt
9. Phiếu điều chỉnh CP
10. Nhật ký hệ thống

### 2.3. Nhóm người dùng (User Classes)
SALE, SALES_DIRECTOR, BUSINESS_DIRECTOR, ACCOUNTANT, BOD, IT, PRODUCTION, ADMIN (xem BRD §4).

### 2.4. Môi trường vận hành
- Trình duyệt hiện đại (Chrome/Edge/Firefox).
- Màn hình desktop (bố cục tối thiểu ~1000px, có cuộn ngang cho bảng rộng).
- Dev server Vite cổng 3000; build production phục vụ tĩnh (thư mục `dist/`).

### 2.5. Ràng buộc thiết kế
- SPA client-side; dữ liệu hiện là seed/in-memory (cần backend + CSDL khi triển khai — tham chiếu ERD).
- Giao diện tiếng Việt, tiền tệ VNĐ, định dạng ngày `yyyy-mm-dd`.

### 2.6. Giả định & Phụ thuộc
- Phân quyền dựa trên vai trò của người dùng đang đăng nhập.
- Thư viện `xlsx` để đọc/ghi Excel phía client.

---

## 3. Yêu cầu chức năng (Functional Requirements)

> Định dạng: mỗi tính năng gồm mô tả, tác nhân, tiền điều kiện, luồng và quy tắc.

### FR-1. Xác thực & Phân quyền
- **FR-1.1** Đăng nhập bằng tài khoản (username) hoặc chọn nhanh tài khoản demo; lưu phiên ở `localStorage`.
- **FR-1.2** Menu và hành động hiển thị theo vai trò (ví dụ nút "Tạo dự án" chỉ với SALE/GĐ KD/GĐ Khối; tab Import chỉ với SALE/GĐ/Admin; tab Chi thực tế thao tác chỉ với Kế toán/Admin).
- **FR-1.3** Đăng xuất xoá phiên.

### FR-2. Quản lý Khách hàng
- **FR-2.1** Xem danh mục khách hàng (mã, tên, MST, liên hệ, domain…).
- **FR-2.2** Thêm/sửa khách hàng (vai trò SALE/GĐ/Admin).
- **FR-2.3** Mã khách hàng dùng làm tiền tố sinh mã dự án.

### FR-3. Khởi tạo PAKD (inline)
- **FR-3.1** Nút "Tạo dự án" tạo ngay một PAKD **Nháp** và mở màn thông tin để nhập trực tiếp (không dùng popup).
- **FR-3.2** Sinh mã tổng mặc định `022.xxx`; nút **"Sinh lại mã theo mã KH"** để sinh mã theo mã khách hàng khi còn nháp.
- **FR-3.3** Nhập thông tin cơ hội: mã/tên khách hàng, domain, người lập (AM), PM, tiến độ (từ–đến); tài chính: doanh thu dự kiến, chi phí dự kiến, tự tính **lợi nhuận gộp dự kiến (%)**.
- **FR-3.4** Khởi tạo sẵn 6 giai đoạn KH01–KH06.

### FR-4. Mã dự án
- **FR-4.1** Hiển thị 3 thẻ mã (Mã tổng, Mã kinh doanh, Mã sản xuất) dạng lưới, kèm PM từng mã.
- **FR-4.2** Cập nhật PM cho các mã.
- **FR-4.3** Mở **mã outsource** (`<Mã SX>.n`) kèm nội dung thuê ngoài — SALE/GĐ.
- **FR-4.4** Sinh lại mã theo mã khách hàng (khi nháp).

### FR-5. Phương án chi phí theo giai đoạn
- **FR-5.1** Bảng lưới các giai đoạn: cột Hiện tại, Giai đoạn (KH), Bắt đầu, Kết thúc, Mục tiêu, Kết quả đầu ra, **Ngân sách phân bổ (Sản xuất | Kinh doanh | Tổng)**, Tài liệu đính kèm, Lịch sử NS.
- **FR-5.2** Nhập ngân sách Sản xuất/Kinh doanh từng giai đoạn; hàng Tổng tự cộng.
- **FR-5.3** Thêm/xoá giai đoạn; đặt "giai đoạn hiện tại"; hoàn thành & chuyển giai đoạn kế tiếp.
- **FR-5.4** Đính kèm tài liệu (tên/link) cho từng giai đoạn.
- **FR-5.5** Chặn chuyển giai đoạn KH02 nếu chưa nhập đủ thông tin dự án sản xuất (PM, ngày bắt đầu/kết thúc).

### FR-6. Nộp & Phê duyệt (workflow)
- **FR-6.1** AM "Nộp trình duyệt" → chuyển sang cấp chờ duyệt đầu tiên (bỏ qua GĐ không gán).
- **FR-6.2** Mỗi cấp: **Duyệt** (chuyển cấp kế tiếp) / **Trả lại** (Returned, kèm ý kiến) / **Làm lại từ đầu** (Restart).
- **FR-6.3** Khi tới thẳng Kế toán (bỏ qua 2 cấp GĐ) → khoá bảng chi phí.
- **FR-6.4** BOD duyệt → **Hoàn tất**.
- **FR-6.5** Hiển thị "Người duyệt tiếp theo" và thanh phê duyệt khi tới lượt vai trò hiện tại.
- **FR-6.6** Hàng đợi duyệt riêng cho vai trò hiện tại; nhập ý kiến rồi Duyệt/Trả lại.

### FR-7. Chỉnh sửa thông tin (không cần duyệt)
- **FR-7.1** Nút "Chỉnh sửa thông tin" cho phép sửa **khối thông tin dự án phía trên** (khách hàng, PM, domain, tiến độ, tài chính).
- **FR-7.2** Thay đổi **lưu trực tiếp**, không tạo phiên bản, không đưa vào luồng duyệt; có banner xác nhận; nút "Xong".

### FR-8. Sửa phương án (cần duyệt) & Versioning
- **FR-8.1** Nút "Sửa phương án" mở chế độ sửa **chỉ phần giai đoạn & ngân sách** (thông tin phía trên khoá).
- **FR-8.2** Nút "Gửi duyệt điều chỉnh" → nhập lý do → hệ thống:
  - Tăng phiên bản **V+1** ở trạng thái chờ duyệt; **đóng băng bản đã duyệt (V)** để xem lại read-only;
  - Ghi log **cũ → mới** cho từng trường thay đổi (tên/thời gian/mục tiêu/kết quả/NS KD/NS SX);
  - **Trình duyệt lại từ đầu**.
- **FR-8.3** Người duyệt xem **bảng so sánh thay đổi (V cũ → V mới)**: giai đoạn • nội dung • bản cũ (gạch đỏ) • bản mới (xanh).
- **FR-8.4** Chip phiên bản: V1…V(n) với trạng thái (đã chốt / hiện hành / đang xin duyệt lại); bấm để xem bản đã chốt.
- **FR-8.5** "Thoát sửa phương án" hoàn tác phần chưa gửi; thông tin đã sửa vẫn giữ.

### FR-9. Phiếu điều chỉnh chi phí (Change Request)
- **FR-9.1** Tạo phiếu thêm/sửa/xoá khoản chi kèm lý do.
- **FR-9.2** Luồng duyệt: GĐ Khối → Kế toán → BOD; khi duyệt xong **áp dụng** thay đổi.
- **FR-9.3** Hiển thị danh sách phiếu, trạng thái, hàng đợi "Phiếu điều chỉnh CP".

### FR-10. Phiếu điều chỉnh ngân sách giai đoạn (Budget Adjustment)
- **FR-10.1** Đề nghị đổi ngân sách Kinh doanh/Sản xuất của một giai đoạn (trước → sau, lý do).
- **FR-10.2** Luồng duyệt: GĐ Khối → Kế toán → BOD.
- **FR-10.3** Lịch sử điều chỉnh ngân sách theo giai đoạn.

### FR-11. Chi thực tế (Kế toán)
- **FR-11.1** Import file (CSV/dán) 4 cột: Mã dự án • Chi sản xuất • Chi kinh doanh • Ngày update.
- **FR-11.2** Khớp theo Mã tổng/Mã PAKD/Mã KD/Mã SX; **cộng dồn** theo dự án; bỏ qua dòng không khớp.
- **FR-11.3** Bảng tổng hợp chi thực tế theo dự án; hiển thị % so với ngân sách.
- **FR-11.4** Tải file mẫu.

### FR-12. Triển khai sản xuất
- **FR-12.1** Nhập **thông tin dự án sản xuất** theo giai đoạn (PM, loại, ưu tiên, quy mô, phòng ban, domain, khách hàng, thời gian, trạng thái) — GĐ Khối/Admin.
- **FR-12.2** Thêm/sửa/xoá **đầu việc triển khai** (người phụ trách, thời gian, tiến độ %); tự ghi ngày cập nhật.
- **FR-12.3** Chỉ lập sau khi Kế toán duyệt (trạng thái Chờ BOD/IT/Hoàn tất).

### FR-13. Dashboard BOD
- **FR-13.1** Danh sách **cảnh báo** (đỏ/cam/xanh): vượt tổng ngân sách, vượt theo loại SX/KD, sắp chạm trần (≥85%), biên LN < 15%, chi vượt chi phí dự kiến, giai đoạn quá hạn, đơn bị trả, đang điều chỉnh chờ duyệt.
- **FR-13.2** Bấm cảnh báo mở chi tiết PAKD.

### FR-14. Dashboard GĐ Khối
- **FR-14.1** Lọc theo khối của người dùng (`businessDirector`).
- **FR-14.2** Dải **6 KPI**: số dự án khối (đang chạy), tổng giá trị HĐ, LN gộp dự kiến & biên TB, đã chi/kế hoạch (%), số chờ tôi duyệt, số dự án rủi ro.
- **FR-14.3** Bảng: **Hàng đợi chờ tôi duyệt** (kèm tuổi hồ sơ), **Biên LN thấp nhất**, **Ngân sách vs Thực chi**, **Tải công việc theo PM**, **Cơ cấu theo Domain**.
- **FR-14.4** Mọi dòng bấm mở chi tiết dự án.

### FR-15. Import hàng loạt
- **FR-15.1 Import PAKD:** đọc file Excel/CSV (mẫu `MAU_IMPORT_DU_AN.xlsx`, sheet `Import_DuAn`); cột bắt buộc: Tên dự án, Mã khách hàng; **tự tạo khách hàng mới** nếu chưa có; chọn trạng thái sau import (Hoàn tất/Nháp); xem trước & báo lỗi từng dòng.
- **FR-15.2 Import ngân sách giai đoạn:** long-format (mỗi dòng = 1 giai đoạn của 1 dự án); khớp dự án theo mã; dự án Nháp → cập nhật trực tiếp; dự án đã chốt → tạo phiên bản mới & trình duyệt lại (bắt buộc nhập lý do).
- **FR-15.3** Hỗ trợ đọc `.xlsx` (arraybuffer) và `.csv` (UTF-8).

### FR-16. Nhật ký hệ thống (Audit Log)
- **FR-16.1** Ghi các hành động: nộp, duyệt, trả lại, điều chỉnh, import, cập nhật chi… kèm người thực hiện, vai trò, trạng thái cũ/mới, thời gian, ghi chú.

### FR-17. Danh sách & Tìm kiếm
- **FR-17.1** Danh sách PAKD với cột: Mã PAKD, Mã tổng, Tên/gói thầu, trạng thái, giai đoạn, giá trị, chi phí…
- **FR-17.2** Tìm kiếm theo tên/mã/gói thầu; lọc theo **giai đoạn**; lọc **dự án trọng điểm**.
- **FR-17.3** "Đơn của tôi" lọc PAKD do người dùng lập.
- **FR-17.4** Đánh dấu/bỏ đánh dấu **dự án trọng điểm**.

---

## 4. Yêu cầu giao diện ngoài (External Interfaces)

### 4.1. Giao diện người dùng (UI)
- Bố cục: Sidebar điều hướng trái + vùng nội dung; thanh module-tab; màn chi tiết PAKD gồm: tiêu đề & trạng thái, khối Mã dự án (lưới 3 thẻ), khối Thông tin cơ hội + Tài chính, tab "Phương án kinh doanh (KH01–KH06)" & "Sản xuất — Triển khai".
- Ngôn ngữ: Tiếng Việt; tiền tệ VNĐ; ngày `yyyy-mm-dd`.

### 4.2. Giao diện phần cứng/phần mềm
- Không phụ thuộc phần cứng đặc thù; chạy trên trình duyệt.
- Thư viện ngoài: React, TailwindCSS, lucide-react (icon), xlsx (Excel).

### 4.3. Giao diện dữ liệu
- Import/Export Excel/CSV (khách hàng, PAKD, ngân sách giai đoạn, chi thực tế).
- (Tương lai) REST API tới backend — xem ERD cho lược đồ bảng.

---

## 5. Yêu cầu phi chức năng (Non-functional)

| Mã | Loại | Yêu cầu |
|---|---|---|
| NFR-01 | Hiệu năng | Thao tác danh sách/chi tiết phản hồi < 1s với vài trăm PAKD (client-side) |
| NFR-02 | Khả dụng | Giao diện desktop, thao tác bằng chuột/bàn phím; nhãn rõ ràng tiếng Việt |
| NFR-03 | Bảo mật | Phân quyền theo vai trò; hành động nhạy cảm giới hạn đúng vai trò |
| NFR-04 | Toàn vẹn | Mọi thay đổi phương án được versioning & ghi log không mất dữ liệu bản cũ |
| NFR-05 | Truy vết | Nhật ký hệ thống đầy đủ actor/role/thời gian |
| NFR-06 | Khả bảo trì | Mã nguồn tách lớp: types, workflow (state machine), UI; không phụ thuộc UI trong workflow |
| NFR-07 | Tương thích | Chrome/Edge/Firefox bản mới |
| NFR-08 | Quốc tế hoá | Hiện tại tiếng Việt; định dạng số `vi-VN` |
| NFR-09 | Triển khai | Build tĩnh (Vite) phục vụ qua web server; khuyến nghị tách chunk cho thư viện lớn (xlsx) |

---

## 6. Mô hình dữ liệu (Data Entities)

> Rút từ `projectTypes.ts`. Chi tiết bảng/khoá xem ERD.md.

### 6.1. Pakd (Phương án Kinh doanh)
`id, name, customerName, customerCode, creator, createdAt, status, pmName, businessDirector, salesDirector, domain, projStart, projEnd, expectedContractValue, expectedCost, tender{...}, revenue, steps[], currentPhase, productionTasks[], locked, version, masterCode, businessCode, productionCode, outsourceCodes[], approvalHistory[], changeRequests[], versionHistory[], comments[], planRevisions[], planChangeLogs[], versionSnaps[], pendingAdjustReason, isKeyProject, businessPM, productionPM, accountingSpends[]`

### 6.2. ProjectStep (Giai đoạn KH)
`id, order, name, assignee, startDate, endDate, note, approvedBudget, revenue, objective, output, attachmentFiles[], budgetAdjustments[], advanceStatus, advanceApprovals[], actualSpent, spentLog[], businessBudget, productionBudget, costItems[], productionCostItems[], productionInfo{...}, productionTasks[]`

### 6.3. CostItem (Khoản chi phí)
`id, name, costType, amount, actualAmount, versionAmounts[], note`

### 6.4. TenderInfo (Gói thầu)
`packageCode, investor, biddingMethod, fieldType, contractType, packagePrice, bidSecurity, closeDate`

### 6.5. ChangeRequest / CostChange
`ChangeRequest{ id, pakdId, createdBy, createdAt, status, reason, changes[], approvalHistory[] }`; `CostChange{ id, op(ADD/EDIT/DELETE), stepId, costName, costType, oldAmount, newAmount }`

### 6.6. BudgetAdjustment
`id, createdAt, requestedBy, reason, before{business,production}, after{business,production}, status, approvals[]`

### 6.7. Versioning
`PlanChangeLog{ id, version, at, by, role, reason, stepCode, field, before, after }`; `PlanVersionSnap{ version, at, by, reason, steps[] }`; `PakdVersionSnapshot{ version, createdAt, changeRequestId, reason, totalCostBefore, totalCostAfter }`

### 6.8. AccountingSpend (Chi thực tế)
`id, at, production, business, by, importedAt`

### 6.9. ProductionInfo / ProductionTask
`ProductionInfo{ workOrder, projectType, priority, size, department, projectManager, domain, customer, startDate, endDate, status }`; `ProductionTask{ id, name, assignee, startDate, endDate, progress, updatedAt }`

### 6.10. Customer
`id, code, name, taxCode, contactPerson, phone, email, address, domain, note, createdAt`

### 6.11. SystemUser / AuditLogEntry
`SystemUser{ id, fullName, role, department, username, password }`; `AuditLogEntry{ id, pakdId, actor, role, action, oldStatus, newStatus, note, createdAt }`

---

## 7. Máy trạng thái PAKD (State Machine)

| Trạng thái | Hành động cho phép | Chuyển đến |
|---|---|---|
| DRAFT | Nộp trình duyệt | Cấp chờ duyệt đầu tiên (động) |
| PENDING_SALES_DIRECTOR | Duyệt / Trả lại / Làm lại | GĐ Khối (hoặc kế tiếp) / RETURNED / RESTART |
| PENDING_BUSINESS_DIRECTOR | Duyệt / Trả lại / Làm lại | Kế toán / RETURNED / RESTART |
| PENDING_ACCOUNTANT | Duyệt / Trả lại / Làm lại | BOD / RETURNED / RESTART |
| PENDING_BOD | Duyệt / Trả lại / Làm lại | COMPLETED / RETURNED / RESTART |
| COMPLETED | Chỉnh sửa thông tin (trực tiếp) / Sửa phương án (→ V+1 duyệt lại) | COMPLETED / cấp chờ duyệt đầu tiên |
| RETURNED | Chỉnh sửa & nộp lại | Cấp chờ duyệt đầu tiên |

---

## 8. Ma trận phân quyền (Role × Chức năng — rút gọn)

| Chức năng | SALE | GĐ KD | GĐ Khối | Kế toán | BOD | SX | IT | Admin |
|---|---|---|---|---|---|---|---|---|
| Tạo/Sửa PAKD | ✔ | ✔ | ✔ | | | | | ✔ |
| Import PAKD | ✔ | ✔ | ✔ | | | | | ✔ |
| Duyệt theo cấp | | ✔ | ✔ | ✔ | ✔ | | (IT) | ✔ |
| Import chi thực tế | | | | ✔ | | | | ✔ |
| Nhập triển khai SX | | | ✔ | | | ✔ | | ✔ |
| Dashboard BOD | | | | | ✔ | | | ✔ |
| Dashboard GĐ Khối | | | ✔ | | | | | ✔ |

---

## 9. Phụ lục
- **Ngưỡng cảnh báo:** biên LN tối thiểu 15%; sắp chạm trần ngân sách 85%.
- **Tài liệu tham chiếu:** BRD.md (nghiệp vụ), ERD.md (thiết kế dữ liệu backend), HDSD (*.docx) hướng dẫn sử dụng, `MAU_IMPORT_DU_AN.xlsx` (mẫu import).
