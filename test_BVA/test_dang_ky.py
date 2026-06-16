import pytest
from validate_dang_ky import validate_dang_ky


class TestHopLeTaiBien:

    def test_tc01_nominal(self):
        """TC01: Tất cả giá trị đại diện — hợp lệ."""
        assert validate_dang_ky(128, 10, 28) is True

    def test_tc02_fullname_min(self):
        """TC02 — B1: fullname = 2 (biên dưới hợp lệ)."""
        assert validate_dang_ky(2, 10, 28) is True

    def test_tc03_fullname_max(self):
        """TC03 — B5: fullname = 255 (biên trên hợp lệ)."""
        assert validate_dang_ky(255, 10, 28) is True

    def test_tc04_phone_min(self):
        """TC04 — B6: phone = 9 chữ số (biên dưới hợp lệ)."""
        assert validate_dang_ky(128, 9, 28) is True

    def test_tc05_phone_max(self):
        """TC05 — B8: phone = 11 chữ số (biên trên hợp lệ)."""
        assert validate_dang_ky(128, 11, 28) is True

    def test_tc06_password_min(self):
        """TC06 — B9: password = 6 ký tự (biên dưới hợp lệ)."""
        assert validate_dang_ky(128, 10, 6) is True

    def test_tc07_password_max(self):
        """TC07 — B13: password = 50 ký tự (biên trên hợp lệ)."""
        assert validate_dang_ky(128, 10, 50) is True

    def test_tc08_tat_ca_bien_min(self):
        """TC08: Tất cả biến tại giá trị min hợp lệ."""
        assert validate_dang_ky(2, 9, 6) is True


class TestKhongHopLe:

    def test_tc09_fullname_duoi_min(self):
        """TC09 — X1: fullname = 1 (dưới biên dưới)."""
        assert validate_dang_ky(1, 10, 28) is False

    def test_tc10_fullname_tren_max(self):
        """TC10 — X2: fullname = 256 (trên biên trên)."""
        assert validate_dang_ky(256, 10, 28) is False

    def test_tc11_phone_duoi_min(self):
        """TC11 — X3: phone = 8 chữ số (dưới biên dưới)."""
        assert validate_dang_ky(128, 8, 28) is False

    def test_tc12_phone_tren_max(self):
        """TC12 — X4: phone = 12 chữ số (trên biên trên)."""
        assert validate_dang_ky(128, 12, 28) is False

    def test_tc13_password_duoi_min(self):
        """TC13 — X5: password = 5 ký tự (dưới biên dưới)."""
        assert validate_dang_ky(128, 10, 5) is False

    def test_tc14_password_tren_max(self):
        """TC14 — X6: password = 51 ký tự (trên biên trên)."""
        assert validate_dang_ky(128, 10, 51) is False

    def test_tc15_nhieu_bien_sai(self):
        """TC15 — X1, X3, X5: fullname, phone, password đều vi phạm."""
        assert validate_dang_ky(1, 8, 5) is False