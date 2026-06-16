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

### Hàm kiểm tra logic

```python
VALID_SIZES = {"S", "M", "L", "XL"}

def validate_them_gio_hang(quantity: int, size: str, so_luong_sp: int = 50) -> bool:
    """
    Kiểm tra tính hợp lệ của yêu cầu thêm sản phẩm vào giỏ hàng Fashion Shop.

    Tham số:
        quantity     (int): Số lượng sản phẩm muốn thêm vào giỏ.
        size         (str): Kích cỡ sản phẩm được chọn (S / M / L / XL).
        so_luong_sp  (int): Tồn kho của sản phẩm (mặc định 50 cho kiểm thử).

    Trả về:
        True  nếu tất cả đầu vào hợp lệ.
        False nếu có ít nhất một đầu vào không hợp lệ.
    """
    return (
        1 <= quantity <= so_luong_sp and
        size in VALID_SIZES
    )
```

### Unit Test — Framework: `pytest`

```python
import pytest
from validate_them_gio_hang import validate_them_gio_hang

SO_LUONG_SP = 50  # tồn kho sản phẩm mẫu dùng trong toàn bộ test


class TestHopLeTaiBien:

    def test_tc01_nominal(self):
        """TC01: Giá trị đại diện — hợp lệ."""
        assert validate_them_gio_hang(25, "M", SO_LUONG_SP) is True

    def test_tc02_quantity_min(self):
        """TC02 — B1: quantity = 1 (biên dưới hợp lệ)."""
        assert validate_them_gio_hang(1, "M", SO_LUONG_SP) is True

    def test_tc03_quantity_max(self):
        """TC03 — B5: quantity = 50 (bằng đúng tồn kho)."""
        assert validate_them_gio_hang(50, "M", SO_LUONG_SP) is True

    def test_tc04_quantity_minplus(self):
        """TC04 — B2: quantity = 2 (ngay trên biên dưới)."""
        assert validate_them_gio_hang(2, "S", SO_LUONG_SP) is True

    def test_tc05_quantity_maxminus(self):
        """TC05 — B4: quantity = 49 (ngay dưới biên trên)."""
        assert validate_them_gio_hang(49, "L", SO_LUONG_SP) is True

    def test_tc06_size_s(self):
        """TC06 — V2: size = S (phần tử đầu tập hợp lệ)."""
        assert validate_them_gio_hang(25, "S", SO_LUONG_SP) is True

    def test_tc07_size_xl(self):
        """TC07 — V2: size = XL (phần tử cuối tập hợp lệ)."""
        assert validate_them_gio_hang(25, "XL", SO_LUONG_SP) is True

    def test_tc08_quantity_min_size_xl(self):
        """TC08 — B1, V2: quantity tối thiểu, size XL."""
        assert validate_them_gio_hang(1, "XL", SO_LUONG_SP) is True


class TestKhongHopLe:

    def test_tc09_quantity_bang_khong(self):
        """TC09 — X1: quantity = 0 (dưới biên dưới)."""
        assert validate_them_gio_hang(0, "M", SO_LUONG_SP) is False

    def test_tc10_quantity_am(self):
        """TC10 — X1: quantity = -1 (số âm)."""
        assert validate_them_gio_hang(-1, "M", SO_LUONG_SP) is False

    def test_tc11_quantity_vuot_ton_kho(self):
        """TC11 — X2: quantity = 51 (vượt tồn kho 50)."""
        assert validate_them_gio_hang(51, "M", SO_LUONG_SP) is False

    def test_tc12_size_xxl(self):
        """TC12 — X3: size = 'XXL' (không thuộc tập hợp lệ)."""
        assert validate_them_gio_hang(25, "XXL", SO_LUONG_SP) is False

    def test_tc13_size_khong_hop_le(self):
        """TC13 — X3: size = 'A' (kích cỡ không tồn tại)."""
        assert validate_them_gio_hang(25, "A", SO_LUONG_SP) is False

    def test_tc14_size_rong(self):
        """TC14 — X3: size = '' (rỗng)."""
        assert validate_them_gio_hang(25, "", SO_LUONG_SP) is False

    def test_tc15_ca_hai_sai(self):
        """TC15 — X1, X3: quantity = 0 và size = 'XXL'."""
        assert validate_them_gio_hang(0, "XXL", SO_LUONG_SP) is False

    def test_tc16_quantity_vuot_max_size_hop_le(self):
        """TC16 — X2: quantity vượt tồn kho, size hợp lệ."""
        assert validate_them_gio_hang(51, "L", SO_LUONG_SP) is False
```

### Hướng dẫn chạy

```bash
pip install pytest

# Chạy toàn bộ test
python -m pytest test_them_gio_hang.py -v

# Chạy chỉ nhóm test hợp lệ
python -m pytest test_them_gio_hang.py::TestHopLeTaiBien -v

# Chạy chỉ nhóm test không hợp lệ
python -m pytest test_them_gio_hang.py::TestKhongHopLe -v
```
