"""
BVA Test: Gửi liên hệ — POST /api/v1/contacts

PHP validation thực tế:
  fullname : required|string   (KHÔNG có min:2/max:255 — khác BVA doc)
  email    : required|email
  message  : required|string   (KHÔNG có min:10/max:1000 — khác BVA doc)

Không yêu cầu đăng nhập.
"""
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"


def post_contact(fullname, email, message):
    return requests.post(f"{BASE_URL}/contacts", json={
        "fullname": fullname,
        "email": email,
        "message": message,
    })


class TestHopLeTaiBien:
    """Đầu vào hợp lệ — API trả 201 Created."""

    def test_tc01_nominal(self):
        """TC01: fullname=10 ký tự, message=50 ký tự."""
        resp = post_contact("A" * 10, "test@example.com", "A" * 50)
        assert resp.status_code == 201

    def test_tc02_fullname_2chars(self):
        """TC02: fullname=2 ký tự (min theo BVA), PHP chỉ required — hợp lệ."""
        resp = post_contact("AB", "test@example.com", "A" * 50)
        assert resp.status_code == 201

    def test_tc03_fullname_255chars(self):
        """TC03: fullname=255 ký tự — PHP không có max — hợp lệ."""
        resp = post_contact("A" * 255, "test@example.com", "A" * 50)
        assert resp.status_code == 201

    def test_tc04_message_10chars(self):
        """TC04: message=10 ký tự (min theo BVA), PHP chỉ required — hợp lệ."""
        resp = post_contact("A" * 10, "test@example.com", "A" * 10)
        assert resp.status_code == 201

    def test_tc05_message_1000chars(self):
        """TC05: message=1000 ký tự (max theo BVA), PHP không có max — hợp lệ."""
        resp = post_contact("A" * 10, "test@example.com", "A" * 1000)
        assert resp.status_code == 201


class TestKhongHopLe:
    """Đầu vào vi phạm ràng buộc PHP — API trả 422."""

    def test_tc06_empty_fullname(self):
        """TC06 — X1: fullname rỗng (PHP required)."""
        resp = post_contact("", "test@example.com", "A" * 50)
        assert resp.status_code == 422

    def test_tc07_empty_message(self):
        """TC07 — X3: message rỗng (PHP required)."""
        resp = post_contact("A" * 10, "test@example.com", "")
        assert resp.status_code == 422

    def test_tc08_invalid_email(self):
        """TC08: email sai định dạng (PHP email)."""
        resp = post_contact("A" * 10, "khong-phai-email", "A" * 50)
        assert resp.status_code == 422

    def test_tc09_all_empty(self):
        """TC09: fullname, email, message đều rỗng."""
        resp = post_contact("", "", "")
        assert resp.status_code == 422

    def test_tc10_fullname_and_message_empty(self):
        """TC10: fullname rỗng + message rỗng — nhiều lỗi cùng lúc."""
        resp = post_contact("", "test@example.com", "")
        assert resp.status_code == 422


class TestDiscrepancyPHPvsZod:
    """
    Các trường hợp BVA doc nói KHÔNG hợp lệ nhưng API thực tế CHẤP NHẬN.
    PHP chỉ có required|string cho fullname và message.
    """

    def test_fullname_1char_passes_api(self):
        """
        BVA doc: fullname=1 ký tự → Không hợp lệ (vi phạm Zod min:2).
        Thực tế API: PHP chỉ required|string → 201.
        """
        resp = post_contact("A", "test@example.com", "A" * 50)
        assert resp.status_code == 201

    def test_message_9chars_passes_api(self):
        """
        BVA doc: message=9 ký tự → Không hợp lệ (vi phạm Zod min:10).
        Thực tế API: PHP chỉ required|string → 201.
        """
        resp = post_contact("A" * 10, "test@example.com", "A" * 9)
        assert resp.status_code == 201

    def test_message_1001chars_passes_api(self):
        """
        BVA doc: message=1001 ký tự → Không hợp lệ (vượt max:1000).
        Thực tế API: PHP không có max → 201.
        """
        resp = post_contact("A" * 10, "test@example.com", "A" * 1001)
        assert resp.status_code == 201
