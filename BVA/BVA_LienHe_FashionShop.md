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

### Hàm kiểm tra logic

```python
def validate_lien_he(fullname: int, message: int) -> bool:
    """
    Kiểm tra tính hợp lệ của một yêu cầu liên hệ Fashion Shop.

    Tham số:
        fullname (int): Số ký tự của họ tên người gửi.
        message  (int): Số ký tự của nội dung tin nhắn.

    Trả về:
        True  nếu tất cả đầu vào hợp lệ.
        False nếu có ít nhất một đầu vào không hợp lệ.
    """
    return (
        2 <= fullname <= 255 and
        10 <= message <= 1000
    )
```

### Unit Test — Framework: `pytest`

```python
import pytest
from validate_lien_he import validate_lien_he


class TestHopLeTaiBien:

    def test_tc01_nominal(self):
        """TC01: Giá trị đại diện — hợp lệ."""
        assert validate_lien_he(128, 505) is True

    def test_tc02_fullname_min(self):
        """TC02 — B1: fullname = 2 (biên dưới hợp lệ)."""
        assert validate_lien_he(2, 505) is True

    def test_tc03_fullname_max(self):
        """TC03 — B5: fullname = 255 (biên trên hợp lệ)."""
        assert validate_lien_he(255, 505) is True

    def test_tc04_message_min(self):
        """TC04 — B6: message = 10 ký tự (biên dưới hợp lệ)."""
        assert validate_lien_he(128, 10) is True

    def test_tc05_message_max(self):
        """TC05 — B10: message = 1000 ký tự (biên trên hợp lệ)."""
        assert validate_lien_he(128, 1000) is True

    def test_tc06_ca_hai_bien_min(self):
        """TC06: Cả hai biến tại min hợp lệ."""
        assert validate_lien_he(2, 10) is True

    def test_tc07_ca_hai_bien_max(self):
        """TC07: Cả hai biến tại max hợp lệ."""
        assert validate_lien_he(255, 1000) is True

    def test_tc08_minplus(self):
        """TC08 — B2, B7: ngay trên biên dưới."""
        assert validate_lien_he(3, 11) is True


class TestKhongHopLe:

    def test_tc09_fullname_duoi_min(self):
        """TC09 — X1: fullname = 1 (dưới biên dưới)."""
        assert validate_lien_he(1, 505) is False

    def test_tc10_fullname_tren_max(self):
        """TC10 — X2: fullname = 256 (trên biên trên)."""
        assert validate_lien_he(256, 505) is False

    def test_tc11_message_duoi_min(self):
        """TC11 — X3: message = 9 ký tự (dưới biên dưới)."""
        assert validate_lien_he(128, 9) is False

    def test_tc12_message_rong(self):
        """TC12 — X3: message = 0 (rỗng)."""
        assert validate_lien_he(128, 0) is False

    def test_tc13_message_tren_max(self):
        """TC13 — X4: message = 1001 ký tự (trên biên trên)."""
        assert validate_lien_he(128, 1001) is False

    def test_tc14_ca_hai_bien_sai(self):
        """TC14 — X1, X3: fullname và message đều vi phạm."""
        assert validate_lien_he(1, 9) is False

    def test_tc15_message_cuc_dai_vi_pham(self):
        """TC15 — X4: fullname hợp lệ, message vượt max."""
        assert validate_lien_he(255, 1001) is False
```

### Hướng dẫn chạy

```bash
pip install pytest

# Chạy toàn bộ test
python -m pytest test_lien_he.py -v

# Chạy chỉ nhóm test hợp lệ
python -m pytest test_lien_he.py::TestHopLeTaiBien -v

# Chạy chỉ nhóm test không hợp lệ
python -m pytest test_lien_he.py::TestKhongHopLe -v
```
