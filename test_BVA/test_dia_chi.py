"""BVA Test: Thêm địa chỉ giao hàng — POST /api/v1/addresses
Theo kịch bản Câu 3 BVA_DiaChi_FashionShop.md (TC01-TC15)
"""
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"


def phone_str(n):
    return ("1234567890" * 3)[:n]


def post_address(fullname_chars, phone_digits, address_chars, auth_headers):
    return requests.post(
        f"{BASE_URL}/addresses",
        json={
            "fullname": "A" * fullname_chars,
            "phone": phone_str(phone_digits),
            "address_details": "A" * address_chars,
        },
        headers=auth_headers,
    )


class TestHopLeTaiBien:

    def test_tc01_tat_ca_hop_le_gia_tri_dai_dien(self, auth_headers):
        """TC01 — V1,V2,V3,B3,B7,B11: fullname=128, phone=10, address_details=252"""
        assert post_address(128, 10, 252, auth_headers).status_code == 201

    def test_tc02_fullname_tai_bien_duoi_min_2(self, auth_headers):
        """TC02 — V1,V2,V3,B1: fullname=2 (biên dưới)"""
        assert post_address(2, 10, 252, auth_headers).status_code == 201

    def test_tc03_fullname_tai_bien_tren_max_255(self, auth_headers):
        """TC03 — V1,V2,V3,B5: fullname=255 (biên trên)"""
        assert post_address(255, 10, 252, auth_headers).status_code == 201

    def test_tc04_phone_tai_bien_duoi_9_chu_so(self, auth_headers):
        """TC04 — V1,V2,V3,B6: phone=9 chữ số (biên dưới)"""
        assert post_address(128, 9, 252, auth_headers).status_code == 201

    def test_tc05_phone_tai_bien_tren_11_chu_so(self, auth_headers):
        """TC05 — V1,V2,V3,B8: phone=11 chữ số (biên trên)"""
        assert post_address(128, 11, 252, auth_headers).status_code == 201

    def test_tc06_address_tai_bien_duoi_5_ky_tu(self, auth_headers):
        """TC06 — V1,V2,V3,B9: address_details=5 ký tự (biên dưới)"""
        assert post_address(128, 10, 5, auth_headers).status_code == 201

    def test_tc07_address_tai_bien_tren_500_ky_tu(self, auth_headers):
        """TC07 — V1,V2,V3,B13: address_details=500 ký tự (biên trên)"""
        assert post_address(128, 10, 500, auth_headers).status_code == 201

    def test_tc08_tat_ca_tai_bien_duoi_hop_le(self, auth_headers):
        """TC08 — V1,V2,V3,B1,B6,B9: fullname=2, phone=9, address_details=5"""
        assert post_address(2, 9, 5, auth_headers).status_code == 201


class TestKhongHopLe:

    def test_tc09_fullname_qua_ngan_1_ky_tu(self, auth_headers):
        """TC09 — X1: fullname=1 ký tự"""
        assert post_address(1, 10, 252, auth_headers).status_code == 422

    def test_tc10_fullname_qua_dai_256_ky_tu(self, auth_headers):
        """TC10 — X2: fullname=256 ký tự"""
        assert post_address(256, 10, 252, auth_headers).status_code == 422

    def test_tc11_phone_thieu_chu_so_8(self, auth_headers):
        """TC11 — X3: phone=8 chữ số"""
        assert post_address(128, 8, 252, auth_headers).status_code == 422

    def test_tc12_phone_du_chu_so_12(self, auth_headers):
        """TC12 — X4: phone=12 chữ số"""
        assert post_address(128, 12, 252, auth_headers).status_code == 422

    def test_tc13_address_qua_ngan_4_ky_tu(self, auth_headers):
        """TC13 — X5: address_details=4 ký tự"""
        assert post_address(128, 10, 4, auth_headers).status_code == 422

    def test_tc14_address_qua_dai_501_ky_tu(self, auth_headers):
        """TC14 — X6: address_details=501 ký tự"""
        assert post_address(128, 10, 501, auth_headers).status_code == 422

    def test_tc15_nhieu_bien_sai_dong_thoi(self, auth_headers):
        """TC15 — X1,X3,X5: fullname=1, phone=8, address_details=4 (tất cả vi phạm)"""
        assert post_address(1, 8, 4, auth_headers).status_code == 422
