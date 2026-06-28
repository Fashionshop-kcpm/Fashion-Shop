"""
BVA Test: Dat hang -- POST /api/v1/orders

PHP validation thuc te:
  fullname : required|string                  (KHONG co min:2/max:255)
  phone    : required|regex:/^[0-9]{9,11}$/
  address  : required|string                  (KHONG co min:5/max:500)
  payment  : required|in:COD

Luu y quan trong:
  - 'quantity' KHONG phai tham so cua order API -- no lay tu gio hang (Cart).
    BVA doc goc co bien 'quantity' la SAI -- phai test quantity o endpoint /cart.
  - OrderController kiem tra gio hang sau validation:
    gio hang trong -> 400 "Gio hang trong"
    gio hang co san pham -> dat hang thanh cong -> 200, gio hang bi xoa.

Yeu cau: Bearer token (dang nhap user).
"""
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"


def phone_str(n):
    return ("1234567890" * 3)[:n]


def ensure_cart_has_item(auth_headers, product_id):
    """Them san pham vao gio hang de dam bao gio hang khong trong truoc khi dat."""
    requests.post(
        f"{BASE_URL}/cart",
        json={"product_id": product_id, "quantity": 1, "size": "M"},
        headers=auth_headers,
    )


def place_order(fullname, phone, address, auth_headers):
    return requests.post(
        f"{BASE_URL}/orders",
        json={
            "fullname": fullname,
            "phone": phone,
            "address": address,
            "payment": "COD",
        },
        headers=auth_headers,
    )


class TestHopLeTaiBien:
    """Dau vao hop le + gio hang khong rong -- API tra 200."""

    def test_tc01_nominal(self, auth_headers, first_product_id):
        """TC01: fullname=10, phone=10 chu so, address=50 ky tu."""
        ensure_cart_has_item(auth_headers, first_product_id)
        resp = place_order("A" * 10, phone_str(10), "A" * 50, auth_headers)
        assert resp.status_code == 200

    def test_tc02_phone_min(self, auth_headers, first_product_id):
        """TC02 -- B6: phone=9 chu so (bien duoi hop le)."""
        ensure_cart_has_item(auth_headers, first_product_id)
        resp = place_order("A" * 10, phone_str(9), "A" * 50, auth_headers)
        assert resp.status_code == 200

    def test_tc03_phone_max(self, auth_headers, first_product_id):
        """TC03 -- B8: phone=11 chu so (bien tren hop le)."""
        ensure_cart_has_item(auth_headers, first_product_id)
        resp = place_order("A" * 10, phone_str(11), "A" * 50, auth_headers)
        assert resp.status_code == 200

    def test_tc04_phone_10digits(self, auth_headers, first_product_id):
        """TC04 -- B7: phone=10 chu so (nominal/min+/max-)."""
        ensure_cart_has_item(auth_headers, first_product_id)
        resp = place_order("A" * 10, phone_str(10), "A" * 50, auth_headers)
        assert resp.status_code == 200


class TestKhongHopLe:
    """Dau vao vi pham rang buoc PHP -- API tra 422 (validation truoc khi kiem tra gio hang)."""

    def test_tc05_phone_below_min(self, auth_headers):
        """TC05 -- X3: phone=8 chu so (duoi bien duoi, PHP regex) -- 422."""
        resp = place_order("A" * 10, phone_str(8), "A" * 50, auth_headers)
        assert resp.status_code == 422

    def test_tc06_phone_above_max(self, auth_headers):
        """TC06 -- X4: phone=12 chu so (tren bien tren) -- 422."""
        resp = place_order("A" * 10, phone_str(12), "A" * 50, auth_headers)
        assert resp.status_code == 422

    def test_tc07_empty_fullname(self, auth_headers):
        """TC07: fullname rong (PHP required) -- 422."""
        resp = place_order("", phone_str(10), "A" * 50, auth_headers)
        assert resp.status_code == 422

    def test_tc08_empty_address(self, auth_headers):
        """TC08: address rong (PHP required) -- 422."""
        resp = place_order("A" * 10, phone_str(10), "", auth_headers)
        assert resp.status_code == 422

    def test_tc09_multiple_invalid(self, auth_headers):
        """TC09: phone=8 chu so + fullname rong -- 422."""
        resp = place_order("", phone_str(8), "A" * 50, auth_headers)
        assert resp.status_code == 422

    def test_tc10_empty_cart(self, auth_headers):
        """TC10: gio hang trong (sau khi tat ca test TC01-04 da xoa gio hang) -- 400."""
        resp = place_order("A" * 10, phone_str(10), "A" * 50, auth_headers)
        assert resp.status_code == 400


class TestDiscrepancyPHPvsZod:
    """
    Cac truong hop BVA doc noi KHONG hop le nhung API thuc te CHAP NHAN.
    PHP chi co required|string cho fullname va address.
    """

    def test_fullname_1char_passes_api(self, auth_headers, first_product_id):
        """
        BVA doc: fullname=1 ky tu -> Khong hop le (Zod min:2).
        Thuc te API: PHP chi required|string -> 200.
        """
        ensure_cart_has_item(auth_headers, first_product_id)
        resp = place_order("A", phone_str(10), "A" * 50, auth_headers)
        assert resp.status_code == 200

    def test_address_4chars_passes_api(self, auth_headers, first_product_id):
        """
        BVA doc: address=4 ky tu -> Khong hop le (Zod min:5).
        Thuc te API: PHP chi required|string -> 200.
        """
        ensure_cart_has_item(auth_headers, first_product_id)
        resp = place_order("A" * 10, phone_str(10), "ABCD", auth_headers)
        assert resp.status_code == 200
