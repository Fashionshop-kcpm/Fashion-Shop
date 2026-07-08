# BÁO CÁO CÁ NHÂN
## Dự án: Fashion Shop – Kiểm thử phần mềm

---

**Họ và tên:** Trí Đinh Quốc  
**Dự án:** FashionShop API  
**Vai trò:** Thành viên nhóm kiểm thử  
**Ngày báo cáo:** 08/07/2026  

---

## TỔNG KẾT

| Chỉ số | Giá trị |
|---|---|
| Tổng số Bug được phân công | **17** |
| Tổng số Bug đã hoàn thành | **17** |
| Tỷ lệ hoàn thành | **100%** |
| Mức độ ưu tiên | Medium (tất cả) |

---

## DANH SÁCH BUG ĐƯỢC PHÂN CÔNG

| STT | Mã Issue | Tóm tắt | Trạng thái |
|---|---|---|---|
| 1 | FAS-103 | [Vulnerability] Docker container không nên chạy bằng user root | Done |
| 2 | FAS-102 | [Code Smell] Định nghĩa constant thay vì lặp lại literal "/orders" | Done |
| 3 | FAS-101 | [Code Smell] Định nghĩa constant thay vì lặp lại literal "/products/{id}" | Done |
| 4 | FAS-100 | [Code Smell] Định nghĩa constant thay vì lặp lại literal "/products" | Done |
| 5 | FAS-99 | [Code Smell] Định nghĩa constant thay vì lặp lại literal "logs/laravel.log" | Done |
| 6 | FAS-98 | [Code Smell] Định nghĩa constant thay vì lặp lại literal "127.0.0.1" | Done |
| 7 | FAS-94 | API cập nhật số lượng sản phẩm trong giỏ hàng không trả về tổng tiền | Done |
| 8 | FAS-88 | API Xóa sản phẩm thiếu cờ 'success' trong response | Done |
| 9 | FAS-80 | Chi tiết đơn hàng Admin trả về 2 trường giá gây nhầm lẫn | Done |
| 10 | FAS-70 | API xem tất cả đánh giá sản phẩm không trả về trường reviews | Done |
| 11 | FAS-62 | API /orders/{id} trả thiếu thông tin chi tiết sản phẩm | Done |
| 12 | FAS-47 | PATCH /admin/orders/{id}/status – Cập nhật trạng thái đơn hàng | Done |
| 13 | FAS-36 | API GET /reviews – Rating không vượt quá 5 | Done |
| 14 | FAS-28 | POST /products/{id}/reviews – Response xem trong 'review' có thông tin 'user' | Done |
| 15 | FAS-21 | API Dashboard Admin không có trường data | Done |
| 16 | FAS-20 | API hủy đơn hàng chưa trả về trường status | Done |
| 17 | FAS-1 | API Đăng ký: Sai cấu trúc JSON trả về | Done |

---

## PHÂN LOẠI THEO NHÓM CHỨC NĂNG

| Nhóm chức năng | Số Bug |
|---|---|
| Code Quality / Code Smell | 5 |
| Security / Vulnerability | 1 |
| Giỏ hàng (Cart) | 1 |
| Đơn hàng (Order) | 3 |
| Sản phẩm (Product) | 1 |
| Đánh giá (Review) | 2 |
| Admin Dashboard | 1 |
| Xác thực (Auth) | 1 |
| Admin Order | 1 |
| Sản phẩm trong đơn hàng | 1 |

---

*Tất cả các Bug có độ ưu tiên: Medium | Trạng thái: Done | Resolution: Done*
