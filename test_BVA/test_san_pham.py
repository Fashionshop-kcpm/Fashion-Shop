import pytest
from validate_san_pham import validate_san_pham


class TestHopLeTaiBien:

    def test_tc01_nominal(self):
        """TC01: Tất cả giá trị đại diện — hợp lệ."""
        assert validate_san_pham(128, 500_000_000, 5_000) is True

    def test_tc02_ten_sp_min(self):
        """TC02 — B1: ten_sp = 1 ký tự (biên dưới hợp lệ)."""
        assert validate_san_pham(1, 500_000_000, 5_000) is True

    def test_tc03_ten_sp_max(self):
        """TC03 — B5: ten_sp = 255 ký tự (biên trên hợp lệ)."""
        assert validate_san_pham(255, 500_000_000, 5_000) is True

    def test_tc04_gia_min(self):
        """TC04 — B6: gia = 0 (sản phẩm miễn phí / tặng kèm)."""
        assert validate_san_pham(128, 0, 5_000) is True

    def test_tc05_gia_max(self):
        """TC05 — B10: gia = 999.999.999 (biên trên hợp lệ)."""
        assert validate_san_pham(128, 999_999_999, 5_000) is True

    def test_tc06_so_luong_min(self):
        """TC06 — B11: so_luong = 0 (hết hàng — vẫn hợp lệ)."""
        assert validate_san_pham(128, 500_000_000, 0) is True

    def test_tc07_so_luong_max(self):
        """TC07 — B15: so_luong = 10.000 (biên trên hợp lệ)."""
        assert validate_san_pham(128, 500_000_000, 10_000) is True

    def test_tc08_tat_ca_bien_min(self):
        """TC08: Tất cả biến tại min hợp lệ."""
        assert validate_san_pham(1, 0, 0) is True

    def test_tc09_tat_ca_bien_max(self):
        """TC09: Tất cả biến tại max hợp lệ."""
        assert validate_san_pham(255, 999_999_999, 10_000) is True


class TestKhongHopLe:

    def test_tc10_ten_sp_rong(self):
        """TC10 — X1: ten_sp = 0 (rỗng, dưới biên dưới)."""
        assert validate_san_pham(0, 500_000_000, 5_000) is False

    def test_tc11_ten_sp_tren_max(self):
        """TC11 — X2: ten_sp = 256 (trên biên trên)."""
        assert validate_san_pham(256, 500_000_000, 5_000) is False

    def test_tc12_gia_am(self):
        """TC12 — X3: gia = -1 (giá âm)."""
        assert validate_san_pham(128, -1, 5_000) is False

    def test_tc13_gia_vuot_gioi_han(self):
        """TC13 — X4: gia = 1.000.000.000 (vượt giới hạn)."""
        assert validate_san_pham(128, 1_000_000_000, 5_000) is False

    def test_tc14_so_luong_am(self):
        """TC14 — X5: so_luong = -1 (tồn kho âm)."""
        assert validate_san_pham(128, 500_000_000, -1) is False

    def test_tc15_so_luong_vuot_gioi_han(self):
        """TC15 — X6: so_luong = 10.001 (vượt tồn kho tối đa)."""
        assert validate_san_pham(128, 500_000_000, 10_001) is False

    def test_tc16_nhieu_bien_sai(self):
        """TC16 — X1, X3, X5: tất cả biến đều vi phạm."""
        assert validate_san_pham(0, -1, -1) is False

    def test_tc17_gia_bien_duoi_vi_pham(self):
        """TC17 — X3: gia = -1 (ngay dưới biên dưới)."""
        assert validate_san_pham(128, -1, 5_000) is False

    def test_tc18_so_luong_bien_tren_vi_pham(self):
        """TC18 — X6: so_luong = 10.001 (ngay trên biên trên)."""
        assert validate_san_pham(128, 500_000_000, 10_001) is False