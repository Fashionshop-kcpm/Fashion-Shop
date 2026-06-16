# Kiểm Thử Chức Năng Quản Lý Sản Phẩm (Admin) — Fashion Shop

**Chức năng:** Thêm / cập nhật sản phẩm (`POST /api/v1/admin/products`, `PATCH /api/v1/admin/products/{id}`)  
**File liên quan:** `fashionshop-admin/src/pages/ProductForm.jsx`, `fashionshop-api/app/Http/Controllers/Api/Admin/ProductController.php`

---

## Mô tả bài toán

Hệ thống Fashion Shop cho phép Admin thêm mới hoặc chỉnh sửa thông tin sản phẩm. Một yêu cầu quản lý sản phẩm được xem là **hợp lệ** khi tất cả điều kiện sau đồng thời thỏa mãn:

| Biến đầu vào | Ý nghĩa | Kiểu dữ liệu | Miền giá trị hợp lệ |
|---|---|---|---|
| `ten_sp` | Độ dài tên sản phẩm (số ký tự) | Số nguyên | Từ 1 đến 255 |
| `gia` | Giá bán sản phẩm (VNĐ) | Số nguyên | Từ 0 đến 999.999.999 |
| `so_luong` | Số lượng tồn kho | Số nguyên | Từ 0 đến 10.000 |

> **Nguồn ràng buộc:**
> - `ten_sp`: Laravel `required|string`, DB `varchar(255)`, tối thiểu 1 ký tự (required)
> - `gia`: Laravel `required|integer|min:0`, DB `unsignedBigInteger`, giới hạn thực tế 999.999.999 VNĐ
> - `so_luong`: Laravel `required|integer|min:0`, DB `integer`, giới hạn thực tế 10.000 sản phẩm/kho
> - `gia_cu` (giá cũ): nullable — không áp dụng BVA bắt buộc

## Công thức logic

$$
Valid =
(1 \leq ten\_sp \leq 255)
\land
(0 \leq gia \leq 999{,}999{,}999)
\land
(0 \leq so\_luong \leq 10{,}000)
$$

---

## Câu 1. Lớp tương đương

| Biến đầu vào | Lớp hợp lệ | Tag | Lớp không hợp lệ | Tag |
|---|---|---|---|---|
| Độ dài tên sản phẩm (`ten_sp`) | 1 ≤ ten_sp ≤ 255 | V1 | ten_sp < 1 (ví dụ: 0 ký tự — rỗng) | X1 |
| | | | ten_sp > 255 (ví dụ: 256 ký tự) | X2 |
| Giá bán (`gia`) | 0 ≤ gia ≤ 999.999.999 | V2 | gia < 0 (ví dụ: -1 — âm) | X3 |
| | | | gia > 999.999.999 (ví dụ: 1.000.000.000) | X4 |
| Tồn kho (`so_luong`) | 0 ≤ so_luong ≤ 10.000 | V3 | so_luong < 0 (ví dụ: -1 — âm) | X5 |
| | | | so_luong > 10.000 (ví dụ: 10.001) | X6 |

---

## Câu 2. Phân tích giá trị biên

| Biến đầu vào | min | min+ | nominal | max- | max | Tag biên |
|---|---:|---:|---:|---:|---:|---|
| Độ dài tên SP (`ten_sp`) | 1 | 2 | 128 | 254 | 255 | B1–B5 |
| Giá bán (`gia`) | 0 | 1 | 500.000.000 | 999.999.998 | 999.999.999 | B6–B10 |
| Tồn kho (`so_luong`) | 0 | 1 | 5.000 | 9.999 | 10.000 | B11–B15 |

### Chi tiết tag biên

| Tag | Biến | Giá trị | Loại |
|---|---|---:|---|
| B1 | ten_sp | 1 | min (tên tối thiểu 1 ký tự) |
| B2 | ten_sp | 2 | min+ |
| B3 | ten_sp | 128 | nominal |
| B4 | ten_sp | 254 | max- |
| B5 | ten_sp | 255 | max |
| B6 | gia | 0 | min (sản phẩm miễn phí / tặng kèm) |
| B7 | gia | 1 | min+ |
| B8 | gia | 500.000.000 | nominal |
| B9 | gia | 999.999.998 | max- |
| B10 | gia | 999.999.999 | max |
| B11 | so_luong | 0 | min (hết hàng) |
| B12 | so_luong | 1 | min+ |
| B13 | so_luong | 5.000 | nominal |
| B14 | so_luong | 9.999 | max- |
| B15 | so_luong | 10.000 | max |

---

## Câu 3. Thiết kế test case

| STT | Tên test case | ten_sp (ký tự) | gia (VNĐ) | so_luong | Kết quả mong đợi | Tag được bao phủ |
|---:|---|---:|---:|---:|---|---|
| 1 | Tất cả hợp lệ — giá trị đại diện | 128 | 500.000.000 | 5.000 | **Hợp lệ** | V1, V2, V3, B3, B8, B13 |
| 2 | ten_sp tại biên dưới (1 ký tự) | 1 | 500.000.000 | 5.000 | **Hợp lệ** — tên tối thiểu 1 ký tự | V1, V2, V3, B1 |
| 3 | ten_sp tại biên trên (255 ký tự) | 255 | 500.000.000 | 5.000 | **Hợp lệ** — tên tối đa 255 ký tự | V1, V2, V3, B5 |
| 4 | gia = 0 (sản phẩm miễn phí) | 128 | 0 | 5.000 | **Hợp lệ** — giá 0 hợp lệ (quà tặng) | V1, V2, V3, B6 |
| 5 | gia tại biên trên (999.999.999) | 128 | 999.999.999 | 5.000 | **Hợp lệ** — giá đạt tối đa | V1, V2, V3, B10 |
| 6 | so_luong = 0 (hết hàng) | 128 | 500.000.000 | 0 | **Hợp lệ** — tồn kho 0 (hết hàng, vẫn lưu được) | V1, V2, V3, B11 |
| 7 | so_luong tại biên trên (10.000) | 128 | 500.000.000 | 10.000 | **Hợp lệ** — tồn kho đạt tối đa | V1, V2, V3, B15 |
| 8 | Tất cả tại biên dưới hợp lệ | 1 | 0 | 0 | **Hợp lệ** — tất cả biến tại min | V1, V2, V3, B1, B6, B11 |
| 9 | ten_sp rỗng (0 ký tự) | 0 | 500.000.000 | 5.000 | **Không hợp lệ** — tên sản phẩm không được rỗng | X1 |
| 10 | ten_sp quá dài (256 ký tự) | 256 | 500.000.000 | 5.000 | **Không hợp lệ** — tên > 255 ký tự | X2 |
| 11 | gia âm (-1) | 128 | -1 | 5.000 | **Không hợp lệ** — giá không thể âm | X3 |
| 12 | gia vượt giới hạn (1.000.000.000) | 128 | 1.000.000.000 | 5.000 | **Không hợp lệ** — giá > 999.999.999 | X4 |
| 13 | so_luong âm (-1) | 128 | 500.000.000 | -1 | **Không hợp lệ** — tồn kho không thể âm | X5 |
| 14 | so_luong vượt giới hạn (10.001) | 128 | 500.000.000 | 10.001 | **Không hợp lệ** — tồn kho > 10.000 | X6 |
| 15 | Tất cả biến sai đồng thời | 0 | -1 | -1 | **Không hợp lệ** — ten_sp, gia, so_luong đều vi phạm | X1, X3, X5 |
| 16 | gia = 1 (min+), so_luong = 1 (min+) | 128 | 1 | 1 | **Hợp lệ** — giá và tồn kho ngay trên biên dưới | V1, V2, V3, B7, B12 |

---

## Câu 4. Triển khai kiểm thử tự động

### Hàm kiểm tra logic

```python
def validate_san_pham(ten_sp: int, gia: int, so_luong: int) -> bool:
    """
    Kiểm tra tính hợp lệ của thông tin sản phẩm trong Fashion Shop Admin.

    Tham số:
        ten_sp   (int): Số ký tự của tên sản phẩm.
        gia      (int): Giá bán sản phẩm (VNĐ), phải >= 0.
        so_luong (int): Số lượng tồn kho, phải >= 0.

    Trả về:
        True  nếu tất cả đầu vào hợp lệ.
        False nếu có ít nhất một đầu vào không hợp lệ.
    """
    return (
        1 <= ten_sp <= 255 and
        0 <= gia <= 999_999_999 and
        0 <= so_luong <= 10_000
    )
```

### Unit Test — Framework: `pytest`

```python
import pytest
from validate_san_pham import validate_san_pham


class TestHopLeTaiBien:

    def test_tc01_nominal(self):
        """TC01: Tất cả giá trị đại diện — hợp lệ."""
        assert validate_san_pham(128, 500_000_000, 5_000) is True

    def test_tc02_ten_sp_min(self):
        """TC02 — B1: ten_sp = 1 ký tự (biên dưới hợp lệ)."""
        assert validate_san_pham(1, 500_000_000, 5_000) is True

    def test_tc03_ten_sp_max(self):
        """TC03 — B5: ten_sp = 255 ký tự (biên trên hợp lệ)."""
        assert validate_san_pham(255, 500_000_000, 5_000) is True

    def test_tc04_gia_min(self):
        """TC04 — B6: gia = 0 (sản phẩm miễn phí / tặng kèm)."""
        assert validate_san_pham(128, 0, 5_000) is True

    def test_tc05_gia_max(self):
        """TC05 — B10: gia = 999.999.999 (biên trên hợp lệ)."""
        assert validate_san_pham(128, 999_999_999, 5_000) is True

    def test_tc06_so_luong_min(self):
        """TC06 — B11: so_luong = 0 (hết hàng — vẫn hợp lệ)."""
        assert validate_san_pham(128, 500_000_000, 0) is True

    def test_tc07_so_luong_max(self):
        """TC07 — B15: so_luong = 10.000 (biên trên hợp lệ)."""
        assert validate_san_pham(128, 500_000_000, 10_000) is True

    def test_tc08_tat_ca_bien_min(self):
        """TC08: Tất cả biến tại min hợp lệ."""
        assert validate_san_pham(1, 0, 0) is True

    def test_tc09_tat_ca_bien_max(self):
        """TC09: Tất cả biến tại max hợp lệ."""
        assert validate_san_pham(255, 999_999_999, 10_000) is True


class TestKhongHopLe:

    def test_tc10_ten_sp_rong(self):
        """TC10 — X1: ten_sp = 0 (rỗng, dưới biên dưới)."""
        assert validate_san_pham(0, 500_000_000, 5_000) is False

    def test_tc11_ten_sp_tren_max(self):
        """TC11 — X2: ten_sp = 256 (trên biên trên)."""
        assert validate_san_pham(256, 500_000_000, 5_000) is False

    def test_tc12_gia_am(self):
        """TC12 — X3: gia = -1 (giá âm)."""
        assert validate_san_pham(128, -1, 5_000) is False

    def test_tc13_gia_vuot_gioi_han(self):
        """TC13 — X4: gia = 1.000.000.000 (vượt giới hạn)."""
        assert validate_san_pham(128, 1_000_000_000, 5_000) is False

    def test_tc14_so_luong_am(self):
        """TC14 — X5: so_luong = -1 (tồn kho âm)."""
        assert validate_san_pham(128, 500_000_000, -1) is False

    def test_tc15_so_luong_vuot_gioi_han(self):
        """TC15 — X6: so_luong = 10.001 (vượt tồn kho tối đa)."""
        assert validate_san_pham(128, 500_000_000, 10_001) is False

    def test_tc16_nhieu_bien_sai(self):
        """TC16 — X1, X3, X5: tất cả biến đều vi phạm."""
        assert validate_san_pham(0, -1, -1) is False

    def test_tc17_gia_bien_duoi_vi_pham(self):
        """TC17 — X3: gia = -1 (ngay dưới biên dưới)."""
        assert validate_san_pham(128, -1, 5_000) is False

    def test_tc18_so_luong_bien_tren_vi_pham(self):
        """TC18 — X6: so_luong = 10.001 (ngay trên biên trên)."""
        assert validate_san_pham(128, 500_000_000, 10_001) is False
```

### Hướng dẫn chạy

```bash
pip install pytest

# Chạy toàn bộ test
python -m pytest test_san_pham.py -v

# Chạy chỉ nhóm test hợp lệ
python -m pytest test_san_pham.py::TestHopLeTaiBien -v

# Chạy chỉ nhóm test không hợp lệ
python -m pytest test_san_pham.py::TestKhongHopLe -v
```
