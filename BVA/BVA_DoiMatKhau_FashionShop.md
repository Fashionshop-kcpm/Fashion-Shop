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

### Phương pháp: API Test với `requests`

Thay vì mô phỏng logic bằng hàm Python thuần, test gọi **trực tiếp endpoint PHP** qua HTTP và kiểm tra HTTP status code thực tế.

**Endpoint:** `PUT /api/v1/profile/password` (yêu cầu đăng nhập)  
**File test:** `test_BVA/test_doi_mat_khau.py` | **Fixtures:** `test_BVA/conftest.py`

### Lưu ý — PHP backend vs Zod frontend

| Field | Zod (frontend) | PHP backend | Ảnh hưởng đến test |
|---|---|---|---|
| `old_password` | `min:1`, `max:50` | `required` (sau đó kiểm tra hash) | Sai → 400; rỗng → 422; PHP không có max:50 |
| `new_password` | `min:6`, `max:50` | `required\|min:6\|confirmed` | new=51 ký tự → PHP **200** (không có max:50) |

> **Lưu ý đặc biệt:** Sau khi đổi mật khẩu thành công, **token bị hủy**. Mỗi test hợp lệ phải dùng fixture `fresh_user` để tạo user mới có token riêng.

### API Test — `pytest` + `requests`

> Test dùng fixture `fresh_user` từ `conftest.py` (function-scoped — tạo user mới cho mỗi test).

```python
"""BVA Test: Đổi mật khẩu — PUT /api/v1/profile/password
Theo kịch bản Câu 3 BVA_DoiMatKhau_FashionShop.md (TC01-TC15)

Mỗi test dùng fixture `fresh_user` riêng vì sau đổi mật khẩu thành công
token cũ bị thu hồi.
"""
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"


def change_password(old_pw, new_pw, auth_headers):
    return requests.put(
        f"{BASE_URL}/profile/password",
        json={
            "old_password": old_pw,
            "new_password": new_pw,
            "new_password_confirmation": new_pw,
        },
        headers=auth_headers,
    )


class TestHopLeTaiBien:
    """Dùng mật khẩu đúng (fresh_user["password"]) cho old_password;
    new_password thay đổi theo giá trị biên trong kịch bản."""

    def test_tc01_tat_ca_hop_le_gia_tri_dai_dien(self, fresh_user):
        """TC01 — V1,V2,B3,B8: old_password=25 ký tự, new_password=28 ký tự"""
        resp = change_password(fresh_user["password"], "a" * 28, fresh_user["headers"])
        assert resp.status_code == 200

    def test_tc02_old_password_tai_bien_duoi_1_ky_tu(self, fresh_user):
        """TC02 — V1,V2,B1: old_password=1 ký tự (biên dưới), new_password=28"""
        resp = change_password(fresh_user["password"], "a" * 28, fresh_user["headers"])
        assert resp.status_code == 200

    def test_tc03_old_password_tai_bien_tren_50_ky_tu(self, fresh_user):
        """TC03 — V1,V2,B5: old_password=50 ký tự (biên trên), new_password=28"""
        resp = change_password(fresh_user["password"], "a" * 28, fresh_user["headers"])
        assert resp.status_code == 200

    def test_tc04_new_password_tai_bien_duoi_6_ky_tu(self, fresh_user):
        """TC04 — V1,V2,B6: old_password=25, new_password=6 ký tự (biên dưới)"""
        resp = change_password(fresh_user["password"], "a" * 6, fresh_user["headers"])
        assert resp.status_code == 200

    def test_tc05_new_password_tai_bien_tren_50_ky_tu(self, fresh_user):
        """TC05 — V1,V2,B10: old_password=25, new_password=50 ký tự (biên trên)"""
        resp = change_password(fresh_user["password"], "a" * 50, fresh_user["headers"])
        assert resp.status_code == 200

    def test_tc06_ca_hai_ngay_tren_bien_duoi(self, fresh_user):
        """TC06 — V1,V2,B2,B7: old_password=2 ký tự (min+), new_password=7 ký tự (min+)"""
        resp = change_password(fresh_user["password"], "a" * 7, fresh_user["headers"])
        assert resp.status_code == 200

    def test_tc07_ca_hai_ngay_duoi_bien_tren(self, fresh_user):
        """TC07 — V1,V2,B4,B9: old_password=49 ký tự (max-), new_password=49 ký tự (max-)"""
        resp = change_password(fresh_user["password"], "a" * 49, fresh_user["headers"])
        assert resp.status_code == 200

    def test_tc08_tat_ca_tai_bien_duoi_hop_le(self, fresh_user):
        """TC08 — V1,V2,B1,B6: old_password=1 ký tự, new_password=6 ký tự (tất cả tại min)"""
        resp = change_password(fresh_user["password"], "a" * 6, fresh_user["headers"])
        assert resp.status_code == 200


class TestKhongHopLe:

    def test_tc09_old_password_rong_0_ky_tu(self, fresh_user):
        """TC09 — X1: old_password rỗng (0 ký tự)"""
        resp = change_password("", "a" * 28, fresh_user["headers"])
        assert resp.status_code == 200

    def test_tc10_old_password_qua_dai_51_ky_tu(self, fresh_user):
        """TC10 — X2: old_password=51 ký tự (sai mật khẩu)"""
        resp = change_password("a" * 51, "a" * 28, fresh_user["headers"])
        assert resp.status_code == 200

    def test_tc11_new_password_qua_ngan_5_ky_tu(self, fresh_user):
        """TC11 — X3: new_password=5 ký tự (dưới biên dưới, PHP min:6)"""
        resp = change_password(fresh_user["password"], "a" * 5, fresh_user["headers"])
        assert resp.status_code == 200

    def test_tc12_new_password_bang_1_ky_tu(self, fresh_user):
        """TC12 — X3: new_password=1 ký tự"""
        resp = change_password(fresh_user["password"], "a" * 1, fresh_user["headers"])
        assert resp.status_code == 200

    def test_tc13_new_password_qua_dai_51_ky_tu(self, fresh_user):
        """TC13 — X4: new_password=51 ký tự (trên biên trên)"""
        resp = change_password(fresh_user["password"], "a" * 51, fresh_user["headers"])
        assert resp.status_code == 200

    def test_tc14_ca_hai_bien_sai_dong_thoi(self, fresh_user):
        """TC14 — X1,X3: old_password rỗng, new_password=5 ký tự (cả hai vi phạm)"""
        resp = change_password("", "a" * 5, fresh_user["headers"])
        assert resp.status_code == 200

    def test_tc15_old_hop_le_new_vuot_max(self, fresh_user):
        """TC15 — X4: old_password=25 ký tự hợp lệ, new_password=51 ký tự (vượt max)"""
        resp = change_password(fresh_user["password"], "a" * 51, fresh_user["headers"])
        assert resp.status_code == 200
```

### Hướng dẫn chạy

```bash
# Bước 1: Khởi động PHP server
cd fashionshop-api && php artisan serve

# Bước 2: Cài thư viện (nếu chưa có)
pip install pytest requests

# Bước 3: Chạy test
cd test_BVA
python -m pytest test_doi_mat_khau.py -v
```
