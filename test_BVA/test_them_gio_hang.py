"""
BVA Test: Thêm sản phẩm vào giỏ hàng — POST /api/v1/cart

PHP validation thực tế:
  product_id : required|exists:products,id
  quantity   : required|integer|min:1   (KHÔNG có max — max tồn kho chỉ ở Zod)
  size       : required|in:S,M,L,XL

⚠️  QUAN TRỌNG: CartController trả HTTP 200 cho CẢ thành công lẫn thất bại!
    Phân biệt qua response body:
      - Thành công: {"message": "Đã thêm vào giỏ hàng", "cart": {...}}
      - Thất bại:   {"message": "...", "errors": {...}}

Yêu cầu: Bearer token (đăng nhập user).
"""
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"


def add_to_cart(product_id, quantity, size, auth_headers):
    return requests.post(
        f"{BASE_URL}/cart",
        json={"product_id": product_id, "quantity": quantity, "size": size},
        headers=auth_headers,
    )


def is_success(resp):
    """Không có key 'errors' trong response = thêm thành công."""
    return "errors" not in resp.json()


class TestHopLeTaiBien:
    """quantity >= 1 và size hợp lệ — API trả 200 + không có 'errors'."""

    def test_tc01_nominal(self, first_product_id, auth_headers):
        """TC01: quantity=25, size=M."""
        resp = add_to_cart(first_product_id, 25, "M", auth_headers)
        assert resp.status_code == 200
        assert is_success(resp)

    def test_tc02_quantity_min(self, first_product_id, auth_headers):
        """TC02 — B1: quantity=1 (biên dưới hợp lệ, PHP min:1)."""
        resp = add_to_cart(first_product_id, 1, "M", auth_headers)
        assert resp.status_code == 200
        assert is_success(resp)

    def test_tc03_quantity_minplus(self, first_product_id, auth_headers):
        """TC03 — B2: quantity=2 (biên dưới + 1)."""
        resp = add_to_cart(first_product_id, 2, "S", auth_headers)
        assert resp.status_code == 200
        assert is_success(resp)

    def test_tc04_size_s(self, first_product_id, auth_headers):
        """TC04 — V2: size=S."""
        resp = add_to_cart(first_product_id, 5, "S", auth_headers)
        assert resp.status_code == 200
        assert is_success(resp)

    def test_tc05_size_l(self, first_product_id, auth_headers):
        """TC05 — V2: size=L."""
        resp = add_to_cart(first_product_id, 5, "L", auth_headers)
        assert resp.status_code == 200
        assert is_success(resp)

    def test_tc06_size_xl(self, first_product_id, auth_headers):
        """TC06 — V2: size=XL (phần tử cuối tập hợp lệ)."""
        resp = add_to_cart(first_product_id, 5, "XL", auth_headers)
        assert resp.status_code == 200
        assert is_success(resp)

    def test_tc07_quantity_nominal(self, first_product_id, auth_headers):
        """TC07 — B3: quantity=25 (nominal), size=M."""
        resp = add_to_cart(first_product_id, 25, "M", auth_headers)
        assert resp.status_code == 200
        assert is_success(resp)


class TestKhongHopLe:
    """quantity < 1 hoặc size không hợp lệ — API trả 200 + có 'errors'."""

    def test_tc08_quantity_zero(self, first_product_id, auth_headers):
        """TC08 — X1: quantity=0 (dưới biên dưới, PHP min:1)."""
        resp = add_to_cart(first_product_id, 0, "M", auth_headers)
        assert resp.status_code == 200
        assert not is_success(resp)

    def test_tc09_quantity_negative(self, first_product_id, auth_headers):
        """TC09 — X1: quantity=-1 (số âm)."""
        resp = add_to_cart(first_product_id, -1, "M", auth_headers)
        assert resp.status_code == 200
        assert not is_success(resp)

    def test_tc10_size_xxl(self, first_product_id, auth_headers):
        """TC10 — X3: size=XXL (không trong {S,M,L,XL})."""
        resp = add_to_cart(first_product_id, 5, "XXL", auth_headers)
        assert resp.status_code == 200
        assert not is_success(resp)

    def test_tc11_size_invalid_char(self, first_product_id, auth_headers):
        """TC11 — X3: size=A (không hợp lệ)."""
        resp = add_to_cart(first_product_id, 5, "A", auth_headers)
        assert resp.status_code == 200
        assert not is_success(resp)

    def test_tc12_both_invalid(self, first_product_id, auth_headers):
        """TC12 — X1, X3: quantity=0 và size=XXL — cả hai sai."""
        resp = add_to_cart(first_product_id, 0, "XXL", auth_headers)
        assert resp.status_code == 200
        assert not is_success(resp)


class TestDiscrepancyPHPvsZod:
    """
    PHP không enforce max quantity (giới hạn tồn kho chỉ ở frontend).
    quantity=51 (vượt tồn kho 50 theo BVA) nhưng PHP chấp nhận.
    """

    def test_quantity_above_stock_passes_api(self, first_product_id, auth_headers):
        """
        BVA doc: quantity=51 → Không hợp lệ (vượt tồn kho 50).
        Thực tế API: PHP chỉ min:1, không có max → 200 + thành công.
        """
        resp = add_to_cart(first_product_id, 51, "M", auth_headers)
        assert resp.status_code == 200
        assert is_success(resp)
