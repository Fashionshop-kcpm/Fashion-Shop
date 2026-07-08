# BÁO CÁO CÁ NHÂN
## Dự án: Fashion Shop – Kiểm thử phần mềm

---

**Họ và tên:** Khang Trương  
**Dự án:** FashionShop API  
**Vai trò:** Thành viên nhóm kiểm thử  
**Ngày báo cáo:** 08/07/2026  

---

## TỔNG KẾT

| Chỉ số | Giá trị |
|---|---|
| Tổng số Bug được phân công | **16** |
| Tổng số Bug đã hoàn thành | **16** |
| Tỷ lệ hoàn thành | **100%** |
| Mức độ ưu tiên | Medium (tất cả) |

---

## DANH SÁCH BUG ĐƯỢC PHÂN CÔNG

| STT | Mã Issue | Tóm tắt | Trạng thái |
|---|---|---|---|
| 1 | FAS-95 | API xem đánh giá sản phẩm không trả về trường review_date | Done |
| 2 | FAS-92 | API đăng xuất không trả về trường status | Done |
| 3 | FAS-87 | API Sửa sản phẩm thiếu object 'category' trong dữ liệu trả về | Done |
| 4 | FAS-86 | API Thêm sản phẩm thiếu object 'category' trong response | Done |
| 5 | FAS-74 | API không trả về trường updated_status | Done |
| 6 | FAS-72 | API xóa đánh giá vi phạm không trả về trường deleted_at | Done |
| 7 | FAS-68 | Response trả về địa chỉ đã xóa nhưng vẫn có is_default = 1 | Done |
| 8 | FAS-57 | Kiểm tra API DELETE có trả về thông tin địa chỉ vừa xóa | Done |
| 9 | FAS-40 | POST /admin/logout không trả về trạng thái thu hồi token | Done |
| 10 | FAS-38 | GET /contacts — trường status trả về "new" thay vì "closed" | Done |
| 11 | FAS-34 | API /categories không trả về thông tin phân trang | Done |
| 12 | FAS-30 | Fix lỗi phân trang API Danh sách sản phẩm | Done |
| 13 | FAS-29 | API DELETE /reviews/{id} thiếu property data | Done |
| 14 | FAS-27 | GET /products/{id}/reviews – Response review sắp xếp từ cũ đến mới | Done |
| 15 | FAS-19 | API xem chi tiết đơn hàng thiếu thuộc tính size | Done |
| 16 | FAS-14 | PUT /profile/password – Response không trả về token mới | Done |

---

## PHÂN LOẠI THEO NHÓM CHỨC NĂNG

| Nhóm chức năng | Số Bug |
|---|---|
| Đánh giá sản phẩm (Review) | 3 |
| Sản phẩm (Product) | 3 |
| Địa chỉ (Address) | 2 |
| Xác thực & Đăng xuất (Auth) | 2 |
| Danh mục (Category) | 1 |
| Liên hệ (Contact) | 1 |
| Đơn hàng (Order) | 1 |
| Hồ sơ người dùng (Profile) | 1 |
| Đơn hàng Admin | 1 |
| Phân trang (Pagination) | 1 |

---

*Tất cả các Bug có độ ưu tiên: Medium | Trạng thái: Done | Resolution: Done*
