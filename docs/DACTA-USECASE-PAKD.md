# ĐẶC TẢ HỆ THỐNG & USE CASE — MODULE QUẢN LÝ PAKD ĐẤU THẦU

**Phiên bản:** 1.0 • **Ngày:** 2026-07-05 • **Đi kèm:** [TESTCASES-PAKD.md](./TESTCASES-PAKD.md)
**Mục đích:** Cung cấp đặc tả để AI (hoặc tester) tự động kiểm thử theo use case; mỗi UC ánh xạ tới nhóm test case tương ứng.

---

## PHẦN A — TỔNG QUAN & CÁCH VẬN HÀNH

### A.1. Hệ thống là gì
Hệ thống quản lý **Phương án Kinh doanh gói thầu (PAKD)** cho doanh nghiệp CNTT: từ khi hình thành cơ hội, lập ngân sách nhiều giai đoạn (KH01–KH06+), trình **duyệt qua nhiều cấp**, sinh mã dự án, theo dõi **chi thực tế**, đến **điều chỉnh có phiên bản** sau khi hoàn tất. Dữ liệu hiện lưu **in-memory** (mock, mất khi refresh trang).

### A.2. Vòng đời một PAKD (end-to-end)
```
[Tạo dự án] → DRAFT ─(Nộp)→ PENDING_SALES_DIRECTOR ─(GĐ KD duyệt)→
PENDING_BUSINESS_DIRECTOR ─(GĐ Khối duyệt = KHÓA chi phí)→
PENDING_ACCOUNTANT ─(Kế toán duyệt)→ PENDING_BOD ─(BOD duyệt)→
COMPLETED (sinh Jira, KHÓA chi thực tế)

Ở mọi cấp chờ duyệt: Duyệt | Làm lại từ đầu | Từ chối
  → "Làm lại từ đầu" / "Từ chối" ⇒ RETURNED ⇒ người lập sửa & Nộp lại (chạy lại từ đầu)

Sau COMPLETED: "Tạo phiếu điều chỉnh" ⇒ sửa trực tiếp (V2 = bản sao V1) ⇒ Gửi duyệt
  ⇒ chạy lại toàn luồng duyệt; V1 đóng băng để xem lại; mọi thay đổi ghi log cũ→mới theo phiên bản
```

### A.3. Nguyên tắc trạng thái & khóa
| Trạng thái | Nhãn | Ý nghĩa |
|---|---|---|
| DRAFT | Nháp | Người lập soạn thảo, sửa tự do |
| PENDING_SALES_DIRECTOR | Chờ GĐ Kinh doanh | Đang chờ cấp 1 |
| PENDING_BUSINESS_DIRECTOR | Chờ GĐ Khối | Cấp 2 — khi duyệt sẽ **khóa chi phí** |
| PENDING_ACCOUNTANT | Chờ Kế toán | Cấp 3 |
| PENDING_BOD | Chờ BOD | Cấp 4 |
| COMPLETED | Hoàn tất | Sinh Jira, **khóa chi thực tế** đã nhập |
| RETURNED | Bị trả lại | Trả về người lập để sửa & nộp lại |

- **Mã dự án** (022.xxx / .1 / .2): sinh **ngay khi tạo** (loại đuôi 49, 53).
- **Khóa chi phí** (`locked`): bật khi GĐ Khối duyệt.
- **Giai đoạn hiện tại**: tự động = KH xa nhất đã nhập thông tin (ngày/mục tiêu/kết quả/ngân sách).

---

## PHẦN B — CÁC ACTOR

| Actor | Username | Vai trò hệ thống | Quyền chính |
|---|---|---|---|
| **AM (Account Manager)** | `am` | SALE | Tạo/sửa PAKD, nộp duyệt, nhập chi thực tế, tạo phiếu điều chỉnh, mở mã outsource |
| **GĐ Kinh doanh** | `gdkd` | SALES_DIRECTOR | Như AM (tạo/sửa/điều chỉnh) **+ duyệt cấp 1** |
| **GĐ Khối** | `gdkhoi` | BUSINESS_DIRECTOR | Như AM **+ duyệt cấp 2 (khóa chi phí)** |
| **Kế toán** | `ketoan` | ACCOUNTANT | Duyệt cấp 3 (thẩm định ngân sách) |
| **BOD (Ban Giám đốc)** | `bod` | BOD | Duyệt cấp 4 (cuối) + xem **Dashboard BOD** |
| **IT** | `it` | IT | (Tạo Jira — hiện tự động) |
| **Khối Sản xuất** | `sanxuat` | PRODUCTION | Nhập đầu việc triển khai (sheet Sản xuất) |
| **Admin** | `admin` | ADMIN | Toàn quyền + Dashboard BOD |

> Mật khẩu chung: `123456`. Đổi actor bằng cách Đăng xuất → đăng nhập tài khoản tương ứng.

**Quy tắc phân quyền quan trọng (business rules):**
- **BR-01:** Chỉ SALE / SALES_DIRECTOR / BUSINESS_DIRECTOR thấy nút **Tạo dự án** và sửa được PAKD ở DRAFT/RETURNED.
- **BR-02:** Mỗi cấp chỉ duyệt được khi PAKD đang ở đúng trạng thái của cấp mình (không phải lượt → không thấy nút duyệt).
- **BR-03:** Không sửa được phương án khi đang chờ duyệt; chỉ sửa khi Nháp / Bị trả lại / (sau hoàn tất) qua phiếu điều chỉnh.
- **BR-04:** Chi thực tế đã nhập chỉ sửa được khi đơn **chưa được duyệt** (COMPLETED thì khóa; không sửa xuống dưới phần đã khóa).
- **BR-05:** Tạo phiếu điều chỉnh **bắt buộc nhập lý do**; lý do hiển thị cho mọi cấp duyệt lại.
- **BR-06:** Chỉ **BOD / ADMIN** thấy tab **Dashboard BOD**.

---

## PHẦN C — ĐẶC TẢ USE CASE

> Định dạng mỗi UC: **Actor • Tiền điều kiện • Kích hoạt • Luồng chính • Luồng thay thế/ngoại lệ • Hậu điều kiện**. Cột "Test map" chỉ tới nhóm test case trong TESTCASES-PAKD.md.

### UC-01 — Đăng nhập & xác định vai trò
- **Actor:** Mọi actor • **Test map:** TC-AUTH
- **Tiền điều kiện:** Có tài khoản hợp lệ.
- **Luồng chính:** 1) Mở app → màn Login. 2) Nhập username/password. 3) Hệ thống xác thực → vào màn Danh sách; hiển thị tên + vai trò góc phải; menu/tab hiển thị theo quyền.
- **Ngoại lệ:** Sai mật khẩu → báo lỗi, ở lại Login.
- **Hậu điều kiện:** Phiên lưu ở localStorage (F5 giữ đăng nhập).

### UC-02 — Tạo dự án (PAKD) mới
- **Actor:** AM / GĐ KD / GĐ Khối • **Test map:** TC-CREATE, TC-EDIT
- **Tiền điều kiện:** Đã đăng nhập đúng vai trò (BR-01).
- **Kích hoạt:** Bấm **Tạo dự án**.
- **Luồng chính:** 1) Nhập Tên dự án*, Tên KH*, chọn GĐ Khối*, GĐ KD, Domain, Doanh thu*, Chi phí dự kiến. 2) Bấm **Lưu**. 3) Hệ thống tạo PAKD **DRAFT**, **sinh mã ngay** (022.xxx/.1/.2, không đuôi 49/53), mở màn chi tiết.
- **Ngoại lệ:** Thiếu trường bắt buộc → báo lỗi; Doanh thu ≤ 0 → báo lỗi.
- **Hậu điều kiện:** PAKD xuất hiện ở Danh sách & "Đơn của tôi"; version = V1.

### UC-03 — Nhập/sửa thông tin phương án (bảng giai đoạn KH)
- **Actor:** Người lập (AM/GĐ KD/GĐ Khối) • **Test map:** TC-EDIT, TC-IMP
- **Tiền điều kiện:** PAKD ở DRAFT hoặc RETURNED (chưa khóa).
- **Luồng chính:** 1) Sửa thông tin cơ hội/tài chính (mã KH, tên KH, domain, PM, tiến độ, doanh thu, chi phí). 2) Nhập từng giai đoạn KH: tên, ngày bắt đầu/kết thúc, mục tiêu, kết quả đầu ra, NS Sản xuất, NS Kinh doanh. 3) Thêm/xóa giai đoạn nếu cần. 4) (Tùy chọn) **Import** danh sách giai đoạn từ CSV/dán Excel.
- **Quy tắc:** Giai đoạn hiện tại tự nhảy tới KH xa nhất có thông tin; cột Tổng & dòng Tổng tự tính; ô số hiện dấu phân cách khi gõ.
- **Ngoại lệ:** PAKD đang chờ duyệt → không sửa được (BR-03).
- **Hậu điều kiện:** Dữ liệu lưu vào state; có thể "Lưu nháp" hoặc "Nộp trình duyệt".

### UC-04 — Nộp trình duyệt
- **Actor:** Người lập • **Test map:** TC-FLOW (FLW-01)
- **Tiền điều kiện:** PAKD DRAFT/RETURNED, có ≥1 giai đoạn.
- **Luồng chính:** 1) Bấm **Nộp trình duyệt**. 2) Trạng thái → Chờ GĐ Kinh doanh; ghi mốc "Nộp" vào Lịch sử phê duyệt; header hiện "Người duyệt tiếp theo".
- **Hậu điều kiện:** PAKD vào Hàng đợi duyệt của GĐ Kinh doanh.

### UC-05 — Phê duyệt một cấp
- **Actor:** GĐ KD / GĐ Khối / Kế toán / BOD • **Test map:** TC-FLOW (FLW-02→06, 09, 10)
- **Tiền điều kiện:** PAKD đang chờ đúng cấp của actor (BR-02).
- **Luồng chính:** 1) Mở PAKD (hoặc tab Hàng đợi duyệt). 2) Nhập ý kiến (tùy chọn). 3) Bấm **Duyệt**. 4) Hệ thống chuyển sang cấp kế; nếu GĐ Khối duyệt → **khóa chi phí + hiển thị badge**; nếu BOD duyệt → **COMPLETED**, sinh Jira, **khóa chi thực tế**.
- **Luồng thay thế:** Không phải lượt actor → không có nút Duyệt.
- **Hậu điều kiện:** Lịch sử phê duyệt cộng thêm 1 dòng; trạng thái tiến 1 bước.

### UC-06 — Từ chối / Làm lại từ đầu
- **Actor:** Cấp đang duyệt • **Test map:** TC-FLOW (FLW-07,08), TC-RST
- **Tiền điều kiện:** PAKD đang chờ duyệt.
- **Luồng chính (Từ chối):** Nhập lý do → **Từ chối** → trạng thái RETURNED.
- **Luồng chính (Làm lại từ đầu):** Bấm **Làm lại từ đầu** → **popup xác nhận** → xác nhận → RETURNED (ghi nhãn "Làm lại từ đầu").
- **Luồng tiếp:** Người lập sửa (UC-03) → **Nộp lại** → chạy lại **từ cấp đầu tiên**.
- **Ngoại lệ:** Hủy popup → giữ nguyên trạng thái.
- **Hậu điều kiện:** PAKD RETURNED, hiển thị banner/ghi chú lý do.

### UC-07 — Nhập chi thực tế theo từng lần
- **Actor:** AM / GĐ KD / GĐ Khối • **Test map:** TC-SPT (01→05, 09, 10)
- **Tiền điều kiện:** Mở PAKD; có quyền nhập chi (canEditSpent).
- **Luồng chính:** 1) Ở cột "Số tiền lần này" của một KH, nhập số → bấm **Cập nhật (lần N)** (hoặc Enter). 2) Hệ thống **cộng dồn** vào "Tổng chi phí các lần", ghi 1 dòng log (lần/thời gian/người/số tiền), tính lại %/NS.
- **Quy tắc:** Vượt NS của KH → tổng chi & % hiển thị đỏ; khoản ≤ 0 → nút disable.
- **Hậu điều kiện:** spentLog tăng 1 dòng; tổng hợp ngân sách cập nhật.

### UC-08 — Sửa lại tổng chi đã nhập (có log)
- **Actor:** AM / GĐ KD / GĐ Khối • **Test map:** TC-SPT (06,07,08)
- **Tiền điều kiện:** Đơn **chưa COMPLETED**; KH đã có ≥1 lần chi.
- **Luồng chính:** 1) Bấm **bút chì** ở ô "Tổng chi phí các lần" → nhập tổng mới → Lưu. 2) Hệ thống ghi dòng log "Điều chỉnh" (chênh lệch ±).
- **Ngoại lệ:** COMPLETED → không có nút sửa (khóa, icon 🔒); sửa xuống dưới phần đã khóa → báo lỗi kèm mức tối thiểu.
- **Hậu điều kiện:** Tổng chi cập nhật; log có badge "Điều chỉnh".

### UC-09 — Tạo phiếu điều chỉnh phương án (sau Hoàn tất) — có phiên bản
- **Actor:** AM / GĐ KD / GĐ Khối • **Test map:** TC-ADJ
- **Tiền điều kiện:** PAKD **COMPLETED** (hoặc phiếu điều chỉnh trước đó bị trả lại).
- **Kích hoạt:** Bấm **Tạo phiếu điều chỉnh** (hoặc "Sửa lại & gửi duyệt" nếu bị trả).
- **Luồng chính:**
  1) Popup **nhập lý do (bắt buộc)** → xác nhận.
  2) Vào chế độ điều chỉnh: bảng giai đoạn + thông tin cơ hội/tài chính mở khóa. **Dữ liệu = bản sao nguyên vẹn của bản hiện hành (V1)** để sửa tiếp.
  3) Sửa các trường cần thiết.
  4) Bấm **Gửi duyệt** → hệ thống: (a) **đóng băng snapshot V1** để xem lại; (b) tăng version (V1→V2); (c) sinh **log cũ→mới** cho từng trường thay đổi, gắn số **Ver**; (d) đưa PAKD **quay lại luồng duyệt từ đầu**; (e) đặt `pendingAdjustReason`.
  5) Mỗi cấp duyệt lại thấy **banner lý do điều chỉnh**; duyệt hết → COMPLETED, xóa lý do treo, V2 thành "đã chốt · hiện hành".
- **Luồng thay thế:** Bấm **Hủy** trong lúc điều chỉnh → khôi phục toàn bộ dữ liệu như cũ, không ghi log.
- **Ngoại lệ:** Không nhập lý do → nút "Bắt đầu điều chỉnh" disable.
- **Hậu điều kiện:** versionSnaps thêm V(cũ); planChangeLogs thêm các dòng của V(mới); thanh phiên bản hiển thị trạng thái từng V.

### UC-10 — Xem lại phiên bản đã chốt (read-only)
- **Actor:** Mọi người xem được PAKD • **Test map:** TC-ADJ (bổ sung)
- **Tiền điều kiện:** PAKD có ≥1 phiên bản đã đóng băng (đã từng điều chỉnh).
- **Luồng chính:** 1) Trên **thanh phiên bản**, bấm chip `V1 · đã chốt duyệt`. 2) Bảng giai đoạn chuyển sang **snapshot V1 chỉ đọc**. 3) Bấm **"← Về bản hiện hành"** để quay lại.
- **Quy tắc:** Không xem/sửa được khi đang ở chế độ điều chỉnh; chip không có snapshot thì không bấm.

### UC-11 — Xem lịch sử điều chỉnh theo phiên bản (Ver 1, Ver 2…)
- **Actor:** Mọi người xem PAKD • **Test map:** TC-ADJ (ADJ-06,07)
- **Luồng chính:** 1) Bấm **icon lịch sử** (cột "Lịch sử NS") của một KH — icon hiện **badge số lần thay đổi**. 2) Popup mở, mục "Lịch sử điều chỉnh phương án" **nhóm theo Ver**: mỗi Ver có header (thời gian, người, lý do, số thay đổi) và bảng **Nội dung / Dữ liệu cũ (đỏ) → Sau thay đổi (xanh)**.

### UC-12 — Quản lý danh sách, lọc, "Đơn của tôi"
- **Actor:** Mọi actor • **Test map:** TC-LST
- **Luồng chính:** 1) Lọc theo **trạng thái** (tab) / **giai đoạn KH** (dropdown) / **tìm kiếm** (tên, mã, gói thầu) — kết hợp được. 2) Tab **"Đơn của tôi"** chỉ hiện PAKD do actor hiện tại lập. 3) Bấm mã/icon 👁 mở chi tiết.

### UC-13 — Dashboard BOD (thống kê & cảnh báo)
- **Actor:** BOD / ADMIN • **Test map:** (chưa có TC — cần bổ sung)
- **Tiền điều kiện:** Đăng nhập BOD/Admin (BR-06).
- **Luồng chính:** 1) Mở tab **Dashboard BOD** (badge số cảnh báo). 2) Xem 6 **KPI**, **thanh ngân sách toàn danh mục**, **Trung tâm cảnh báo** (đỏ/cam/xanh), **Watchlist top 10** (đèn giao thông). 3) Bấm dòng cảnh báo / mã PAKD → mở chi tiết dự án đó.
- **Quy tắc cảnh báo:** vượt tổng NS / biên LN < 15% / vượt chi phí dự kiến (đỏ); vượt NS cục bộ theo KH / sắp chạm trần ≥85% / giai đoạn quá hạn (cam); bị trả lại / điều chỉnh chờ duyệt (xanh).

### UC-14 — Mở mã outsource
- **Actor:** AM • **Test map:** TC-DTL (DTL-03)
- **Tiền điều kiện:** PAKD đã có mã sản xuất.
- **Luồng chính:** Nhập nội dung thuê ngoài → **Mở mã outsource** → sinh mã con `…2.1`, `…2.2` tăng dần, hiển thị trên dòng mã dự án.

---

## PHẦN D — HƯỚNG DẪN AI TEST THEO ĐẶC TẢ

1. **Chuẩn bị:** dựng localhost (`npm run dev` → http://localhost:3000). Dữ liệu in-memory → **không refresh giữa chuỗi test**; mỗi kịch bản làm liền mạch.
2. **Cách chạy:** với mỗi UC, thực thi **Luồng chính** rồi tới **Luồng thay thế/ngoại lệ**; đối chiếu **Hậu điều kiện** và các **business rule (BR)**.
3. **Đổi actor:** Đăng xuất → đăng nhập tài khoản ở Phần B để kiểm thử phân quyền (BR-01, BR-02, BR-06).
4. **Bộ dữ liệu nhanh:** PAKD-689 (đã Hoàn tất, có mã outsource) để test UC-09/10/11/14 mà không phải dựng luồng từ đầu.
5. **Tiêu chí Pass/Fail:** một UC PASS khi **tất cả** test case ánh xạ (cột Test map) trong TESTCASES-PAKD.md đều PASS và không vi phạm BR nào.
6. **Kịch bản smoke (chạy nhanh sau mỗi build):** SMK-01→05 trong TESTCASES-PAKD.md phủ UC-02→06, 08, 09.

## PHẦN E — MA TRẬN TRUY VẾT (UC ↔ Test case)

| UC | Tên | Nhóm test case |
|---|---|---|
| UC-01 | Đăng nhập & vai trò | TC-AUTH |
| UC-02 | Tạo dự án | TC-CREATE |
| UC-03 | Nhập/sửa phương án | TC-EDIT, TC-IMP |
| UC-04 | Nộp trình duyệt | FLW-01 |
| UC-05 | Phê duyệt một cấp | FLW-02→06, 09, 10, 11 |
| UC-06 | Từ chối / Làm lại từ đầu | FLW-07,08, TC-RST |
| UC-07 | Nhập chi thực tế | SPT-01→05, 09, 10 |
| UC-08 | Sửa tổng chi có log | SPT-06,07,08 |
| UC-09 | Phiếu điều chỉnh có phiên bản | TC-ADJ |
| UC-10 | Xem lại phiên bản đã chốt | TC-ADJ (bổ sung) |
| UC-11 | Lịch sử điều chỉnh theo Ver | ADJ-06,07 |
| UC-12 | Danh sách / lọc / Đơn của tôi | TC-LST |
| UC-13 | Dashboard BOD | (cần bổ sung test case) |
| UC-14 | Mở mã outsource | DTL-03 |
