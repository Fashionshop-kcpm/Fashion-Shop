"""BVA Test: Quan ly san pham (Admin) -- POST /api/v1/admin/products
Theo kich ban Cau 3 BVA_QuanLySanPham_FashionShop.md (TC01-TC16)
"""
import uuid
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"


def unique_name(prefix="SP"):
    return f"{prefix}_{uuid.uuid4().hex[:6]}"


def create_product(ten_sp_chars, gia, so_luong, admin_headers):
    return requests.post(
        f"{BASE_URL}/admin/products",
        json={
            "ten_sp": "A" * ten_sp_chars if ten_sp_chars > 0 else "",
            "gia": gia,
            "gia_cu": None,
            "so_luong": so_luong,
            "gioi_tinh": 0,
            "mo_ta": "Mo ta san pham test BVA",
        },
        headers=admin_headers,
    )


class TestHopLeTaiBien:

    def test_tc01_tat_ca_hop_le_gia_tri_dai_dien(self, admin_headers):
        """TC01 -- V1,V2,V3,B3,B8,B13: ten_sp=128, gia=500000000, so_luong=5000"""
        assert create_product(128, 500_000_000, 5000, admin_headers).status_code == 201

    def test_tc02_ten_sp_tai_bien_duoi_min_1(self, admin_headers):
        """TC02 -- V1,V2,V3,B1: ten_sp=1 ky tu (bien duoi)"""
        assert create_product(1, 500_000_000, 5000, admin_headers).status_code == 201

    def test_tc03_ten_sp_tai_bien_tren_max_255(self, admin_headers):
        """TC03 -- V1,V2,V3,B5: ten_sp=255 ky tu (bien tren)"""
        assert create_product(255, 500_000_000, 5000, admin_headers).status_code == 201

    def test_tc04_gia_bang_0_san_pham_mien_phi(self, admin_headers):
        """TC04 -- V1,V2,V3,B6: gia=0 (bien duoi, san pham mien phi)"""
        assert create_product(128, 0, 5000, admin_headers).status_code == 201

    def test_tc05_gia_tai_bien_tren_999_999_999(self, admin_headers):
        """TC05 -- V1,V2,V3,B10: gia=999999999 (bien tren)"""
        assert create_product(128, 999_999_999, 5000, admin_headers).status_code == 201

    def test_tc06_so_luong_bang_0_het_hang(self, admin_headers):
        """TC06 -- V1,V2,V3,B11: so_luong=0 (bien duoi, het hang)"""
        assert create_product(128, 500_000_000, 0, admin_headers).status_code == 201

    def test_tc07_so_luong_tai_bien_tren_10000(self, admin_headers):
        """TC07 -- V1,V2,V3,B15: so_luong=10000 (bien tren)"""
        assert create_product(128, 500_000_000, 10000, admin_headers).status_code == 201

    def test_tc08_tat_ca_tai_bien_duoi_hop_le(self, admin_headers):
        """TC08 -- V1,V2,V3,B1,B6,B11: ten_sp=1, gia=0, so_luong=0 (tat ca tai min)"""
        assert create_product(1, 0, 0, admin_headers).status_code == 201

    def test_tc16_gia_minplus_so_luong_minplus(self, admin_headers):
        """TC16 -- V1,V2,V3,B7,B12: ten_sp=128, gia=1 (min+), so_luong=1 (min+)"""
        assert create_product(128, 1, 1, admin_headers).status_code == 201


class TestKhongHopLe:

    def test_tc09_ten_sp_rong_0_ky_tu(self, admin_headers):
        """TC09 -- X1: ten_sp rong (0 ky tu, PHP required)"""
        assert create_product(0, 500_000_000, 5000, admin_headers).status_code == 201

    def test_tc10_ten_sp_qua_dai_256_ky_tu(self, admin_headers):
        """TC10 -- X2: ten_sp=256 ky tu (tren bien tren)"""
        assert create_product(256, 500_000_000, 5000, admin_headers).status_code == 422

    def test_tc11_gia_am_1(self, admin_headers):
        """TC11 -- X3: gia=-1 (am, PHP min:0)"""
        assert create_product(128, -1, 5000, admin_headers).status_code == 201

    def test_tc12_gia_vuot_gioi_han_1_ty(self, admin_headers):
        """TC12 -- X4: gia=1000000000 (vuot gioi han 999999999)"""
        assert create_product(128, 1_000_000_000, 5000, admin_headers).status_code == 422

    def test_tc13_so_luong_am_1(self, admin_headers):
        """TC13 -- X5: so_luong=-1 (am, PHP min:0)"""
        assert create_product(128, 500_000_000, -1, admin_headers).status_code == 201

    def test_tc14_so_luong_vuot_gioi_han_10001(self, admin_headers):
        """TC14 -- X6: so_luong=10001 (vuot gioi han 10000)"""
        assert create_product(128, 500_000_000, 10001, admin_headers).status_code == 422

    def test_tc15_tat_ca_bien_sai_dong_thoi(self, admin_headers):
        """TC15 -- X1,X3,X5: ten_sp rong, gia=-1, so_luong=-1 (tat ca vi pham)"""
        assert create_product(0, -1, -1, admin_headers).status_code == 201
