# BỘ TEST CASE — MODULE QUẢN LÝ PAKD ĐẤU THẦU

**Phiên bản:** 1.0 • **Ngày lập:** 2026-07-04 • **Phạm vi:** `src/components/projects/` (Danh sách PAKD, luồng duyệt, chi thực tế, phiếu điều chỉnh, lịch sử)

## Tài khoản test (mật khẩu chung: `123456`)

| Username | Họ tên | Vai trò |
|---|---|---|
| `am` | Lê Thu Trang | AM (SALE) |
| `gdkd` | Đỗ Mạnh Cường | GĐ Kinh doanh (SALES_DIRECTOR) |
| `gdkhoi` | Nguyễn Tiến Dũng | GĐ Khối (BUSINESS_DIRECTOR) |
| `ketoan` | Lê Thị Mai | Kế toán (ACCOUNTANT) |
| `bod` | Phạm Minh Hải | BOD |
| `it` / `sanxuat` / `admin` | — | IT / Khối SX / Admin |

**Luồng duyệt chuẩn:** Người lập nộp → GĐ Kinh doanh → GĐ Khối (khóa chi phí) → Kế toán → BOD → **Hoàn tất** (sinh Jira, khóa chi thực tế).

**Quy ước độ ưu tiên:** P1 = Critical (chặn luồng chính) • P2 = High • P3 = Medium.

---

## 1. ĐĂNG NHẬP & PHÂN QUYỀN (TC-AUTH)

| Mã TC | Mục tiêu | Điều kiện tiên quyết | Bước thực hiện | Kết quả mong đợi | Ưu tiên |
|---|---|---|---|---|---|
| AUTH-01 | Đăng nhập đúng | Có tài khoản `am/123456` | 1. Mở app 2. Nhập username/password 3. Đăng nhập | Vào màn Danh sách PAKD, góc phải hiện "Lê Thu Trang – AM (Account Manager)" | P1 |
| AUTH-02 | Đăng nhập sai | — | Nhập sai mật khẩu | Báo lỗi, không vào được hệ thống | P1 |
| AUTH-03 | Nút "Tạo dự án" theo vai trò | Đăng nhập lần lượt từng vai trò | Quan sát header danh sách | Chỉ **AM / GĐ Kinh doanh / GĐ Khối** thấy nút "Tạo dự án"; Kế toán/BOD/IT/SX không thấy | P1 |
| AUTH-04 | Giữ phiên đăng nhập | Đã đăng nhập | Refresh trình duyệt (F5) | Vẫn giữ user hiện tại (localStorage), không phải đăng nhập lại | P3 |
| AUTH-05 | Đăng xuất | Đã đăng nhập | Bấm nút đăng xuất | Quay về màn Login | P2 |

---

## 2. TẠO DỰ ÁN & SINH MÃ (TC-CREATE)

| Mã TC | Mục tiêu | Điều kiện tiên quyết | Bước thực hiện | Kết quả mong đợi | Ưu tiên |
|---|---|---|---|---|---|
| CRT-01 | Tạo dự án thành công (AM) | Đăng nhập `am` | 1. Bấm "Tạo dự án" 2. Nhập Tên dự án, Tên KH, chọn GĐ Khối, Doanh thu > 0 3. Bấm **Lưu** | Modal đóng, mở màn chi tiết PAKD mới ở trạng thái **Nháp**; tiêu đề modal ghi rõ "Lưu ở dạng nháp" | P1 |
| CRT-02 | Validate trường bắt buộc | Modal tạo đang mở | Bỏ trống Tên dự án hoặc Tên KH → Lưu | Báo lỗi "Cần nhập Tên dự án, Tên khách hàng và Giám đốc khối", không tạo | P1 |
| CRT-03 | Validate doanh thu | Modal tạo đang mở | Nhập Doanh thu = 0 → Lưu | Báo lỗi "Giá trị hợp đồng dự kiến phải > 0" | P1 |
| CRT-04 | Mã dự án sinh ngay khi tạo | CRT-01 thành công | Xem khối "MÃ DỰ ÁN" ở màn chi tiết | Có ngay Mã tổng `022.xxx`, Mã KD `022.xxx.1`, Mã SX `022.xxx.2` — **không cần chờ GĐ Khối duyệt** | P1 |
| CRT-05 | Loại trừ đuôi mã 49/53 | — | Tạo nhiều dự án (≥20 lần), ghi lại mã | Không có mã nào có 2 số cuối là **49** hoặc **53** (vd 022.149, 022.253) | P2 |
| CRT-06 | GĐ Kinh doanh / GĐ Khối tạo dự án | Đăng nhập `gdkd` rồi `gdkhoi` | Lặp lại CRT-01 | Tạo thành công như AM; trường "Người lập" hiển thị đúng tên người tạo | P1 |
| CRT-07 | Mã khách hàng tự sinh | Modal tạo | Bỏ trống Mã KH, nhập Tên KH "Viettel" → Lưu | Mã KH tự sinh = 4 ký tự đầu tên KH viết hoa (VIET) | P3 |
| CRT-08 | Lợi nhuận gộp tự tính trong modal | Modal tạo | Nhập Doanh thu 10 tỷ, Chi phí 4 tỷ | Ô lợi nhuận hiện `6.000.000.000 đ (60.0%)` màu xanh; chi phí > doanh thu thì màu đỏ | P2 |
| CRT-09 | Ô số tiền có dấu phân cách khi gõ | Modal tạo | Gõ `10000000000` vào ô Doanh thu | Hiển thị ngay `10.000.000.000` trong lúc gõ (không cần submit) | P2 |

---

## 3. SỬA NHÁP & BẢNG GIAI ĐOẠN (TC-EDIT)

| Mã TC | Mục tiêu | Điều kiện tiên quyết | Bước thực hiện | Kết quả mong đợi | Ưu tiên |
|---|---|---|---|---|---|
| EDT-01 | Sửa thông tin khi Nháp | PAKD ở trạng thái Nháp, mở bằng người lập | Sửa Tên KH, Domain, PM, Tiến độ, Doanh thu, Chi phí dự kiến | Các trường là ô nhập; giá trị lưu ngay; Lợi nhuận gộp tự tính lại | P1 |
| EDT-02 | Nút "Lưu nháp" | PAKD Nháp | Bấm "Lưu nháp" | Hiện xác nhận "✓ Đã lưu nháp" ~2.5s | P2 |
| EDT-03 | Sửa bảng giai đoạn | PAKD Nháp | Sửa tên KH01, ngày bắt đầu/kết thúc, mục tiêu, kết quả đầu ra, NS Sản xuất/Kinh doanh | Nhập được tất cả; cột Tổng = SX + KD tự tính; dòng Tổng cuối bảng cập nhật | P1 |
| EDT-04 | Thêm giai đoạn | PAKD Nháp có 6 KH | Bấm "Thêm giai đoạn (KH07)" | Thêm dòng KH07; select "Giai đoạn hiện tại" có thêm KH07 | P2 |
| EDT-05 | Xóa giai đoạn | PAKD Nháp có ≥2 KH | Bấm 🗑 ở 1 KH → xác nhận | KH bị xóa, các KH sau đánh lại số thứ tự; không xóa được khi chỉ còn 1 KH | P2 |
| EDT-06 | Giai đoạn hiện tại tự động | PAKD Nháp, KH01–KH02 trống | Nhập mục tiêu/ngân sách cho KH03 | Select "Giai đoạn hiện tại" tự nhảy về **KH03**; KH01–02 hiện dấu ✓, KH03 chấm xanh | P1 |
| EDT-07 | Chọn giai đoạn thủ công | EDT-06 | Chọn KH05 trên select; sau đó thử chọn KH01 | Chọn cao hơn (KH05) được; chọn thấp hơn KH có thông tin xa nhất thì tự trả về KH xa nhất | P2 |
| EDT-08 | Không sửa được khi đang chờ duyệt | PAKD ở "Chờ GĐ Kinh doanh" | Mở bằng AM/GĐ | **Không** có nút "Sửa phương án"; các ô ở dạng chỉ đọc | P1 |

---

## 4. IMPORT THÔNG TIN GIAI ĐOẠN (TC-IMP)

| Mã TC | Mục tiêu | Điều kiện tiên quyết | Bước thực hiện | Kết quả mong đợi | Ưu tiên |
|---|---|---|---|---|---|
| IMP-01 | Mở modal import | PAKD Nháp (editable) | Bấm "Import thông tin" | Modal mở, có hướng dẫn 7 cột: Giai đoạn • Bắt đầu • Kết thúc • Mục tiêu • Kết quả đầu ra • NS Sản xuất • NS Kinh doanh | P2 |
| IMP-02 | Tải file mẫu | Modal import | Bấm "Tải file mẫu" | Tải về `mau-import-giai-doan.csv`, mở Excel không lỗi font (có BOM UTF-8), đúng 7 cột + 2 dòng mẫu | P2 |
| IMP-03 | Import từ file CSV | Có file CSV đúng định dạng | Chọn file → xem Preview → "Áp dụng" | Preview map từng dòng vào KH01, KH02…; áp dụng xong bảng giai đoạn nhận đúng dữ liệu | P1 |
| IMP-04 | Dán từ Excel (Tab) | Copy 2 dòng từ Excel | Dán vào ô textarea | Tự nhận ngăn cách Tab; preview hiển thị đúng cột | P2 |
| IMP-05 | Bỏ qua dòng tiêu đề | Dữ liệu có dòng đầu "Giai đoạn,..." | Dán & xem preview | Dòng tiêu đề không thành dòng dữ liệu | P2 |
| IMP-06 | Dòng dư tạo KH mới | PAKD có 6 KH, dán 8 dòng | Xem preview → Áp dụng | Dòng 7–8 đánh dấu "mới" nền xanh; áp dụng tạo KH07, KH08 | P2 |
| IMP-07 | Ô trống giữ giá trị cũ | KH01 đã có mục tiêu | Import dòng 1 có ô Mục tiêu để trống | Mục tiêu cũ của KH01 **không bị ghi đè** | P2 |
| IMP-08 | Không có dữ liệu hợp lệ | Modal import | Bấm "Áp dụng" khi ô trống | Nút disable / báo "Chưa có dữ liệu hợp lệ để import" | P3 |

---

## 5. NỘP TRÌNH DUYỆT & LUỒNG DUYỆT (TC-FLOW)

| Mã TC | Mục tiêu | Điều kiện tiên quyết | Bước thực hiện | Kết quả mong đợi | Ưu tiên |
|---|---|---|---|---|---|
| FLW-01 | Nộp trình duyệt | PAKD Nháp | Bấm "Nộp trình duyệt" | Trạng thái → **Chờ GĐ Kinh doanh**; Lịch sử phê duyệt có dòng **"Nộp"** (xanh dương) của người lập; header hiện "Người duyệt tiếp theo: Đỗ Mạnh Cường (GĐ Kinh doanh)" | P1 |
| FLW-02 | GĐ Kinh doanh duyệt | FLW-01; đăng nhập `gdkd` | Mở PAKD → thanh vàng "Hồ sơ đang chờ..." → nhập ý kiến → **Duyệt** | Trạng thái → **Chờ GĐ Khối**; lịch sử thêm dòng Duyệt kèm ý kiến | P1 |
| FLW-03 | GĐ Khối duyệt → khóa chi phí | FLW-02; đăng nhập `gdkhoi` | Bấm Duyệt | Trạng thái → **Chờ Kế toán**; PAKD chuyển sang **ĐÃ KHÓA CHI PHÍ** (locked) | P1 |
| FLW-04 | Kế toán duyệt | FLW-03; đăng nhập `ketoan` | Bấm Duyệt | Trạng thái → **Chờ BOD** | P1 |
| FLW-05 | BOD duyệt → Hoàn tất | FLW-04; đăng nhập `bod` | Bấm Duyệt | Trạng thái → **Hoàn tất**; tự sinh Jira key/URL; header: "Người duyệt tiếp theo: Đã hoàn tất — không còn bước duyệt"; toàn bộ chi thực tế đã nhập bị **khóa** | P1 |
| FLW-06 | Sai vai trò không duyệt được | PAKD Chờ GĐ Khối; đăng nhập `gdkd` | Mở PAKD | **Không** hiện thanh Duyệt/Từ chối (không phải lượt mình) | P1 |
| FLW-07 | Từ chối → trả về người lập | PAKD đang chờ duyệt bất kỳ cấp | Nhập lý do → **Từ chối** | Trạng thái → **Bị trả lại**; banner đỏ ⚠ ở màn chi tiết; người lập sửa được và có nút "Nộp trình duyệt" lại | P1 |
| FLW-08 | Nộp lại sau khi bị trả | FLW-07; đăng nhập người lập | Sửa → Nộp trình duyệt | Luồng chạy lại **từ đầu** (Chờ GĐ Kinh doanh); lịch sử thêm mốc Nộp "nộp lại sau khi bị trả lại" | P1 |
| FLW-09 | Ý kiến để trống | Đến lượt duyệt | Duyệt không nhập ý kiến | Vẫn duyệt được, ý kiến mặc định "Đồng ý phê duyệt." | P3 |
| FLW-10 | Duyệt từ tab Hàng đợi duyệt | Có ≥1 hồ sơ chờ vai trò mình | Vào tab "Hàng đợi duyệt" → Duyệt/Trả lại trực tiếp trên bảng | Kết quả như duyệt trong màn chi tiết; hồ sơ biến khỏi hàng đợi | P2 |
| FLW-11 | Lịch sử phê duyệt đầy đủ từ AM→BOD | PAKD đã đi hết luồng | Xem panel "Lịch sử phê duyệt" | Đủ các dòng: Nộp (AM) → Duyệt GĐ KD → Duyệt GĐ Khối → Duyệt Kế toán → Duyệt BOD, đúng thứ tự thời gian | P1 |

---

## 6. NÚT "LÀM LẠI TỪ ĐẦU" (TC-RST)

| Mã TC | Mục tiêu | Điều kiện tiên quyết | Bước thực hiện | Kết quả mong đợi | Ưu tiên |
|---|---|---|---|---|---|
| RST-01 | Hiện popup xác nhận | PAKD đang chờ duyệt, đúng lượt | Bấm **"Làm lại từ đầu"** (nút cam) | Mở popup "Xác nhận làm lại từ đầu" với nội dung cảnh báo; **chưa** thay đổi trạng thái | P1 |
| RST-02 | Hủy popup | RST-01 | Bấm "Hủy" hoặc click nền tối | Popup đóng, PAKD giữ nguyên trạng thái chờ duyệt | P1 |
| RST-03 | Xác nhận làm lại | RST-01 | Bấm "Xác nhận làm lại từ đầu" | Trạng thái → **Bị trả lại**; lịch sử ghi dòng **"Làm lại từ đầu"** (badge cam); người lập sửa & nộp lại từ bước đầu | P1 |
| RST-04 | Hiện ở mọi cấp | Lần lượt để PAKD ở 4 bước chờ | Kiểm tra thanh duyệt của từng cấp | Cả GĐ KD / GĐ Khối / Kế toán / BOD đều có nút "Làm lại từ đầu" | P2 |

---

## 7. CHI THỰC TẾ THEO TỪNG LẦN (TC-SPT)

| Mã TC | Mục tiêu | Điều kiện tiên quyết | Bước thực hiện | Kết quả mong đợi | Ưu tiên |
|---|---|---|---|---|---|
| SPT-01 | Nhập chi lần 1 | Đăng nhập AM/GĐ KD/GĐ Khối, mở PAKD | Ở KH01 nhập "Số tiền lần này" = 50.000.000 → bấm **"Cập nhật (lần 1)"** | Cột "Tổng chi phí các lần" = 50.000.000 đ (1 lần); %/NS tính đúng; dưới ô hiện "Lần gần nhất: 1 • [ngày giờ]" | P1 |
| SPT-02 | Nhập cộng dồn lần 2 | SPT-01 | Nhập tiếp 30.000.000 → "Cập nhật (lần 2)" | Tổng = 80.000.000 đ (2 lần); nút chuyển "Cập nhật (lần 3)" | P1 |
| SPT-03 | Không nhận khoản ≤ 0 | Ô Số tiền lần này | Để trống / nhập 0 → quan sát nút | Nút "Cập nhật" bị disable (xám) | P2 |
| SPT-04 | Nhập bằng phím Enter | Ô có số > 0 | Gõ số → Enter | Cập nhật như bấm nút | P3 |
| SPT-05 | Lịch sử chi trong popup | SPT-02 | Bấm icon 🕘 "Lịch sử NS" của KH01 | Bảng "Lịch sử cập nhật chi thực tế": Lần / Thời gian / Người cập nhật / Chi lần này / **Tổng lũy kế** — lũy kế tăng dần đúng | P1 |
| SPT-06 | Sửa tổng chi khi đơn CHƯA duyệt | PAKD chưa Hoàn tất, đã có ≥1 lần chi | Ở cột Tổng, bấm **✏ bút chì** → nhập tổng mới → Lưu | Tổng đổi theo giá trị mới; lịch sử thêm dòng chênh lệch ± kèm badge **"Điều chỉnh"** (số âm hiển thị đỏ) | P1 |
| SPT-07 | Khóa chi sau khi BOD duyệt | PAKD Hoàn tất (đã có chi trước duyệt) | Xem cột Tổng chi + popup lịch sử | Không còn nút bút chì; nhãn "đã khóa sau duyệt"; từng dòng lịch sử có icon 🔒 | P1 |
| SPT-08 | Không sửa xuống dưới phần đã khóa | PAKD Hoàn tất → tạo phiếu điều chỉnh (về trạng thái chờ duyệt) | Sửa tổng chi xuống **dưới** mức đã khóa | Báo lỗi "Không thể sửa xuống dưới … — phần này đã được duyệt ở lần trước"; ô hiện "tối thiểu [số] (đã duyệt)" | P1 |
| SPT-09 | Vẫn cộng thêm lần mới sau duyệt | PAKD Hoàn tất | Nhập "Số tiền lần này" → Cập nhật | Vẫn cộng dồn bình thường (chỉ chặn sửa, không chặn thêm) | P2 |
| SPT-10 | Cảnh báo vượt NS từng dòng | KH01 NS 110tr, chi 116tr | Quan sát dòng KH01 | Tổng chi & %/NS hiển thị **đỏ đậm** (105%) | P2 |

---

## 8. TỔNG HỢP NGÂN SÁCH (TC-SUM)

| Mã TC | Mục tiêu | Điều kiện tiên quyết | Bước thực hiện | Kết quả mong đợi | Ưu tiên |
|---|---|---|---|---|---|
| SUM-01 | Thanh tổng hợp 1 dòng | Mở sheet Phương án KD | Quan sát hàng tiêu đề bảng giai đoạn | Cùng 1 hàng: tiêu đề + select giai đoạn (trái) • "NS đã xin / Đã chi (%) / badge trạng thái" (phải) | P2 |
| SUM-02 | Trong ngân sách | Tổng chi < tổng NS, không KH nào vượt | Quan sát badge | Badge **xanh "✓ Trong ngân sách"** | P1 |
| SUM-03 | Vượt cục bộ theo KH | KH01 chi > NS KH01 nhưng tổng chi < tổng NS | Quan sát badge + hover | Badge **cam "⚠ Vượt ở KH01"**; hover hiện tooltip chi tiết `KH01: chi …/NS … (…%)` | P1 |
| SUM-04 | Vượt tổng | Tổng chi > tổng NS | Quan sát badge | Badge **đỏ "⚠ Đã vượt tổng NS"**; số Đã chi màu đỏ | P1 |

---

## 9. PHIẾU ĐIỀU CHỈNH SAU HOÀN TẤT (TC-ADJ)

| Mã TC | Mục tiêu | Điều kiện tiên quyết | Bước thực hiện | Kết quả mong đợi | Ưu tiên |
|---|---|---|---|---|---|
| ADJ-01 | Nút chỉ hiện khi Hoàn tất | PAKD Hoàn tất; đăng nhập AM/GĐ KD/GĐ Khối | Mở màn chi tiết | Có nút cam **"Tạo phiếu điều chỉnh"**; các vai trò khác (Kế toán, BOD…) không thấy | P1 |
| ADJ-02 | Bắt buộc nhập lý do | ADJ-01 | Bấm nút → popup lý do → để trống | Nút "Bắt đầu điều chỉnh" **disable** cho tới khi nhập lý do | P1 |
| ADJ-03 | Vào chế độ điều chỉnh | Nhập lý do → xác nhận | Quan sát màn hình | Banner cam hiện lý do; bảng giai đoạn + Thông tin cơ hội KD + Tài chính chuyển sang **sửa được**; xuất hiện nút "Gửi duyệt" & "Hủy" | P1 |
| ADJ-04 | Hủy điều chỉnh khôi phục dữ liệu | ADJ-03, đã sửa vài ô | Bấm "Hủy" | Mọi thay đổi (cả bảng KH lẫn thông tin chung) **khôi phục như cũ**, thoát chế độ điều chỉnh, không ghi log | P1 |
| ADJ-05 | Gửi duyệt → trình lại từ đầu | ADJ-03, sửa NS KH01 + tên KH | Bấm **"Gửi duyệt"** | Trạng thái → **Chờ GĐ Kinh doanh**; lịch sử phê duyệt có mốc "Điều chỉnh phương án — nộp duyệt lại (N thay đổi). Lý do: …" | P1 |
| ADJ-06 | Log cũ → mới theo trường | ADJ-05 | Mở popup Lịch sử NS của KH01 | Mục "Lịch sử điều chỉnh phương án (KH01)": mỗi trường 1 dòng — Thời gian / Người / **Lý do** / Nội dung / **Dữ liệu cũ** (đỏ gạch ngang) / **Sau thay đổi** (xanh) | P1 |
| ADJ-07 | Log thay đổi thông tin chung | ADJ-05 (đã sửa tên KH/doanh thu) | Xem log | Dòng log có Giai đoạn = **"Chung"** cho các trường: Mã KH, Tên KH, Domain, PM, Tiến độ, Doanh thu, Chi phí dự kiến | P2 |
| ADJ-08 | Banner lý do ở mọi cấp duyệt | ADJ-05 | Đăng nhập lần lượt 4 cấp duyệt, mở PAKD | Mỗi cấp thấy banner cam "Phương án vừa được điều chỉnh… **Lý do điều chỉnh:** …" trước khi Duyệt | P1 |
| ADJ-09 | Duyệt lại hết luồng → xóa banner | ADJ-08 | 4 cấp duyệt hết → Hoàn tất | Banner lý do biến mất; có thể tạo phiếu điều chỉnh mới | P1 |
| ADJ-10 | Phiếu điều chỉnh bị trả lại | ADJ-05; một cấp bấm Từ chối | Đăng nhập AM/GĐ | Trạng thái Bị trả lại; nút đổi thành **"Sửa lại & gửi duyệt"**; popup lý do **prefill lý do cũ**; cho gửi lại kể cả không đổi nội dung | P1 |
| ADJ-11 | Lịch sử phê duyệt gộp luồng phiếu | PAKD có ≥1 phiếu điều chỉnh CP (dữ liệu mẫu PAKD-689) | Xem "Lịch sử phê duyệt" | Các dòng "Phiếu điều chỉnh lần N — Tạo phiếu / Chờ GĐ Khối / …" nền tím, xếp đúng dòng thời gian với luồng gốc | P2 |

---

## 10. DANH SÁCH / ĐƠN CỦA TÔI / BỘ LỌC (TC-LST)

| Mã TC | Mục tiêu | Điều kiện tiên quyết | Bước thực hiện | Kết quả mong đợi | Ưu tiên |
|---|---|---|---|---|---|
| LST-01 | Lọc theo trạng thái | Có PAKD nhiều trạng thái | Bấm từng tab (Nháp / GĐ Kinh doanh / …) | Bảng chỉ hiện đúng trạng thái; số đếm trên tab đúng | P1 |
| LST-02 | Lọc theo giai đoạn KH | Có PAKD ở KH khác nhau | Chọn dropdown "Giai đoạn: KH03" | Chỉ hiện PAKD có giai đoạn hiện tại = KH03; cột "Giai đoạn" hiển thị badge khớp | P1 |
| LST-03 | Tìm kiếm | — | Gõ tên dự án / mã PAKD / số gói thầu | Lọc realtime đúng kết quả; kết hợp được với 2 bộ lọc trên | P2 |
| LST-04 | Tab "Đơn của tôi" | Đăng nhập `am` (có đơn tự lập) | Mở tab "Đơn của tôi" | Chỉ hiện PAKD do Lê Thu Trang lập; số đếm trên tab đúng; các bộ lọc hoạt động trong phạm vi này | P1 |
| LST-05 | Đơn của tôi theo từng user | Đăng nhập `gdkd` | Mở tab "Đơn của tôi" | Chỉ thấy đơn do Đỗ Mạnh Cường lập (không thấy đơn của AM) | P2 |
| LST-06 | Mở chi tiết | Danh sách có dữ liệu | Bấm mã PAKD hoặc icon 👁 | Vào đúng màn chi tiết PAKD đó; breadcrumb hiện mã | P1 |

---

## 11. HIỂN THỊ THÔNG TIN CHI TIẾT (TC-DTL)

| Mã TC | Mục tiêu | Điều kiện tiên quyết | Bước thực hiện | Kết quả mong đợi | Ưu tiên |
|---|---|---|---|---|---|
| DTL-01 | Trạng thái đơn + Người duyệt tiếp theo | Mở PAKD bất kỳ | Xem góc phải header | 2 dòng: "Trạng thái đơn: [chấm màu + nhãn]" và "Người duyệt tiếp theo: [tên (vai trò)]"; Nháp → "Chưa nộp…"; Bị trả lại → "Chờ người lập chỉnh sửa…"; Hoàn tất → "Đã hoàn tất…" | P1 |
| DTL-02 | Mã dự án 1 dòng | PAKD có mã + ≥2 mã outsource | Xem khối Mã dự án | Tất cả trên 1 hàng: `MÃ TỔNG … │ MÃ KINH DOANH … │ MÃ SẢN XUẤT … │ MÃ OUTSOURCE (2): a — b` (gạch ngang giữa các mã outsource; hover mã thấy nội dung thuê ngoài) | P2 |
| DTL-03 | Mở mã outsource | Đăng nhập `am`, PAKD có mã SX | Nhập nội dung thuê ngoài → "Mở mã outsource" | Sinh mã con `…2.1`, `…2.2` tăng dần, hiển thị ngay trên dòng mã | P2 |
| DTL-04 | Số tiền hiển thị dấu phân cách khi gõ | Bất kỳ ô tiền nào (NS, chi phí, chi thực tế) | Gõ số dài | Hiển thị `1.234.567` ngay khi gõ; giá trị lưu vẫn là số đúng | P2 |
| DTL-05 | Sheet Sản xuất chỉ mở sau Kế toán duyệt | PAKD trước bước Kế toán | Mở tab "Sản xuất — Triển khai" | Thông báo "⏳ Chưa mở triển khai…"; không thêm được đầu việc | P2 |

---

## 12. CA KIỂM THỬ HỒI QUY NHANH (SMOKE — chạy sau mỗi lần build)

1. **SMK-01:** Đăng nhập AM → Tạo dự án → có mã ngay → Nộp trình duyệt. *(CRT-01, CRT-04, FLW-01)*
2. **SMK-02:** 4 cấp duyệt tuần tự → Hoàn tất, sinh Jira, khóa chi phí + khóa chi thực tế. *(FLW-02→05)*
3. **SMK-03:** Nhập chi 2 lần ở KH01 → sửa tổng (khi chưa duyệt) → kiểm tra log Điều chỉnh. *(SPT-01,02,06)*
4. **SMK-04:** Hoàn tất → Tạo phiếu điều chỉnh (lý do bắt buộc) → sửa → Gửi duyệt → banner lý do ở cấp duyệt → duyệt hết → log cũ→mới trong popup KH. *(ADJ-02,03,05,06,08,09)*
5. **SMK-05:** Từ chối / Làm lại từ đầu → về người lập → nộp lại chạy từ đầu. *(FLW-07, RST-03, FLW-08)*

---

## Ghi chú cho tester

- Dữ liệu là **in-memory** (mock): refresh trang sẽ mất PAKD tạo mới trong phiên — khi test chuỗi dài, làm liền mạch không refresh (trừ AUTH-04 chỉ test giữ đăng nhập).
- Có thể dùng dữ liệu mẫu sẵn: **PAKD-689** (Hoàn tất, có phiếu điều chỉnh CP, có mã outsource) để test nhanh nhóm ADJ/DTL.
- Đổi vai trò bằng cách Đăng xuất → đăng nhập tài khoản tương ứng ở bảng đầu tài liệu.
