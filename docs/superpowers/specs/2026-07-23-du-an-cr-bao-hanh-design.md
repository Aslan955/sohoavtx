# Dự án CR / Bảo hành (mã .3 / .4)

Ngày: 2026-07-23

## Mục tiêu

Một mã tổng dự án (vd `022.689`) có thêm hai loại project phát sinh **sau khi sản xuất xong**:
CR và Bảo hành. Mỗi loại là một project riêng nhưng dùng chung mã tổng của dự án cha.

Bấm "+ Tạo dự án" mở popup chọn: Dự án mới / Dự án CR / Dự án Bảo hành. Danh sách thêm cột
"Loại hình" để nhận biết.

## Mô hình mã — bốn mã ngang hàng dưới một mã tổng

| Mã | Ý nghĩa | Thuộc |
|---|---|---|
| `022.689.1` | Mã kinh doanh | dự án chính |
| `022.689.2` | Mã sản xuất | dự án chính |
| `022.689.3` | Mã CR | project riêng |
| `022.689.4` | Mã bảo hành | project riêng |

CR và Bảo hành **ngang hàng** với mã kinh doanh và sản xuất — không nằm dưới mã sản xuất như
mã outsource. Dự án CR có đúng một mã `022.689.3`, không sinh mã con.

## Mô hình dữ liệu

Ba trường mới trên `Pakd`:

- `projectKind?: 'CR' | 'WARRANTY'` — không có = dự án chính
- `parentPakdId?: string` — id dự án cha
- `projectCode?: string` — mã riêng `<mã tổng>.3` / `.4`

Dự án CR/BH mượn `masterCode` của cha. Nó **không có** `businessCode`, `productionCode`,
`outsourceCodes` — vì đó là các mã của dự án chính.

Vì CR/BH vẫn là một `Pakd` đầy đủ, toàn bộ luồng sẵn có (6 giai đoạn KH01–KH06, duyệt nhiều
cấp, P&L, Kanban) chạy nguyên vẹn không cần sửa.

## Sinh mã và ràng buộc — `createChildPakd`

Đặt trong `projectWorkflow.ts`, trả `{pakd?, error?}` + ghi audit log, đúng pattern `runAction`.

Guard (kiểm tra trong hàm, không chỉ ở UI):

1. Vai trò tạo được dự án (`CREATE_PROJECT_ROLES`)
2. Cha phải là dự án chính — **không tạo CR của CR** (`parent.projectKind` rỗng)
3. Cha đã có mã tổng
4. Mỗi cha chỉ 1 CR và 1 Bảo hành (`childOfKind`)

Dự án con kế thừa khách hàng, GĐ khối, GĐ kinh doanh, domain của cha; tên mặc định
`[CR] <tên cha>` / `[Bảo hành] <tên cha>`, sửa được sau.

## Giao diện

**Popup `CreateProjectModal.tsx`** (file mới): ba lựa chọn dạng thẻ. Chọn CR/BH hiện dropdown
dự án cha — chỉ liệt kê dự án chính đã có mã tổng và **chưa** có loại con đó. Có preview mã
sẽ sinh. Nút tạo bị vô hiệu khi không còn cha khả dụng.

**Danh sách:** cột "Loại hình" mới (badge tím CR, badge teal BH, `—` cho dự án chính); cột
"Mã tổng" hiển thị `projectCode` nếu có (nên dòng CR hiện `022.689.3`).

**Màn chi tiết:** dự án CR/BH hiện `Mã tổng` + `Mã CR/BH` kèm giải thích ngang hàng, ẩn hàng
mã kinh doanh/sản xuất/outsource và nút "Cập nhật PM" / "Sinh lại mã" (không áp dụng cho con).

## Dọn dẹp kèm theo

Component `CreateModal` cũ (~78 dòng) và state `createOpen` là code chết — popup tạo dự án cũ
đã bị thay bằng `createDraftInline` từ trước nhưng chưa xóa. Vì lối vào "Tạo dự án" nay trỏ tới
popup mới, `CreateModal` được xóa để không còn hai popup tạo dự án song song. `createOpen` được
tái sử dụng cho popup mới.

## Kiểm thử đã chạy

- `tsc --noEmit` sạch, console trình duyệt sạch
- Tạo CR cho 022.689 → mã `022.689.3`, tên `[CR] ...`, kế thừa khách hàng; màn chi tiết ẩn
  mã KD/SX đúng; danh sách hiện cột Loại hình = CR, mã tổng = 022.689.3
- Tạo Bảo hành cho cùng 022.689 → mã `022.689.4` (CR và BH độc lập)
- Sau khi có CR, 022.689 bị loại khỏi dropdown tạo CR (chặn trùng), nhưng vẫn chọn được cho BH
- Dropdown cha không liệt kê dự án CR/BH (không tạo con của con)
- Luồng "Dự án mới" giữ nguyên: tạo nháp với đủ mã tổng + KD + SX

## Giới hạn đã biết

State trong bộ nhớ, rời module rồi quay lại sẽ mất — đặc tính sẵn có của bản demo.
