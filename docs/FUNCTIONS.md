# IMIS — Module Quản lý PAKD & Vòng đời Dự án — Danh sách chức năng (High-level)

## 1. Xác thực & Phân quyền
- Đăng nhập theo tài khoản (5 vai trò nghiệp vụ + Khối Sản xuất + Admin), lưu phiên (localStorage), đăng xuất.
- Phân quyền thao tác theo vai trò: Sale, Giám đốc Khối, BOD, Kế toán, IT, Khối Sản xuất, Admin.

## 2. Quản lý Cơ hội kinh doanh
- Sale tạo **Cơ hội** (tên, khách hàng + mã KH, Giám đốc khối, Domain, thời gian, giá trị HĐ dự kiến, chi phí dự kiến, lợi nhuận tự tính).
- Danh sách cơ hội/PAKD: tìm kiếm, lọc theo trạng thái, xem mã tổng, giá trị, chi phí, %LN, phiên bản.
- Chi tiết cơ hội: thông tin cơ hội, tài chính, mã dự án, tiến trình, trao đổi/ghi chú.

## 3. Phương án kinh doanh (PAKD) — 6 giai đoạn KH01→KH06
- 6 giai đoạn chuẩn: Hình thành cơ hội → Khảo sát/Lập KH → Lựa chọn nhà thầu → Tổ chức lựa chọn nhà thầu → Ký hợp đồng → Đóng dự án/Kiểm toán.
- Mỗi giai đoạn = 1 sheet, có **phân bổ ngân sách 2 bên**: I. Kinh doanh và II. Sản xuất (kèm % trong tổng phân bổ).
- Bảng khoản chi phí theo **phiên bản**: CP dự kiến V1, điều chỉnh V2/V3…, và **Kế toán duyệt chi**; tổng cộng theo cột.
- Bổ sung/đổi tên/xóa khoản chi phí; thêm cột điều chỉnh (V2, V3…).
- KH01–KH05 có **Kết quả đầu ra**; KH06 có **Doanh thu tạo ra**.
- Đánh dấu **giai đoạn hiện tại**, tích xanh giai đoạn đã hoàn thành; nút hoàn thành để chuyển KH tiếp theo.

## 4. Quản lý chi phí & ngân sách
- Kinh doanh nhập chi phí dự kiến; Kế toán nhập số duyệt chi (ô riêng).
- So sánh kế hoạch vs duyệt chi, cảnh báo vượt chi / tiết kiệm.
- Ngân sách duyệt chi & doanh thu theo từng giai đoạn.

## 5. Quy trình phê duyệt PAKD (tuyến tính)
- Luồng: Sale nộp → Giám đốc Khối → BOD → Kế toán → IT (tạo Jira) → Hoàn tất.
- Mỗi cấp: Phê duyệt / Trả lại (kèm ý kiến); hàng đợi duyệt theo vai trò.
- Trả lại → Sale chỉnh sửa & nộp lại.

## 6. Sinh mã & tích hợp
- Sinh tự động **Mã tổng / Mã kinh doanh / Mã sản xuất** khi Giám đốc Khối duyệt (khóa chi phí).
- Mở **mã Outsource** (mã con của mã sản xuất).
- IT tạo **dự án Jira** ở bước cuối (mô phỏng).

## 7. Phiếu điều chỉnh chi phí (sau khi khóa)
- Sale tạo phiếu điều chỉnh: bổ sung / đổi tên / xóa khoản chi phí kèm lý do.
- Luồng duyệt phiếu: Giám đốc Khối → BOD → Kế toán → áp dụng & tạo **phiên bản mới**.
- Lưu lịch sử phiên bản chi phí (trước → sau).

## 8. Sản xuất — Triển khai (theo giai đoạn KH01→KH06)
- **Thông tin dự án sản xuất** (nhập tại KH02, do Giám đốc Khối): Project code (lấy từ mã sản xuất), Work order, Project Type, Priority, Size, Department, PM, Domain, Customer, Start/End Date, Status.
- Ràng buộc: chưa nhập đủ thông tin dự án SX ở KH02 thì **chặn chuyển giai đoạn**.
- **Đầu việc triển khai** theo từng KH: đầu việc, người phụ trách, thời gian, tiến độ %, ngày cập nhật; tiến độ trung bình.

## 9. Trao đổi & Ghi chú
- Luồng bình luận/ghi chú theo từng PAKD (tên, vai trò, thời gian); bật/tắt panel.

## 10. Nhật ký hệ thống (Audit log)
- Ghi mọi thao tác: nộp, phê duyệt/trả lại, sinh mã, khóa chi phí, áp dụng phiếu điều chỉnh, tạo Jira, chuyển giai đoạn…

## 11. Dashboard & Báo cáo
- Thống kê phân bố trạng thái PAKD, KPI (tổng doanh thu, số chờ duyệt, hoàn tất), hoạt động gần nhất.

---
*Ghi chú: bản hiện tại là frontend mô phỏng (mock, lưu trong bộ nhớ trình duyệt). Thiết kế dữ liệu & API để triển khai backend thật xem `docs/ERD.md` và `docs/API_SPEC.md`.*
