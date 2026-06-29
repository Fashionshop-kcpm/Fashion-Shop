# Kiểm Thử Chức Năng Quản Lý Địa Chỉ Giao Hàng — Fashion Shop

**Chức năng:** Thêm địa chỉ giao hàng mới (`POST /api/v1/addresses`)  
**File liên quan:** `fashionshop-web/src/pages/Address.jsx`, `fashionshop-api/app/Http/Controllers/Api/UserAddressController.php`

---

## Mô tả bài toán

Hệ thống Fashion Shop cho phép người dùng đã đăng nhập lưu danh sách địa chỉ giao hàng. Một địa chỉ được xem là **hợp lệ** khi tất cả điều kiện sau đồng thời thỏa mãn:

| Biến đầu vào | Ý nghĩa | Kiểu dữ liệu | Miền giá trị hợp lệ |
|---|---|---|---|
| `fullname` | Độ dài họ tên người nhận (số ký tự) | Số nguyên | Từ 2 đến 255 |
| `phone` | Số lượng chữ số của số điện thoại | Số nguyên | Từ 9 đến 11 |
| `address_details` | Độ dài địa chỉ chi tiết (số ký tự) | Số nguyên | Từ 5 đến 500 |

> **Nguồn ràng buộc:**
> - `fullname`: Zod `z.string().min(2)`, Laravel `required|string`, DB `varchar(255)`
> - `phone`: Zod `z.string().regex(/^\d{9,11}$/)`, Laravel `required|regex:/^[0-9]{9,11}$/`, DB `varchar(255)`
> - `address_details`: Zod `z.string().min(5)`, Laravel `required|string`, DB `text` (giới hạn thực tế 500 ký tự)

## Công thức logic

$$
Valid =
(2 \leq fullname \leq 255)
\land
(9 \leq phone \leq 11)
\land
(5 \leq address\_details \leq 500)
$$

---

## Câu 1. Lớp tương đương

| Biến đầu vào | Lớp hợp lệ | Tag | Lớp không hợp lệ | Tag |
|---|---|---|---|---|
| Độ dài họ tên (`fullname`) | 2 ≤ fullname ≤ 255 | V1 | fullname < 2 (ví dụ: 1 ký tự) | X1 |
| | | | fullname > 255 (ví dụ: 256 ký tự) | X2 |
| Số chữ số điện thoại (`phone`) | 9 ≤ phone ≤ 11 | V2 | phone < 9 (ví dụ: 8 chữ số) | X3 |
| | | | phone > 11 (ví dụ: 12 chữ số) | X4 |
| Độ dài địa chỉ (`address_details`) | 5 ≤ address_details ≤ 500 | V3 | address_details < 5 (ví dụ: 4 ký tự) | X5 |
| | | | address_details > 500 (ví dụ: 501 ký tự) | X6 |

---

## Câu 2. Phân tích giá trị biên

| Biến đầu vào | min | min+ | nominal | max- | max | Tag biên |
|---|---:|---:|---:|---:|---:|---|
| Độ dài họ tên (`fullname`) | 2 | 3 | 128 | 254 | 255 | B1–B5 |
| Số chữ số điện thoại (`phone`) | 9 | 10 | 10 | 10 | 11 | B6–B8 |
| Độ dài địa chỉ (`address_details`) | 5 | 6 | 252 | 499 | 500 | B9–B13 |

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
| B9 | address_details | 5 | min |
| B10 | address_details | 6 | min+ |
| B11 | address_details | 252 | nominal |
| B12 | address_details | 499 | max- |
| B13 | address_details | 500 | max |

> **Lưu ý:** `phone` có miền [9, 11] hẹp (3 giá trị nguyên), nên `min+`, `nominal`, `max-` đều bằng 10.

---

## Câu 3. Thiết kế test case

| STT | Tên test case | fullname (ký tự) | phone (chữ số) | address_details (ký tự) | Kết quả mong đợi | Tag được bao phủ |
|---:|---|---:|---:|---:|---|---|
| 1 | Tất cả hợp lệ — giá trị đại diện | 128 | 10 | 252 | **Hợp lệ** | V1, V2, V3, B3, B7, B11 |
| 2 | fullname tại biên dưới (min = 2) | 2 | 10 | 252 | **Hợp lệ** — họ tên tối thiểu 2 ký tự | V1, V2, V3, B1 |
| 3 | fullname tại biên trên (max = 255) | 255 | 10 | 252 | **Hợp lệ** — họ tên đạt tối đa 255 ký tự | V1, V2, V3, B5 |
| 4 | phone tại biên dưới (9 chữ số) | 128 | 9 | 252 | **Hợp lệ** — SĐT 9 chữ số hợp lệ | V1, V2, V3, B6 |
| 5 | phone tại biên trên (11 chữ số) | 128 | 11 | 252 | **Hợp lệ** — SĐT 11 chữ số hợp lệ | V1, V2, V3, B8 |
| 6 | address_details tại biên dưới (5 ký tự) | 128 | 10 | 5 | **Hợp lệ** — địa chỉ tối thiểu 5 ký tự | V1, V2, V3, B9 |
| 7 | address_details tại biên trên (500 ký tự) | 128 | 10 | 500 | **Hợp lệ** — địa chỉ đạt tối đa 500 ký tự | V1, V2, V3, B13 |
| 8 | Tất cả tại biên dưới hợp lệ | 2 | 9 | 5 | **Hợp lệ** — tất cả biến tại min | V1, V2, V3, B1, B6, B9 |
| 9 | fullname quá ngắn (1 ký tự) | 1 | 10 | 252 | **Không hợp lệ** — họ tên < 2 ký tự | X1 |
| 10 | fullname quá dài (256 ký tự) | 256 | 10 | 252 | **Không hợp lệ** — họ tên > 255 ký tự | X2 |
| 11 | phone thiếu chữ số (8 chữ số) | 128 | 8 | 252 | **Không hợp lệ** — SĐT < 9 chữ số | X3 |
| 12 | phone dư chữ số (12 chữ số) | 128 | 12 | 252 | **Không hợp lệ** — SĐT > 11 chữ số | X4 |
| 13 | address_details quá ngắn (4 ký tự) | 128 | 10 | 4 | **Không hợp lệ** — địa chỉ < 5 ký tự | X5 |
| 14 | address_details quá dài (501 ký tự) | 128 | 10 | 501 | **Không hợp lệ** — địa chỉ > 500 ký tự | X6 |
| 15 | Nhiều biến sai đồng thời | 1 | 8 | 4 | **Không hợp lệ** — fullname, phone, address_details đều vi phạm | X1, X3, X5 |

---

## Câu 4. Triển khai kiểm thử tự động

### Phương pháp: API Test với `requests`

Thay vì mô phỏng logic bằng hàm Python thuần, test gọi **trực tiếp endpoint PHP** qua HTTP và kiểm tra HTTP status code thực tế.

**Endpoint:** `POST /api/v1/addresses` (yêu cầu đăng nhập)  
**File test:** `test_BVA/test_dia_chi.py` | **Fixtures:** `test_BVA/conftest.py`

### Lưu ý — PHP backend vs Zod frontend

| Field | Zod (frontend) | PHP backend | Ảnh hưởng đến test |
|---|---|---|---|
| `fullname` | `min:2` | `required\|string` | fullname=1 ký tự → PHP **201** |
| `phone` | 9–11 chữ số | `required\|regex:/^[0-9]{9,11}$/` | Cả hai đều enforce 9–11 chữ số |
| `address_details` | `min:5`, `max:500` | `required\|string` | address=4 → **201**; address=501 → **201** |

### API Test — `pytest` + `requests`

> Test dùng fixture `auth_headers` từ `conftest.py` (session-scoped).

```python
"""BVA Test: Thêm địa chỉ giao hàng — POST /api/v1/addresses
Theo kịch bản Câu 3 BVA_DiaChi_FashionShop.md (TC01-TC15)
"""
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"


def phone_str(n):
    return ("1234567890" * 3)[:n]


def post_address(fullname_chars, phone_digits, address_chars, auth_headers):
    return requests.post(
        f"{BASE_URL}/addresses",
        json={
            "fullname": "A" * fullname_chars,
            "phone": phone_str(phone_digits),
            "address_details": "A" * address_chars,
        },
        headers=auth_headers,
    )


class TestHopLeTaiBien:

    def test_tc01_tat_ca_hop_le_gia_tri_dai_dien(self, auth_headers):
        """TC01 — V1,V2,V3,B3,B7,B11: fullname=128, phone=10, address_details=252"""
        assert post_address(128, 10, 252, auth_headers).status_code == 201

    def test_tc02_fullname_tai_bien_duoi_min_2(self, auth_headers):
        """TC02 — V1,V2,V3,B1: fullname=2 (biên dưới)"""
        assert post_address(2, 10, 252, auth_headers).status_code == 201

    def test_tc03_fullname_tai_bien_tren_max_255(self, auth_headers):
        """TC03 — V1,V2,V3,B5: fullname=255 (biên trên)"""
        assert post_address(255, 10, 252, auth_headers).status_code == 201

    def test_tc04_phone_tai_bien_duoi_9_chu_so(self, auth_headers):
        """TC04 — V1,V2,V3,B6: phone=9 chữ số (biên dưới)"""
        assert post_address(128, 9, 252, auth_headers).status_code == 201

    def test_tc05_phone_tai_bien_tren_11_chu_so(self, auth_headers):
        """TC05 — V1,V2,V3,B8: phone=11 chữ số (biên trên)"""
        assert post_address(128, 11, 252, auth_headers).status_code == 201

    def test_tc06_address_tai_bien_duoi_5_ky_tu(self, auth_headers):
        """TC06 — V1,V2,V3,B9: address_details=5 ký tự (biên dưới)"""
        assert post_address(128, 10, 5, auth_headers).status_code == 201

    def test_tc07_address_tai_bien_tren_500_ky_tu(self, auth_headers):
        """TC07 — V1,V2,V3,B13: address_details=500 ký tự (biên trên)"""
        assert post_address(128, 10, 500, auth_headers).status_code == 201

    def test_tc08_tat_ca_tai_bien_duoi_hop_le(self, auth_headers):
        """TC08 — V1,V2,V3,B1,B6,B9: fullname=2, phone=9, address_details=5"""
        assert post_address(2, 9, 5, auth_headers).status_code == 201


class TestKhongHopLe:

    def test_tc09_fullname_qua_ngan_1_ky_tu(self, auth_headers):
        """TC09 — X1: fullname=1 ký tự"""
        assert post_address(1, 10, 252, auth_headers).status_code == 422

    def test_tc10_fullname_qua_dai_256_ky_tu(self, auth_headers):
        """TC10 — X2: fullname=256 ký tự"""
        assert post_address(256, 10, 252, auth_headers).status_code == 422

    def test_tc11_phone_thieu_chu_so_8(self, auth_headers):
        """TC11 — X3: phone=8 chữ số"""
        assert post_address(128, 8, 252, auth_headers).status_code == 422

    def test_tc12_phone_du_chu_so_12(self, auth_headers):
        """TC12 — X4: phone=12 chữ số"""
        assert post_address(128, 12, 252, auth_headers).status_code == 422

    def test_tc13_address_qua_ngan_4_ky_tu(self, auth_headers):
        """TC13 — X5: address_details=4 ký tự"""
        assert post_address(128, 10, 4, auth_headers).status_code == 422

    def test_tc14_address_qua_dai_501_ky_tu(self, auth_headers):
        """TC14 — X6: address_details=501 ký tự"""
        assert post_address(128, 10, 501, auth_headers).status_code == 422

    def test_tc15_nhieu_bien_sai_dong_thoi(self, auth_headers):
        """TC15 — X1,X3,X5: fullname=1, phone=8, address_details=4 (tất cả vi phạm)"""
        assert post_address(1, 8, 4, auth_headers).status_code == 422
```

### Hướng dẫn chạy

```bash
# Bước 1: Khởi động PHP server
cd fashionshop-api && php artisan serve

# Bước 2: Cài thư viện (nếu chưa có)
pip install pytest requests

# Bước 3: Chạy test
cd test_BVA
python -m pytest test_dia_chi.py -v
```
