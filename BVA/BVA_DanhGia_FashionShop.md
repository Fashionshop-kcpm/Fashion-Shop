# Kiểm Thử Chức Năng Đánh Giá Sản Phẩm — Fashion Shop

**Chức năng:** Gửi đánh giá sản phẩm (`POST /api/v1/products/{id}/reviews`)  
**File liên quan:** `fashionshop-web/src/pages/ProductDetail.jsx`, `fashionshop-api/app/Http/Controllers/Api/ReviewController.php`

---

## Mô tả bài toán

Hệ thống Fashion Shop cho phép người dùng đã đăng nhập gửi đánh giá sản phẩm sau khi mua hàng. Một đánh giá được xem là **hợp lệ** khi tất cả điều kiện sau đồng thời thỏa mãn:

| Biến đầu vào | Ý nghĩa | Kiểu dữ liệu | Miền giá trị hợp lệ |
|---|---|---|---|
| `rating` | Số sao đánh giá | Số nguyên | Từ 1 đến 5 |
| `comment` | Độ dài nội dung nhận xét (số ký tự) | Số nguyên | Từ 5 đến 500 |

> **Nguồn ràng buộc:**
> - `rating`: Zod `z.coerce.number().min(1).max(5)`, Laravel `integer|min:1|max:5`
> - `comment`: Zod `z.string().min(5)`, Laravel `string`, giới hạn thực tế 500 ký tự (cột TEXT)

## Công thức logic

$$
Valid =
(1 \leq rating \leq 5)
\land
(5 \leq comment \leq 500)
$$

---

## Câu 1. Lớp tương đương

| Biến đầu vào | Lớp hợp lệ | Tag | Lớp không hợp lệ | Tag |
|---|---|---|---|---|
| Số sao đánh giá (`rating`) | 1 ≤ rating ≤ 5 | V1 | rating < 1 (ví dụ: 0 sao) | X1 |
| | | | rating > 5 (ví dụ: 6 sao) | X2 |
| Độ dài nhận xét (`comment`) | 5 ≤ comment ≤ 500 | V2 | comment < 5 (ví dụ: 4 ký tự) | X3 |
| | | | comment > 500 (ví dụ: 501 ký tự) | X4 |

---

## Câu 2. Phân tích giá trị biên

| Biến đầu vào | min | min+ | nominal | max- | max | Tag biên |
|---|---:|---:|---:|---:|---:|---|
| Số sao (`rating`) | 1 | 2 | 3 | 4 | 5 | B1–B5 |
| Độ dài nhận xét (`comment`) | 5 | 6 | 252 | 499 | 500 | B6–B10 |

### Chi tiết tag biên

| Tag | Biến | Giá trị | Loại |
|---|---|---:|---|
| B1 | rating | 1 | min (1 sao — tệ nhất) |
| B2 | rating | 2 | min+ |
| B3 | rating | 3 | nominal (trung bình) |
| B4 | rating | 4 | max- |
| B5 | rating | 5 | max (5 sao — tốt nhất) |
| B6 | comment | 5 | min |
| B7 | comment | 6 | min+ |
| B8 | comment | 252 | nominal |
| B9 | comment | 499 | max- |
| B10 | comment | 500 | max |

---

## Câu 3. Thiết kế test case

| STT | Tên test case | rating (sao) | comment (ký tự) | Kết quả mong đợi | Tag được bao phủ |
|---:|---|---:|---:|---|---|
| 1 | Tất cả hợp lệ — giá trị đại diện | 3 | 252 | **Hợp lệ** | V1, V2, B3, B8 |
| 2 | rating tại biên dưới (1 sao) | 1 | 252 | **Hợp lệ** — đánh giá 1 sao hợp lệ | V1, V2, B1 |
| 3 | rating tại biên trên (5 sao) | 5 | 252 | **Hợp lệ** — đánh giá 5 sao hợp lệ | V1, V2, B5 |
| 4 | comment tại biên dưới (5 ký tự) | 3 | 5 | **Hợp lệ** — nhận xét đúng tối thiểu 5 ký tự | V1, V2, B6 |
| 5 | comment tại biên trên (500 ký tự) | 3 | 500 | **Hợp lệ** — nhận xét đạt tối đa 500 ký tự | V1, V2, B10 |
| 6 | rating tại min+, comment tại min+ | 2 | 6 | **Hợp lệ** — cả hai biến ngay trên biên dưới | V1, V2, B2, B7 |
| 7 | rating tại max-, comment tại max- | 4 | 499 | **Hợp lệ** — cả hai biến ngay dưới biên trên | V1, V2, B4, B9 |
| 8 | Tất cả tại biên dưới (min) | 1 | 5 | **Hợp lệ** — tất cả biến tại min | V1, V2, B1, B6 |
| 9 | rating = 0 (dưới biên dưới) | 0 | 252 | **Không hợp lệ** — số sao < 1 | X1 |
| 10 | rating = -1 (âm) | -1 | 252 | **Không hợp lệ** — số sao không thể âm | X1 |
| 11 | rating = 6 (trên biên trên) | 6 | 252 | **Không hợp lệ** — số sao > 5 | X2 |
| 12 | comment = 4 ký tự (dưới min) | 3 | 4 | **Không hợp lệ** — nhận xét < 5 ký tự | X3 |
| 13 | comment = 501 ký tự (trên max) | 3 | 501 | **Không hợp lệ** — nhận xét > 500 ký tự | X4 |
| 14 | Cả hai biến sai đồng thời | 0 | 4 | **Không hợp lệ** — rating và comment đều vi phạm | X1, X3 |
| 15 | rating = 5, comment = 501 (chỉ comment sai) | 5 | 501 | **Không hợp lệ** — comment vượt giới hạn | X4 |

---

## Câu 4. Triển khai kiểm thử tự động

### Hàm kiểm tra logic

```python
def validate_danh_gia(rating: int, comment: int) -> bool:
    """
    Kiểm tra tính hợp lệ của một đánh giá sản phẩm Fashion Shop.

    Tham số:
        rating  (int): Số sao đánh giá (1–5).
        comment (int): Số ký tự của nội dung nhận xét.

    Trả về:
        True  nếu tất cả đầu vào hợp lệ.
        False nếu có ít nhất một đầu vào không hợp lệ.
    """
    return (
        1 <= rating <= 5 and
        5 <= comment <= 500
    )
```

### Unit Test — Framework: `pytest`

```python
import pytest
from validate_danh_gia import validate_danh_gia


class TestHopLeTaiBien:

    def test_tc01_nominal(self):
        """TC01: Giá trị đại diện — hợp lệ."""
        assert validate_danh_gia(3, 252) is True

    def test_tc02_rating_min(self):
        """TC02 — B1: rating = 1 sao (biên dưới hợp lệ)."""
        assert validate_danh_gia(1, 252) is True

    def test_tc03_rating_max(self):
        """TC03 — B5: rating = 5 sao (biên trên hợp lệ)."""
        assert validate_danh_gia(5, 252) is True

    def test_tc04_comment_min(self):
        """TC04 — B6: comment = 5 ký tự (biên dưới hợp lệ)."""
        assert validate_danh_gia(3, 5) is True

    def test_tc05_comment_max(self):
        """TC05 — B10: comment = 500 ký tự (biên trên hợp lệ)."""
        assert validate_danh_gia(3, 500) is True

    def test_tc06_ca_hai_bien_min(self):
        """TC06: Cả hai biến tại min hợp lệ."""
        assert validate_danh_gia(1, 5) is True

    def test_tc07_ca_hai_bien_max(self):
        """TC07: Cả hai biến tại max hợp lệ."""
        assert validate_danh_gia(5, 500) is True

    def test_tc08_rating_minplus_comment_minplus(self):
        """TC08 — B2, B7: rating = 2, comment = 6 (ngay trên biên dưới)."""
        assert validate_danh_gia(2, 6) is True


class TestKhongHopLe:

    def test_tc09_rating_bang_khong(self):
        """TC09 — X1: rating = 0 (dưới biên dưới)."""
        assert validate_danh_gia(0, 252) is False

    def test_tc10_rating_am(self):
        """TC10 — X1: rating = -1 (số âm)."""
        assert validate_danh_gia(-1, 252) is False

    def test_tc11_rating_tren_max(self):
        """TC11 — X2: rating = 6 (trên biên trên)."""
        assert validate_danh_gia(6, 252) is False

    def test_tc12_comment_duoi_min(self):
        """TC12 — X3: comment = 4 ký tự (dưới biên dưới)."""
        assert validate_danh_gia(3, 4) is False

    def test_tc13_comment_tren_max(self):
        """TC13 — X4: comment = 501 ký tự (trên biên trên)."""
        assert validate_danh_gia(3, 501) is False

    def test_tc14_ca_hai_bien_sai(self):
        """TC14 — X1, X3: rating và comment đều vi phạm."""
        assert validate_danh_gia(0, 4) is False

    def test_tc15_rating_hop_le_comment_sai(self):
        """TC15 — X4: rating hợp lệ nhưng comment vượt giới hạn."""
        assert validate_danh_gia(5, 501) is False
```

### Hướng dẫn chạy

```bash
pip install pytest
pytest test_danh_gia.py -v
```
