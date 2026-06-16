import pytest
from validate_them_gio_hang import validate_them_gio_hang

SO_LUONG_SP = 50  # tồn kho sản phẩm mẫu dùng trong toàn bộ test


class TestHopLeTaiBien:

    def test_tc01_nominal(self):
        """TC01: Giá trị đại diện — hợp lệ."""
        assert validate_them_gio_hang(25, "M", SO_LUONG_SP) is True

    def test_tc02_quantity_min(self):
        """TC02 — B1: quantity = 1 (biên dưới hợp lệ)."""
        assert validate_them_gio_hang(1, "M", SO_LUONG_SP) is True

    def test_tc03_quantity_max(self):
        """TC03 — B5: quantity = 50 (bằng đúng tồn kho)."""
        assert validate_them_gio_hang(50, "M", SO_LUONG_SP) is True

    def test_tc04_quantity_minplus(self):
        """TC04 — B2: quantity = 2 (ngay trên biên dưới)."""
        assert validate_them_gio_hang(2, "S", SO_LUONG_SP) is True

    def test_tc05_quantity_maxminus(self):
        """TC05 — B4: quantity = 49 (ngay dưới biên trên)."""
        assert validate_them_gio_hang(49, "L", SO_LUONG_SP) is True

    def test_tc06_size_s(self):
        """TC06 — V2: size = S (phần tử đầu tập hợp lệ)."""
        assert validate_them_gio_hang(25, "S", SO_LUONG_SP) is True

    def test_tc07_size_xl(self):
        """TC07 — V2: size = XL (phần tử cuối tập hợp lệ)."""
        assert validate_them_gio_hang(25, "XL", SO_LUONG_SP) is True

    def test_tc08_quantity_min_size_xl(self):
        """TC08 — B1, V2: quantity tối thiểu, size XL."""
        assert validate_them_gio_hang(1, "XL", SO_LUONG_SP) is True


class TestKhongHopLe:

    def test_tc09_quantity_bang_khong(self):
        """TC09 — X1: quantity = 0 (dưới biên dưới)."""
        assert validate_them_gio_hang(0, "M", SO_LUONG_SP) is False

    def test_tc10_quantity_am(self):
        """TC10 — X1: quantity = -1 (số âm)."""
        assert validate_them_gio_hang(-1, "M", SO_LUONG_SP) is False

    def test_tc11_quantity_vuot_ton_kho(self):
        """TC11 — X2: quantity = 51 (vượt tồn kho 50)."""
        assert validate_them_gio_hang(51, "M", SO_LUONG_SP) is False

    def test_tc12_size_xxl(self):
        """TC12 — X3: size = 'XXL' (không thuộc tập hợp lệ)."""
        assert validate_them_gio_hang(25, "XXL", SO_LUONG_SP) is False

    def test_tc13_size_khong_hop_le(self):
        """TC13 — X3: size = 'A' (kích cỡ không tồn tại)."""
        assert validate_them_gio_hang(25, "A", SO_LUONG_SP) is False

    def test_tc14_size_rong(self):
        """TC14 — X3: size = '' (rỗng)."""
        assert validate_them_gio_hang(25, "", SO_LUONG_SP) is False

    def test_tc15_ca_hai_sai(self):
        """TC15 — X1, X3: quantity = 0 và size = 'XXL'."""
        assert validate_them_gio_hang(0, "XXL", SO_LUONG_SP) is False

    def test_tc16_quantity_vuot_max_size_hop_le(self):
        """TC16 — X2: quantity vượt tồn kho, size hợp lệ."""
        assert validate_them_gio_hang(51, "L", SO_LUONG_SP) is False