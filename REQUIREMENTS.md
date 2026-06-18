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
| U-03 | Xem danh sách địa chỉ giao hàng đã lưu: 

        - Trả về HTTP 200 khi lấy danh sách địa chỉ thành công.
        - Dữ liệu trả về có message và data.
        - data phải là một mảng danh sách địa chỉ.
        - Mỗi địa chỉ phải có đầy đủ thông tin:
            id
            fullname
            phone
            address_details
            is_default
            Dữ liệu trả về có trường total.
        - Giá trị total phải bằng số lượng phần tử trong data.  |


| U-04 | Thêm địa chỉ giao hàng mới: 

        - Trả về kết quả thành công với success = true khi tạo địa chỉ mới.
        - Dữ liệu trả về có message.
        - Dữ liệu trả về có thông tin địa chỉ (address).
        - Khi tạo mới, trường is_default phải bằng 0.
        - Hệ thống phải trả về id của địa chỉ mới (có thể nằm trong address.id, data.id hoặc id).  |


| U-05 | Xóa địa chỉ giao hàng: 

        - Trả về HTTP 200 khi xóa địa chỉ thành công.
        - Dữ liệu trả về có message xác nhận xóa và nội dung message có chứa từ “xóa”.
        - Dữ liệu trả về có thông tin địa chỉ đã xóa (address).
        - Trong address phải có id và fullname.
        - Sau khi xóa, địa chỉ này không được còn trạng thái is_default = 1.  |


| U-06 | Đặt một địa chỉ làm mặc định:

        - Trả về HTTP 200 khi đặt địa chỉ mặc định thành công.
        - Dữ liệu trả về có data.
        - Trong data phải có đầy đủ thông tin địa chỉ:
            id
            user_id
            fullname
            phone
            address_details
            is_default
        - Sau khi cập nhật, is_default phải bằng 1.
        - Hệ thống phải đảm bảo chỉ một địa chỉ được đặt làm mặc định (sync_all_addresses = true).  |


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
| U-15 | Xem tóm tắt đơn hàng trước khi xác nhận (sản phẩm, phí ship 30.000đ, tổng):

        - Trả về HTTP 200 hoặc 201 khi lấy dữ liệu tóm tắt đơn hàng.
        - Dữ liệu có order id (trong order.id).
        - Dữ liệu có details (danh sách sản phẩm).
        - Dữ liệu có shipping_fee = 30000.
        - Nếu không có thông tin đơn hàng thì xem là lỗi hệ thống.  |


| U-16 | Đặt hàng thành công → hiển thị trang xác nhận kèm mã đơn |
| U-17 | Xem danh sách toàn bộ đơn hàng đã đặt (mã, ngày, tổng, trạng thái):
 
        - Trả về HTTP 200 khi lấy danh sách đơn hàng.
        - Mỗi đơn hàng có trạng thái (status).
        - Mỗi đơn hàng có tổng số lượng sản phẩm (total_quantity).
        - Mỗi đơn hàng có ngày đặt hàng (order_date).   |


| U-18 | Xem chi tiết đơn hàng (từng sản phẩm, size, số lượng, giá): 

        - Trả về HTTP 200 khi lấy chi tiết đơn hàng.
        - Dữ liệu có danh sách details (chi tiết sản phẩm trong đơn hàng).
        - Mỗi sản phẩm có quantity và price.
        - Mỗi sản phẩm có product.size (size nằm trong product).
        - Mỗi sản phẩm có total = price * quantity.  |


| U-19 | Hủy đơn hàng khi trạng thái còn **"Chờ xử lý"** :

        - Trả về HTTP 200 khi hủy đơn hàng thành công.
        - Trả về thông báo message = "Đã hủy đơn hàng".
        - Dữ liệu trả về có status của đơn hàng sau khi hủy.
        - Dữ liệu trả về có updated_at (thời gian cập nhật sau khi hủy).|


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
| A-02 | Xem danh sách 7 đơn hàng mới nhất trên dashboard: 

        - Trả về HTTP 200 khi lấy dữ liệu dashboard thành công.
        - Dữ liệu dashboard phải có các thống kê tổng quan gồm:
            total_revenue
            total_orders
            total_users
            total_products
        - Dữ liệu trả về phải có field data.
        - Dữ liệu phải có danh sách latest_orders.
        - Số lượng latest_orders phải đúng bằng 7 đơn hàng mới nhất. |


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
