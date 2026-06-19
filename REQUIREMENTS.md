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

        - Người dùng có thể xem danh sách địa chỉ giao hàng đã lưu của mình.
        - Hệ thống hiển thị thông tin từng địa chỉ bao gồm: mã địa chỉ, họ tên người nhận, số điện thoại, địa chỉ chi tiết và trạng thái mặc định.
        - Danh sách trả về có tổng số lượng địa chỉ tương ứng với số bản ghi thực tế.  |


| U-04 | Thêm địa chỉ giao hàng mới: 

        - Người dùng có thể thêm mới một địa chỉ giao hàng vào hệ thống.
        - Sau khi thêm thành công, hệ thống lưu lại thông tin địa chỉ vừa tạo và trả về kết quả xác nhận.
        - Địa chỉ mới mặc định không được đặt là địa chỉ chính.  |


| U-05 | Xóa địa chỉ giao hàng: 

        - Người dùng có thể xóa một địa chỉ giao hàng đã lưu trong hệ thống.
        - Sau khi xóa thành công, hệ thống trả về thông tin xác nhận và thông tin của địa chỉ vừa bị xóa.
        - Địa chỉ đã xóa không được còn trạng thái mặc định. |


| U-06 | Đặt một địa chỉ làm mặc định:

        - Người dùng có thể chọn một địa chỉ giao hàng và đặt làm địa chỉ mặc định trong hệ thống.
        - Hệ thống trả về thông tin địa chỉ sau khi cập nhật(id, user_id, fullname, phone, address_details, is_default)
        - Khi thao tác thành công, hệ thống cập nhật lại trạng thái mặc định của địa chỉ được chọn và đảm bảo chỉ tồn tại một địa chỉ mặc định tại một thời điểm.  |


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

        - Người dùng có thể xem thông tin tóm tắt đơn hàng trước khi tiến hành xác nhận đặt hàng.
        - Thông tin tóm tắt bao gồm mã đơn hàng, danh sách sản phẩm trong đơn và phí vận chuyển.
        - Hệ thống hiển thị phí vận chuyển cố định là 30.000đ trong bước tóm tắt đơn hàng.  |


| U-16 | Đặt hàng thành công → hiển thị trang xác nhận kèm mã đơn |
| U-17 | Xem danh sách toàn bộ đơn hàng đã đặt (mã, ngày, tổng, trạng thái):
 
        Người dùng có thể xem danh sách tất cả đơn hàng đã đặt của mình trong hệ thống.
        Mỗi đơn hàng hiển thị tổng số lượng sản phẩm đã đặt, mỗi đơn hàng có thông tin ngày đặt hàng.
        Danh sách đơn hàng bao gồm thông tin cơ bản để theo dõi tình trạng và lịch sử mua hàng.  |


| U-18 | Xem chi tiết đơn hàng (từng sản phẩm, size, số lượng, giá): 

        - Người dùng có thể xem chi tiết của một đơn hàng, bao gồm danh sách sản phẩm đã mua và thông tin chi tiết của từng sản phẩm trong đơn.
        - Hệ thống tính đúng thành tiền của từng sản phẩm |


| U-19 | Hủy đơn hàng khi trạng thái còn **"Chờ xử lý"** :

        - Người dùng có thể hủy đơn hàng nếu đơn hàng đang ở trạng thái “Chờ xử lý”.
        - Hệ thống trả về thông báo xác nhận hủy đơn.
        - Sau khi hủy thành công, hệ thống cập nhật lại trạng thái đơn hàng và ghi nhận thời gian cập nhật mới nhất. |


### Đánh giá

| ID | Yêu cầu |
|---|---|
| U-20 | Viết đánh giá sản phẩm (1–5 sao + bình luận văn bản) |
| U-21 | Xem phản hồi của shop trên bình luận của mình |
| U-22 | Xem đánh giá sản phẩm |

---

## Admin — Quản trị viên

### Dashboard

| ID | Yêu cầu |
|---|---|
| A-01 | Xem tổng quan: tổng doanh thu (đơn "Hoàn thành"), tổng đơn hàng, tổng khách hàng |
| A-02 | Xem danh sách 7 đơn hàng mới nhất trên dashboard: 

        - Admin có thể xem trang dashboard hệ thống, trong đó hiển thị các thống kê tổng quan và danh sách các đơn hàng mới nhất để theo dõi hoạt động kinh doanh.
        - Hệ thống chỉ hiển thị 7 đơn hàng mới nhất. |

        
| A-03 | Đăng xuất | 



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
