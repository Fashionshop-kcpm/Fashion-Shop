import pytest
from validate_dia_chi import validate_dia_chi


class TestHopLeTaiBien:

    def test_tc01_nominal(self):
        """TC01: Tất cả giá trị đại diện — hợp lệ."""
        assert validate_dia_chi(128, 10, 252) is True

    def test_tc02_fullname_min(self):
        """TC02 — B1: fullname = 2 (biên dưới hợp lệ)."""
        assert validate_dia_chi(2, 10, 252) is True

    def test_tc03_fullname_max(self):
        """TC03 — B5: fullname = 255 (biên trên hợp lệ)."""
        assert validate_dia_chi(255, 10, 252) is True

    def test_tc04_phone_min(self):
        """TC04 — B6: phone = 9 chữ số (biên dưới hợp lệ)."""
        assert validate_dia_chi(128, 9, 252) is True

    def test_tc05_phone_max(self):
        """TC05 — B8: phone = 11 chữ số (biên trên hợp lệ)."""
        assert validate_dia_chi(128, 11, 252) is True

    def test_tc06_address_min(self):
        """TC06 — B9: address_details = 5 ký tự (biên dưới hợp lệ)."""
        assert validate_dia_chi(128, 10, 5) is True

    def test_tc07_address_max(self):
        """TC07 — B13: address_details = 500 ký tự (biên trên hợp lệ)."""
        assert validate_dia_chi(128, 10, 500) is True

    def test_tc08_tat_ca_bien_min(self):
        """TC08: Tất cả biến tại min hợp lệ."""
        assert validate_dia_chi(2, 9, 5) is True

    def test_tc09_tat_ca_bien_max(self):
        """TC09: Tất cả biến tại max hợp lệ."""
        assert validate_dia_chi(255, 11, 500) is True


class TestKhongHopLe:

    def test_tc10_fullname_duoi_min(self):
        """TC10 — X1: fullname = 1 (dưới biên dưới)."""
        assert validate_dia_chi(1, 10, 252) is False

    def test_tc11_fullname_tren_max(self):
        """TC11 — X2: fullname = 256 (trên biên trên)."""
        assert validate_dia_chi(256, 10, 252) is False

    def test_tc12_phone_duoi_min(self):
        """TC12 — X3: phone = 8 chữ số (dưới biên dưới)."""
        assert validate_dia_chi(128, 8, 252) is False

    def test_tc13_phone_tren_max(self):
        """TC13 — X4: phone = 12 chữ số (trên biên trên)."""
        assert validate_dia_chi(128, 12, 252) is False

    def test_tc14_address_duoi_min(self):
        """TC14 — X5: address_details = 4 ký tự (dưới biên dưới)."""
        assert validate_dia_chi(128, 10, 4) is False

    def test_tc15_address_tren_max(self):
        """TC15 — X6: address_details = 501 ký tự (trên biên trên)."""
        assert validate_dia_chi(128, 10, 501) is False

    def test_tc16_nhieu_bien_sai(self):
        """TC16 — X1, X3, X5: tất cả biến đều vi phạm."""
        assert validate_dia_chi(1, 8, 4) is False