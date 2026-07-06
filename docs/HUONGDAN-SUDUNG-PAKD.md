# HƯỚNG DẪN SỬ DỤNG — QUẢN LÝ PAKD ĐẤU THẦU

**Đối tượng:** AM (Account Manager) • Giám đốc Kinh doanh • Giám đốc Khối
**Phạm vi:** Tạo mới dự án → Trình duyệt → Phê duyệt → Sửa đổi phương án & Xin duyệt lại
**Phiên bản:** 1.0 • Cập nhật: 2026-07-05

---

## 0. ĐĂNG NHẬP & TỔNG QUAN

### 0.1. Tài khoản (mật khẩu chung `123456`)
| Vai trò | Username | Người dùng mẫu |
|---|---|---|
| AM | `am` | Lê Thu Trang |
| Giám đốc Kinh doanh | `gdkd` | Đỗ Mạnh Cường |
| Giám đốc Khối | `gdkhoi` | Nguyễn Tiến Dũng |
| Kế toán | `ketoan` | Lê Thị Mai |
| BOD | `bod` | Phạm Minh Hải |

> Đổi vai trò: bấm **Đăng xuất** (biểu tượng ↪ góc phải header) → đăng nhập tài khoản khác.

### 0.2. Các thành phần chung trên màn hình
- **Thanh tab:** Danh sách PAKD • Đơn của tôi • Hàng đợi duyệt • Phiếu điều chỉnh CP • Nhật ký hệ thống (BOD/Admin có thêm **Dashboard BOD**).
- **🔔 Chuông thông báo** (góc phải): số hồ sơ đang chờ **chính vai trò của bạn** xử lý — bấm để mở nhanh.
- **Nút "+ Tạo dự án"** (chỉ AM / GĐ Kinh doanh / GĐ Khối).

### 0.3. Luồng duyệt tổng quát
```
Người lập  →  GĐ Kinh doanh  →  GĐ Khối (khóa chi phí)  →  Kế toán  →  BOD  →  HOÀN TẤT
                    (mỗi cấp: Duyệt | Làm lại từ đầu | Từ chối)
```
- **Bỏ qua cấp:** khi tạo dự án, nếu **không chọn** GĐ Kinh doanh và/hoặc GĐ Khối → luồng **tự bỏ qua** cấp đó.
- **Bị trả lại / Làm lại từ đầu** → hồ sơ về người lập để sửa & **nộp lại từ đầu**.

---

## PHẦN A — AM (ACCOUNT MANAGER)

AM là người khởi tạo và vận hành chính của PAKD.

### A.1. Tạo mới dự án
1. Ở màn **Danh sách PAKD**, bấm **+ Tạo dự án**.
2. Điền thông tin trong popup *"Tạo phương án kinh doanh"* (lưu ở dạng **nháp**):
   - **Tên dự án** *(bắt buộc)*, **Tên khách hàng** *(bắt buộc)*.
   - **Mã khách hàng**: để trống → tự sinh.
   - **Giám đốc khối / Giám đốc kinh doanh**: chọn người duyệt; hoặc chọn **"— Bỏ qua —"** nếu không cần cấp đó duyệt.
   - **Domain**, **Thời gian bắt đầu/kết thúc**.
   - **Doanh thu tối thiểu dự kiến** *(bắt buộc, > 0)*, **Chi phí dự kiến tối đa** → hệ thống tự tính **Lợi nhuận gộp %**.
3. Bấm **Lưu**. Hệ thống tạo PAKD trạng thái **Nháp** và **sinh ngay Mã dự án** (Mã tổng `022.xxx`, Mã KD `.1`, Mã SX `.2`).

### A.2. Nhập thông tin phương án (bảng giai đoạn KH01–KH06)
1. Vào tab **"Phương án kinh doanh (KH01–KH06)"**.
2. Với mỗi giai đoạn KH: nhập **Tên giai đoạn, Ngày bắt đầu/kết thúc, Mục tiêu, Kết quả đầu ra, NS Sản xuất, NS Kinh doanh**.
   - Ô số tiền tự hiển thị **dấu phân cách** khi gõ (vd `50.000.000`).
   - **Giai đoạn hiện tại** tự nhảy tới KH xa nhất đã có thông tin (chọn tay được qua dropdown).
3. Tùy chọn:
   - **Import thông tin**: nạp nhiều giai đoạn từ file CSV / dán từ Excel (có nút *Tải file mẫu*).
   - **Thêm giai đoạn** (KH07…), **xóa giai đoạn** (nút 🗑).
4. Chỉnh xong bấm **Lưu nháp** (xác nhận "Đã lưu nháp").

### A.3. Mở mã outsource (nếu có thuê ngoài)
- Ngay sau khi tạo dự án (đã có mã sản xuất), ở khối **Mã dự án** nhập nội dung thuê ngoài → **Mở mã outsource** → sinh mã con `022.xxx.2.1`, `.2.2`…

### A.4. Đánh dấu dự án trọng điểm (tùy chọn)
- Trong thông tin dự án, bấm **⭐ Đánh dấu dự án trọng điểm** → **popup xác nhận** → dự án gắn cờ ⭐ (hiện ở Danh sách, bộ lọc "Trọng điểm", Dashboard BOD).

### A.5. Nộp trình duyệt
1. Bấm **Nộp trình duyệt**.
2. Trạng thái chuyển sang **Chờ [cấp duyệt đầu tiên]**; header hiện **"Người duyệt tiếp theo"**; hồ sơ vào **Hàng đợi duyệt** của cấp đó và hiện trên **🔔 chuông** của họ.

> ⚠️ Khi PAKD **đang chờ duyệt**, AM **không sửa** được phương án. Chỉ sửa khi **Nháp** hoặc **Bị trả lại**.

### A.6. Khi bị Trả lại / Làm lại từ đầu
1. 🔔 / Danh sách hiện PAKD trạng thái **Bị trả lại** (xem lý do ở **Lịch sử phê duyệt / Lịch sử trao đổi**).
2. AM **sửa lại** thông tin (bảng giai đoạn A.2).
3. Bấm **Nộp trình duyệt** → luồng chạy **lại từ đầu**.

### A.7. Nhập chi thực tế (khi dự án đang triển khai)
1. Ở cột **"Số tiền lần này"** của một KH: nhập số → **Cập nhật (lần N)** → cộng dồn vào **"Tổng chi phí các lần"** (mỗi lần ghi log).
2. **Sửa lại tổng chi** (khi đơn chưa duyệt xong): bấm **✏ bút chì** ở cột Tổng → nhập lại → Lưu (ghi log "Điều chỉnh").
3. Bấm **icon 🕘 (Lịch sử NS)** để xem chi tiết từng lần / lịch sử điều chỉnh.
   - Sau khi **BOD duyệt hoàn tất**, chi thực tế bị **khóa** (🔒), không sửa được.

---

## PHẦN B — GIÁM ĐỐC KINH DOANH & GIÁM ĐỐC KHỐI (CẤP DUYỆT)

> Cả hai vai trò cùng thao tác duyệt như nhau; khác biệt: **GĐ Khối duyệt sẽ khóa chi phí**. Cả hai cũng **tạo được dự án** như AM (Phần A).

### B.1. Nhận thông báo & mở hồ sơ chờ duyệt
1. Đăng nhập đúng vai trò → **🔔 chuông** hiện số hồ sơ chờ bạn.
2. Bấm chuông → chọn hồ sơ, **hoặc** vào tab **"Hàng đợi duyệt"** để xem danh sách đầy đủ (mã, tên, chủ đầu tư, giá dự thầu, chi phí, bước chờ).

### B.2. Xem xét & Phê duyệt
1. Mở PAKD → xem **Thông tin cơ hội, Tài chính, bảng giai đoạn (KH), Tổng hợp ngân sách** (badge cảnh báo vượt NS), **Lịch sử phê duyệt**.
2. Ở thanh vàng *"Hồ sơ đang chờ … xử lý"*, nhập **Ý kiến** (tùy chọn) rồi chọn:
   - **✓ Duyệt** → chuyển sang **cấp kế tiếp còn hiệu lực**. (GĐ Khối duyệt → **ĐÃ KHÓA CHI PHÍ**.)
   - **↻ Làm lại từ đầu** → **popup xác nhận** → trả về người lập, duyệt lại từ đầu.
   - **⊘ Từ chối** → trả về người lập (Bị trả lại).
3. Có thể duyệt trực tiếp ngay trong tab **Hàng đợi duyệt** (nút Duyệt / Trả lại trên từng dòng).

> Bạn chỉ thấy nút duyệt khi hồ sơ **đúng đến lượt vai trò của bạn**.

### B.3. Lưu ý cho Giám đốc Khối
- Khi GĐ Khối **Duyệt**, hệ thống **khóa chi phí** (badge *ĐÃ KHÓA CHI PHÍ*): từ đây mọi thay đổi phương án phải qua **phiếu điều chỉnh** (Phần C).

---

## PHẦN C — SỬA ĐỔI PHƯƠNG ÁN SAU DUYỆT & XIN DUYỆT LẠI (CÓ PHIÊN BẢN)

Áp dụng khi PAKD đã **Hoàn tất** và cần điều chỉnh. Thực hiện bởi **AM / GĐ Kinh doanh / GĐ Khối**.

### C.1. Tạo phiếu điều chỉnh
1. Mở PAKD (trạng thái **Hoàn tất**) → bấm **Tạo phiếu điều chỉnh** (nút cam, góc phải).
2. **Popup nhập lý do** *(bắt buộc)* → **Bắt đầu điều chỉnh**.
3. Hệ thống vào **chế độ điều chỉnh**:
   - Thanh phiên bản hiển thị: **V1 · đã chốt · hiện hành › V2 · đang soạn điều chỉnh**.
   - Bảng giai đoạn + Thông tin cơ hội/Tài chính **mở khóa để sửa**. Dữ liệu **V2 kế thừa nguyên vẹn V1** để chỉnh tiếp.

### C.2. Chỉnh sửa & Gửi duyệt lại
1. Sửa các trường cần thiết (tên, ngày, mục tiêu, kết quả, ngân sách, thông tin KH, doanh thu…).
2. Bấm **Gửi duyệt** (hoặc **Hủy** để hoàn tác toàn bộ, không ghi log).
3. Hệ thống:
   - **Đóng băng V1** để xem lại; tạo **V2 đang xin duyệt lại**.
   - Ghi **log cũ → mới** cho từng trường, gắn số phiên bản.
   - Đưa PAKD **quay lại luồng duyệt từ đầu** (theo đúng luồng động — bỏ qua cấp GĐ không gán).

### C.3. Các cấp duyệt lại thấy lý do
- Ở mỗi cấp duyệt lại, đầu màn hiển thị **banner cam**: *"Phương án vừa được điều chỉnh — Lý do: …"*.
- Người duyệt xem **bảng thay đổi cũ→mới** trong popup **Lịch sử NS** (nhóm theo **Ver 1, Ver 2…**), rồi **Duyệt / Làm lại từ đầu / Từ chối** như bình thường.
- Duyệt hết → PAKD **Hoàn tất** trở lại, **V2 thành "đã chốt · hiện hành"**, banner lý do biến mất.

### C.4. Xem lại phiên bản đã chốt
- Trên **thanh phiên bản**, bấm chip **`V1 · đã chốt duyệt`** → xem bảng V1 **chỉ đọc**; bấm **"← Về bản hiện hành"** để quay lại.

### C.5. Nếu phiếu điều chỉnh bị Trả lại
- Trạng thái về **Bị trả lại**; nút đổi thành **"Sửa lại & gửi duyệt"** (popup **tự điền lại lý do cũ**). Sửa xong Gửi duyệt lại (giữ nguyên số V, không tạo version mới).

---

## PHẦN D — KỊCH BẢN END-TO-END (LÀM MỘT LƯỢT)

> Thực hiện liền mạch, **không refresh trang** (dữ liệu in-memory).

| Bước | Đăng nhập | Thao tác |
|---|---|---|
| 1 | `am` | Tạo dự án (chọn GĐ Kinh doanh + GĐ Khối) → nhập bảng giai đoạn → **Nộp trình duyệt** |
| 2 | `gdkd` | 🔔 → mở hồ sơ → **Duyệt** |
| 3 | `gdkhoi` | **Duyệt** (chi phí bị khóa) |
| 4 | `ketoan` | **Duyệt** |
| 5 | `bod` | **Duyệt** → **Hoàn tất** (sinh Jira, khóa chi thực tế) |
| 6 | `am` | Mở PAKD → **Tạo phiếu điều chỉnh** → nhập lý do → sửa NS → **Gửi duyệt** (tạo V2) |
| 7 | `gdkd`→`bod` | Lần lượt **Duyệt lại** (mỗi cấp thấy banner lý do) → **Hoàn tất**, V2 chốt |
| 8 | bất kỳ | Bấm chip **V1** để xem lại bản gốc; xem **Lịch sử NS** để đối chiếu cũ→mới |

**Kịch bản bỏ qua cấp:** ở bước 1, chọn **"— Bỏ qua —"** cho GĐ Kinh doanh → sau khi Nộp, hồ sơ vào thẳng **GĐ Khối** (bỏ qua bước 2).

**Kịch bản bị trả lại:** ở bất kỳ bước duyệt nào bấm **Từ chối / Làm lại từ đầu** → đăng nhập `am` sửa → **Nộp trình duyệt** lại.

---

## PHẦN E — CÂU HỎI THƯỜNG GẶP

- **Không sửa được phương án?** → PAKD đang chờ duyệt. Chỉ sửa khi **Nháp / Bị trả lại**, hoặc qua **Tạo phiếu điều chỉnh** sau khi Hoàn tất.
- **Không thấy nút Tạo dự án?** → chỉ AM / GĐ Kinh doanh / GĐ Khối có quyền.
- **Không thấy nút Duyệt?** → chưa đến lượt vai trò của bạn.
- **Không sửa được chi thực tế?** → đơn đã **Hoàn tất** (khóa 🔒). Tạo phiếu điều chỉnh nếu cần.
- **Mất dữ liệu sau khi refresh?** → hệ thống đang chạy dữ liệu mẫu (in-memory); mỗi lần tải lại về trạng thái ban đầu.
