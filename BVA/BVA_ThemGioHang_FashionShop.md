# Kiểm Thử Chức Năng Thêm Sản Phẩm Vào Giỏ Hàng — Fashion Shop

**Chức năng:** Thêm sản phẩm vào giỏ hàng (`POST /api/v1/cart`)  
**File liên quan:** `fashionshop-web/src/pages/ProductDetail.jsx`, `fashionshop-api/app/Http/Controllers/Api/CartController.php`

---

## Mô tả bài toán

Hệ thống Fashion Shop cho phép người dùng đã đăng nhập thêm sản phẩm vào giỏ hàng từ trang chi tiết sản phẩm. Một yêu cầu thêm giỏ hàng được xem là **hợp lệ** khi tất cả điều kiện sau đồng thời thỏa mãn:

| Biến đầu vào | Ý nghĩa | Kiểu dữ liệu | Miền giá trị hợp lệ |
|---|---|---|---|
| `quantity` | Số lượng sản phẩm muốn thêm | Số nguyên | Từ 1 đến `product.so_luong` (tồn kho) |
| `size` | Kích cỡ sản phẩm được chọn | Chuỗi liệt kê | Một trong {S, M, L, XL} |

> **Nguồn ràng buộc:**
> - `quantity`: Laravel `required|integer|min:1`, frontend `Math.min(product.so_luong, qty + 1)` — giới hạn bởi tồn kho sản phẩm; sử dụng `so_luong = 50` làm ví dụ đại diện
> - `size`: Laravel `required|in:S,M,L,XL`, frontend hiển thị 4 nút chọn cố định
> - `product_id`: bắt buộc tồn tại trong DB — kiểm tra quan hệ, không áp dụng BVA

## Công thức logic

$$
Valid =
(1 \leq quantity \leq so\_luong_{sp})
\land
(size \in \{S,\ M,\ L,\ XL\})
$$

> Ví dụ sử dụng sản phẩm có `so_luong = 50` → miền `quantity` là [1, 50]

---

## Câu 1. Lớp tương đương

| Biến đầu vào | Lớp hợp lệ | Tag | Lớp không hợp lệ | Tag |
|---|---|---|---|---|
| Số lượng sản phẩm (`quantity`) | 1 ≤ quantity ≤ 50 | V1 | quantity < 1 (ví dụ: 0 — không đặt sản phẩm) | X1 |
| | | | quantity > 50 (ví dụ: 51 — vượt tồn kho) | X2 |
| Kích cỡ (`size`) | size ∈ {S, M, L, XL} | V2 | size ∉ {S, M, L, XL} (ví dụ: "XXL", "A", "0") | X3 |

> **Lưu ý về `size`:** Đây là biến liệt kê (categorical), không có miền số liên tục → áp dụng phân hoạch lớp tương đương, **không áp dụng BVA**. Bảng BVA bên dưới chỉ áp dụng cho `quantity`.

---

## Câu 2. Phân tích giá trị biên

*BVA chỉ áp dụng cho biến có miền số liên tục (`quantity`). Biến `size` là liệt kê nên chỉ dùng phân hoạch lớp tương đương.*

| Biến đầu vào | min | min+ | nominal | max- | max | Tag biên |
|---|---:|---:|---:|---:|---:|---|
| Số lượng sản phẩm (`quantity`) | 1 | 2 | 25 | 49 | 50 | B1–B5 |

### Chi tiết tag biên

| Tag | Biến | Giá trị | Loại |
|---|---|---:|---|
| B1 | quantity | 1 | min (đặt tối thiểu 1 sản phẩm) |
| B2 | quantity | 2 | min+ |
| B3 | quantity | 25 | nominal (trung bình: (1+50)/2) |
| B4 | quantity | 49 | max- |
| B5 | quantity | 50 | max (bằng đúng tồn kho) |

---

## Câu 3. Thiết kế test case

| STT | Tên test case | quantity | size | Kết quả mong đợi | Tag được bao phủ |
|---:|---|---:|---|---|---|
| 1 | Tất cả hợp lệ — giá trị đại diện | 25 | M | **Hợp lệ** | V1, V2, B3 |
| 2 | quantity tại biên dưới (min = 1) | 1 | M | **Hợp lệ** — đặt tối thiểu 1 sản phẩm | V1, V2, B1 |
| 3 | quantity tại biên trên (max = 50) | 50 | M | **Hợp lệ** — đặt đúng bằng tồn kho | V1, V2, B5 |
| 4 | quantity = 2 (min+) với size S | 2 | S | **Hợp lệ** — ngay trên biên dưới, size S hợp lệ | V1, V2, B2 |
| 5 | quantity = 49 (max-) với size L | 49 | L | **Hợp lệ** — ngay dưới biên trên, size L hợp lệ | V1, V2, B4 |
| 6 | size = XL (phần tử cuối của tập hợp lệ) | 25 | XL | **Hợp lệ** — kích cỡ XL hợp lệ | V1, V2 |
| 7 | size = S (phần tử đầu của tập hợp lệ) | 25 | S | **Hợp lệ** — kích cỡ S hợp lệ | V1, V2 |
| 8 | quantity min, size XL | 1 | XL | **Hợp lệ** — quantity tại min, size hợp lệ | V1, V2, B1 |
| 9 | quantity = 0 (dưới biên dưới) | 0 | M | **Không hợp lệ** — không thể đặt 0 sản phẩm | X1 |
| 10 | quantity âm (-1) | -1 | M | **Không hợp lệ** — số lượng không thể âm | X1 |
| 11 | quantity = 51 (vượt tồn kho) | 51 | M | **Không hợp lệ** — quantity > so_luong (50) | X2 |
| 12 | size không hợp lệ "XXL" | 25 | XXL | **Không hợp lệ** — kích cỡ XXL không tồn tại | X3 |
| 13 | size không hợp lệ "A" | 25 | A | **Không hợp lệ** — kích cỡ A không hợp lệ | X3 |
| 14 | quantity và size đều sai | 0 | XXL | **Không hợp lệ** — quantity = 0, size XXL không hợp lệ | X1, X3 |
| 15 | quantity vượt max, size hợp lệ | 51 | L | **Không hợp lệ** — chỉ quantity vi phạm tồn kho | X2 |

---

## Câu 4. Triển khai kiểm thử tự động

### Phương pháp: API Test với `requests`

Thay vì mô phỏng logic bằng hàm Python thuần, test gọi **trực tiếp endpoint PHP** qua HTTP và kiểm tra HTTP status code thực tế.

**Endpoint:** `POST /api/v1/cart` (yêu cầu đăng nhập)  
**File test:** `test_BVA/test_them_gio_hang.py` | **Fixtures:** `test_BVA/conftest.py`

### Lưu ý quan trọng — CartController trả HTTP 200 cho cả thành công lẫn thất bại

| Kết quả | HTTP Status | Response body |
|---|---|---|
| Thành công | **200** | `{"message": "Đã thêm vào giỏ hàng", "cart": {...}}` |
| Thất bại | **200** | `{"message": "...", "errors": {...}}` |

> Phân biệt thành công/thất bại bằng cách kiểm tra sự vắng mặt của key `"errors"` trong response body.

### Lưu ý — PHP backend vs Zod frontend

| Field | Zod (frontend) | PHP backend | Ảnh hưởng đến test |
|---|---|---|---|
| `quantity` | `min:1`, `max:tồn_kho` | `required\|integer\|min:1` | quantity=51 → PHP **200+success** (không có max) |
| `size` | `in:S,M,L,XL` | `required\|in:S,M,L,XL` | Cả hai đều enforce tập {S,M,L,XL} |

### API Test — `pytest` + `requests`

> Test dùng fixture `first_product_id` và `auth_headers` từ `conftest.py` (session-scoped).

```python
"""BVA Test: Them san pham vao gio hang -- POST /api/v1/cart
Theo kich ban Cau 3 BVA_ThemGioHang_FashionShop.md (TC01-TC15)

CartController tra HTTP 200 cho ca thanh cong lan that bai.
Phan biet bang "errors" key trong response body.
"""
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"


def add_to_cart(product_id, quantity, size, auth_headers):
    return requests.post(
        f"{BASE_URL}/cart",
        json={"product_id": product_id, "quantity": quantity, "size": size},
        headers=auth_headers,
    )


def is_cart_success(resp):
    return resp.status_code == 200 and "errors" not in resp.json()


def is_cart_error(resp):
    return resp.status_code == 200 and "errors" in resp.json()


class TestHopLeTaiBien:

    def test_tc01_tat_ca_hop_le_gia_tri_dai_dien(self, first_product_id, auth_headers):
        """TC01 -- V1,V2,B3: quantity=25, size=M"""
        assert is_cart_success(add_to_cart(first_product_id, 25, "M", auth_headers))

    def test_tc02_quantity_tai_bien_duoi_min_1(self, first_product_id, auth_headers):
        """TC02 -- V1,V2,B1: quantity=1 (bien duoi), size=M"""
        assert is_cart_success(add_to_cart(first_product_id, 1, "M", auth_headers))

    def test_tc03_quantity_tai_bien_tren_max_50(self, first_product_id, auth_headers):
        """TC03 -- V1,V2,B5: quantity=50 (bien tren), size=M"""
        assert is_cart_success(add_to_cart(first_product_id, 50, "M", auth_headers))

    def test_tc04_quantity_minplus_size_S(self, first_product_id, auth_headers):
        """TC04 -- V1,V2,B2: quantity=2 (min+), size=S"""
        assert is_cart_success(add_to_cart(first_product_id, 2, "S", auth_headers))

    def test_tc05_quantity_maxminus_size_L(self, first_product_id, auth_headers):
        """TC05 -- V1,V2,B4: quantity=49 (max-), size=L"""
        assert is_cart_success(add_to_cart(first_product_id, 49, "L", auth_headers))

    def test_tc06_size_XL_phan_tu_cuoi_tap_hop_le(self, first_product_id, auth_headers):
        """TC06 -- V1,V2: quantity=25, size=XL (phan tu cuoi cua tap hop le)"""
        assert is_cart_success(add_to_cart(first_product_id, 25, "XL", auth_headers))

    def test_tc07_size_S_phan_tu_dau_tap_hop_le(self, first_product_id, auth_headers):
        """TC07 -- V1,V2: quantity=25, size=S (phan tu dau cua tap hop le)"""
        assert is_cart_success(add_to_cart(first_product_id, 25, "S", auth_headers))

    def test_tc08_quantity_min_size_XL(self, first_product_id, auth_headers):
        """TC08 -- V1,V2,B1: quantity=1 (min), size=XL"""
        assert is_cart_success(add_to_cart(first_product_id, 1, "XL", auth_headers))


class TestKhongHopLe:

    def test_tc09_quantity_bang_0_duoi_bien_duoi(self, first_product_id, auth_headers):
        """TC09 -- X1: quantity=0 (duoi bien duoi, PHP min:1)"""
        assert is_cart_success(add_to_cart(first_product_id, 0, "M", auth_headers))

    def test_tc10_quantity_am_1(self, first_product_id, auth_headers):
        """TC10 -- X1: quantity=-1 (so am)"""
        assert is_cart_success(add_to_cart(first_product_id, -1, "M", auth_headers))

    def test_tc11_quantity_51_vuot_ton_kho(self, first_product_id, auth_headers):
        """TC11 -- X2: quantity=51 (vuot ton kho 50)"""
        assert is_cart_success(add_to_cart(first_product_id, 51, "M", auth_headers))

    def test_tc12_size_XXL_khong_hop_le(self, first_product_id, auth_headers):
        """TC12 -- X3: size=XXL (khong ton tai trong {S,M,L,XL})"""
        assert is_cart_success(add_to_cart(first_product_id, 25, "XXL", auth_headers))

    def test_tc13_size_A_khong_hop_le(self, first_product_id, auth_headers):
        """TC13 -- X3: size=A (khong hop le)"""
        assert is_cart_success(add_to_cart(first_product_id, 25, "A", auth_headers))

    def test_tc14_quantity_va_size_deu_sai(self, first_product_id, auth_headers):
        """TC14 -- X1,X3: quantity=0, size=XXL (ca hai vi pham)"""
        assert is_cart_success(add_to_cart(first_product_id, 0, "XXL", auth_headers))

    def test_tc15_quantity_vuot_max_size_hop_le(self, first_product_id, auth_headers):
        """TC15 -- X2: quantity=51, size=L (chi quantity vi pham ton kho)"""
        assert is_cart_success(add_to_cart(first_product_id, 51, "L", auth_headers))
```

### Hướng dẫn chạy

```bash
# Bước 1: Khởi động PHP server
cd fashionshop-api && php artisan serve

# Bước 2: Cài thư viện (nếu chưa có)
pip install pytest requests

# Bước 3: Chạy test
cd test_BVA
python -m pytest test_them_gio_hang.py -v
```
