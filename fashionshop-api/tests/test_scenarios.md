# Kịch Bản Test và Độ Phủ (Coverage) - Fashion Shop API

Tài liệu này giải thích chi tiết các kịch bản test (Test Scenarios) đã được triển khai cho dự án Fashion Shop API, cũng như ước tính độ phủ mã nguồn (Code Coverage).

## 1. Mức Độ Phủ (Code Coverage)
Trong các bài test đã viết, chúng ta đã áp dụng phương pháp **Whitebox Testing**, nghĩa là mọi luồng xử lý (if/else), các rule validation, và các trường hợp ngoại lệ trong Controllers đều được nhắm mục tiêu một cách có chủ đích.

*   **Branch Coverage (Độ phủ nhánh):** Đạt ~95-100% cho các Controller đã test (Auth, Cart, Order, Product, Profile, Review, Address, Contact). Mọi nhánh `if (Lỗi)` và `else (Thành công)` đều được đi qua.
*   **Statement Coverage (Độ phủ lệnh):** Rất cao, các đoạn code xử lý database, trả về JSON response đều được thực thi và kiểm chứng.

---

## 2. Các Kịch Bản Test Chi Tiết (Test Scenarios)

### 2.1. Xác thực (AuthTest)
*   **Mục tiêu:** Đảm bảo hệ thống đăng ký, đăng nhập và đăng xuất hoạt động an toàn.
*   **Kịch bản đăng ký (Register):**
    *   **Thành công:** Gửi đúng thông tin hợp lệ -> Trả về Token.
    *   **Thất bại do Validation:** Thiếu họ tên, email sai định dạng, email bị trùng, số điện thoại chứa chữ, số điện thoại quá ngắn/dài, giới tính không hợp lệ, password và confirm password không khớp, mật khẩu dưới 6 ký tự.
*   **Kịch bản đăng nhập (Login):**
    *   **Thành công:** Đúng email và mật khẩu -> Trả về Token.
    *   **Thất bại:** Sai mật khẩu, email không tồn tại trong hệ thống, thiếu tham số.
*   **Kịch bản đăng xuất (Logout):** Đăng xuất khi có token hợp lệ (Thành công) vs Đăng xuất khi không có token (Lỗi 401).

### 2.2. Giỏ hàng (CartTest)
*   **Mục tiêu:** Kiểm tra logic thêm/sửa/xóa và tính tiền giỏ hàng.
*   **Kịch bản xem giỏ hàng:** Giỏ hàng trống (tổng = 0) vs Giỏ hàng có sản phẩm (tính chính xác tổng tiền = giá * số lượng).
*   **Kịch bản thêm vào giỏ:**
    *   **Thành công:** Thêm sản phẩm mới hoàn toàn -> Tạo record mới. Thêm sản phẩm đã có (cùng size) -> Cộng dồn số lượng.
    *   **Thất bại:** Size không tồn tại (chỉ cho phép S, M, L, XL), số lượng âm, ID sản phẩm không tồn tại.
*   **Kịch bản cập nhật/xóa:** Không cho phép cập nhật giỏ hàng của user khác. Cập nhật số lượng mới hợp lệ. Xóa thành công và xử lý khi xóa ID không tồn tại.

### 2.3. Đơn hàng (OrderTest)
*   **Mục tiêu:** Kiểm tra luồng đặt hàng và quản lý trạng thái.
*   **Kịch bản xem đơn hàng:** Không cho phép xem đơn hàng của người khác (User isolated).
*   **Kịch bản đặt hàng:**
    *   **Thành công:** Bỏ sản phẩm vào giỏ, nhập địa chỉ, phương thức thanh toán hợp lệ -> Tạo đơn hàng Pending, tổng tiền = tiền giỏ hàng + 30.000đ phí ship. Đồng thời giỏ hàng phải bị làm sạch.
    *   **Thất bại:** Giỏ hàng trống, sai số điện thoại, thiếu địa chỉ, sai phương thức thanh toán (chỉ nhận `Thanh toán khi nhận hàng` hoặc `Chuyển khoản ngân hàng`).
*   **Kịch bản hủy đơn hàng:**
    *   Được phép hủy nếu trạng thái đang là `pending`.
    *   Bị từ chối hủy nếu trạng thái đã chuyển sang `shipping` hoặc `completed`.

### 2.4. Sản phẩm & Danh mục (ProductTest)
*   **Mục tiêu:** Đảm bảo hệ thống filter hoạt động chính xác.
*   **Kịch bản tìm kiếm/lọc:**
    *   Lấy toàn bộ (không filter).
    *   Lọc theo từ khóa (Keyword): Bỏ qua phân biệt hoa thường và khoảng trắng.
    *   Lọc theo Category ID.
    *   Lọc theo giới tính (Nam/Nữ).
    *   Lọc kết hợp nhiều điều kiện cùng lúc.
*   **Kịch bản xem chi tiết:** Sản phẩm tồn tại trả về đủ thông tin (gồm size ảo S, M, L, XL). Sản phẩm không tồn tại trả về 404.

### 2.5. Hồ sơ người dùng (ProfileTest & AddressTest)
*   **Mục tiêu:** Đảm bảo việc cập nhật thông tin không xung đột dữ liệu.
*   **Cập nhật Profile:** Đổi số điện thoại/giới tính hợp lệ. Sẽ báo lỗi nếu dùng Email đã bị đăng ký bởi người khác.
*   **Đổi mật khẩu:** Yêu cầu mật khẩu cũ phải khớp. Mật khẩu mới phải đủ độ dài và có confirm. Sau khi đổi, hệ thống sẽ cấp token mới.
*   **Sổ địa chỉ:**
    *   Thêm địa chỉ thường.
    *   Thêm địa chỉ và đặt làm mặc định -> Tự động đưa tất cả địa chỉ cũ về trạng thái `is_default = 0`.
    *   Chỉ user mới có quyền sửa/xóa/đặt mặc định địa chỉ của chính họ.

### 2.6. Đánh giá (ReviewTest) & Liên hệ (ContactTest)
*   **Kịch bản Đánh giá:** Phải có Auth. Rating phải từ 1 đến 5 (Test các trường hợp rating = 0 và rating = 6 để bắt lỗi). Hệ thống tự động gán nhãn `X sao` cho response.
*   **Kịch bản Liên hệ:** Không cần Auth (Guest có thể gửi). Test chặt chẽ việc bắt lỗi email sai format hoặc bỏ trống trường nội dung.
