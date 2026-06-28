"""
BVA Test: Đăng ký tài khoản — POST /api/v1/register

PHP validation thực tế:
  fullname : required|string|max:255   (KHÔNG có min:2 — khác BVA doc)
  phone    : required|regex:/^[0-9]{9,11}$/
  password : required|min:6|confirmed  (KHÔNG có max:50 — khác BVA doc)
  email    : required|email|unique
  gender   : required|in:Nam,Nữ
"""
import uuid
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"


def unique_email():
    return f"dk_{uuid.uuid4().hex[:8]}@test.com"


def phone_str(n):
    return ("1234567890" * 3)[:n]


def register(fullname, phone, password):
    return requests.post(f"{BASE_URL}/register", json={
        "fullname": fullname,
        "email": unique_email(),
        "phone": phone,
        "gender": "Nam",
        "password": password,
        "password_confirmation": password,
    })


class TestHopLeTaiBien:
    """Đầu vào hợp lệ tại biên — API trả 201 Created."""

    def test_tc01_nominal(self):
        """TC01: giá trị đại diện — fullname=10, phone=10 chữ số, password=10 ký tự."""
        resp = register("A" * 10, phone_str(10), "a" * 10)
        assert resp.status_code == 201

    def test_tc02_phone_min(self):
        """TC02 — B6: phone=9 chữ số (biên dưới hợp lệ)."""
        resp = register("A" * 10, phone_str(9), "a" * 10)
        assert resp.status_code == 201

    def test_tc03_phone_max(self):
        """TC03 — B8: phone=11 chữ số (biên trên hợp lệ)."""
        resp = register("A" * 10, phone_str(11), "a" * 10)
        assert resp.status_code == 201

    def test_tc04_password_min(self):
        """TC04 — B9: password=6 ký tự (biên dưới hợp lệ, PHP min:6)."""
        resp = register("A" * 10, phone_str(10), "a" * 6)
        assert resp.status_code == 201

    def test_tc05_fullname_max(self):
        """TC05 — B5: fullname=255 ký tự (biên trên hợp lệ, PHP max:255)."""
        resp = register("A" * 255, phone_str(10), "a" * 10)
        assert resp.status_code == 201

    def test_tc06_all_at_min_valid(self):
        """TC06: fullname=2, phone=9 chữ số, password=6 — tất cả tại biên dưới hợp lệ."""
        resp = register("AB", phone_str(9), "a" * 6)
        assert resp.status_code == 201


class TestKhongHopLe:
    """Đầu vào vi phạm ràng buộc PHP — API trả 422 Unprocessable Entity."""

    def test_tc07_phone_below_min(self):
        """TC07 — X3: phone=8 chữ số (dưới biên dưới, PHP regex /^[0-9]{9,11}$/)."""
        resp = register("A" * 10, phone_str(8), "a" * 10)
        assert resp.status_code == 422

    def test_tc08_phone_above_max(self):
        """TC08 — X4: phone=12 chữ số (trên biên trên)."""
        resp = register("A" * 10, phone_str(12), "a" * 10)
        assert resp.status_code == 422

    def test_tc09_password_below_min(self):
        """TC09 — X5: password=5 ký tự (dưới biên dưới, PHP min:6)."""
        resp = register("A" * 10, phone_str(10), "a" * 5)
        assert resp.status_code == 422

    def test_tc10_fullname_above_max(self):
        """TC10 — X2: fullname=256 ký tự (trên biên trên, PHP max:255)."""
        resp = register("A" * 256, phone_str(10), "a" * 10)
        assert resp.status_code == 422

    def test_tc11_empty_fullname(self):
        """TC11: fullname rỗng (PHP required)."""
        resp = register("", phone_str(10), "a" * 10)
        assert resp.status_code == 422

    def test_tc12_multiple_invalid(self):
        """TC12: phone=8 chữ số + password=5 ký tự — nhiều lỗi cùng lúc."""
        resp = register("A" * 10, phone_str(8), "a" * 5)
        assert resp.status_code == 422


class TestDiscrepancyPHPvsZod:
    """
    Các test case cho thấy sự KHÁC BIỆT giữa PHP backend và Zod frontend.
    BVA doc gốc dựa trên cả hai lớp — test API chỉ kiểm tra PHP backend.
    """

    def test_fullname_1char_passes_api(self):
        """
        BVA doc: fullname=1 ký tự → Không hợp lệ (vi phạm Zod min:2).
        Thực tế API: PHP chỉ có max:255 → 201 (hợp lệ ở backend).
        """
        resp = register("A", phone_str(10), "a" * 10)
        assert resp.status_code == 201

    def test_password_51chars_passes_api(self):
        """
        BVA doc: password=51 ký tự → Không hợp lệ (vi phạm Zod max:50).
        Thực tế API: PHP chỉ có min:6, không có max → 201.
        """
        resp = register("A" * 10, phone_str(10), "a" * 51)
        assert resp.status_code == 201
