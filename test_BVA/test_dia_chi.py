"""
BVA Test: Thêm địa chỉ giao hàng — POST /api/v1/addresses

PHP validation thực tế:
  fullname        : required|string                   (KHÔNG có min:2/max:255)
  phone           : required|regex:/^[0-9]{9,11}$/
  address_details : required|string                   (KHÔNG có min:5/max:500)

Yêu cầu: Bearer token (đăng nhập user).
"""
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"


def phone_str(n):
    return ("1234567890" * 3)[:n]


def post_address(fullname, phone, address_details, auth_headers):
    return requests.post(
        f"{BASE_URL}/addresses",
        json={
            "fullname": fullname,
            "phone": phone,
            "address_details": address_details,
        },
        headers=auth_headers,
    )


class TestHopLeTaiBien:
    """Đầu vào hợp lệ — API trả 201 Created."""

    def test_tc01_nominal(self, auth_headers):
        """TC01: fullname=10, phone=10 chữ số, address_details=50 ký tự."""
        resp = post_address("A" * 10, phone_str(10), "A" * 50, auth_headers)
        assert resp.status_code == 201

    def test_tc02_phone_min(self, auth_headers):
        """TC02 — B6: phone=9 chữ số (biên dưới hợp lệ)."""
        resp = post_address("A" * 10, phone_str(9), "A" * 50, auth_headers)
        assert resp.status_code == 201

    def test_tc03_phone_max(self, auth_headers):
        """TC03 — B8: phone=11 chữ số (biên trên hợp lệ)."""
        resp = post_address("A" * 10, phone_str(11), "A" * 50, auth_headers)
        assert resp.status_code == 201

    def test_tc04_address_5chars(self, auth_headers):
        """TC04: address_details=5 ký tự (min theo BVA), PHP chỉ required — hợp lệ."""
        resp = post_address("A" * 10, phone_str(10), "ABCDE", auth_headers)
        assert resp.status_code == 201

    def test_tc05_address_500chars(self, auth_headers):
        """TC05: address_details=500 ký tự (max theo BVA), PHP không có max — hợp lệ."""
        resp = post_address("A" * 10, phone_str(10), "A" * 500, auth_headers)
        assert resp.status_code == 201

    def test_tc06_all_at_min_valid(self, auth_headers):
        """TC06: fullname=2, phone=9 chữ số, address_details=5 ký tự."""
        resp = post_address("AB", phone_str(9), "ABCDE", auth_headers)
        assert resp.status_code == 201


class TestKhongHopLe:
    """Đầu vào vi phạm ràng buộc PHP — API trả 422."""

    def test_tc07_phone_below_min(self, auth_headers):
        """TC07 — X3: phone=8 chữ số (dưới biên dưới)."""
        resp = post_address("A" * 10, phone_str(8), "A" * 50, auth_headers)
        assert resp.status_code == 422

    def test_tc08_phone_above_max(self, auth_headers):
        """TC08 — X4: phone=12 chữ số (trên biên trên)."""
        resp = post_address("A" * 10, phone_str(12), "A" * 50, auth_headers)
        assert resp.status_code == 422

    def test_tc09_empty_fullname(self, auth_headers):
        """TC09: fullname rỗng (PHP required)."""
        resp = post_address("", phone_str(10), "A" * 50, auth_headers)
        assert resp.status_code == 422

    def test_tc10_empty_address_details(self, auth_headers):
        """TC10: address_details rỗng (PHP required)."""
        resp = post_address("A" * 10, phone_str(10), "", auth_headers)
        assert resp.status_code == 422

    def test_tc11_multiple_invalid(self, auth_headers):
        """TC11: phone=8 chữ số + fullname rỗng — nhiều lỗi cùng lúc."""
        resp = post_address("", phone_str(8), "A" * 50, auth_headers)
        assert resp.status_code == 422


class TestDiscrepancyPHPvsZod:
    """
    Các trường hợp BVA doc nói KHÔNG hợp lệ nhưng API thực tế CHẤP NHẬN.
    """

    def test_fullname_1char_passes_api(self, auth_headers):
        """
        BVA doc: fullname=1 ký tự → Không hợp lệ (vi phạm Zod min:2).
        Thực tế API: PHP chỉ required|string → 201.
        """
        resp = post_address("A", phone_str(10), "A" * 50, auth_headers)
        assert resp.status_code == 201

    def test_address_4chars_passes_api(self, auth_headers):
        """
        BVA doc: address_details=4 ký tự → Không hợp lệ (vi phạm Zod min:5).
        Thực tế API: PHP chỉ required|string → 201.
        """
        resp = post_address("A" * 10, phone_str(10), "ABCD", auth_headers)
        assert resp.status_code == 201

    def test_address_501chars_passes_api(self, auth_headers):
        """
        BVA doc: address_details=501 ký tự → Không hợp lệ (vượt max:500).
        Thực tế API: PHP không có max → 201.
        """
        resp = post_address("A" * 10, phone_str(10), "A" * 501, auth_headers)
        assert resp.status_code == 201
