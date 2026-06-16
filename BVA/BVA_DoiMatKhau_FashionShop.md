# Kiểm Thử Chức Năng Đổi Mật Khẩu — Fashion Shop

**Chức năng:** Thay đổi mật khẩu tài khoản (`PUT /api/v1/profile/password`)  
**File liên quan:** `fashionshop-web/src/pages/Profile.jsx`, `fashionshop-api/app/Http/Controllers/Api/ProfileController.php`

---

## Mô tả bài toán

Hệ thống Fashion Shop cho phép người dùng đã đăng nhập thay đổi mật khẩu tài khoản. Một yêu cầu đổi mật khẩu được xem là **hợp lệ** khi tất cả điều kiện sau đồng thời thỏa mãn:

| Biến đầu vào | Ý nghĩa | Kiểu dữ liệu | Miền giá trị hợp lệ |
|---|---|---|---|
| `old_password` | Độ dài mật khẩu hiện tại (số ký tự) | Số nguyên | Từ 1 đến 50 |
| `new_password` | Độ dài mật khẩu mới (số ký tự) | Số nguyên | Từ 6 đến 50 |

> **Nguồn ràng buộc:**
> - `old_password`: Zod `z.string().min(1)` (bắt buộc nhập), Laravel `required` + kiểm tra hash so với DB
> - `new_password`: Zod `z.string().min(6)`, Laravel `required|min:6|confirmed`, giới hạn thực tế 50 ký tự
> - `new_password_confirmation`: phải khớp với `new_password` — điều kiện định dạng, không áp dụng BVA số

## Công thức logic

$$
Valid =
(1 \leq old\_password \leq 50)
\land
(6 \leq new\_password \leq 50)
$$

---

## Câu 1. Lớp tương đương

| Biến đầu vào | Lớp hợp lệ | Tag | Lớp không hợp lệ | Tag |
|---|---|---|---|---|
| Độ dài mật khẩu cũ (`old_password`) | 1 ≤ old_password ≤ 50 | V1 | old_password < 1 (ví dụ: 0 ký tự — rỗng) | X1 |
| | | | old_password > 50 (ví dụ: 51 ký tự) | X2 |
| Độ dài mật khẩu mới (`new_password`) | 6 ≤ new_password ≤ 50 | V2 | new_password < 6 (ví dụ: 5 ký tự) | X3 |
| | | | new_password > 50 (ví dụ: 51 ký tự) | X4 |

---

## Câu 2. Phân tích giá trị biên

| Biến đầu vào | min | min+ | nominal | max- | max | Tag biên |
|---|---:|---:|---:|---:|---:|---|
| Độ dài mật khẩu cũ (`old_password`) | 1 | 2 | 25 | 49 | 50 | B1–B5 |
| Độ dài mật khẩu mới (`new_password`) | 6 | 7 | 28 | 49 | 50 | B6–B10 |

### Chi tiết tag biên

| Tag | Biến | Giá trị | Loại |
|---|---|---:|---|
| B1 | old_password | 1 | min (mật khẩu cũ tối thiểu 1 ký tự) |
| B2 | old_password | 2 | min+ |
| B3 | old_password | 25 | nominal |
| B4 | old_password | 49 | max- |
| B5 | old_password | 50 | max |
| B6 | new_password | 6 | min (mật khẩu mới tối thiểu 6 ký tự) |
| B7 | new_password | 7 | min+ |
| B8 | new_password | 28 | nominal |
| B9 | new_password | 49 | max- |
| B10 | new_password | 50 | max |

---

## Câu 3. Thiết kế test case

| STT | Tên test case | old_password (ký tự) | new_password (ký tự) | Kết quả mong đợi | Tag được bao phủ |
|---:|---|---:|---:|---|---|
| 1 | Tất cả hợp lệ — giá trị đại diện | 25 | 28 | **Hợp lệ** | V1, V2, B3, B8 |
| 2 | old_password tại biên dưới (1 ký tự) | 1 | 28 | **Hợp lệ** — mật khẩu cũ tối thiểu 1 ký tự | V1, V2, B1 |
| 3 | old_password tại biên trên (50 ký tự) | 50 | 28 | **Hợp lệ** — mật khẩu cũ tối đa 50 ký tự | V1, V2, B5 |
| 4 | new_password tại biên dưới (6 ký tự) | 25 | 6 | **Hợp lệ** — mật khẩu mới tối thiểu 6 ký tự | V1, V2, B6 |
| 5 | new_password tại biên trên (50 ký tự) | 25 | 50 | **Hợp lệ** — mật khẩu mới tối đa 50 ký tự | V1, V2, B10 |
| 6 | old_password min+, new_password min+ | 2 | 7 | **Hợp lệ** — cả hai ngay trên biên dưới | V1, V2, B2, B7 |
| 7 | old_password max-, new_password max- | 49 | 49 | **Hợp lệ** — cả hai ngay dưới biên trên | V1, V2, B4, B9 |
| 8 | Tất cả tại biên dưới hợp lệ | 1 | 6 | **Hợp lệ** — tất cả biến tại min | V1, V2, B1, B6 |
| 9 | old_password rỗng (0 ký tự) | 0 | 28 | **Không hợp lệ** — mật khẩu cũ không được để trống | X1 |
| 10 | old_password quá dài (51 ký tự) | 51 | 28 | **Không hợp lệ** — mật khẩu cũ > 50 ký tự | X2 |
| 11 | new_password quá ngắn (5 ký tự) | 25 | 5 | **Không hợp lệ** — mật khẩu mới < 6 ký tự | X3 |
| 12 | new_password = 1 ký tự | 25 | 1 | **Không hợp lệ** — mật khẩu mới quá ngắn | X3 |
| 13 | new_password quá dài (51 ký tự) | 25 | 51 | **Không hợp lệ** — mật khẩu mới > 50 ký tự | X4 |
| 14 | Cả hai biến sai đồng thời | 0 | 5 | **Không hợp lệ** — old_password rỗng, new_password < 6 | X1, X3 |
| 15 | old_password hợp lệ, new_password vượt max | 25 | 51 | **Không hợp lệ** — chỉ new_password vi phạm | X4 |

---

## Câu 4. Triển khai kiểm thử tự động

### Hàm kiểm tra logic

```python
def validate_doi_mat_khau(old_password: int, new_password: int) -> bool:
    """
    Kiểm tra tính hợp lệ của yêu cầu đổi mật khẩu Fashion Shop.

    Tham số:
        old_password (int): Số ký tự của mật khẩu hiện tại.
        new_password (int): Số ký tự của mật khẩu mới.

    Trả về:
        True  nếu tất cả đầu vào hợp lệ.
        False nếu có ít nhất một đầu vào không hợp lệ.
    """
    return (
        1 <= old_password <= 50 and
        6 <= new_password <= 50
    )
```

### Unit Test — Framework: `pytest`

```python
import pytest
from validate_doi_mat_khau import validate_doi_mat_khau


class TestHopLeTaiBien:

    def test_tc01_nominal(self):
        """TC01: Giá trị đại diện — hợp lệ."""
        assert validate_doi_mat_khau(25, 28) is True

    def test_tc02_old_min(self):
        """TC02 — B1: old_password = 1 ký tự (biên dưới hợp lệ)."""
        assert validate_doi_mat_khau(1, 28) is True

    def test_tc03_old_max(self):
        """TC03 — B5: old_password = 50 ký tự (biên trên hợp lệ)."""
        assert validate_doi_mat_khau(50, 28) is True

    def test_tc04_new_min(self):
        """TC04 — B6: new_password = 6 ký tự (biên dưới hợp lệ)."""
        assert validate_doi_mat_khau(25, 6) is True

    def test_tc05_new_max(self):
        """TC05 — B10: new_password = 50 ký tự (biên trên hợp lệ)."""
        assert validate_doi_mat_khau(25, 50) is True

    def test_tc06_ca_hai_bien_min(self):
        """TC06: old = 1 (min), new = 6 (min) — tất cả tại biên dưới."""
        assert validate_doi_mat_khau(1, 6) is True

    def test_tc07_ca_hai_bien_max(self):
        """TC07: old = 50 (max), new = 50 (max) — tất cả tại biên trên."""
        assert validate_doi_mat_khau(50, 50) is True

    def test_tc08_minplus(self):
        """TC08 — B2, B7: old = 2, new = 7 (ngay trên biên dưới)."""
        assert validate_doi_mat_khau(2, 7) is True


class TestKhongHopLe:

    def test_tc09_old_rong(self):
        """TC09 — X1: old_password = 0 (rỗng, dưới biên dưới)."""
        assert validate_doi_mat_khau(0, 28) is False

    def test_tc10_old_tren_max(self):
        """TC10 — X2: old_password = 51 (trên biên trên)."""
        assert validate_doi_mat_khau(51, 28) is False

    def test_tc11_new_qua_ngan(self):
        """TC11 — X3: new_password = 5 ký tự (dưới biên dưới)."""
        assert validate_doi_mat_khau(25, 5) is False

    def test_tc12_new_mot_ky_tu(self):
        """TC12 — X3: new_password = 1 ký tự (quá ngắn)."""
        assert validate_doi_mat_khau(25, 1) is False

    def test_tc13_new_tren_max(self):
        """TC13 — X4: new_password = 51 ký tự (trên biên trên)."""
        assert validate_doi_mat_khau(25, 51) is False

    def test_tc14_ca_hai_sai(self):
        """TC14 — X1, X3: old rỗng, new quá ngắn."""
        assert validate_doi_mat_khau(0, 5) is False

    def test_tc15_new_am(self):
        """TC15 — X3: new_password = -1 (giá trị âm)."""
        assert validate_doi_mat_khau(25, -1) is False
```

### Hướng dẫn chạy

```bash
pip install pytest

# Chạy toàn bộ test
python -m pytest test_doi_mat_khau.py -v

# Chạy chỉ nhóm test hợp lệ
python -m pytest test_doi_mat_khau.py::TestHopLeTaiBien -v

# Chạy chỉ nhóm test không hợp lệ
python -m pytest test_doi_mat_khau.py::TestKhongHopLe -v
```
