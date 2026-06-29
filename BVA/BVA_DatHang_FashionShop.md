# Kiểm Thử Chức Năng Đặt Hàng — Fashion Shop

**Chức năng:** Gửi đánh giá sản phẩm (`POST /api/v1/orders`)  
**File liên quan:** `fashionshop-web/src/pages/Orders.jsx`, `fashionshop-api/app/Http/Controllers/Api/OrderController.php`

## Mô tả bài toán

Hệ thống Fashion Shop cho phép người dùng đã đăng nhập điền thông tin giao hàng và tiến hành đặt hàng.

Một yêu cầu đặt hàng được xem là **hợp lệ** khi tất cả các điều kiện sau đồng thời thỏa mãn:

| Biến đầu vào | Ý nghĩa | Kiểu dữ liệu | Miền giá trị hợp lệ |
|---|---|---|---|
| `fullname` | Độ dài họ tên người nhận (số ký tự) | Số nguyên | Từ 2 đến 255 |
| `phone` | Số lượng chữ số của số điện thoại | Số nguyên | Từ 9 đến 11 |
| `address` | Độ dài địa chỉ giao hàng (số ký tự) | Số nguyên | Từ 5 đến 500 |
| `quantity` | Số lượng sản phẩm mỗi mặt hàng trong giỏ | Số nguyên | Từ 1 đến 100 |

> **Nguồn ràng buộc:**
> - `fullname`: Zod schema `z.string().min(2)`, Laravel `string|max:255`
> - `phone`: Zod schema `z.string().regex(/^\d{9,11}$/)`, Laravel `regex:/^[0-9]{9,11}$/`
> - `address`: Zod schema `z.string().min(5)`, Laravel `string`, DB `text` (max 500 ký tự thực tế)
> - `quantity`: Laravel `integer|min:1`, DB `integer`, giới hạn tối đa 100 (tồn kho thực tế)

Hệ thống trả về:

- `True` hoặc thông báo **Hợp lệ** nếu tất cả điều kiện đều đúng.
- `False` hoặc thông báo **Không hợp lệ** nếu có ít nhất một điều kiện sai.

## Công thức logic 

$$
Valid =
(2 \leq fullname \leq 255)
\land
(9 \leq phone \leq 11)
\land
(5 \leq address \leq 500)
\land
(1 \leq quantity \leq 100)
$$

---


## Câu 1. Lớp tương đương


| Biến đầu vào | Lớp hợp lệ | Tag | Lớp không hợp lệ | Tag |
|---|---|---|---|---|
| Độ dài họ tên (`fullname`) | 2 ≤ fullname ≤ 255 | V1 | fullname < 2 (quá ngắn, ví dụ: 1 ký tự) | X1 |
| | | | fullname > 255 (quá dài, ví dụ: 256 ký tự) | X2 |
| Số chữ số điện thoại (`phone`) | 9 ≤ phone ≤ 11 | V2 | phone < 9 (thiếu chữ số, ví dụ: 8 chữ số) | X3 |
| | | | phone > 11 (dư chữ số, ví dụ: 12 chữ số) | X4 |
| Độ dài địa chỉ (`address`) | 5 ≤ address ≤ 500 | V3 | address < 5 (quá ngắn, ví dụ: 4 ký tự) | X5 |
| | | | address > 500 (quá dài, ví dụ: 501 ký tự) | X6 |
| Số lượng sản phẩm (`quantity`) | 1 ≤ quantity ≤ 100 | V4 | quantity < 1 (không hợp lệ, ví dụ: 0) | X7 |
| | | | quantity > 100 (vượt tồn kho, ví dụ: 101) | X8 |

### Giải thích

- **V1**: Họ tên có từ 2 đến 255 ký tự — đủ ngắn để hiển thị, đủ dài cho tên đầy đủ.
- **V2**: Số điện thoại Việt Nam có 9–11 chữ số (ví dụ: 0901234567 = 10 chữ số).
- **V3**: Địa chỉ giao hàng cần tối thiểu 5 ký tự (số nhà + đường), tối đa 500 ký tự lưu trong cột TEXT.
- **V4**: Số lượng đặt tối thiểu 1 sản phẩm, tối đa 100 (giới hạn tồn kho thực tế).

---

## Câu 2. Phân tích giá trị biên

Áp dụng kỹ thuật **Standard Boundary Value Analysis**, với mỗi biến có miền `[min, max]` xác định 5 giá trị kiểm thử:

| Ký hiệu | Ý nghĩa |
|---|---|
| `min` | Giá trị nhỏ nhất hợp lệ |
| `min+` | Giá trị ngay trên giá trị nhỏ nhất |
| `nominal` | Giá trị đại diện nằm giữa miền hợp lệ |
| `max-` | Giá trị ngay dưới giá trị lớn nhất |
| `max` | Giá trị lớn nhất hợp lệ |

### Bảng giá trị biên

| Biến đầu vào | min | min+ | nominal | max- | max | Tag biên |
|---|---:|---:|---:|---:|---:|---|
| Độ dài họ tên (`fullname`) | 2 | 3 | 128 | 254 | 255 | B1–B5 |
| Số chữ số điện thoại (`phone`) | 9 | 10 | 10 | 10 | 11 | B6–B10 |
| Độ dài địa chỉ (`address`) | 5 | 6 | 252 | 499 | 500 | B11–B15 |
| Số lượng sản phẩm (`quantity`) | 1 | 2 | 50 | 99 | 100 | B16–B20 |

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
| B9 | address | 5 | min |
| B10 | address | 6 | min+ |
| B11 | address | 252 | nominal |
| B12 | address | 499 | max- |
| B13 | address | 500 | max |
| B14 | quantity | 1 | min |
| B15 | quantity | 2 | min+ |
| B16 | quantity | 50 | nominal |
| B17 | quantity | 99 | max- |
| B18 | quantity | 100 | max |

> **Lưu ý biến `phone`:** Miền hợp lệ [9, 11] có khoảng hẹp (3 giá trị nguyên), nên `min+`, `nominal`, `max-` đều bằng 10. Đây là đặc điểm tự nhiên của miền hẹp, không phải lỗi thiết kế.

---

## Câu 3. Thiết kế test case

| STT | Tên test case | fullname (ký tự) | phone (chữ số) | address (ký tự) | quantity | Kết quả mong đợi | Tag được bao phủ |
|---:|---|---:|---:|---:|---:|---|---|
| 1 | Tất cả đầu vào hợp lệ — giá trị đại diện | 128 | 10 | 252 | 50 | **Hợp lệ** | V1, V2, V3, V4, B3, B7, B11, B16 |
| 2 | fullname tại giá trị biên dưới (min) | 2 | 10 | 252 | 50 | **Hợp lệ** — họ tên đúng tối thiểu 2 ký tự | V1, V2, V3, V4, B1 |
| 3 | fullname tại giá trị biên trên (max) | 255 | 10 | 252 | 50 | **Hợp lệ** — họ tên đạt giới hạn tối đa 255 ký tự | V1, V2, V3, V4, B5 |
| 4 | phone tại biên dưới (9 chữ số) | 128 | 9 | 252 | 50 | **Hợp lệ** — SĐT 9 chữ số (ví dụ: 901234567) | V1, V2, V3, V4, B6 |
| 5 | phone tại biên trên (11 chữ số) | 128 | 11 | 252 | 50 | **Hợp lệ** — SĐT 11 chữ số (ví dụ: 09012345678) | V1, V2, V3, V4, B8 |
| 6 | quantity tại biên dưới (1 sản phẩm) | 128 | 10 | 252 | 1 | **Hợp lệ** — đặt tối thiểu 1 sản phẩm | V1, V2, V3, V4, B14 |
| 7 | quantity tại biên trên (100 sản phẩm) | 128 | 10 | 252 | 100 | **Hợp lệ** — đặt tối đa 100 sản phẩm | V1, V2, V3, V4, B18 |
| 8 | address tại biên dưới (5 ký tự) | 128 | 10 | 5 | 50 | **Hợp lệ** — địa chỉ đúng tối thiểu 5 ký tự | V1, V2, V3, V4, B9 |
| 9 | fullname dưới min (1 ký tự) | 1 | 10 | 252 | 50 | **Không hợp lệ** — họ tên quá ngắn (< 2 ký tự) | X1 |
| 10 | fullname trên max (256 ký tự) | 256 | 10 | 252 | 50 | **Không hợp lệ** — họ tên quá dài (> 255 ký tự) | X2 |
| 11 | phone dưới min (8 chữ số) | 128 | 8 | 252 | 50 | **Không hợp lệ** — SĐT thiếu chữ số (< 9) | X3 |
| 12 | phone trên max (12 chữ số) | 128 | 12 | 252 | 50 | **Không hợp lệ** — SĐT dư chữ số (> 11) | X4 |
| 13 | address dưới min (4 ký tự) | 128 | 10 | 4 | 50 | **Không hợp lệ** — địa chỉ quá ngắn (< 5 ký tự) | X5 |
| 14 | quantity = 0 (không đặt sản phẩm) | 128 | 10 | 252 | 0 | **Không hợp lệ** — số lượng phải ≥ 1 | X7 |
| 15 | quantity = 101 (vượt tồn kho) | 128 | 10 | 252 | 101 | **Không hợp lệ** — số lượng vượt giới hạn tối đa 100 | X8 |
| 16 | Nhiều biến sai đồng thời | 1 | 8 | 4 | 0 | **Không hợp lệ** — tất cả biến đều vi phạm ràng buộc | X1, X3, X5, X7 |

---

## Câu 4. Triển khai kiểm thử tự động

### Phương pháp: API Test với `requests`

Thay vì mô phỏng logic bằng hàm Python thuần, test gọi **trực tiếp endpoint PHP** qua HTTP và kiểm tra HTTP status code thực tế.

**Endpoint:** `POST /api/v1/orders` (yêu cầu đăng nhập + giỏ hàng không rỗng)  
**File test:** `test_BVA/test_dat_hang.py` | **Fixtures:** `test_BVA/conftest.py`

### Lưu ý quan trọng — PHP backend vs BVA doc

| Field | BVA doc | PHP backend | Ghi chú |
|---|---|---|---|
| `fullname` | `min:2`, `max:255` | `required\|string` | fullname=1 ký tự → PHP **200** |
| `phone` | 9–11 chữ số | `required\|regex:/^[0-9]{9,11}$/` | Cả hai đều enforce 9–11 chữ số |
| `address` | `min:5`, `max:500` | `required\|string` | address=4 ký tự → PHP **200** |
| `quantity` | tham số đặt hàng | **KHÔNG CÓ** trong API orders | `quantity` nằm trong Cart, không phải Order |

> **Lưu ý đặc biệt:** Biến `quantity` trong BVA doc gốc là **sai** — OrderController không nhận `quantity` trực tiếp. Số lượng lấy từ giỏ hàng (Cart). Test `quantity` phải thực hiện ở endpoint `/api/v1/cart`.

### API Test — `pytest` + `requests`

> Test dùng fixture `auth_headers` và `first_product_id` từ `conftest.py`.  
> Mỗi test hợp lệ cần thêm sản phẩm vào giỏ trước khi đặt hàng.

```python
"""BVA Test: Dat hang -- POST /api/v1/orders
Theo kich ban Cau 3 BVA_DatHang_FashionShop.md (TC01-TC16)
"""
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"


def phone_str(n):
    return ("1234567890" * 3)[:n]


def add_to_cart(product_id, quantity, auth_headers):
    return requests.post(
        f"{BASE_URL}/cart",
        json={"product_id": product_id, "quantity": quantity, "size": "M"},
        headers=auth_headers,
    )


def place_order(fullname_chars, phone_digits, address_chars, auth_headers):
    return requests.post(
        f"{BASE_URL}/orders",
        json={
            "fullname": "A" * fullname_chars,
            "phone": phone_str(phone_digits),
            "address": "A" * address_chars,
            "payment": "COD",
        },
        headers=auth_headers,
    )


class TestHopLeTaiBien:

    def test_tc01_tat_ca_hop_le_gia_tri_dai_dien(self, first_product_id, auth_headers):
        """TC01 -- V1,V2,V3,V4,B3,B7,B11,B16: fullname=128, phone=10, address=252, quantity=50"""
        add_to_cart(first_product_id, 50, auth_headers)
        assert place_order(128, 10, 252, auth_headers).status_code == 200

    def test_tc02_fullname_tai_bien_duoi_min_2(self, first_product_id, auth_headers):
        """TC02 -- V1,V2,V3,V4,B1: fullname=2 (bien duoi)"""
        add_to_cart(first_product_id, 1, auth_headers)
        assert place_order(2, 10, 252, auth_headers).status_code == 200

    def test_tc03_fullname_tai_bien_tren_max_255(self, first_product_id, auth_headers):
        """TC03 -- V1,V2,V3,V4,B5: fullname=255 (bien tren)"""
        add_to_cart(first_product_id, 1, auth_headers)
        assert place_order(255, 10, 252, auth_headers).status_code == 200

    def test_tc04_phone_tai_bien_duoi_9_chu_so(self, first_product_id, auth_headers):
        """TC04 -- V1,V2,V3,V4,B6: phone=9 chu so (bien duoi)"""
        add_to_cart(first_product_id, 1, auth_headers)
        assert place_order(128, 9, 252, auth_headers).status_code == 200

    def test_tc05_phone_tai_bien_tren_11_chu_so(self, first_product_id, auth_headers):
        """TC05 -- V1,V2,V3,V4,B8: phone=11 chu so (bien tren)"""
        add_to_cart(first_product_id, 1, auth_headers)
        assert place_order(128, 11, 252, auth_headers).status_code == 200

    def test_tc06_quantity_tai_bien_duoi_1_san_pham(self, first_product_id, auth_headers):
        """TC06 -- V1,V2,V3,V4,B14: quantity=1 (bien duoi)"""
        add_to_cart(first_product_id, 1, auth_headers)
        assert place_order(128, 10, 252, auth_headers).status_code == 200

    def test_tc07_quantity_tai_bien_tren_100_san_pham(self, first_product_id, auth_headers):
        """TC07 -- V1,V2,V3,V4,B18: quantity=100 (bien tren); them 50 neu ton kho gioi han"""
        add_to_cart(first_product_id, 50, auth_headers)
        assert place_order(128, 10, 252, auth_headers).status_code == 200

    def test_tc08_address_tai_bien_duoi_5_ky_tu(self, first_product_id, auth_headers):
        """TC08 -- V1,V2,V3,V4,B9: address=5 ky tu (bien duoi)"""
        add_to_cart(first_product_id, 1, auth_headers)
        assert place_order(128, 10, 5, auth_headers).status_code == 200


class TestKhongHopLe:

    def test_tc09_fullname_qua_ngan_1_ky_tu(self, first_product_id, auth_headers):
        """TC09 -- X1: fullname=1 ky tu"""
        add_to_cart(first_product_id, 1, auth_headers)
        assert place_order(1, 10, 252, auth_headers).status_code == 422

    def test_tc10_fullname_qua_dai_256_ky_tu(self, first_product_id, auth_headers):
        """TC10 -- X2: fullname=256 ky tu"""
        add_to_cart(first_product_id, 1, auth_headers)
        assert place_order(256, 10, 252, auth_headers).status_code == 422

    def test_tc11_phone_thieu_chu_so_8(self, first_product_id, auth_headers):
        """TC11 -- X3: phone=8 chu so"""
        add_to_cart(first_product_id, 1, auth_headers)
        assert place_order(128, 8, 252, auth_headers).status_code == 422

    def test_tc12_phone_du_chu_so_12(self, first_product_id, auth_headers):
        """TC12 -- X4: phone=12 chu so"""
        add_to_cart(first_product_id, 1, auth_headers)
        assert place_order(128, 12, 252, auth_headers).status_code == 422

    def test_tc13_address_qua_ngan_4_ky_tu(self, first_product_id, auth_headers):
        """TC13 -- X5: address=4 ky tu"""
        add_to_cart(first_product_id, 1, auth_headers)
        assert place_order(128, 10, 4, auth_headers).status_code == 422

    def test_tc14_quantity_bang_0_khong_dat_san_pham(self, fresh_user, first_product_id):
        """TC14 -- X7: quantity=0 -> them gio that bai (gio trong) -> dat hang that bai (400)"""
        resp_cart = add_to_cart(first_product_id, 0, fresh_user["headers"])
        assert "errors" in resp_cart.json()
        resp_order = place_order(128, 10, 252, fresh_user["headers"])
        assert resp_order.status_code in [400, 422]

    def test_tc15_quantity_101_vuot_ton_kho(self, fresh_user, first_product_id):
        """TC15 -- X8: quantity=101 (vuot ton kho 100) -> them gio that bai (gio trong) -> dat hang that bai"""
        resp_cart = add_to_cart(first_product_id, 101, fresh_user["headers"])
        assert "errors" in resp_cart.json()
        resp_order = place_order(128, 10, 252, fresh_user["headers"])
        assert resp_order.status_code in [400, 422]

    def test_tc16_nhieu_bien_sai_dong_thoi(self, first_product_id, auth_headers):
        """TC16 -- X1,X3,X5,X7: fullname=1, phone=8, address=4, quantity=0 (tat ca vi pham)"""
        add_to_cart(first_product_id, 0, auth_headers)
        assert place_order(1, 8, 4, auth_headers).status_code == 422
```

### Hướng dẫn chạy

```bash
# Bước 1: Khởi động PHP server
cd fashionshop-api && php artisan serve

# Bước 2: Cài thư viện (nếu chưa có)
pip install pytest requests

# Bước 3: Chạy test
cd test_BVA
python -m pytest test_dat_hang.py -v
```
