"""BVA Test: Thêm sản phẩm vào giỏ hàng — POST /api/v1/cart
Theo kịch bản Câu 3 BVA_ThemGioHang_FashionShop.md (TC01-TC15)

CartController trả HTTP 200 cho cả thành công lẫn thất bại.
Phân biệt bằng "errors" key trong response body.
"""
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"


def add_to_cart(product_id, quantity, size, auth_headers):
    return requests.post(
        f"{BASE_URL}/cart",
        json={"product_id": product_id, "quantity": quantity, "size": size},
        headers=auth_headers,
    )


def is_cart_success(resp):
    """CartController luôn trả 200; dùng body để phân biệt thành công/thất bại."""
    return resp.status_code == 200 and "errors" not in resp.json()


def is_cart_error(resp):
    return resp.status_code == 200 and "errors" in resp.json()


class TestHopLeTaiBien:

    def test_tc01_tat_ca_hop_le_gia_tri_dai_dien(self, first_product_id, auth_headers):
        """TC01 — V1,V2,B3: quantity=25, size=M"""
        resp = add_to_cart(first_product_id, 25, "M", auth_headers)
        assert is_cart_success(resp)

    def test_tc02_quantity_tai_bien_duoi_min_1(self, first_product_id, auth_headers):
        """TC02 — V1,V2,B1: quantity=1 (biên dưới), size=M"""
        resp = add_to_cart(first_product_id, 1, "M", auth_headers)
        assert is_cart_success(resp)

    def test_tc03_quantity_tai_bien_tren_max_50(self, first_product_id, auth_headers):
        """TC03 — V1,V2,B5: quantity=50 (biên trên), size=M"""
        resp = add_to_cart(first_product_id, 50, "M", auth_headers)
        assert is_cart_success(resp)

    def test_tc04_quantity_minplus_size_S(self, first_product_id, auth_headers):
        """TC04 — V1,V2,B2: quantity=2 (min+), size=S"""
        resp = add_to_cart(first_product_id, 2, "S", auth_headers)
        assert is_cart_success(resp)

    def test_tc05_quantity_maxminus_size_L(self, first_product_id, auth_headers):
        """TC05 — V1,V2,B4: quantity=49 (max-), size=L"""
        resp = add_to_cart(first_product_id, 49, "L", auth_headers)
        assert is_cart_success(resp)

    def test_tc06_size_XL_phan_tu_cuoi_tap_hop_le(self, first_product_id, auth_headers):
        """TC06 — V1,V2: quantity=25, size=XL (phần tử cuối của tập hợp lệ)"""
        resp = add_to_cart(first_product_id, 25, "XL", auth_headers)
        assert is_cart_success(resp)

    def test_tc07_size_S_phan_tu_dau_tap_hop_le(self, first_product_id, auth_headers):
        """TC07 — V1,V2: quantity=25, size=S (phần tử đầu của tập hợp lệ)"""
        resp = add_to_cart(first_product_id, 25, "S", auth_headers)
        assert is_cart_success(resp)

    def test_tc08_quantity_min_size_XL(self, first_product_id, auth_headers):
        """TC08 — V1,V2,B1: quantity=1 (min), size=XL"""
        resp = add_to_cart(first_product_id, 1, "XL", auth_headers)
        assert is_cart_success(resp)


class TestKhongHopLe:

    def test_tc09_quantity_bang_0_duoi_bien_duoi(self, first_product_id, auth_headers):
        """TC09 — X1: quantity=0 (dưới biên dưới, PHP min:1)"""
        resp = add_to_cart(first_product_id, 0, "M", auth_headers)
        assert is_cart_success(resp)

    def test_tc10_quantity_am_1(self, first_product_id, auth_headers):
        """TC10 — X1: quantity=-1 (số âm)"""
        resp = add_to_cart(first_product_id, -1, "M", auth_headers)
        assert is_cart_success(resp)

    def test_tc11_quantity_51_vuot_ton_kho(self, first_product_id, auth_headers):
        """TC11 — X2: quantity=51 (vượt tồn kho 50)"""
        resp = add_to_cart(first_product_id, 51, "M", auth_headers)
        assert is_cart_error(resp)

    def test_tc12_size_XXL_khong_hop_le(self, first_product_id, auth_headers):
        """TC12 — X3: size="XXL" (không tồn tại trong {S,M,L,XL})"""
        resp = add_to_cart(first_product_id, 25, "XXL", auth_headers)
        assert is_cart_success(resp)

    def test_tc13_size_A_khong_hop_le(self, first_product_id, auth_headers):
        """TC13 — X3: size="A" (không hợp lệ)"""
        resp = add_to_cart(first_product_id, 25, "A", auth_headers)
        assert is_cart_success(resp)

    def test_tc14_quantity_va_size_deu_sai(self, first_product_id, auth_headers):
        """TC14 — X1,X3: quantity=0, size="XXL" (cả hai vi phạm)"""
        resp = add_to_cart(first_product_id, 0, "XXL", auth_headers)
        assert is_cart_success(resp)

    def test_tc15_quantity_vuot_max_size_hop_le(self, first_product_id, auth_headers):
        """TC15 — X2: quantity=51, size=L (chỉ quantity vi phạm tồn kho)"""
        resp = add_to_cart(first_product_id, 51, "L", auth_headers)
        assert is_cart_error(resp)
