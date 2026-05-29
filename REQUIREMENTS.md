# FashionShop — Yêu cầu hệ thống (Requirements)

## Actors

| Actor | Mô tả |
|---|---|
| **Guest** | Khách chưa đăng nhập |
| **User** | Khách hàng đã đăng nhập |
| **Admin** | Quản trị viên |

---

## Guest — Khách chưa đăng nhập

### Được phép

| ID | Yêu cầu |
|---|---|
| G-01 | Xem trang chủ: sản phẩm Nổi Bật, Bán Chạy, Khuyến Mãi (3 tab) |
| G-02 | Duyệt sản phẩm theo danh mục (Quần Tây, Jean, Kaki, Short, Polo, Sơ Mi, Khoác) |
| G-03 | Lọc sản phẩm theo giới tính (Nam / Nữ) |
| G-04 | Tìm kiếm sản phẩm theo tên |
| G-05 | Xem trang chi tiết sản phẩm (hình ảnh, mô tả, giá, kích cỡ) |
| G-06 | Xem điểm rating trung bình và bình luận của sản phẩm |
| G-07 | Đăng ký tài khoản (họ tên, email, SĐT, giới tính, mật khẩu) |
| G-08 | Đăng nhập bằng email + mật khẩu |
| G-09 | Gửi form liên hệ (họ tên, email, nội dung) |

### Bị chặn (redirect về trang login)

| ID | Yêu cầu |
|---|---|
| G-10 | Thêm sản phẩm vào giỏ hàng |
| G-11 | Xem giỏ hàng |
| G-12 | Tiến hành thanh toán |
| G-13 | Xem lịch sử đơn hàng |
| G-14 | Viết đánh giá sản phẩm |
| G-15 | Xem hồ sơ cá nhân và địa chỉ giao hàng |

---

## User — Khách hàng đã đăng nhập

### Tài khoản & Hồ sơ

| ID | Yêu cầu |
|---|---|
| U-01 | Xem và cập nhật thông tin cá nhân (họ tên, SĐT, giới tính) |
| U-02 | Đổi mật khẩu (nhập mật khẩu cũ, mật khẩu mới, xác nhận) |
| U-03 | Xem danh sách địa chỉ giao hàng đã lưu |
| U-04 | Thêm địa chỉ giao hàng mới |
| U-05 | Xóa địa chỉ giao hàng |
| U-06 | Đặt một địa chỉ làm mặc định |
| U-07 | Đăng xuất |

### Mua sắm

| ID | Yêu cầu |
|---|---|
| U-08 | Tất cả quyền của Guest (G-01 → G-09) |
| U-09 | Thêm sản phẩm vào giỏ hàng (chọn size S/M/L/XL và số lượng) |
| U-10 | Xem giỏ hàng: danh sách sản phẩm, size, số lượng, giá, tổng tiền |
| U-11 | Cập nhật số lượng sản phẩm trong giỏ |
| U-12 | Xóa một sản phẩm khỏi giỏ |

### Thanh toán & Đơn hàng

| ID | Yêu cầu |
|---|---|
| U-13 | Điền thông tin giao hàng (họ tên, SĐT, địa chỉ) hoặc chọn từ địa chỉ đã lưu |
| U-14 | Chọn phương thức thanh toán: **COD (Thanh toán khi nhận hàng)** |
| U-15 | Xem tóm tắt đơn hàng trước khi xác nhận (sản phẩm, phí ship 30.000đ, tổng) |
| U-16 | Đặt hàng thành công → hiển thị trang xác nhận kèm mã đơn |
| U-17 | Xem danh sách toàn bộ đơn hàng đã đặt (mã, ngày, tổng, trạng thái) |
| U-18 | Xem chi tiết đơn hàng (từng sản phẩm, size, số lượng, giá) |
| U-19 | Hủy đơn hàng khi trạng thái còn **"Chờ xử lý"** |

### Đánh giá

| ID | Yêu cầu |
|---|---|
| U-20 | Viết đánh giá sản phẩm (1–5 sao + bình luận văn bản) |
| U-21 | Xem phản hồi của shop trên bình luận của mình |

---

## Admin — Quản trị viên

### Dashboard

| ID | Yêu cầu |
|---|---|
| A-01 | Xem tổng quan: tổng doanh thu (đơn "Hoàn thành"), tổng đơn hàng, tổng khách hàng |
| A-02 | Xem danh sách 7 đơn hàng mới nhất trên dashboard |

### Quản lý Sản phẩm

| ID | Yêu cầu |
|---|---|
| A-03 | Xem danh sách sản phẩm (tìm kiếm theo tên, phân trang 10/trang) |
| A-04 | Thêm sản phẩm mới: tên, giá, giá cũ, mô tả, số lượng, giới tính, danh mục, ảnh |
| A-05 | Sửa thông tin sản phẩm |
| A-06 | Xóa sản phẩm |
| A-07 | Upload ảnh sản phẩm (validate MIME: jpg/jpeg/png/webp, tối đa 5MB) |

### Quản lý Đơn hàng

| ID | Yêu cầu |
|---|---|
| A-08 | Xem tất cả đơn hàng (phân trang) |
| A-09 | Xem chi tiết đơn hàng (thông tin khách, sản phẩm, tổng tiền) |
| A-10 | Cập nhật trạng thái đơn: `pending` → `shipping` → `completed` / `cancelled` |

### Quản lý Người dùng

| ID | Yêu cầu |
|---|---|
| A-11 | Xem danh sách toàn bộ khách hàng |
| A-12 | Xem chi tiết thông tin một khách hàng |

### Quản lý Đánh giá

| ID | Yêu cầu |
|---|---|
| A-13 | Xem tất cả đánh giá sản phẩm |
| A-14 | Phản hồi đánh giá của khách (shop reply) |
| A-15 | Xóa đánh giá vi phạm |

### Quản lý Liên hệ

| ID | Yêu cầu |
|---|---|
| A-16 | Xem danh sách tin nhắn liên hệ từ khách |
| A-17 | Cập nhật trạng thái liên hệ: `new` → `read` → `resolved` |
