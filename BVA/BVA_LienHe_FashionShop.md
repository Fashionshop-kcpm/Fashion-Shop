# Kiểm Thử Chức Năng Liên Hệ — Fashion Shop

**Chức năng:** Gửi liên hệ / phản hồi (`POST /api/v1/contacts`)  
**File liên quan:** `fashionshop-web/src/pages/Contact.jsx`, `fashionshop-api/app/Http/Controllers/Api/ContactController.php`

---

## Mô tả bài toán

Hệ thống Fashion Shop cho phép bất kỳ người dùng nào (kể cả chưa đăng nhập) gửi yêu cầu liên hệ / phản hồi đến cửa hàng. Một yêu cầu liên hệ được xem là **hợp lệ** khi tất cả điều kiện sau đồng thời thỏa mãn:

| Biến đầu vào | Ý nghĩa                             | Kiểu dữ liệu | Miền giá trị hợp lệ |
| ------------ | ----------------------------------- | ------------ | ------------------- |
| `fullname`   | Độ dài họ tên người gửi (số ký tự)  | Số nguyên    | Từ 2 đến 255        |
| `message`    | Độ dài nội dung tin nhắn (số ký tự) | Số nguyên    | Từ 10 đến 1000      |

> **Nguồn ràng buộc:**
>
> - `fullname`: Zod `z.string().min(2)`, Laravel `string`, DB `varchar(255)`
> - `message`: Zod `z.string().min(10)`, Laravel `string`, DB `text` (giới hạn thực tế 1000 ký tự)
> - `email`: chỉ kiểm tra định dạng, không có ràng buộc phạm vi số — không áp dụng BVA

## Công thức logic

$$
Valid =
(2 \leq fullname \leq 255)
\land
(10 \leq message \leq 1000)
$$

---

## Câu 1. Lớp tương đương

| Biến đầu vào                | Lớp hợp lệ          | Tag | Lớp không hợp lệ                   | Tag |
| --------------------------- | ------------------- | --- | ---------------------------------- | --- |
| Độ dài họ tên (`fullname`)  | 2 ≤ fullname ≤ 255  | V1  | fullname < 2 (ví dụ: 1 ký tự)      | X1  |
|                             |                     |     | fullname > 255 (ví dụ: 256 ký tự)  | X2  |
| Độ dài tin nhắn (`message`) | 10 ≤ message ≤ 1000 | V2  | message < 10 (ví dụ: 9 ký tự)      | X3  |
|                             |                     |     | message > 1000 (ví dụ: 1001 ký tự) | X4  |

---

## Câu 2. Phân tích giá trị biên

| Biến đầu vào                | min | min+ | nominal | max- |  max | Tag biên |
| --------------------------- | --: | ---: | ------: | ---: | ---: | -------- |
| Độ dài họ tên (`fullname`)  |   2 |    3 |     128 |  254 |  255 | B1–B5    |
| Độ dài tin nhắn (`message`) |  10 |   11 |     505 |  999 | 1000 | B6–B10   |

### Chi tiết tag biên

| Tag | Biến     | Giá trị | Loại    |
| --- | -------- | ------: | ------- |
| B1  | fullname |       2 | min     |
| B2  | fullname |       3 | min+    |
| B3  | fullname |     128 | nominal |
| B4  | fullname |     254 | max-    |
| B5  | fullname |     255 | max     |
| B6  | message  |      10 | min     |
| B7  | message  |      11 | min+    |
| B8  | message  |     505 | nominal |
| B9  | message  |     999 | max-    |
| B10 | message  |    1000 | max     |

---

## Câu 3. Thiết kế test case

| STT | Tên test case                       | fullname (ký tự) | message (ký tự) | Kết quả mong đợi                                   | Tag được bao phủ |
| --: | ----------------------------------- | ---------------: | --------------: | -------------------------------------------------- | ---------------- |
|   1 | Tất cả hợp lệ — giá trị đại diện    |              128 |             505 | **Hợp lệ**                                         | V1, V2, B3, B8   |
|   2 | fullname tại biên dưới (min = 2)    |                2 |             505 | **Hợp lệ** — họ tên tối thiểu 2 ký tự              | V1, V2, B1       |
|   3 | fullname tại biên trên (max = 255)  |              255 |             505 | **Hợp lệ** — họ tên đạt tối đa 255 ký tự           | V1, V2, B5       |
|   4 | message tại biên dưới (min = 10)    |              128 |              10 | **Hợp lệ** — tin nhắn đúng tối thiểu 10 ký tự      | V1, V2, B6       |
|   5 | message tại biên trên (max = 1000)  |              128 |            1000 | **Hợp lệ** — tin nhắn đạt tối đa 1000 ký tự        | V1, V2, B10      |
|   6 | fullname min+, message min+         |                3 |              11 | **Hợp lệ** — cả hai ngay trên biên dưới            | V1, V2, B2, B7   |
|   7 | fullname max-, message max-         |              254 |             999 | **Hợp lệ** — cả hai ngay dưới biên trên            | V1, V2, B4, B9   |
|   8 | Tất cả tại biên dưới (min)          |                2 |              10 | **Hợp lệ** — tất cả biến tại min                   | V1, V2, B1, B6   |
|   9 | fullname quá ngắn (1 ký tự)         |                1 |             505 | **Không hợp lệ** — họ tên < 2 ký tự                | X1               |
|  10 | fullname quá dài (256 ký tự)        |              256 |             505 | **Không hợp lệ** — họ tên > 255 ký tự              | X2               |
|  11 | message quá ngắn (9 ký tự)          |              128 |               9 | **Không hợp lệ** — tin nhắn < 10 ký tự             | X3               |
|  12 | message rỗng (0 ký tự)              |              128 |               0 | **Không hợp lệ** — tin nhắn không được để trống    | X3               |
|  13 | message quá dài (1001 ký tự)        |              128 |            1001 | **Không hợp lệ** — tin nhắn > 1000 ký tự           | X4               |
|  14 | Cả hai biến sai đồng thời           |                1 |               9 | **Không hợp lệ** — fullname và message đều vi phạm | X1, X3           |
|  15 | fullname hợp lệ tối đa, message sai |              255 |            1001 | **Không hợp lệ** — chỉ message vi phạm             | X4               |

---

## Câu 4. Triển khai kiểm thử tự động

### Phương pháp: API Test với `requests`

Thay vì mô phỏng logic bằng hàm Python thuần, test gọi **trực tiếp endpoint PHP** qua HTTP và kiểm tra HTTP status code thực tế.

**Endpoint:** `POST /api/v1/contacts` (không yêu cầu đăng nhập)  
**File test:** `test_BVA/test_lien_he.py`

### Lưu ý — PHP backend vs Zod frontend

| Field | Zod (frontend) | PHP backend | Ảnh hưởng đến test |
|---|---|---|---|
| `fullname` | `min:2` | `required\|string` | fullname=1 ký tự → PHP chấp nhận → **201** |
| `message` | `min:10`, `max:1000` | `required\|string` | message=9 → **201**; message=1001 → **201** |
| `email` | format | `required\|email` | Cả hai đều kiểm tra định dạng |

### API Test — `pytest` + `requests`

```python
"""BVA Test: Gửi liên hệ — POST /api/v1/contacts
Theo kịch bản Câu 3 BVA_LienHe_FashionShop.md (TC01-TC15)
"""
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"


def post_contact(fullname_chars, message_chars):
    return requests.post(f"{BASE_URL}/contacts", json={
        "fullname": "A" * fullname_chars,
        "email": "test@example.com",
        "message": "A" * message_chars,
    })


class TestHopLeTaiBien:

    def test_tc01_tat_ca_hop_le_gia_tri_dai_dien(self):
        """TC01 — V1, V2, B3, B8: fullname=128, message=505"""
        assert post_contact(128, 505).status_code == 201

    def test_tc02_fullname_tai_bien_duoi_min_2(self):
        """TC02 — V1, V2, B1: fullname=2 (biên dưới)"""
        assert post_contact(2, 505).status_code == 201

    def test_tc03_fullname_tai_bien_tren_max_255(self):
        """TC03 — V1, V2, B5: fullname=255 (biên trên)"""
        assert post_contact(255, 505).status_code == 201

    def test_tc04_message_tai_bien_duoi_min_10(self):
        """TC04 — V1, V2, B6: message=10 (biên dưới)"""
        assert post_contact(128, 10).status_code == 201

    def test_tc05_message_tai_bien_tren_max_1000(self):
        """TC05 — V1, V2, B10: message=1000 (biên trên)"""
        assert post_contact(128, 1000).status_code == 201

    def test_tc06_fullname_minplus_message_minplus(self):
        """TC06 — V1, V2, B2, B7: fullname=3 (min+), message=11 (min+)"""
        assert post_contact(3, 11).status_code == 201

    def test_tc07_fullname_maxminus_message_maxminus(self):
        """TC07 — V1, V2, B4, B9: fullname=254 (max-), message=999 (max-)"""
        assert post_contact(254, 999).status_code == 201

    def test_tc08_tat_ca_tai_bien_duoi_min(self):
        """TC08 — V1, V2, B1, B6: fullname=2, message=10 (tất cả tại min)"""
        assert post_contact(2, 10).status_code == 201


class TestKhongHopLe:

    def test_tc09_fullname_qua_ngan_1_ky_tu(self):
        """TC09 — X1: fullname=1 ký tự (dưới biên dưới)"""
        assert post_contact(1, 505).status_code == 422

    def test_tc10_fullname_qua_dai_256_ky_tu(self):
        """TC10 — X2: fullname=256 ký tự (trên biên trên)"""
        assert post_contact(256, 505).status_code == 422

    def test_tc11_message_qua_ngan_9_ky_tu(self):
        """TC11 — X3: message=9 ký tự (dưới biên dưới)"""
        assert post_contact(128, 9).status_code == 422

    def test_tc12_message_rong_0_ky_tu(self):
        """TC12 — X3: message=0 ký tự (rỗng)"""
        assert post_contact(128, 0).status_code == 422

    def test_tc13_message_qua_dai_1001_ky_tu(self):
        """TC13 — X4: message=1001 ký tự (trên biên trên)"""
        assert post_contact(128, 1001).status_code == 422

    def test_tc14_ca_hai_bien_sai(self):
        """TC14 — X1, X3: fullname=1, message=9 (cả hai vi phạm)"""
        assert post_contact(1, 9).status_code == 422

    def test_tc15_fullname_hop_le_toi_da_message_sai(self):
        """TC15 — X4: fullname=255, message=1001 (chỉ message vi phạm)"""
        assert post_contact(255, 1001).status_code == 422
```

### Hướng dẫn chạy

```bash
# Bước 1: Khởi động PHP server
cd fashionshop-api && php artisan serve

# Bước 2: Cài thư viện (nếu chưa có)
pip install pytest requests

# Bước 3: Chạy test
cd test_BVA
python -m pytest test_lien_he.py -v
```
