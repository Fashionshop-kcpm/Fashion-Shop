# Kiểm Thử Chức Năng Đăng Ký Tài Khoản — Fashion Shop

**Chức năng:** Đăng ký tài khoản người dùng mới (`POST /api/v1/register`)  
**File liên quan:** `fashionshop-web/src/pages/Register.jsx`, `fashionshop-api/app/Http/Controllers/Api/AuthController.php`

---

## Mô tả bài toán

Hệ thống Fashion Shop cho phép người dùng mới tạo tài khoản bằng cách điền thông tin cá nhân. Yêu cầu đăng ký được xem là **hợp lệ** khi tất cả điều kiện sau đồng thời thỏa mãn:

| Biến đầu vào | Ý nghĩa | Kiểu dữ liệu | Miền giá trị hợp lệ |
|---|---|---|---|
| `fullname` | Độ dài họ tên (số ký tự) | Số nguyên | Từ 2 đến 255 |
| `phone` | Số lượng chữ số của số điện thoại | Số nguyên | Từ 9 đến 11 |
| `password` | Độ dài mật khẩu (số ký tự) | Số nguyên | Từ 6 đến 50 |

> **Nguồn ràng buộc:**
> - `fullname`: Zod `z.string().min(2)`, Laravel `string|max:255`
> - `phone`: Zod `z.string().regex(/^\d{9,11}$/)`, Laravel `regex:/^[0-9]{9,11}$/`
> - `password`: Zod `z.string().min(6)`, Laravel `min:6`, giới hạn thực tế 50 ký tự

## Công thức logic

$$
Valid =
(2 \leq fullname \leq 255)
\land
(9 \leq phone \leq 11)
\land
(6 \leq password \leq 50)
$$

---

## Câu 1. Lớp tương đương

| Biến đầu vào | Lớp hợp lệ | Tag | Lớp không hợp lệ | Tag |
|---|---|---|---|---|
| Độ dài họ tên (`fullname`) | 2 ≤ fullname ≤ 255 | V1 | fullname < 2 (ví dụ: 1 ký tự) | X1 |
| | | | fullname > 255 (ví dụ: 256 ký tự) | X2 |
| Số chữ số điện thoại (`phone`) | 9 ≤ phone ≤ 11 | V2 | phone < 9 (ví dụ: 8 chữ số) | X3 |
| | | | phone > 11 (ví dụ: 12 chữ số) | X4 |
| Độ dài mật khẩu (`password`) | 6 ≤ password ≤ 50 | V3 | password < 6 (ví dụ: 5 ký tự) | X5 |
| | | | password > 50 (ví dụ: 51 ký tự) | X6 |

---

## Câu 2. Phân tích giá trị biên

| Biến đầu vào | min | min+ | nominal | max- | max | Tag biên |
|---|---:|---:|---:|---:|---:|---|
| Độ dài họ tên (`fullname`) | 2 | 3 | 128 | 254 | 255 | B1–B5 |
| Số chữ số điện thoại (`phone`) | 9 | 10 | 10 | 10 | 11 | B6–B10 |
| Độ dài mật khẩu (`password`) | 6 | 7 | 28 | 49 | 50 | B11–B15 |

### Chi tiết tag biên

| Tag | Biến | Giá trị | Loại |
|---|---|---:|---|
| B1 | fullname | 2 | min |
| B2 | fullname | 3 | min+ |
| B3 | fullname | 128 | nominal |
| B4 | fullname | 254 | max- |
| B5 | fullname | 255 | max |
| B6 | phone | 9 | min |
| B7 | phone | 10 | min+ = nominal = max- |
| B8 | phone | 11 | max |
| B9 | password | 6 | min |
| B10 | password | 7 | min+ |
| B11 | password | 28 | nominal |
| B12 | password | 49 | max- |
| B13 | password | 50 | max |

> **Lưu ý:** `phone` có miền [9, 11] hẹp (3 giá trị nguyên), nên `min+`, `nominal`, `max-` đều bằng 10.

---

## Câu 3. Thiết kế test case

| STT | Tên test case | fullname (ký tự) | phone (chữ số) | password (ký tự) | Kết quả mong đợi | Tag được bao phủ |
|---:|---|---:|---:|---:|---|---|
| 1 | Tất cả hợp lệ — giá trị đại diện | 128 | 10 | 28 | **Hợp lệ** | V1, V2, V3, B3, B7, B11 |
| 2 | fullname tại biên dưới (min = 2) | 2 | 10 | 28 | **Hợp lệ** — họ tên tối thiểu 2 ký tự | V1, V2, V3, B1 |
| 3 | fullname tại biên trên (max = 255) | 255 | 10 | 28 | **Hợp lệ** — họ tên đạt tối đa 255 ký tự | V1, V2, V3, B5 |
| 4 | phone tại biên dưới (9 chữ số) | 128 | 9 | 28 | **Hợp lệ** — SĐT 9 chữ số hợp lệ | V1, V2, V3, B6 |
| 5 | phone tại biên trên (11 chữ số) | 128 | 11 | 28 | **Hợp lệ** — SĐT 11 chữ số hợp lệ | V1, V2, V3, B8 |
| 6 | password tại biên dưới (min = 6) | 128 | 10 | 6 | **Hợp lệ** — mật khẩu tối thiểu 6 ký tự | V1, V2, V3, B9 |
| 7 | password tại biên trên (max = 50) | 128 | 10 | 50 | **Hợp lệ** — mật khẩu tối đa 50 ký tự | V1, V2, V3, B13 |
| 8 | Tất cả tại biên dưới hợp lệ | 2 | 9 | 6 | **Hợp lệ** — tất cả biến tại min | V1, V2, V3, B1, B6, B9 |
| 9 | fullname quá ngắn (1 ký tự) | 1 | 10 | 28 | **Không hợp lệ** — họ tên < 2 ký tự | X1 |
| 10 | fullname quá dài (256 ký tự) | 256 | 10 | 28 | **Không hợp lệ** — họ tên > 255 ký tự | X2 |
| 11 | phone thiếu chữ số (8 chữ số) | 128 | 8 | 28 | **Không hợp lệ** — SĐT < 9 chữ số | X3 |
| 12 | phone dư chữ số (12 chữ số) | 128 | 12 | 28 | **Không hợp lệ** — SĐT > 11 chữ số | X4 |
| 13 | password quá ngắn (5 ký tự) | 128 | 10 | 5 | **Không hợp lệ** — mật khẩu < 6 ký tự | X5 |
| 14 | password quá dài (51 ký tự) | 128 | 10 | 51 | **Không hợp lệ** — mật khẩu > 50 ký tự | X6 |
| 15 | Nhiều biến sai đồng thời | 1 | 8 | 5 | **Không hợp lệ** — fullname, phone, password đều vi phạm | X1, X3, X5 |

---

## Câu 4. Triển khai kiểm thử tự động

### Hàm kiểm tra logic

```python
def validate_dang_ky(fullname: int, phone: int, password: int) -> bool:
    """
    Kiểm tra tính hợp lệ của một yêu cầu đăng ký tài khoản Fashion Shop.

    Tham số:
        fullname (int): Số ký tự của họ tên.
        phone    (int): Số lượng chữ số của số điện thoại.
        password (int): Số ký tự của mật khẩu.

    Trả về:
        True  nếu tất cả đầu vào hợp lệ.
        False nếu có ít nhất một đầu vào không hợp lệ.
    """
    return (
        2 <= fullname <= 255 and
        9 <= phone <= 11 and
        6 <= password <= 50
    )
```

### Unit Test — Framework: `pytest`

```python
import pytest
from validate_dang_ky import validate_dang_ky


class TestHopLeTaiBien:

    def test_tc01_nominal(self):
        """TC01: Tất cả giá trị đại diện — hợp lệ."""
        assert validate_dang_ky(128, 10, 28) is True

    def test_tc02_fullname_min(self):
        """TC02 — B1: fullname = 2 (biên dưới hợp lệ)."""
        assert validate_dang_ky(2, 10, 28) is True

    def test_tc03_fullname_max(self):
        """TC03 — B5: fullname = 255 (biên trên hợp lệ)."""
        assert validate_dang_ky(255, 10, 28) is True

    def test_tc04_phone_min(self):
        """TC04 — B6: phone = 9 chữ số (biên dưới hợp lệ)."""
        assert validate_dang_ky(128, 9, 28) is True

    def test_tc05_phone_max(self):
        """TC05 — B8: phone = 11 chữ số (biên trên hợp lệ)."""
        assert validate_dang_ky(128, 11, 28) is True

    def test_tc06_password_min(self):
        """TC06 — B9: password = 6 ký tự (biên dưới hợp lệ)."""
        assert validate_dang_ky(128, 10, 6) is True

    def test_tc07_password_max(self):
        """TC07 — B13: password = 50 ký tự (biên trên hợp lệ)."""
        assert validate_dang_ky(128, 10, 50) is True

    def test_tc08_tat_ca_bien_min(self):
        """TC08: Tất cả biến tại giá trị min hợp lệ."""
        assert validate_dang_ky(2, 9, 6) is True


class TestKhongHopLe:

    def test_tc09_fullname_duoi_min(self):
        """TC09 — X1: fullname = 1 (dưới biên dưới)."""
        assert validate_dang_ky(1, 10, 28) is False

    def test_tc10_fullname_tren_max(self):
        """TC10 — X2: fullname = 256 (trên biên trên)."""
        assert validate_dang_ky(256, 10, 28) is False

    def test_tc11_phone_duoi_min(self):
        """TC11 — X3: phone = 8 chữ số (dưới biên dưới)."""
        assert validate_dang_ky(128, 8, 28) is False

    def test_tc12_phone_tren_max(self):
        """TC12 — X4: phone = 12 chữ số (trên biên trên)."""
        assert validate_dang_ky(128, 12, 28) is False

    def test_tc13_password_duoi_min(self):
        """TC13 — X5: password = 5 ký tự (dưới biên dưới)."""
        assert validate_dang_ky(128, 10, 5) is False

    def test_tc14_password_tren_max(self):
        """TC14 — X6: password = 51 ký tự (trên biên trên)."""
        assert validate_dang_ky(128, 10, 51) is False

    def test_tc15_nhieu_bien_sai(self):
        """TC15 — X1, X3, X5: fullname, phone, password đều vi phạm."""
        assert validate_dang_ky(1, 8, 5) is False
```

### Hướng dẫn chạy

```bash
pip install pytest
pytest test_dang_ky.py -v
```
