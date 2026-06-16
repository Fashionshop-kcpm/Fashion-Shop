import pytest
from validate_dat_hang import validate_dat_hang

class TestHopLeTaiBien:

    def test_tc01_tat_ca_tai_nominal(self):
        """TC01: Tất cả biến hợp lệ — giá trị đại diện (nominal)."""
        assert validate_dat_hang(128, 10, 252, 50) is True

    def test_tc02_fullname_tai_min(self):
        """TC02 — B1: fullname = 2 (biên dưới hợp lệ)."""
        assert validate_dat_hang(2, 10, 252, 50) is True

    def test_tc03_fullname_tai_max(self):
        """TC03 — B5: fullname = 255 (biên trên hợp lệ)."""
        assert validate_dat_hang(255, 10, 252, 50) is True

    def test_tc04_phone_tai_min(self):
        """TC04 — B6: phone = 9 chữ số (biên dưới hợp lệ)."""
        assert validate_dat_hang(128, 9, 252, 50) is True

    def test_tc05_phone_tai_max(self):
        """TC05 — B8: phone = 11 chữ số (biên trên hợp lệ)."""
        assert validate_dat_hang(128, 11, 252, 50) is True

    def test_tc06_address_tai_min(self):
        """TC06 — B9: address = 5 ký tự (biên dưới hợp lệ)."""
        assert validate_dat_hang(128, 10, 5, 50) is True

    def test_tc07_address_tai_max(self):
        """TC07 — B13: address = 500 ký tự (biên trên hợp lệ)."""
        assert validate_dat_hang(128, 10, 500, 50) is True

    def test_tc08_quantity_tai_min(self):
        """TC08 — B14: quantity = 1 sản phẩm (biên dưới hợp lệ)."""
        assert validate_dat_hang(128, 10, 252, 1) is True

    def test_tc09_quantity_tai_max(self):
        """TC09 — B18: quantity = 100 sản phẩm (biên trên hợp lệ)."""
        assert validate_dat_hang(128, 10, 252, 100) is True

    def test_tc10_tat_ca_tai_bien_min(self):
        """TC10: Tất cả biến tại biên dưới hợp lệ (min)."""
        assert validate_dat_hang(2, 9, 5, 1) is True

    def test_tc11_tat_ca_tai_bien_max(self):
        """TC11: Tất cả biến tại biên trên hợp lệ (max)."""
        assert validate_dat_hang(255, 11, 500, 100) is True


class TestKhongHopLe:

    def test_tc12_fullname_duoi_min(self):
        """TC12 — X1: fullname = 1 (dưới biên dưới)."""
        assert validate_dat_hang(1, 10, 252, 50) is False

    def test_tc13_fullname_tren_max(self):
        """TC13 — X2: fullname = 256 (trên biên trên)."""
        assert validate_dat_hang(256, 10, 252, 50) is False

    def test_tc14_phone_duoi_min(self):
        """TC14 — X3: phone = 8 chữ số (dưới biên dưới)."""
        assert validate_dat_hang(128, 8, 252, 50) is False

    def test_tc15_phone_tren_max(self):
        """TC15 — X4: phone = 12 chữ số (trên biên trên)."""
        assert validate_dat_hang(128, 12, 252, 50) is False

    def test_tc16_address_duoi_min(self):
        """TC16 — X5: address = 4 ký tự (dưới biên dưới)."""
        assert validate_dat_hang(128, 10, 4, 50) is False

    def test_tc17_address_tren_max(self):
        """TC17 — X6: address = 501 ký tự (trên biên trên)."""
        assert validate_dat_hang(128, 10, 501, 50) is False

    def test_tc18_quantity_bang_khong(self):
        """TC18 — X7: quantity = 0 (không thể đặt 0 sản phẩm)."""
        assert validate_dat_hang(128, 10, 252, 0) is False

    def test_tc19_quantity_am(self):
        """TC19 — X7: quantity = -1 (số lượng âm)."""
        assert validate_dat_hang(128, 10, 252, -1) is False

    def test_tc20_quantity_tren_max(self):
        """TC20 — X8: quantity = 101 (vượt tồn kho tối đa)."""
        assert validate_dat_hang(128, 10, 252, 101) is False

    def test_tc21_nhieu_bien_sai(self):
        """TC21: Nhiều biến vi phạm đồng thời — X1, X3, X5, X7."""
        assert validate_dat_hang(1, 8, 4, 0) is False