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

### Phương pháp: API Test với `requests`

Thay vì mô phỏng logic bằng hàm Python thuần, test gọi **trực tiếp endpoint PHP** qua HTTP và kiểm tra HTTP status code thực tế.

**Endpoint:** `POST /api/v1/products/{id}/reviews` (yêu cầu đăng nhập)  
**File test:** `test_BVA/test_danh_gia.py` | **Fixtures:** `test_BVA/conftest.py`

### Lưu ý — PHP backend vs Zod frontend

| Field | Zod (frontend) | PHP backend | Ảnh hưởng đến test |
|---|---|---|---|
| `rating` | `min:1`, `max:5` | `required\|integer\|min:1\|max:5` | Cả hai đều enforce 1–5 |
| `comment` | `min:5`, `max:500` | `required\|string` | comment=4 → PHP **201**; comment=501 → PHP **201** |

### API Test — `pytest` + `requests`

> Test dùng fixture `first_product_id` và `auth_headers` từ `conftest.py` (session-scoped).

```python
"""BVA Test: Đánh giá sản phẩm — POST /api/v1/products/{id}/reviews
Theo kịch bản Câu 3 BVA_DanhGia_FashionShop.md (TC01-TC15)
"""
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"


def post_review(product_id, rating, comment_chars, auth_headers):
    return requests.post(
        f"{BASE_URL}/products/{product_id}/reviews",
        json={"rating": rating, "comment": "A" * comment_chars},
        headers=auth_headers,
    )


class TestHopLeTaiBien:

    def test_tc01_tat_ca_hop_le_gia_tri_dai_dien(self, first_product_id, auth_headers):
        """TC01 — V1,V2,B3,B8: rating=3, comment=252"""
        assert post_review(first_product_id, 3, 252, auth_headers).status_code == 201

    def test_tc02_rating_tai_bien_duoi_1_sao(self, first_product_id, auth_headers):
        """TC02 — V1,V2,B1: rating=1 (biên dưới)"""
        assert post_review(first_product_id, 1, 252, auth_headers).status_code == 201

    def test_tc03_rating_tai_bien_tren_5_sao(self, first_product_id, auth_headers):
        """TC03 — V1,V2,B5: rating=5 (biên trên)"""
        assert post_review(first_product_id, 5, 252, auth_headers).status_code == 201

    def test_tc04_comment_tai_bien_duoi_5_ky_tu(self, first_product_id, auth_headers):
        """TC04 — V1,V2,B6: comment=5 ký tự (biên dưới)"""
        assert post_review(first_product_id, 3, 5, auth_headers).status_code == 201

    def test_tc05_comment_tai_bien_tren_500_ky_tu(self, first_product_id, auth_headers):
        """TC05 — V1,V2,B10: comment=500 ký tự (biên trên)"""
        assert post_review(first_product_id, 3, 500, auth_headers).status_code == 201

    def test_tc06_rating_minplus_comment_minplus(self, first_product_id, auth_headers):
        """TC06 — V1,V2,B2,B7: rating=2 (min+), comment=6 ký tự (min+)"""
        assert post_review(first_product_id, 2, 6, auth_headers).status_code == 201

    def test_tc07_rating_maxminus_comment_maxminus(self, first_product_id, auth_headers):
        """TC07 — V1,V2,B4,B9: rating=4 (max-), comment=499 ký tự (max-)"""
        assert post_review(first_product_id, 4, 499, auth_headers).status_code == 201

    def test_tc08_tat_ca_tai_bien_duoi_min(self, first_product_id, auth_headers):
        """TC08 — V1,V2,B1,B6: rating=1, comment=5 ký tự (tất cả tại min)"""
        assert post_review(first_product_id, 1, 5, auth_headers).status_code == 201


class TestKhongHopLe:

    def test_tc09_rating_bang_0_duoi_bien_duoi(self, first_product_id, auth_headers):
        """TC09 — X1: rating=0 (dưới biên dưới)"""
        assert post_review(first_product_id, 0, 252, auth_headers).status_code == 422

    def test_tc10_rating_am_1(self, first_product_id, auth_headers):
        """TC10 — X1: rating=-1 (âm)"""
        assert post_review(first_product_id, -1, 252, auth_headers).status_code == 422

    def test_tc11_rating_bang_6_tren_bien_tren(self, first_product_id, auth_headers):
        """TC11 — X2: rating=6 (trên biên trên)"""
        assert post_review(first_product_id, 6, 252, auth_headers).status_code == 422

    def test_tc12_comment_4_ky_tu_duoi_min(self, first_product_id, auth_headers):
        """TC12 — X3: comment=4 ký tự (dưới biên dưới)"""
        assert post_review(first_product_id, 3, 4, auth_headers).status_code == 422

    def test_tc13_comment_501_ky_tu_tren_max(self, first_product_id, auth_headers):
        """TC13 — X4: comment=501 ký tự (trên biên trên)"""
        assert post_review(first_product_id, 3, 501, auth_headers).status_code == 422

    def test_tc14_ca_hai_bien_sai_dong_thoi(self, first_product_id, auth_headers):
        """TC14 — X1,X3: rating=0, comment=4 ký tự (cả hai vi phạm)"""
        assert post_review(first_product_id, 0, 4, auth_headers).status_code == 422

    def test_tc15_rating_5_comment_501_chi_comment_sai(self, first_product_id, auth_headers):
        """TC15 — X4: rating=5, comment=501 ký tự (chỉ comment vi phạm)"""
        assert post_review(first_product_id, 5, 501, auth_headers).status_code == 422
```

### Hướng dẫn chạy

```bash
# Bước 1: Khởi động PHP server
cd fashionshop-api && php artisan serve

# Bước 2: Cài thư viện (nếu chưa có)
pip install pytest requests

# Bước 3: Chạy test
cd test_BVA
python -m pytest test_danh_gia.py -v
```
