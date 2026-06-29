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

### Phương pháp: API Test với `requests`

Thay vì mô phỏng logic bằng hàm Python thuần, test gọi **trực tiếp endpoint PHP** qua HTTP và kiểm tra HTTP status code thực tế.

**Endpoint:** `POST /api/v1/admin/products` (yêu cầu đăng nhập Admin)  
**File test:** `test_BVA/test_san_pham.py` | **Fixtures:** `test_BVA/conftest.py`

### Lưu ý — PHP backend vs Zod/business logic

| Field | Business logic | PHP backend | Ảnh hưởng đến test |
|---|---|---|---|
| `ten_sp` | `min:1`, `max:255` | `required\|string` | PHP chấp nhận bất kỳ string nào (giới hạn DB varchar(255)) |
| `gia` | `0` – `999,999,999` | `required\|integer\|min:0` | gia=1,000,000,000 → PHP **201** (không có max) |
| `so_luong` | `0` – `10,000` | `required\|integer\|min:0` | so_luong=10,001 → PHP **201** (không có max) |

### API Test — `pytest` + `requests`

> Test dùng fixture `admin_headers` từ `conftest.py` (session-scoped, đăng nhập admin@fashionshop.vn).

```python
"""BVA Test: Quan ly san pham (Admin) -- POST /api/v1/admin/products
Theo kich ban Cau 3 BVA_QuanLySanPham_FashionShop.md (TC01-TC16)
"""
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"


def create_product(ten_sp_chars, gia, so_luong, admin_headers):
    return requests.post(
        f"{BASE_URL}/admin/products",
        json={
            "ten_sp": "A" * ten_sp_chars if ten_sp_chars > 0 else "",
            "gia": gia,
            "gia_cu": None,
            "so_luong": so_luong,
            "gioi_tinh": 0,
            "mo_ta": "Mo ta san pham test BVA",
        },
        headers=admin_headers,
    )


class TestHopLeTaiBien:

    def test_tc01_tat_ca_hop_le_gia_tri_dai_dien(self, admin_headers):
        """TC01 -- V1,V2,V3,B3,B8,B13: ten_sp=128, gia=500000000, so_luong=5000"""
        assert create_product(128, 500_000_000, 5000, admin_headers).status_code == 201

    def test_tc02_ten_sp_tai_bien_duoi_min_1(self, admin_headers):
        """TC02 -- V1,V2,V3,B1: ten_sp=1 ky tu (bien duoi)"""
        assert create_product(1, 500_000_000, 5000, admin_headers).status_code == 201

    def test_tc03_ten_sp_tai_bien_tren_max_255(self, admin_headers):
        """TC03 -- V1,V2,V3,B5: ten_sp=255 ky tu (bien tren)"""
        assert create_product(255, 500_000_000, 5000, admin_headers).status_code == 201

    def test_tc04_gia_bang_0_san_pham_mien_phi(self, admin_headers):
        """TC04 -- V1,V2,V3,B6: gia=0 (bien duoi, san pham mien phi)"""
        assert create_product(128, 0, 5000, admin_headers).status_code == 201

    def test_tc05_gia_tai_bien_tren_999_999_999(self, admin_headers):
        """TC05 -- V1,V2,V3,B10: gia=999999999 (bien tren)"""
        assert create_product(128, 999_999_999, 5000, admin_headers).status_code == 201

    def test_tc06_so_luong_bang_0_het_hang(self, admin_headers):
        """TC06 -- V1,V2,V3,B11: so_luong=0 (bien duoi, het hang)"""
        assert create_product(128, 500_000_000, 0, admin_headers).status_code == 201

    def test_tc07_so_luong_tai_bien_tren_10000(self, admin_headers):
        """TC07 -- V1,V2,V3,B15: so_luong=10000 (bien tren)"""
        assert create_product(128, 500_000_000, 10000, admin_headers).status_code == 201

    def test_tc08_tat_ca_tai_bien_duoi_hop_le(self, admin_headers):
        """TC08 -- V1,V2,V3,B1,B6,B11: ten_sp=1, gia=0, so_luong=0 (tat ca tai min)"""
        assert create_product(1, 0, 0, admin_headers).status_code == 201

    def test_tc16_gia_minplus_so_luong_minplus(self, admin_headers):
        """TC16 -- V1,V2,V3,B7,B12: ten_sp=128, gia=1 (min+), so_luong=1 (min+)"""
        assert create_product(128, 1, 1, admin_headers).status_code == 201


class TestKhongHopLe:

    def test_tc09_ten_sp_rong_0_ky_tu(self, admin_headers):
        """TC09 -- X1: ten_sp rong (0 ky tu, PHP required)"""
        assert create_product(0, 500_000_000, 5000, admin_headers).status_code == 422

    def test_tc10_ten_sp_qua_dai_256_ky_tu(self, admin_headers):
        """TC10 -- X2: ten_sp=256 ky tu (tren bien tren)"""
        assert create_product(256, 500_000_000, 5000, admin_headers).status_code == 422

    def test_tc11_gia_am_1(self, admin_headers):
        """TC11 -- X3: gia=-1 (am, PHP min:0)"""
        assert create_product(128, -1, 5000, admin_headers).status_code == 422

    def test_tc12_gia_vuot_gioi_han_1_ty(self, admin_headers):
        """TC12 -- X4: gia=1000000000 (vuot gioi han 999999999)"""
        assert create_product(128, 1_000_000_000, 5000, admin_headers).status_code == 422

    def test_tc13_so_luong_am_1(self, admin_headers):
        """TC13 -- X5: so_luong=-1 (am, PHP min:0)"""
        assert create_product(128, 500_000_000, -1, admin_headers).status_code == 422

    def test_tc14_so_luong_vuot_gioi_han_10001(self, admin_headers):
        """TC14 -- X6: so_luong=10001 (vuot gioi han 10000)"""
        assert create_product(128, 500_000_000, 10001, admin_headers).status_code == 422

    def test_tc15_tat_ca_bien_sai_dong_thoi(self, admin_headers):
        """TC15 -- X1,X3,X5: ten_sp rong, gia=-1, so_luong=-1 (tat ca vi pham)"""
        assert create_product(0, -1, -1, admin_headers).status_code == 422
```

### Hướng dẫn chạy

```bash
# Bước 1: Khởi động PHP server
cd fashionshop-api && php artisan serve

# Bước 2: Cài thư viện (nếu chưa có)
pip install pytest requests

# Bước 3: Chạy test
cd test_BVA
python -m pytest test_san_pham.py -v
```
