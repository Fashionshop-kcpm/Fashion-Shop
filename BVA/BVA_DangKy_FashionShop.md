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

### Phương pháp: API Test với `requests`

Thay vì mô phỏng logic bằng hàm Python thuần, test gọi **trực tiếp endpoint PHP** qua HTTP và kiểm tra HTTP status code thực tế.

**Endpoint:** `POST /api/v1/register`  
**File test:** `test_BVA/test_dang_ky.py`

### Lưu ý — PHP backend vs Zod frontend

| Field | Zod (frontend) | PHP backend | Ảnh hưởng đến test |
|---|---|---|---|
| `fullname` | `min:2`, `max:255` | `required\|string\|max:255` | fullname=1 ký tự → PHP **201** (không có min:2) |
| `phone` | 9–11 chữ số | `required\|regex:/^[0-9]{9,11}$/` | Cả hai đều enforce 9–11 chữ số |
| `password` | `min:6`, `max:50` | `required\|min:6\|confirmed` | password=51 ký tự → PHP **201** (không có max:50) |

### API Test — `pytest` + `requests`

```python
"""BVA Test: Đăng ký tài khoản — POST /api/v1/register
Theo kịch bản Câu 3 BVA_DangKy_FashionShop.md (TC01-TC15)
"""
import uuid
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"


def unique_email():
    return f"dk_{uuid.uuid4().hex[:8]}@test.com"


def phone_str(n):
    return ("1234567890" * 3)[:n]


def register(fullname_chars, phone_digits, password_chars):
    pw = "a" * password_chars
    return requests.post(f"{BASE_URL}/register", json={
        "fullname": "A" * fullname_chars,
        "email": unique_email(),
        "phone": phone_str(phone_digits),
        "gender": "Nam",
        "password": pw,
        "password_confirmation": pw,
    })


class TestHopLeTaiBien:

    def test_tc01_tat_ca_hop_le_gia_tri_dai_dien(self):
        """TC01 — V1,V2,V3,B3,B7,B11: fullname=128, phone=10, password=28"""
        assert register(128, 10, 28).status_code == 201

    def test_tc02_fullname_tai_bien_duoi_min_2(self):
        """TC02 — V1,V2,V3,B1: fullname=2 (biên dưới)"""
        assert register(2, 10, 28).status_code == 201

    def test_tc03_fullname_tai_bien_tren_max_255(self):
        """TC03 — V1,V2,V3,B5: fullname=255 (biên trên)"""
        assert register(255, 10, 28).status_code == 201

    def test_tc04_phone_tai_bien_duoi_9_chu_so(self):
        """TC04 — V1,V2,V3,B6: phone=9 chữ số (biên dưới)"""
        assert register(128, 9, 28).status_code == 201

    def test_tc05_phone_tai_bien_tren_11_chu_so(self):
        """TC05 — V1,V2,V3,B8: phone=11 chữ số (biên trên)"""
        assert register(128, 11, 28).status_code == 201

    def test_tc06_password_tai_bien_duoi_min_6(self):
        """TC06 — V1,V2,V3,B9: password=6 ký tự (biên dưới)"""
        assert register(128, 10, 6).status_code == 201

    def test_tc07_password_tai_bien_tren_max_50(self):
        """TC07 — V1,V2,V3,B13: password=50 ký tự (biên trên)"""
        assert register(128, 10, 50).status_code == 201

    def test_tc08_tat_ca_tai_bien_duoi_hop_le(self):
        """TC08 — V1,V2,V3,B1,B6,B9: fullname=2, phone=9, password=6 (tất cả tại min)"""
        assert register(2, 9, 6).status_code == 201


class TestKhongHopLe:

    def test_tc09_fullname_qua_ngan_1_ky_tu(self):
        """TC09 — X1: fullname=1 ký tự"""
        assert register(1, 10, 28).status_code == 422

    def test_tc10_fullname_qua_dai_256_ky_tu(self):
        """TC10 — X2: fullname=256 ký tự"""
        assert register(256, 10, 28).status_code == 422

    def test_tc11_phone_thieu_chu_so_8(self):
        """TC11 — X3: phone=8 chữ số"""
        assert register(128, 8, 28).status_code == 422

    def test_tc12_phone_du_chu_so_12(self):
        """TC12 — X4: phone=12 chữ số"""
        assert register(128, 12, 28).status_code == 422

    def test_tc13_password_qua_ngan_5_ky_tu(self):
        """TC13 — X5: password=5 ký tự"""
        assert register(128, 10, 5).status_code == 422

    def test_tc14_password_qua_dai_51_ky_tu(self):
        """TC14 — X6: password=51 ký tự"""
        assert register(128, 10, 51).status_code == 422

    def test_tc15_nhieu_bien_sai_dong_thoi(self):
        """TC15 — X1,X3,X5: fullname=1, phone=8, password=5 (tất cả vi phạm)"""
        assert register(1, 8, 5).status_code == 422
```

### Hướng dẫn chạy

```bash
# Bước 1: Khởi động PHP server
cd fashionshop-api && php artisan serve

# Bước 2: Cài thư viện (nếu chưa có)
pip install pytest requests

# Bước 3: Chạy test
cd test_BVA
python -m pytest test_dang_ky.py -v
```
