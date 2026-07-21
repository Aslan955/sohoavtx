# TÀI LIỆU YÊU CẦU NGHIỆP VỤ (BRD)
## Hệ thống IMIS — Module Quản lý Phương án Kinh doanh & Dự án đấu thầu (PLM)

| Mục | Nội dung |
|---|---|
| Tên hệ thống | IMIS Management System |
| Module | PLM — Quản lý PAKD đấu thầu (Project/Plan Lifecycle Management) |
| Phiên bản tài liệu | 1.0 |
| Ngày lập | 2026-07-16 |
| Trạng thái | Baseline theo mã nguồn hiện hành |
| Người lập | Business Analyst |

---

## 1. Giới thiệu & Bối cảnh

IMIS là nền tảng quản trị nội bộ doanh nghiệp CNTT, gồm hai nhóm module:
- **Nhân sự (HR):** Chấm công, Tổng hợp công, Nghỉ phép, Phép cá nhân, Bảng công (Timesheet), Quản lý đơn từ, Người phụ thuộc, Báo cáo Onsite, Cấu hình hệ thống.
- **PLM — Quản lý PAKD đấu thầu (trọng tâm):** quản lý toàn bộ vòng đời một **Phương án Kinh doanh (PAKD)** cho các gói thầu/dự án CNTT: từ hình thành cơ hội → lập phương án chi phí → phê duyệt nhiều cấp → sinh mã dự án → triển khai sản xuất → theo dõi chi thực tế → điều chỉnh phương án.

Tài liệu này đặc tả **yêu cầu nghiệp vụ** cho module PLM, được rút ra trực tiếp từ mã nguồn và giao diện hiện hành.

### 1.1. Vấn đề nghiệp vụ cần giải quyết
- Quy trình lập & duyệt phương án kinh doanh cho gói thầu đang thủ công (Excel, email), khó kiểm soát phiên bản và luồng phê duyệt.
- Không có công cụ tập trung để **Ban lãnh đạo (BOD) và Giám đốc Khối** giám sát chi phí, lợi nhuận dự kiến, tiến độ và rủi ro theo thời gian thực.
- Khó truy vết thay đổi chi phí (cũ → mới) và ai đã duyệt ở bước nào.
- Khó đồng bộ giữa **kế hoạch chi phí (kinh doanh)** và **chi thực tế (kế toán)**.

### 1.2. Tầm nhìn giải pháp
Một hệ thống web tập trung, phân quyền theo vai trò, số hoá toàn bộ luồng PAKD: khởi tạo → duyệt → sinh mã → triển khai → điều chỉnh, kèm bảng điều khiển (dashboard) cho lãnh đạo và cơ chế nhập liệu hàng loạt.

---

## 2. Mục tiêu nghiệp vụ

| Mã | Mục tiêu | Chỉ số thành công |
|---|---|---|
| BO-01 | Chuẩn hoá quy trình lập & duyệt PAKD nhiều cấp | 100% PAKD đi qua luồng duyệt chuẩn, có nhật ký |
| BO-02 | Kiểm soát chi phí & lợi nhuận dự kiến từng dự án | Lãnh đạo xem được biên LN, NS vs thực chi mọi PAKD |
| BO-03 | Truy vết mọi thay đổi phương án (versioning) | Mọi điều chỉnh lưu bản cũ → mới, có lý do & người thực hiện |
| BO-04 | Rút ngắn thời gian phê duyệt | Hàng đợi duyệt tập trung, cảnh báo tuổi hồ sơ |
| BO-05 | Đồng bộ kế hoạch – thực chi | Kế toán import chi thực tế, đối chiếu ngân sách |
| BO-06 | Hỗ trợ ra quyết định cho lãnh đạo | Dashboard BOD & GĐ Khối với KPI, cảnh báo rủi ro |
| BO-07 | Nhập liệu di trú/hàng loạt | Import nhiều PAKD & ngân sách giai đoạn từ Excel |

---

## 3. Phạm vi (Scope)

### 3.1. Trong phạm vi (In-scope)
- Quản lý danh mục **Khách hàng / Chủ đầu tư**.
- Khởi tạo, chỉnh sửa, nộp, phê duyệt PAKD (luồng nhiều cấp).
- Sinh & quản lý **mã dự án** (mã tổng, mã kinh doanh, mã sản xuất, mã outsource).
- Lập **phương án chi phí theo 6 giai đoạn KH01–KH06** (ngân sách Kinh doanh & Sản xuất).
- **Điều chỉnh phương án** sau khi hoàn tất (tạo phiên bản mới + duyệt lại) và **chỉnh sửa thông tin** trực tiếp.
- **Phiếu điều chỉnh chi phí** và **phiếu điều chỉnh ngân sách** giai đoạn.
- Nhập **chi thực tế** (Kế toán) và đối chiếu ngân sách.
- Quản lý **giai đoạn triển khai sản xuất** (đầu việc, tiến độ, thông tin dự án SX).
- **Dashboard BOD** và **Dashboard GĐ Khối**.
- **Import hàng loạt** PAKD và ngân sách giai đoạn (Excel/CSV).
- **Nhật ký hệ thống** (audit log).

### 3.2. Ngoài phạm vi (Out-of-scope) của module PLM
- Các module HR (chấm công, nghỉ phép…) — thuộc nền tảng, không đặc tả tại đây.
- Kế toán tài chính đầy đủ (sổ cái, hoá đơn) — hệ thống chỉ nhận chi thực tế tổng hợp.
- Tích hợp cổng đấu thầu quốc gia (chỉ lưu thông tin gói thầu).
- Ký số, xác thực SSO (dữ liệu người dùng hiện ở dạng mô phỏng).

---

## 4. Các bên liên quan & Vai trò (Stakeholders)

| Vai trò (hệ thống) | Tên nghiệp vụ | Trách nhiệm chính |
|---|---|---|
| SALE | AM / Account Manager | Khởi tạo PAKD, nhập cơ hội & chi phí kinh doanh, nộp trình duyệt, mở mã outsource |
| SALES_DIRECTOR | Giám đốc Kinh doanh | Duyệt cấp 1 (nếu được gán) |
| BUSINESS_DIRECTOR | Giám đốc Khối | Duyệt cấp 2, nhập thông tin dự án sản xuất, giám sát khối (dashboard riêng) |
| ACCOUNTANT | Kế toán | Duyệt chi, import chi thực tế hàng tháng |
| BOD | Ban Giám đốc | Phê duyệt cuối, giám sát toàn danh mục (dashboard BOD) |
| IT | Bộ phận IT | Bước IT trong luồng (cấu hình/kỹ thuật) |
| PRODUCTION | Khối Sản xuất | Nhập đầu việc & tiến độ triển khai |
| ADMIN | Quản trị hệ thống | Toàn quyền, cấu hình, giám sát |

---

## 5. Quy trình nghiệp vụ (Business Processes)

### 5.1. Vòng đời PAKD (luồng chính)
```
[AM tạo Nháp] → Nộp trình duyệt
   → [GĐ Kinh doanh duyệt]*  → [GĐ Khối duyệt]*  → [Kế toán duyệt]
   → [BOD duyệt] → [HOÀN TẤT]
(* Bỏ qua tự động nếu PAKD không gán GĐ Kinh doanh / GĐ Khối)
Bất kỳ cấp nào có thể: Duyệt / Trả lại (Returned) / Làm lại từ đầu (Restart)
```

**Quy tắc luồng động:** Kế toán & BOD **bắt buộc**; hai cấp Giám đốc chỉ có hiệu lực khi PAKD được gán người phụ trách tương ứng. Khi bỏ qua cả hai cấp GĐ và vào thẳng Kế toán, **bảng chi phí bị khoá**.

### 5.2. Sinh mã dự án
Khi tạo dự án, hệ thống sinh **Mã tổng = `<Mã KH>.<3 số>`**, kèm **Mã kinh doanh = `<Mã tổng>.1`**, **Mã sản xuất = `<Mã tổng>.2`**. AM có thể mở thêm **mã outsource = `<Mã sản xuất>.n`** cho các hạng mục thuê ngoài. Khi còn nháp, có thể **sinh lại mã theo mã khách hàng**.

### 5.3. Lập phương án chi phí
PAKD gồm **6 giai đoạn chuẩn KH01–KH06** (Hình thành cơ hội → Khảo sát/Lập KH → Lựa chọn nhà thầu → Tổ chức lựa chọn → Ký hợp đồng → Đóng dự án/Kiểm toán). Mỗi giai đoạn có: mục tiêu, kết quả đầu ra, thời gian, **ngân sách phân bổ Sản xuất và Kinh doanh** (kèm các khoản chi phí chi tiết) và tài liệu đính kèm. Có thể thêm/bớt giai đoạn.

### 5.4. Điều chỉnh sau khi hoàn tất (2 khối tách biệt)
- **Chỉnh sửa thông tin dự án** (khách hàng, PM, domain, tiến độ, tài chính): **lưu trực tiếp, không cần duyệt lại**.
- **Sửa phương án kinh doanh** (giai đoạn & ngân sách): tạo **phiên bản mới (V+1) ở trạng thái chờ duyệt**, đóng băng bản đã duyệt (V) để tham chiếu, ghi log **cũ → mới** cho từng trường; **người duyệt được xem bảng so sánh thay đổi** so với bản cũ; sau đó **trình duyệt lại từ đầu**.

### 5.5. Phiếu điều chỉnh chi phí & ngân sách
- **Phiếu điều chỉnh chi phí (Change Request):** thêm/sửa/xoá khoản chi, duyệt qua GĐ Khối → Kế toán → BOD.
- **Phiếu điều chỉnh ngân sách giai đoạn (Budget Adjustment):** đổi ngân sách Kinh doanh/Sản xuất của một giai đoạn, duyệt qua GĐ Khối → Kế toán → BOD.

### 5.6. Chi thực tế (Kế toán)
Kế toán **import hàng tháng** file chi thực tế (mã dự án • chi sản xuất • chi kinh doanh • ngày update). Hệ thống **cộng dồn** theo dự án và đối chiếu với ngân sách để cảnh báo vượt/sắp vượt.

### 5.7. Triển khai sản xuất
Sau khi Kế toán duyệt, **Khối Sản xuất/GĐ Khối** nhập **thông tin dự án sản xuất** (PM, quy mô, loại, thời gian) và **đầu việc triển khai** (tiến độ %) theo từng giai đoạn.

### 5.8. Import hàng loạt
- **Import PAKD:** tạo nhiều dự án từ 1 file Excel (mẫu `MAU_IMPORT_DU_AN.xlsx`), tự tạo khách hàng chưa có.
- **Import ngân sách giai đoạn:** cập nhật ngân sách nhiều giai đoạn cho nhiều dự án; dự án đã hoàn tất sẽ được tạo phiên bản mới & trình duyệt lại.

---

## 6. Yêu cầu nghiệp vụ (Business Requirements)

| Mã | Yêu cầu | Ưu tiên |
|---|---|---|
| BR-01 | Người dùng đăng nhập và làm việc theo vai trò được phân | Cao |
| BR-02 | AM tạo PAKD trực tiếp trên màn thông tin (không popup) | Cao |
| BR-03 | Hệ thống sinh mã dự án tự động theo mã khách hàng | Cao |
| BR-04 | Lập phương án chi phí 6 giai đoạn, thêm/bớt giai đoạn | Cao |
| BR-05 | Nộp & phê duyệt PAKD theo luồng nhiều cấp động | Cao |
| BR-06 | Trả lại / làm lại từ đầu kèm lý do | Cao |
| BR-07 | Chỉnh sửa thông tin dự án không cần duyệt | Trung bình |
| BR-08 | Sửa phương án tạo phiên bản mới + trình duyệt lại + bảng so sánh | Cao |
| BR-09 | Phiếu điều chỉnh chi phí / ngân sách có luồng duyệt | Trung bình |
| BR-10 | Kế toán import & đối chiếu chi thực tế | Cao |
| BR-11 | Quản lý danh mục khách hàng | Trung bình |
| BR-12 | Nhập đầu việc & tiến độ triển khai sản xuất | Trung bình |
| BR-13 | Dashboard BOD: cảnh báo rủi ro toàn danh mục | Cao |
| BR-14 | Dashboard GĐ Khối: KPI, hàng đợi duyệt, biên LN, NS vs thực chi, tải PM | Cao |
| BR-15 | Import hàng loạt PAKD & ngân sách giai đoạn | Trung bình |
| BR-16 | Nhật ký hệ thống ghi mọi hành động quan trọng | Cao |
| BR-17 | Đánh dấu dự án trọng điểm để ưu tiên theo dõi | Thấp |

---

## 7. Quy tắc nghiệp vụ (Business Rules)

| Mã | Quy tắc |
|---|---|
| RULE-01 | Kế toán và BOD là hai cấp duyệt bắt buộc; GĐ Kinh doanh/GĐ Khối chỉ duyệt khi được gán |
| RULE-02 | Sau khi vào bước Kế toán, bảng chi phí bị khoá (không sửa trực tiếp) |
| RULE-03 | Điều chỉnh phương án sau hoàn tất luôn tạo phiên bản mới và trình duyệt lại từ đầu |
| RULE-04 | Chỉnh sửa thông tin dự án (khối trên) được lưu trực tiếp, không sinh phiên bản |
| RULE-05 | Mã tổng = `<Mã KH>.<3 số>`; loại trừ một số hậu tố mã theo quy ước |
| RULE-06 | Chi thực tế import được cộng dồn theo dự án theo từng lần import |
| RULE-07 | Biên lợi nhuận tối thiểu cảnh báo: 15%; ngưỡng sắp chạm trần ngân sách: 85% |
| RULE-08 | Đơn bị trả lại (Returned) giữ nguyên phiên bản khi nộp lại; điều chỉnh mới thì tăng phiên bản |
| RULE-09 | Chỉ SALE/GĐ Kinh doanh/GĐ Khối/Admin được tạo & import PAKD |
| RULE-10 | Chỉ Kế toán/Admin được import chi thực tế |

---

## 8. Giả định & Ràng buộc

**Giả định**
- Người dùng và phân quyền được cấu hình sẵn (bản hiện tại dùng tài khoản mô phỏng, mật khẩu chung demo).
- Dữ liệu chi thực tế được kế toán tổng hợp bên ngoài rồi import định kỳ.

**Ràng buộc**
- Ứng dụng web, tối ưu cho màn hình desktop (bố cục dày, nhiều bảng).
- Ngôn ngữ giao diện: Tiếng Việt.
- Đơn vị tiền tệ: VNĐ.
- Dữ liệu hiện lưu tại phía trình duyệt (in-memory/seed) — cần backend khi triển khai thật (xem ERD).

---

## 9. Chỉ số đo lường thành công (KPIs)
- Tỷ lệ PAKD đi qua luồng duyệt chuẩn: **100%**.
- Thời gian duyệt trung bình mỗi cấp: **giảm** so với quy trình email.
- Tỷ lệ PAKD có bản ghi truy vết thay đổi đầy đủ: **100%**.
- Số dự án vượt ngân sách được phát hiện sớm qua dashboard.

---

## 10. Phụ lục — Trạng thái PAKD

| Trạng thái | Nhãn | Ý nghĩa |
|---|---|---|
| DRAFT | Nháp | Đang soạn, chưa nộp |
| PENDING_SALES_DIRECTOR | GĐ Kinh doanh | Chờ Giám đốc Kinh doanh duyệt |
| PENDING_BUSINESS_DIRECTOR | GĐ Khối | Chờ Giám đốc Khối duyệt |
| PENDING_ACCOUNTANT | Kế toán | Chờ Kế toán duyệt chi |
| PENDING_BOD | BOD | Chờ Ban Giám đốc duyệt cuối |
| PENDING_IT | IT | Bước IT (cấu hình/kỹ thuật) |
| COMPLETED | Hoàn tất | Đã duyệt xong, đang thực thi |
| RETURNED | Bị trả lại | Bị trả để chỉnh sửa & nộp lại |
