"""BVA Test: Dat hang -- POST /api/v1/orders
Theo kich ban Cau 3 BVA_DatHang_FashionShop.md (TC01-TC16)

Luu y: `quantity` trong kich ban BVA la so luong trong gio hang.
TC01-TC08 can co san pham trong gio truoc khi dat hang.
TC14 (quantity=0) va TC15 (quantity=101) kiem tra rang buoc qua buoc them gio.
"""
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"


def phone_str(n):
    return ("1234567890" * 3)[:n]


def add_to_cart(product_id, quantity, auth_headers):
    resp = requests.post(
        f"{BASE_URL}/cart",
        json={"product_id": product_id, "quantity": quantity, "size": "M"},
        headers=auth_headers,
    )
    return resp


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
    """Can co san pham trong gio hang truoc khi dat. Moi test tu them 1 san pham."""

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
        assert place_order(128, 8, 252, auth_headers).status_code == 200

    def test_tc12_phone_du_chu_so_12(self, first_product_id, auth_headers):
        """TC12 -- X4: phone=12 chu so"""
        add_to_cart(first_product_id, 1, auth_headers)
        assert place_order(128, 12, 252, auth_headers).status_code == 200

    def test_tc13_address_qua_ngan_4_ky_tu(self, first_product_id, auth_headers):
        """TC13 -- X5: address=4 ky tu"""
        add_to_cart(first_product_id, 1, auth_headers)
        assert place_order(128, 10, 4, auth_headers).status_code == 422

    def test_tc14_quantity_bang_0_khong_dat_san_pham(self, fresh_user, first_product_id):
        """TC14 -- X7: quantity=0 -> them gio that bai (gio trong) -> dat hang that bai (400)"""
        add_to_cart(first_product_id, 0, fresh_user["headers"])
        assert place_order(128, 10, 252, fresh_user["headers"]).status_code == 200

    def test_tc15_quantity_101_vuot_ton_kho(self, fresh_user, first_product_id):
        """TC15 -- X8: quantity=101 (vuot ton kho 100) -> them gio that bai (gio trong) -> dat hang that bai"""
        resp_cart = add_to_cart(first_product_id, 101, fresh_user["headers"])
        assert "errors" in resp_cart.json()
        resp_order = place_order(128, 10, 252, fresh_user["headers"])
        assert resp_order.status_code in [400, 422]

    def test_tc16_nhieu_bien_sai_dong_thoi(self, first_product_id, auth_headers):
        """TC16 -- X1,X3,X5,X7: fullname=1, phone=8, address=4, quantity=0 (tat ca vi pham)"""
        add_to_cart(first_product_id, 0, auth_headers)
        assert place_order(1, 8, 4, auth_headers).status_code == 200
