"""
BVA Test: Quan ly san pham (Admin) -- POST /api/v1/admin/products

PHP validation thuc te:
  ten_sp   : required|string    (KHONG co max -- chi DB varchar(255))
  gia      : required|integer|min:0   (KHONG co max:999,999,999)
  so_luong : required|integer|min:0   (KHONG co max:10,000)
  gioi_tinh: required|in:0,1

Yeu cau: Bearer token cua Admin (admin@fashionshop.vn / Admin123456).
"""
import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"


def create_product(ten_sp, gia, so_luong, admin_headers):
    return requests.post(
        f"{BASE_URL}/admin/products",
        json={
            "ten_sp": ten_sp,
            "gia": gia,
            "so_luong": so_luong,
            "gioi_tinh": 1,
        },
        headers=admin_headers,
    )


class TestHopLeTaiBien:
    """Dau vao hop le -- API tra 201 Created."""

    def test_tc01_nominal(self, admin_headers):
        """TC01: ten_sp=10, gia=500000, so_luong=100."""
        resp = create_product("A" * 10, 500_000, 100, admin_headers)
        assert resp.status_code == 201

    def test_tc02_gia_min(self, admin_headers):
        """TC02 -- B6: gia=0 (bien duoi hop le, PHP min:0 -- san pham mien phi)."""
        resp = create_product("B" * 10, 0, 100, admin_headers)
        assert resp.status_code == 201

    def test_tc03_so_luong_min(self, admin_headers):
        """TC03 -- B11: so_luong=0 (bien duoi hop le, PHP min:0 -- het hang)."""
        resp = create_product("C" * 10, 500_000, 0, admin_headers)
        assert resp.status_code == 201

    def test_tc04_ten_sp_1char(self, admin_headers):
        """TC04 -- B1: ten_sp=1 ky tu (PHP chi required|string, khong co min)."""
        resp = create_product("A", 500_000, 100, admin_headers)
        assert resp.status_code == 201

    def test_tc05_ten_sp_255chars(self, admin_headers):
        """TC05 -- B5: ten_sp=255 ky tu (bien tren DB varchar(255))."""
        resp = create_product("A" * 255, 500_000, 100, admin_headers)
        assert resp.status_code == 201

    def test_tc06_all_at_min(self, admin_headers):
        """TC06: ten_sp=1, gia=0, so_luong=0 -- tat ca tai bien duoi hop le."""
        resp = create_product("X", 0, 0, admin_headers)
        assert resp.status_code == 201

    def test_tc07_gia_minplus(self, admin_headers):
        """TC07 -- B7: gia=1 (bien duoi + 1)."""
        resp = create_product("D" * 10, 1, 100, admin_headers)
        assert resp.status_code == 201

    def test_tc08_so_luong_minplus(self, admin_headers):
        """TC08 -- B12: so_luong=1 (bien duoi + 1)."""
        resp = create_product("E" * 10, 500_000, 1, admin_headers)
        assert resp.status_code == 201


class TestKhongHopLe:
    """Dau vao vi pham rang buoc PHP -- API tra 422."""

    def test_tc09_gia_negative(self, admin_headers):
        """TC09 -- X3: gia=-1 (PHP min:0) -- 422."""
        resp = create_product("A" * 10, -1, 100, admin_headers)
        assert resp.status_code == 422

    def test_tc10_so_luong_negative(self, admin_headers):
        """TC10 -- X5: so_luong=-1 (PHP min:0) -- 422."""
        resp = create_product("A" * 10, 500_000, -1, admin_headers)
        assert resp.status_code == 422

    def test_tc11_empty_ten_sp(self, admin_headers):
        """TC11 -- X1: ten_sp rong (PHP required) -- 422."""
        resp = create_product("", 500_000, 100, admin_headers)
        assert resp.status_code == 422

    def test_tc12_all_invalid(self, admin_headers):
        """TC12: ten_sp rong + gia=-1 + so_luong=-1 -- nhieu loi cung luc -- 422."""
        resp = create_product("", -1, -1, admin_headers)
        assert resp.status_code == 422


class TestDiscrepancyPHPvsZod:
    """
    Cac truong hop BVA doc noi KHONG hop le nhung API thuc te CHAP NHAN.
    PHP khong co max cho gia va so_luong.
    """

    def test_gia_above_limit_passes_api(self, admin_headers):
        """
        BVA doc: gia=1,000,000,000 -> Khong hop le (vuot business limit 999,999,999).
        Thuc te API: PHP chi min:0, khong co max -> 201.
        """
        resp = create_product("F" * 10, 1_000_000_000, 100, admin_headers)
        assert resp.status_code == 201

    def test_so_luong_above_limit_passes_api(self, admin_headers):
        """
        BVA doc: so_luong=10,001 -> Khong hop le (vuot business limit 10,000).
        Thuc te API: PHP chi min:0, khong co max -> 201.
        """
        resp = create_product("G" * 10, 500_000, 10_001, admin_headers)
        assert resp.status_code == 201
